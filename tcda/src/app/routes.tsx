import { lazy } from "react";
import { createBrowserRouter, Navigate, useParams } from "react-router";

function ProductRedirect() {
  const { id } = useParams();
  return <Navigate to={`/en/product/${id}`} replace />;
}

import { Root } from "./pages/Root";
import { LangRedirect } from "./pages/LangRedirect";

const TopPage             = lazy(() => import("./pages/TopPage").then(m => ({ default: m.TopPage })));
const ProductPage         = lazy(() => import("./pages/ProductPage").then(m => ({ default: m.ProductPage })));
const AboutPage           = lazy(() => import("./pages/AboutPage").then(m => ({ default: m.AboutPage })));
const ArchivePage         = lazy(() => import("./pages/ArchivePage").then(m => ({ default: m.ArchivePage })));
const CartPage            = lazy(() => import("./pages/CartPage").then(m => ({ default: m.CartPage })));
const CheckoutPage        = lazy(() => import("./pages/CheckoutPage").then(m => ({ default: m.CheckoutPage })));
const PaymentSuccessPage  = lazy(() => import("./pages/PaymentSuccessPage").then(m => ({ default: m.PaymentSuccessPage })));
const PaymentCancelledPage= lazy(() => import("./pages/PaymentCancelledPage").then(m => ({ default: m.PaymentCancelledPage })));
const PaymentErrorPage    = lazy(() => import("./pages/PaymentErrorPage").then(m => ({ default: m.PaymentErrorPage })));
const CollectionPage      = lazy(() => import("./pages/CollectionPage").then(m => ({ default: m.CollectionPage })));
const SizeGuidePage       = lazy(() => import("./pages/SizeGuidePage").then(m => ({ default: m.SizeGuidePage })));
const LegalPage           = lazy(() => import("./pages/LegalPage").then(m => ({ default: m.LegalPage })));
const PrivacyPage         = lazy(() => import("./pages/PrivacyPage").then(m => ({ default: m.PrivacyPage })));
const ShippingReturnsPage = lazy(() => import("./pages/ShippingReturnsPage").then(m => ({ default: m.ShippingReturnsPage })));
const ContactPage         = lazy(() => import("./pages/ContactPage").then(m => ({ default: m.ContactPage })));
const ReviewPage          = lazy(() => import("./pages/ReviewPage").then(m => ({ default: m.ReviewPage })));
const FaqPage             = lazy(() => import("./pages/FaqPage").then(m => ({ default: m.FaqPage })));
const NotFound            = lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })));

export const router = createBrowserRouter([
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
      { path: "faq", Component: FaqPage },
    ],
  },
  { path: "product/:id", element: <ProductRedirect /> },
  { path: "products", element: <Navigate to="/en/products" replace /> },
  { path: "collection", element: <Navigate to="/en/collection" replace /> },
  { path: "faq", element: <Navigate to="/en/faq" replace /> },
  { path: "about", element: <Navigate to="/en/about" replace /> },
  { path: "*", Component: NotFound },
]);
