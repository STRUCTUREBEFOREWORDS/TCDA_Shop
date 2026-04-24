import { createBrowserRouter, Navigate } from "react-router";
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
import { PaymentErrorPage } from "./pages/PaymentErrorPage";
import { CollectionPage } from "./pages/CollectionPage";
import { SizeGuidePage } from "./pages/SizeGuidePage";
import { LegalPage } from "./pages/LegalPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { ShippingReturnsPage } from "./pages/ShippingReturnsPage";
import { ContactPage } from "./pages/ContactPage";
import { ReviewPage } from "./pages/ReviewPage";
import { BrandFoundationPage } from "./pages/BrandFoundationPage";
import { FaqPage } from "./pages/FaqPage";
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
      { path: "collection", Component: CollectionPage },
      { path: "size-guide", Component: SizeGuidePage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "payment-success", Component: PaymentSuccessPage },
      { path: "payment-cancelled", Component: PaymentCancelledPage },
      { path: "payment-error", Component: PaymentErrorPage },
      { path: "about", Component: AboutPage },
      { path: "legal", Component: LegalPage },
      { path: "privacy", Component: PrivacyPage },
      { path: "shipping-returns", Component: ShippingReturnsPage },
      { path: "contact", Component: ContactPage },
      { path: "review/:token", Component: ReviewPage },
      { path: "brand-foundation", Component: BrandFoundationPage },
      { path: "faq", Component: FaqPage },
    ],
  },
  { path: "products", element: <Navigate to="/en/products" replace /> },
  { path: "collection", element: <Navigate to="/en/collection" replace /> },
  { path: "faq", element: <Navigate to="/en/faq" replace /> },
  { path: "about", element: <Navigate to="/en/about" replace /> },
  { path: "brand-foundation", element: <Navigate to="/en/brand-foundation" replace /> },
  { path: "*", Component: NotFound },
]);
