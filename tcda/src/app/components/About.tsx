import { motion } from 'motion/react';
import { useState } from 'react';
import { ContactModal } from './ContactModal';
import { useApp } from '../context/AppContext';

export function About() {
  const [showContact, setShowContact] = useState(false);
  const { language } = useApp();

  const content = {
    en: {
      title: 'ATELIER',
      description:
        'Where fashion transcends commerce. Each piece is a digital artifact, curated for those who see clothing as art.',
      philosophy:
        'We believe in timeless design, minimal intervention, and maximum expression.',
      contact: 'CONTACT',
    },
    es: {
      title: 'ATELIER',
      description:
        'Donde la moda trasciende el comercio. Cada pieza es un artefacto digital, curado para aquellos que ven la ropa como arte.',
      philosophy:
        'Creemos en el diseño atemporal, la intervención mínima y la máxima expresión.',
      contact: 'CONTACTO',
    },
    fr: {
      title: 'ATELIER',
      description:
        'Où la mode transcende le commerce. Chaque pièce est un artefact numérique, organisé pour ceux qui voient les vêtements comme de l\'art.',
      philosophy:
        'Nous croyons au design intemporel, à l\'intervention minimale et à l\'expression maximale.',
      contact: 'CONTACT',
    },
    ja: {
      title: 'ATELIER',
      description:
        'ファッションが商業を超える場所。それぞれの作品は、服をアートとして見る人々のためにキュレーションされたデジタルアーティファクトです。',
      philosophy:
        '私たちは、タイムレスなデザイン、最小限の介入、そして最大限の表現を信じています。',
      contact: '連絡',
    },
  };

  const text = content[language];

  return (
    <>
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="min-h-screen bg-black px-8 py-32 text-white"
      >
        <div className="mx-auto max-w-4xl">
          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16 text-6xl tracking-[0.3em]"
          >
            {text.title}
          </motion.h2>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-24 space-y-8"
          >
            <p className="text-xl leading-relaxed text-neutral-300">
              {text.description}
            </p>
            <p className="text-lg leading-relaxed text-neutral-400">
              {text.philosophy}
            </p>
          </motion.div>

          {/* Contact Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border-t border-neutral-800 pt-12"
          >
            <button
              onClick={() => setShowContact(true)}
              className="text-xs tracking-[0.3em] text-white transition-opacity hover:opacity-70"
            >
              {text.contact}
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Modal */}
      <ContactModal isOpen={showContact} onClose={() => setShowContact(false)} />
    </>
  );
}
