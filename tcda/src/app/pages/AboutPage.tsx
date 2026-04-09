import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";

const CONTENT = {
  en: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "Individuality is not something to hide.\nIt is something to wear.",
    heroSub: "TCDA is a brand that makes the expression inside you visible as fashion.",
    philosophyLabel: "Philosophy",
    philosophy: [
      "Everyone has individuality.",
      "And that individuality is worth expressing.",
      "Individuality is the will of how you want to be.",
      "There is no need to suppress it.",
      "Release it, wear it, and show it to the world.",
    ],
    whyLabel: "Why",
    why: [
      "People fear being different from those around them.",
      "Speak up and you stand out. Act and you are avoided.",
      "So many people suppress their individuality.",
      "But fashion is different.",
      "You can express yourself without words.",
      "Difference is not denied. It becomes value.",
    ],
    definitionLabel: "Definition",
    definition: [
      "What we provide is not clothing.",
      "It is a device to expand self-expression.",
      "Emotions, thoughts, and impulses within you —",
      "released outward as vision.",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "Abstract sensibility translated directly into design",
      "Visuals designed with the strength of individuality as a premise",
      "An experiential design that reinforces self-awareness through wearing",
    ],
    messageLabel: "Message",
    message: [
      "Can you say with certainty: this is who I am?",
      "If words are difficult,",
      "show it through fashion.",
    ],
    cta: "View Collection",
  },
  ja: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "個性は、隠すものではなく\n\"纏うもの\"だ。",
    heroSub: "TCDAは、あなたの内側にある表現をファッションとして可視化するブランド。",
    philosophyLabel: "Philosophy",
    philosophy: [
      "誰もが個性を持っている。",
      "そしてその個性には、表現する価値がある。",
      "個性とは、「自分がどう在りたいか」という意志そのもの。",
      "それを閉じ込める必要はない。",
      "外に出し、纏い、世界に示せばいい。",
    ],
    whyLabel: "Why",
    why: [
      "人は、周囲と違うことを恐れる。",
      "発言すれば浮く。行動すれば避けられる。",
      "だから、多くの人は個性を抑える。",
      "しかしファッションは違う。",
      "言葉を使わずに、自分を表現できる。",
      "違いは否定されない。むしろ価値として成立する。",
    ],
    definitionLabel: "Definition",
    definition: [
      "私たちが提供しているのは、服ではない。",
      "自己表現を拡張するための装置である。",
      "内側にある感情、思想、衝動を、",
      "視覚として外に解放する。",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "抽象的な感性をそのままデザインへ変換",
      "個性の強さを前提に設計されたビジュアル",
      "着ることで自己認識を強化する体験設計",
    ],
    messageLabel: "Message",
    message: [
      "自分とはこういう人間だと、言い切れるか。",
      "もし言葉で難しいなら、",
      "ファッションで示せばいい。",
    ],
    cta: "View Collection",
  },
  fr: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "L'individualité n'est pas quelque chose à cacher.\nC'est quelque chose à porter.",
    heroSub: "TCDA est une marque qui rend visible l'expression intérieure à travers la mode.",
    philosophyLabel: "Philosophy",
    philosophy: [
      "Tout le monde a une individualité.",
      "Et cette individualité mérite d'être exprimée.",
      "L'individualité est la volonté de ce que vous voulez être.",
      "Il n'est pas nécessaire de la supprimer.",
      "Libérez-la, portez-la, montrez-la au monde.",
    ],
    whyLabel: "Why",
    why: [
      "Les gens craignent d'être différents de leur entourage.",
      "Parlez et vous vous démarquez. Agissez et vous êtes évité.",
      "Beaucoup suppriment donc leur individualité.",
      "Mais la mode est différente.",
      "Vous pouvez vous exprimer sans mots.",
      "La différence n'est pas niée. Elle devient valeur.",
    ],
    definitionLabel: "Definition",
    definition: [
      "Ce que nous fournissons n'est pas des vêtements.",
      "C'est un dispositif pour étendre l'auto-expression.",
      "Émotions, pensées et impulsions en vous —",
      "libérées vers l'extérieur comme vision.",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "Sensibilité abstraite traduite directement en design",
      "Visuels conçus avec la force de l'individualité comme prémisse",
      "Design expérientiel qui renforce la conscience de soi par le port",
    ],
    messageLabel: "Message",
    message: [
      "Pouvez-vous dire avec certitude : c'est qui je suis ?",
      "Si les mots sont difficiles,",
      "montrez-le à travers la mode.",
    ],
    cta: "View Collection",
  },
  es: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "La individualidad no es algo que ocultar.\nEs algo que vestir.",
    heroSub: "TCDA es una marca que hace visible la expresión interior a través de la moda.",
    philosophyLabel: "Philosophy",
    philosophy: [
      "Todos tienen individualidad.",
      "Y esa individualidad vale la pena expresarla.",
      "La individualidad es la voluntad de cómo quieres ser.",
      "No hay necesidad de suprimirla.",
      "Libérala, vístela y muéstrala al mundo.",
    ],
    whyLabel: "Why",
    why: [
      "La gente teme ser diferente a quienes los rodean.",
      "Habla y destacas. Actúa y te evitan.",
      "Así que muchos suprimen su individualidad.",
      "Pero la moda es diferente.",
      "Puedes expresarte sin palabras.",
      "La diferencia no se niega. Se convierte en valor.",
    ],
    definitionLabel: "Definition",
    definition: [
      "Lo que ofrecemos no es ropa.",
      "Es un dispositivo para expandir la autoexpresión.",
      "Emociones, pensamientos e impulsos en ti —",
      "liberados hacia afuera como visión.",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "Sensibilidad abstracta traducida directamente en diseño",
      "Visuales diseñados con la fuerza de la individualidad como premisa",
      "Diseño experiencial que refuerza la autoconciencia al vestir",
    ],
    messageLabel: "Message",
    message: [
      "¿Puedes decir con certeza: así soy yo?",
      "Si las palabras son difíciles,",
      "muéstralo a través de la moda.",
    ],
    cta: "View Collection",
  },
  ko: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "개성은 숨기는 것이 아니라\n'걸치는 것'이다.",
    heroSub: "TCDA는 당신 내면의 표현을 패션으로 가시화하는 브랜드입니다.",
    philosophyLabel: "Philosophy",
    philosophy: [
      "누구나 개성을 가지고 있다.",
      "그리고 그 개성에는 표현할 가치가 있다.",
      "개성이란 자신이 어떻게 있고 싶은지에 대한 의지 그 자체다.",
      "그것을 억누를 필요는 없다.",
      "밖으로 내보이고, 걸치고, 세상에 보여주면 된다.",
    ],
    whyLabel: "Why",
    why: [
      "사람들은 주변과 다름을 두려워한다.",
      "말하면 튀고, 행동하면 멀리한다.",
      "그래서 많은 사람들이 개성을 억누른다.",
      "하지만 패션은 다르다.",
      "말 없이 자신을 표현할 수 있다.",
      "차이는 부정되지 않는다. 오히려 가치가 된다.",
    ],
    definitionLabel: "Definition",
    definition: [
      "우리가 제공하는 것은 옷이 아니다.",
      "자기표현을 확장하기 위한 장치다.",
      "내면의 감정, 사상, 충동을",
      "시각으로 외부에 해방시킨다.",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "추상적인 감성을 그대로 디자인으로 변환",
      "개성의 강함을 전제로 설계된 비주얼",
      "착용을 통해 자기 인식을 강화하는 경험 설계",
    ],
    messageLabel: "Message",
    message: [
      "나는 이런 사람이라고 단언할 수 있는가.",
      "만약 말로 어렵다면,",
      "패션으로 보여주면 된다.",
    ],
    cta: "View Collection",
  },
  zh: {
    heroCaption: "Transcend Color Digital Apparel",
    heroCatch: "个性不是需要隐藏的东西。\n而是需要穿戴的东西。",
    heroSub: "TCDA是一个将你内心的表达通过时尚可视化的品牌。",
    philosophyLabel: "Philosophy",
    philosophy: [
      "每个人都有个性。",
      "而这种个性值得被表达。",
      "个性就是你想要如何存在的意志本身。",
      "没有必要压抑它。",
      "释放它，穿戴它，向世界展示。",
    ],
    whyLabel: "Why",
    why: [
      "人们害怕与周围不同。",
      "说话就会突出。行动就会被避开。",
      "所以很多人压抑个性。",
      "但时尚不同。",
      "不用言语就能表达自己。",
      "差异不被否定。反而成为价值。",
    ],
    definitionLabel: "Definition",
    definition: [
      "我们提供的不是服装。",
      "而是扩展自我表达的装置。",
      "内心的情感、思想、冲动——",
      "以视觉的形式向外释放。",
    ],
    differenceLabel: "What Makes Us Different",
    differences: [
      "将抽象感性直接转化为设计",
      "以个性强度为前提设计的视觉",
      "通过穿戴强化自我认知的体验设计",
    ],
    messageLabel: "Message",
    message: [
      "你能断言：我就是这样的人吗？",
      "如果用语言很难，",
      "就用时尚来展示。",
    ],
    cta: "View Collection",
  },
};

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] },
};

export function AboutPage() {
  const { language } = useGlobalContext();
  const t = CONTENT[language] ?? CONTENT.en;

  return (
    <div className="min-h-screen bg-white">

      {/* 1. HERO */}
      <section className="min-h-screen flex flex-col justify-center px-8 md:px-20 pt-24 pb-20 bg-black">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto w-full"
        >
          <p className="text-white/40 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.heroCaption}
          </p>
          <h1 className="text-white text-3xl md:text-5xl font-extralight leading-[1.5] tracking-wide mb-10 whitespace-pre-line">
            {t.heroCatch}
          </h1>
          <p className="text-white/60 text-sm font-light leading-relaxed tracking-wide max-w-xl">
            {t.heroSub}
          </p>
        </motion.div>
      </section>

      {/* 2. PHILOSOPHY */}
      <section className="px-8 md:px-20 py-32 bg-white">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <p className="text-black/30 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.philosophyLabel}
          </p>
          <div className="space-y-5">
            {t.philosophy.map((line, i) => (
              <p key={i} className="text-black text-lg md:text-xl font-light leading-relaxed tracking-wide">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 3. WHY */}
      <section className="px-8 md:px-20 py-32 bg-black">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.whyLabel}
          </p>
          <div className="space-y-5">
            {t.why.map((line, i) => (
              <p key={i} className="text-white text-lg md:text-xl font-light leading-relaxed tracking-wide opacity-80">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 4. DEFINITION */}
      <section className="px-8 md:px-20 py-32 bg-white">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <p className="text-black/30 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.definitionLabel}
          </p>
          <div className="space-y-5">
            {t.definition.map((line, i) => (
              <p key={i} className="text-black text-lg md:text-xl font-light leading-relaxed tracking-wide">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 5. DIFFERENCE */}
      <section className="px-8 md:px-20 py-32 bg-black">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <p className="text-white/30 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.differenceLabel}
          </p>
          <div className="space-y-6">
            {t.differences.map((line, i) => (
              <div key={i} className="flex items-start gap-6">
                <span className="text-white/20 text-xs font-light mt-1">0{i + 1}</span>
                <p className="text-white text-base md:text-lg font-light leading-relaxed tracking-wide opacity-80">
                  {line}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 6. MESSAGE */}
      <section className="px-8 md:px-20 py-32 bg-white">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto">
          <p className="text-black/30 text-[10px] tracking-[0.4em] uppercase mb-12">
            {t.messageLabel}
          </p>
          <div className="space-y-5">
            {t.message.map((line, i) => (
              <p key={i} className="text-black text-xl md:text-2xl font-extralight leading-relaxed tracking-wide">
                {line}
              </p>
            ))}
          </div>
        </motion.div>
      </section>

      {/* 7. CTA */}
      <section className="px-8 md:px-20 py-32 bg-black flex items-center justify-center">
        <motion.div {...fadeUp} className="text-center">
          <Link
            to="/products"
            className="inline-block px-16 py-5 bg-white text-black text-xs font-light tracking-[0.4em] uppercase hover:bg-white/90 transition-colors duration-300"
          >
            {t.cta}
          </Link>
        </motion.div>
      </section>

    </div>
  );
}
