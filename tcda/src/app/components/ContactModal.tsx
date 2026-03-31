import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useApp } from '../context/AppContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ContactType = 'order' | 'support' | 'collaboration';

export function ContactModal({ isOpen, onClose }: ContactModalProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ContactType>('order');
  const { language } = useApp();

  if (!isOpen) return null;

  const content = {
    en: {
      title: 'CONTACT',
      email: 'Email',
      message: 'Message',
      order: 'Order',
      support: 'Support',
      collaboration: 'Collaboration',
      send: 'SEND',
    },
    es: {
      title: 'CONTACTO',
      email: 'Correo electrónico',
      message: 'Mensaje',
      order: 'Pedido',
      support: 'Soporte',
      collaboration: 'Colaboración',
      send: 'ENVIAR',
    },
    fr: {
      title: 'CONTACT',
      email: 'E-mail',
      message: 'Message',
      order: 'Commande',
      support: 'Support',
      collaboration: 'Collaboration',
      send: 'ENVOYER',
    },
    ja: {
      title: '連絡',
      email: 'メール',
      message: 'メッセージ',
      order: '注文',
      support: 'サポート',
      collaboration: 'コラボレーション',
      send: '送信',
    },
  };

  const text = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log({ email, message, type });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white p-12"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute right-6 top-6 text-neutral-400 transition-colors hover:text-black"
          >
            <X className="h-6 w-6" strokeWidth={1} />
          </button>

          {/* Title */}
          <h2 className="mb-12 text-3xl tracking-widest">{text.title}</h2>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div>
              <label className="mb-3 block text-xs tracking-widest text-neutral-400">
                {text.email}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border-b border-neutral-300 bg-transparent pb-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="mb-3 block text-xs tracking-widest text-neutral-400">
                TYPE
              </label>
              <div className="flex gap-4">
                {(['order', 'support', 'collaboration'] as ContactType[]).map(
                  (contactType) => (
                    <button
                      key={contactType}
                      type="button"
                      onClick={() => setType(contactType)}
                      className={`border px-6 py-3 text-xs tracking-widest transition-colors ${
                        type === contactType
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 text-neutral-600 hover:border-black'
                      }`}
                    >
                      {text[contactType]}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Message */}
            <div>
              <label className="mb-3 block text-xs tracking-widest text-neutral-400">
                {text.message}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                className="w-full resize-none border-b border-neutral-300 bg-transparent pb-3 text-sm focus:border-black focus:outline-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!email || !message}
              className={`w-full py-4 text-xs tracking-widest transition-all ${
                email && message
                  ? 'bg-black text-white hover:bg-neutral-800'
                  : 'cursor-not-allowed bg-neutral-200 text-neutral-400'
              }`}
            >
              {text.send}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
