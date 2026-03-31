import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface PaymentSuccessProps {
  onClose: () => void;
}

export function PaymentSuccess({ onClose }: PaymentSuccessProps) {
  const { language } = useApp();

  const content = {
    en: {
      title: 'ORDER CONFIRMED',
      message: 'Thank you for your purchase',
      details: 'You will receive a confirmation email shortly.',
      continue: 'CONTINUE SHOPPING',
    },
    es: {
      title: 'PEDIDO CONFIRMADO',
      message: 'Gracias por tu compra',
      details: 'Recibirás un correo de confirmación en breve.',
      continue: 'CONTINUAR COMPRANDO',
    },
    fr: {
      title: 'COMMANDE CONFIRMÉE',
      message: 'Merci pour votre achat',
      details: 'Vous recevrez un e-mail de confirmation sous peu.',
      continue: 'CONTINUER VOS ACHATS',
    },
    ja: {
      title: '注文確認',
      message: 'ご購入ありがとうございます',
      details: '確認メールをお送りします。',
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
        className="w-full max-w-md bg-white p-12 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-black"
        >
          <Check className="h-10 w-10 text-white" strokeWidth={2} />
        </motion.div>

        {/* Title */}
        <h2 className="mb-4 text-2xl tracking-widest">{text.title}</h2>

        {/* Message */}
        <p className="mb-2 text-neutral-600">{text.message}</p>
        <p className="mb-12 text-sm text-neutral-400">{text.details}</p>

        {/* CTA */}
        <button
          onClick={onClose}
          className="w-full bg-black py-4 text-xs tracking-widest text-white transition-colors hover:bg-neutral-800"
        >
          {text.continue}
        </button>
      </motion.div>
    </motion.div>
  );
}
