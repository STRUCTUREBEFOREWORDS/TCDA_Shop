import { createBrowserRouter, Navigate } from "react-router";
import { Root } from "./pages/Root";
import { TopPage } from "./pages/TopPage";
import { ProductPage } from "./pages/ProductPage";
import { AboutPage } from "./pages/AboutPage";
import { ArchivePage } from "./pages/ArchivePage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { LookbookPage } from "./pages/LookbookPage";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: TopPage },
      { path: "product/:id", Component: ProductPage },
      // PLP — /products is canonical; /archive redirects
      { path: "products", Component: ArchivePage },
      { path: "archive", element: <Navigate to="/products" replace /> },
      // New pages
      { path: "look", Component: LookbookPage },
      { path: "cart", Component: CartPage },
      { path: "checkout", Component: CheckoutPage },
      { path: "about", Component: AboutPage },
      { path: "*", Component: NotFound },
    ],
  },
]);
