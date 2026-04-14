import { createBrowserRouter } from "react-router";
import { Root } from "./pages/Root";
import { LangRedirect } from "./pages/LangRedirect";
import { TopPage } from "./pages/TopPage";
import { ProductPage } from "./pages/ProductPage";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { PaymentSuccessPage } from "./pages/PaymentSuccessPage";
import { PaymentCancelledPage } from "./pages/PaymentCancelledPage";
import { LookbookPage } from "./pages/LookbookPage";
import { SizeGuidePage } from "./pages/SizeGuidePage";
import { LegalPage } from "./pages/LegalPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  // Root "/" → detect language → redirect to /:lang/
  { index: true, Component: LangRedirect },
  {
    path: "/:lang",
    Component: Root,
    children: [
      { index: true, Component: TopPage },
      { path: "product/:id", Component: ProductPage },
      { path: "products", Component: ArchivePage },
      { path: "collection", Component: LookbookPage },
      { path: "look", Component: LookbookPage },
      { path: "size-guide", Component: SizeGuidePage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "payment-success", Component: PaymentSuccessPage },
      { path: "payment-cancelled", Component: PaymentCancelledPage },
      { path: "about", Component: AboutPage },
      { path: "legal", Component: LegalPage },
      { path: "privacy", Component: PrivacyPage },
    ],
  },
  { path: "*", Component: NotFound },
]);
