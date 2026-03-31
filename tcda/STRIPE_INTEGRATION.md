# Stripe決済統合ガイド

このドキュメントでは、Stripe Checkoutを実装するための手順を説明します。

## 概要

現在の実装では、「BUY NOW」ボタンをクリックするとStripe Checkoutページへリダイレクトする準備ができています。実際にStripeを統合するには、バックエンドAPIが必要です。

## 必要な手順

### 1. Stripeアカウントの設定

1. [Stripe Dashboard](https://dashboard.stripe.com/)でアカウントを作成
2. APIキーを取得（公開可能キーとシークレットキー）
3. 公開可能キーを `/src/app/utils/stripe.ts` の `STRIPE_PUBLISHABLE_KEY` に設定

### 2. バックエンドAPI実装例 (Node.js/Express)

```javascript
// server.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(express.json());

// Checkoutセッション作成エンドポイント
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { product } = req.body;
    
    // Stripe Checkoutセッションを作成
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: product.currency.toLowerCase(),
            product_data: {
              name: product.name,
              description: `Size: ${product.size}`,
              images: [product.image],
            },
            unit_amount: Math.round(product.price * 100), // 金額をセント単位に変換
          },
          quantity: product.quantity || 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: {
        size: product.size,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook処理（決済完了の通知を受け取る）
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    
    // 決済完了イベント
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // ここで注文処理を実行（データベースへの保存、メール送信など）
      console.log('Payment successful:', session);
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### 3. フロントエンドの実装を有効化

`/src/app/utils/stripe.ts` のコメントアウトされたコードを有効にします：

```typescript
export async function redirectToCheckout(product: CheckoutProduct) {
  try {
    // バックエンドAPIを呼び出してCheckoutセッションを作成
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
    
    // Stripeインスタンスを取得
    const stripe = await stripePromise;
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
```

### 4. 環境変数の設定

```bash
# .env.local (フロントエンド)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxx

# .env (バックエンド)
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
```

### 5. 決済完了/キャンセルページの作成

```typescript
// /src/app/pages/Success.tsx
export function Success() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl mb-4">ご購入ありがとうございます</h1>
        <p className="text-neutral-600">注文が完了しました。</p>
      </div>
    </div>
  );
}

// /src/app/pages/Cancel.tsx
export function Cancel() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl mb-4">決済がキャンセルされました</h1>
        <p className="text-neutral-600">ショッピングを続けることができます。</p>
      </div>
    </div>
  );
}
```

## テスト

Stripeのテストモードでは、以下のテストカード番号を使用できます：

- **成功**: 4242 4242 4242 4242
- **失敗**: 4000 0000 0000 0002
- **3Dセキュア**: 4000 0027 6000 3184

有効期限: 将来の任意の日付（例: 12/34）
CVC: 任意の3桁（例: 123）

## セキュリティのベストプラクティス

1. **APIキーの保護**: シークレットキーは絶対にフロントエンドに公開しない
2. **Webhook署名の検証**: Webhookリクエストが本当にStripeから来たものか確認
3. **金額の検証**: バックエンドで金額を再計算し、改ざんを防ぐ
4. **HTTPS必須**: 本番環境では必ずHTTPSを使用

## 参考リンク

- [Stripe Checkout公式ドキュメント](https://stripe.com/docs/payments/checkout)
- [Stripe Webhook](https://stripe.com/docs/webhooks)
- [Stripe Testing](https://stripe.com/docs/testing)
