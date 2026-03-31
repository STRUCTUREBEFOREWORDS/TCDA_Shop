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
      collaboration: 'Collab',
      send: 'SEND',
    },
    es: {
      title: 'CONTACTO',
      email: 'Correo',
      message: 'Mensaje',
      order: 'Pedido',
      support: 'Soporte',
      collaboration: 'Collab',
      send: 'ENVIAR',
    },
    fr: {
      title: 'CONTACT',
      email: 'E-mail',
      message: 'Message',
      order: 'Commande',
      support: 'Support',
      collaboration: 'Collab',
      send: 'ENVOYER',
    },
    ja: {
      title: '連絡',
      email: 'メール',
      message: 'メッセージ',
      order: '注文',
      support: 'サポート',
      collaboration: 'コラボ',
      send: '送信',
    },
  };

  const text = content[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, message, type });
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-end justify-center bg-black/90 backdrop-blur-sm sm:items-center sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="relative w-full max-h-[92dvh] overflow-y-auto bg-white sm:max-w-xl sm:rounded-none"
          style={{ borderRadius: '12px 12px 0 0' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Mobile drag handle */}
          <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-neutral-200 sm:hidden" />

          <div className="p-6 sm:p-10">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-neutral-400 transition-colors hover:text-black sm:right-6 sm:top-6"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>

            {/* Title */}
            <h2 className="mb-8 text-2xl tracking-widest sm:mb-10 sm:text-3xl">{text.title}</h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
              {/* Email */}
              <div>
                <label className="mb-2 block text-xs tracking-widest text-neutral-400">
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
                <label className="mb-2 block text-xs tracking-widest text-neutral-400">TYPE</label>
                <div className="flex flex-wrap gap-2">
                  {(['order', 'support', 'collaboration'] as ContactType[]).map((contactType) => (
                    <button
                      key={contactType}
                      type="button"
                      onClick={() => setType(contactType)}
                      className={`border px-5 py-2.5 text-xs tracking-widest transition-colors ${
                        type === contactType
                          ? 'border-black bg-black text-white'
                          : 'border-neutral-300 text-neutral-600 hover:border-black'
                      }`}
                    >
                      {text[contactType]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 block text-xs tracking-widest text-neutral-400">
                  {text.message}
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
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
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
