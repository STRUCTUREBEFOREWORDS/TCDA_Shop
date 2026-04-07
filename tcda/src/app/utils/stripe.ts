// 商品情報の型定義
export interface CheckoutProduct {
  name: string;
  price_jpy: number;
  size: string;
  quantity?: number;
}

/**
 * Stripe Checkoutセッションを作成してリダイレクト
 * 本番環境では、バックエンドAPIを呼び出してセッションIDを取得する必要があります
 */
export async function redirectToCheckout(product: CheckoutProduct) {
  try {
    console.log('Stripe Checkout starting with product:', product);
    
    // デモ用：シミュレーションとしてアラートを表示
    alert(
      `Stripe Checkout Demo\n\n` +
      `Product: ${product.name}\n` +
      `Size: ${product.size}\n` +
      `Price: ${product.currency} ${product.price}\n\n` +
      `実際の実装では、ここでStripe Checkoutページにリダイレクトされます。\n\n` +
      `実装手順:\n` +
      `1. バックエンドAPIでCheckoutセッションを作成\n` +
      `2. stripe.redirectToCheckout()でStripeページへ遷移\n` +
      `3. 決済完了後、success_urlにリダイレクト`
    );
    
    return true;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}

/**
 * 本番環境用：実際のStripe Checkoutへリダイレクト
 * 使用するには、この関数を有効にして、redirectToCheckout関数を置き換えてください
 */
export async function redirectToCheckoutProduction(product: CheckoutProduct) {
  try {
    // Stripeを動的にインポート
    const { loadStripe } = await import('@stripe/stripe-js');
    
    // Stripe公開可能キー（環境変数から取得）
    const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_PUBLISHABLE_KEY_HERE';
    
    // バックエンドAPIエンドポイントを呼び出し
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          name: product.name,
          price: product.price,
          currency: product.currency.toLowerCase(),
          size: product.size,
          image: product.image,
          quantity: product.quantity || 1,
        },
      }),
    });
    
    const { sessionId } = await response.json();
    
    // Stripeインスタンスを初期化
    const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
    if (!stripe) {
      throw new Error('Stripe failed to load');
    }
    
    // Stripe Checkoutページへリダイレクト
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) {
      console.error('Stripe redirect error:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
}
