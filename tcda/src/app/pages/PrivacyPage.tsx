export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-sm font-light tracking-[0.3em] uppercase mb-12">Privacy Policy</h1>
      <div className="space-y-10 text-xs font-light leading-loose">
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">1. 収集する情報</h2>
          <p>当ショップでは、注文処理のためにお名前・住所・メールアドレス・電話番号・決済情報を収集します。決済情報はStripe, Inc.が安全に処理し、当ショップは保持しません。</p>
        </section>
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">2. 利用目的</h2>
          <p>収集した情報は、注文処理・配送・カスタマーサポート・サービス改善のために使用します。第三者への販売・提供は行いません。</p>
        </section>
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">3. 第三者への提供</h2>
          <p>注文の履行のため、Printful（製造・配送パートナー）に必要な配送情報を提供します。それ以外の第三者への提供は法令に基づく場合を除き行いません。</p>
        </section>
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">4. Cookie</h2>
          <p>当サイトはGoogle Analytics（GA4）によるアクセス解析にCookieを使用しています。Cookieを無効にしてもサイトの利用は可能です。</p>
        </section>
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">5. 情報の管理</h2>
          <p>個人情報は適切なセキュリティ対策のもと管理し、不正アクセス・漏洩・改ざんの防止に努めます。</p>
        </section>
        <section>
          <h2 className="tracking-widest uppercase mb-4 text-black/40">6. お問い合わせ</h2>
          <p>個人情報に関するお問い合わせはinfo@tcdashop.comまでご連絡ください。</p>
        </section>
        <p className="text-black/30">制定日：2026年4月10日</p>
      </div>
    </div>
  );
}
