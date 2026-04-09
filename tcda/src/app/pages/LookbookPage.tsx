import { motion } from "motion/react";
import { Link } from "react-router";
import { useGlobalContext } from "./Root";
import { getTranslation } from "../data/translations";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const CDN = "https://cdn.tcdashop.com/look";

const LOOKS = [
  { img: `${CDN}/001.webp`, name: "Unisex Zip Hoodie", productId: "4a69aec4-915d-4bd5-9eed-ccbd2b50c0ae", span: "full" },
  { img: `${CDN}/002.webp`, name: "Unisex Zip Hoodie", productId: "e8437d7c-e040-44da-a5c0-211996a6f75a", span: "half" },
  { img: `${CDN}/003.webp`, name: "Unisex Zip Hoodie", productId: "e6dfc933-6c59-46c6-9858-ed2f06cdd2d6", span: "half" },
  { img: `${CDN}/004.webp`, name: "Unisex Hoodie", productId: "80f7385f-2d2d-4a00-a2b9-73fc1db31540", span: "half" },
  { img: `${CDN}/005.webp`, name: "Unisex Hoodie", productId: "923fb75d-33e3-4d36-83ae-b1d11bd8a321", span: "half" },
  { img: `${CDN}/006.webp`, name: "Unisex Hoodie", productId: "42aa7b08-c68a-489a-a7ac-9bc14263adee", span: "full" },
  { img: `${CDN}/007.webp`, name: "Men's T-shirt", productId: "624896bf-d906-425b-ae3c-bf64f95142ee", span: "full" },
  { img: `${CDN}/008.webp`, name: "Men's T-shirt", productId: "a0af00b9-8743-426b-be56-433c671a7ee1", span: "half" },
  { img: `${CDN}/009.webp`, name: "Men's T-shirt", productId: "3c2c6e54-99ab-496a-b392-26dacd5fa1c8", span: "half" },
  { img: `${CDN}/010.webp`, name: "Men's T-shirt", productId: "88314d0d-cbc5-4c63-9d5c-b6c2f0d8a44d", span: "full" },
  { img: `${CDN}/011.webp`, name: "Women's T-shirt", productId: "d5664f2e-776c-44a7-ae81-ac29c3775cb1", span: "half" },
  { img: `${CDN}/012.webp`, name: "Women's T-shirt", productId: "a75e2f20-f668-46c5-a2b7-54df0d133f9d", span: "half" },
  { img: `${CDN}/013.webp`, name: "Women's T-shirt", productId: "dc0db78d-864c-40bd-89a8-0defa8f74b40", span: "full" },
  { img: `${CDN}/014.webp`, name: "Women's T-shirt", productId: "f4aff5c0-c546-44c5-b79e-866805ab8ea2", span: "full" },
];

export function LookbookPage() {
  const { language } = useGlobalContext();
  const t = (key: Parameters<typeof getTranslation>[1]) => getTranslation(language, key);

  const rows: (typeof LOOKS[number])[][] = [];
  let i = 0;
  while (i < LOOKS.length) {
    if (LOOKS[i].span === "full") {
      rows.push([LOOKS[i]]);
      i++;
    } else {
      rows.push([LOOKS[i], LOOKS[i + 1]].filter(Boolean) as typeof LOOKS);
      i += 2;
    }
  }

  return (
    <div className="bg-black min-h-screen">
      <div className="pt-24 pb-4 px-8 md:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-white/20 text-[10px] font-light tracking-[0.5em] uppercase"
        >
          {t("look")}
        </motion.p>
      </div>

      <div className="flex flex-col gap-px">
        {rows.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-px"
          >
            {row.map((look, idx) => (
              <Link
                key={idx}
                to={`/product/${look.productId}`}
                className="group relative overflow-hidden flex-1"
                style={{ height: row.length === 1 ? "100vh" : "60vh" }}
              >
                <ImageWithFallback
                  src={look.img}
                  alt={look.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-500" />
                <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-[10px] font-light tracking-[0.3em] uppercase">
                    {look.name}
                  </p>
                  <span className="text-white/60 text-[9px] font-light tracking-[0.3em] uppercase border-b border-white/30 pb-0.5">
                    VIEW ITEM
                  </span>
                </div>
              </Link>
            ))}
          </motion.div>
        ))}
      </div>

      <div className="py-20 flex justify-center border-t border-white/5">
        <Link
          to="/products"
          className="text-white/30 text-[10px] font-light tracking-[0.4em] uppercase hover:text-white/70 transition-colors duration-300 border-b border-white/10 hover:border-white/40 pb-2"
        >
          {t("shop")}
        </Link>
      </div>
    </div>
  );
}
