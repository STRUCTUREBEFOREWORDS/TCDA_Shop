import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PaymentCancelledProps {
  onClose: () => void;
  onRetry: () => void;
}

export function PaymentCancelled({ onClose, onRetry }: PaymentCancelledProps) {
  const { language } = useApp();

  const content = {
    en: {
      title: 'PAYMENT CANCELLED',
      message: 'Your payment was not completed',
      details: 'You can try again or continue shopping.',
      retry: 'TRY AGAIN',
      continue: 'CONTINUE SHOPPING',
    },
    es: {
      title: 'PAGO CANCELADO',
      message: 'Tu pago no se completó',
      details: 'Puedes intentarlo de nuevo o continuar comprando.',
      retry: 'INTENTAR DE NUEVO',
      continue: 'CONTINUAR COMPRANDO',
    },
    fr: {
      title: 'PAIEMENT ANNULÉ',
      message: "Votre paiement n'a pas été complété",
      details: 'Vous pouvez réessayer ou continuer vos achats.',
      retry: 'RÉESSAYER',
      continue: 'CONTINUER VOS ACHATS',
    },
    ja: {
      title: '決済キャンセル',
      message: '決済が完了しませんでした',
      details: 'もう一度お試しいただくか、ショッピングを続けることができます。',
      retry: '再試行',
      continue: 'ショッピングを続ける',
    },
  };

  const text = content[language];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm bg-white p-8 text-center sm:max-w-md sm:p-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cancel Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-neutral-300 sm:mb-8 sm:h-20 sm:w-20"
        >
          <X className="h-8 w-8 text-neutral-400 sm:h-10 sm:w-10" strokeWidth={2} />
        </motion.div>

        <h2 className="mb-3 text-xl tracking-widest sm:mb-4 sm:text-2xl">{text.title}</h2>
        <p className="mb-2 text-neutral-600">{text.message}</p>
        <p className="mb-8 text-sm text-neutral-400 sm:mb-12">{text.details}</p>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="w-full bg-black py-4 text-xs tracking-widest text-white transition-colors hover:bg-neutral-800"
          >
            {text.retry}
          </button>
          <button
            onClick={onClose}
            className="w-full border border-neutral-300 py-4 text-xs tracking-widest text-neutral-600 transition-colors hover:border-black"
          >
            {text.continue}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
