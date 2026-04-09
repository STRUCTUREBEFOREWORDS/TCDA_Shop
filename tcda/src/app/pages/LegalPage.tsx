export function LegalPage() {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-20 max-w-2xl mx-auto">
      <h1 className="text-sm font-light tracking-[0.3em] uppercase mb-12">特定商取引法に基づく表記</h1>
      <table className="w-full text-xs font-light leading-loose border-collapse">
        <tbody>
          {[
            ["販売事業者", "小川大樹"],
            ["所在地", "東京都世田谷区太子堂５-１７-１ メゾン・ド・ミロール103"],
            ["電話番号", "050-5476-8894"],
            ["メールアドレス", "info@tcdashop.com"],
            ["販売価格", "各商品ページに記載の価格（税込）"],
            ["支払方法", "クレジットカード（Visa / Mastercard / JCB / American Express / Diners Club）"],
            ["支払時期", "注文確定時"],
            ["商品の引渡し時期", "注文確定後、通常5〜10営業日以内に発送"],
            ["返品・交換", "商品の性質上、注文確定後のキャンセル・返品・交換は原則お受けできません。商品の破損・印刷不良・誤配送の場合のみ、到着後7日以内にinfo@tcdashop.comへご連絡ください。該当する場合は再送または返金対応いたします。"],
            ["販売数量", "在庫の範囲内"],
            ["動作環境", "最新のChrome / Safari / Firefox / Edge"],
          ].map(([label, value]) => (
            <tr key={label} className="border-t border-black/10">
              <td className="py-4 pr-8 text-black/40 whitespace-nowrap align-top w-40">{label}</td>
              <td className="py-4">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
