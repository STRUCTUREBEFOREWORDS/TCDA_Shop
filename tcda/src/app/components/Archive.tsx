import { motion } from 'motion/react';
import { useApp } from '../context/AppContext';

export function Archive() {
  const { language } = useApp();

  const content = {
    en: {
      title: 'ARCHIVE',
      subtitle: 'Past Collections',
      coming: 'Coming Soon',
      description:
        'A curated archive of our previous collections. Each season tells a story.',
    },
    es: {
      title: 'ARCHIVO',
      subtitle: 'Colecciones Pasadas',
      coming: 'Próximamente',
      description:
        'Un archivo curado de nuestras colecciones anteriores. Cada temporada cuenta una historia.',
    },
    fr: {
      title: 'ARCHIVE',
      subtitle: 'Collections Précédentes',
      coming: 'Bientôt Disponible',
      description:
        'Une archive organisée de nos collections précédentes. Chaque saison raconte une histoire.',
    },
    ja: {
      title: 'アーカイブ',
      subtitle: '過去のコレクション',
      coming: '近日公開',
      description:
        '過去のコレクションのキュレーションされたアーカイブ。それぞれのシーズンがストーリーを語ります。',
    },
  };

  const text = content[language];

  return (
    <motion.section
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="flex min-h-screen items-center justify-center bg-white px-8 py-32"
    >
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-4 text-6xl tracking-[0.3em]"
        >
          {text.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-2 text-sm tracking-widest text-neutral-400"
        >
          {text.subtitle}
        </motion.p>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mx-auto mb-12 max-w-md text-neutral-600"
        >
          {text.description}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-xs tracking-[0.3em] text-neutral-400"
        >
          {text.coming}
        </motion.div>
      </div>
    </motion.section>
  );
}
