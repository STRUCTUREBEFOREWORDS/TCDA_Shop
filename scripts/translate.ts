#!/usr/bin/env npx ts-node
/**
 * scripts/translate.ts
 * jaのtranslation.jsonをベースにClaude APIで他5言語を自動生成する。
 *
 * 使用方法:
 *   npx ts-node scripts/translate.ts           # 全言語を再生成
 *   npx ts-node scripts/translate.ts en fr     # 指定言語のみ
 *
 * 環境変数:
 *   ANTHROPIC_API_KEY  （.envまたはシェル環境に設定）
 */

import * as fs from "fs";
import * as path from "path";
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";

dotenv.config({ path: path.resolve(__dirname, "../tcda/.env") });
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const LOCALES_DIR = path.resolve(__dirname, "../tcda/public/locales");
const SOURCE_LANG = "ja";
const TARGET_LANGS: Record<string, string> = {
  en: "English",
  fr: "French",
  es: "Spanish",
  ko: "Korean",
  zh: "Simplified Chinese",
};

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const key = prefix ? `${prefix}.${k}` : k;
    return typeof v === "object" && v !== null
      ? flattenKeys(v as Record<string, unknown>, key)
      : [key];
  });
}

function setNestedValue(
  obj: Record<string, unknown>,
  keyPath: string,
  value: string
): void {
  const parts = keyPath.split(".");
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!cur[parts[i]]) cur[parts[i]] = {};
    cur = cur[parts[i]] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

function getNestedValue(obj: Record<string, unknown>, keyPath: string): string {
  const parts = keyPath.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null) return "";
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : "";
}

async function translateChunk(
  entries: { key: string; value: string }[],
  targetLang: string,
  targetLangName: string
): Promise<Record<string, string>> {
  const jsonInput = Object.fromEntries(entries.map((e) => [e.key, e.value]));

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `You are a professional translator for a fashion e-commerce website (TCDA).
Translate the following Japanese UI strings to ${targetLangName}.

Rules:
- Preserve tone: minimal, poetic, premium fashion brand
- Keep brand names (TCDA, Printful, Stripe) unchanged
- Keep placeholders like {{count}} unchanged
- Return ONLY valid JSON with the same keys, no explanation

Input JSON:
${JSON.stringify(jsonInput, null, 2)}

Return translated JSON:`,
      },
    ],
  });

  const raw = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error(`No JSON in response for ${targetLang}`);
  return JSON.parse(jsonMatch[0]);
}

async function translateLang(
  sourcePath: string,
  targetLang: string,
  targetLangName: string
): Promise<void> {
  const source: Record<string, unknown> = JSON.parse(
    fs.readFileSync(sourcePath, "utf-8")
  );

  const targetPath = path.join(LOCALES_DIR, targetLang, "translation.json");
  let existing: Record<string, unknown> = {};
  if (fs.existsSync(targetPath)) {
    existing = JSON.parse(fs.readFileSync(targetPath, "utf-8"));
  }

  const allKeys = flattenKeys(source);

  // Only translate missing or empty keys
  const missing = allKeys.filter((k) => {
    const v = getNestedValue(existing, k);
    return !v || v === getNestedValue(source, k);
  });

  if (missing.length === 0) {
    console.log(`[${targetLang}] Already up to date.`);
    return;
  }

  console.log(`[${targetLang}] Translating ${missing.length} keys...`);

  const CHUNK_SIZE = 40;
  const result: Record<string, unknown> = JSON.parse(JSON.stringify(existing));

  for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
    const chunk = missing.slice(i, i + CHUNK_SIZE).map((k) => ({
      key: k,
      value: getNestedValue(source, k),
    }));

    const translated = await translateChunk(chunk, targetLang, targetLangName);

    for (const [key, value] of Object.entries(translated)) {
      setNestedValue(result, key, value);
    }

    console.log(
      `[${targetLang}] ${Math.min(i + CHUNK_SIZE, missing.length)}/${missing.length} done`
    );
  }

  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(result, null, 2) + "\n", "utf-8");
  console.log(`[${targetLang}] Saved to ${targetPath}`);
}

async function main() {
  const sourcePath = path.join(LOCALES_DIR, SOURCE_LANG, "translation.json");
  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    process.exit(1);
  }

  const args = process.argv.slice(2);
  const langs =
    args.length > 0
      ? Object.fromEntries(
          args
            .filter((l) => TARGET_LANGS[l])
            .map((l) => [l, TARGET_LANGS[l]])
        )
      : TARGET_LANGS;

  for (const [lang, name] of Object.entries(langs)) {
    await translateLang(sourcePath, lang, name);
  }

  console.log("✓ Translation complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
