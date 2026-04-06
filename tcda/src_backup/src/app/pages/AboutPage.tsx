import { motion } from "motion/react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useGlobalContext } from "./Root";

export function AboutPage() {
  const { language } = useGlobalContext();

  const content = {
    en: {
      title: "ABOUT TCDA",
      subtitle: "Transcend Color Digital Apparel",
      philosophy: [
        "We do not create fashion.",
        "We create spaces for the unspeakable.",
        "Each piece is a meditation on discomfort, displacement, and the refusal to conform.",
      ],
      manifesto: "The Manifesto",
      manifestoText: [
        "This is not for everyone.",
        "This is for those who carry something they cannot name.",
        "For those who exist in the space between words.",
        "For those who feel the world was built without them in mind.",
        "We do not sell products. We offer mirrors.",
      ],
      process: "The Process",
      processText:
        "Each artwork begins with a feeling that has no language. Through color, form, and negative space, we give shape to what cannot be spoken. Every piece is limited. Every piece is numbered. What you wear becomes part of the archive.",
    },
    ja: {
      title: "TCDA について",
      subtitle: "Transcend Color Digital Apparel",
      philosophy: [
        "私たちはファッションを作らない。",
        "言葉にできないもののための空間を作る。",
        "各作品は、不快感、違和感、そして適合の拒否についての瞑想である。",
      ],
      manifesto: "マニフェスト",
      manifestoText: [
        "これはすべての人のためのものではない。",
        "これは、名付けられない何かを抱える者たちのため。",
        "言葉と言葉の間に存在する者たちのため。",
        "世界が自分を念頭に置いて作られていないと感じる者たちのため。",
        "私たちは製品を売らない。鏡を提供する。",
      ],
      process: "制作プロセス",
      processText:
        "各アートワークは、言語を持たない感情から始まります。色、形、ネガティブスペースを通じて、語れないものに形を与えます。すべての作品は限定です。すべての作品には番号が付けられます。あなたが身につけるものは、アーカイブの一部となります。",
    },
    fr: {
      title: "À PROPOS DE TCDA",
      subtitle: "Transcend Color Digital Apparel",
      philosophy: [
        "Nous ne créons pas de mode.",
        "Nous créons des espaces pour l'indicible.",
        "Chaque pièce est une méditation sur l'inconfort, le déplacement et le refus de se conformer.",
      ],
      manifesto: "Le Manifeste",
      manifestoText: [
        "Ce n'est pas pour tout le monde.",
        "C'est pour ceux qui portent quelque chose qu'ils ne peuvent nommer.",
        "Pour ceux qui existent dans l'espace entre les mots.",
        "Pour ceux qui sentent que le monde a été construit sans eux à l'esprit.",
        "Nous ne vendons pas de produits. Nous offrons des miroirs.",
      ],
      process: "Le Processus",
      processText:
        "Chaque œuvre commence par un sentiment qui n'a pas de langage. À travers la couleur, la forme et l'espace négatif, nous donnons forme à ce qui ne peut être dit. Chaque pièce est limitée. Chaque pièce est numérotée. Ce que vous portez devient partie des archives.",
    },
  };

  const t = content[language];

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Header */}
      <section className="px-8 md:px-20 mb-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-black text-4xl md:text-6xl font-extralight tracking-[0.2em] mb-6">
            {t.title}
          </h1>
          <p className="text-black text-sm font-light tracking-widest uppercase opacity-50">
            {t.subtitle}
          </p>
        </motion.div>
      </section>

      {/* Philosophy */}
      <section className="px-8 md:px-20 py-32 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          {t.philosophy.map((line, index) => (
            <p
              key={index}
              className="text-white text-xl md:text-2xl font-light leading-[180%] tracking-wide mb-6"
            >
              {line}
            </p>
          ))}
        </motion.div>
      </section>

      {/* Manifesto */}
      <section className="px-8 md:px-20 py-32 bg-white">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-black text-xs font-light tracking-widest uppercase mb-12 opacity-40">
            {t.manifesto}
          </h2>
          <div className="space-y-6">
            {t.manifestoText.map((line, index) => (
              <p
                key={index}
                className="text-black text-lg font-light leading-[180%] tracking-wide"
              >
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Process */}
      <section className="px-8 md:px-20 py-32 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-white text-xs font-light tracking-widest uppercase mb-12 opacity-40">
            {t.process}
          </h2>
          <p className="text-white text-lg font-light leading-[180%] tracking-wide opacity-70">
            {t.processText}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
