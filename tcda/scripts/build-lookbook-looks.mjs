// 実行: node tcda/scripts/build-lookbook-looks.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const MAX_IMGS = 3;
const src = fileURLToPath(new URL("../src/app/data/lookbookImages.json", import.meta.url));
const dst = fileURLToPath(new URL("../src/app/data/lookbookLooks.json", import.meta.url));

const groups = new Map();
for (const { pid, img } of JSON.parse(readFileSync(src, "utf8"))) {
  const imgs = groups.get(pid) ?? [];
  if (!imgs.includes(img)) imgs.push(img);
  groups.set(pid, imgs);
}

const looks = [...groups].map(([pid, imgs]) => ({ pid, imgs: imgs.slice(0, MAX_IMGS) }));
writeFileSync(dst, JSON.stringify(looks, null, 2) + "\n");
console.log(`${looks.length} products, ${looks.reduce((n, l) => n + l.imgs.length, 0)} images -> ${dst}`);
