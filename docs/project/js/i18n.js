/**
 * TCDA — Internationalization (i18n)
 * Supported languages: en, zh, es, ar, ja
 * Usage: add data-i18n="key" to elements; i18n.apply() replaces textContent.
 * For HTML content use data-i18n-html="key".
 * For placeholder/aria-label use data-i18n-attr='{"aria-label":"key"}'.
 */

(function (global) {
  "use strict";

  /* ── 1. Translation data ─────────────────────────────────────── */
  const TRANSLATIONS = {
    /* ── English ──────────────────────────────────────────────── */
    en: {
      /* Meta / title suffixes */
      title_home: "TCDA | Wear Art, Liberate Sensibility",
      title_brand: "Brand | TCDA",
      title_collection: "Collection | TCDA",
      title_lookbook: "Lookbook | TCDA",
      title_archive: "Archive | TCDA",
      title_shop: "Shop | TCDA",
      title_product_cnj: "Chroma Noise Jacket | TCDA",

      /* Navigation */
      nav_home: "Home",
      nav_art: "Art",
      nav_brand: "Brand",
      nav_about: "About",
      nav_collection: "Collection",
      nav_lookbook: "Lookbook",
      nav_archive: "Archive",
      nav_shop: "Shop",
      nav_open_menu: "Open menu",
      nav_close_menu: "Close menu",
      nav_menu: "Menu",

      /* Cart */
      cart_label: "Cart",
      cart_added: "Added",
      cart_add: "Add to Cart",

      /* Footer */
      footer_tagline:
        "Transcend Color Digital Apparel / Wear Art, Liberate Sensibility.",
      footer_tech:
        "HTTPS ready, Cloudflare compatible, secure checkout placeholder included.",

      /* Skip link */
      skip_link: "Skip to content",

      /* ─── index.html ─── */
      home_eyebrow: "Transcend Color Digital Apparel",
      home_h1_html: "Wear Art,<br />Liberate Sensibility.",
      home_lead:
        "A premium digital art apparel house where abstract chromatic compositions become wearable expression. The experience begins with art, then moves into philosophy, then product discovery.",
      home_btn_shop: "Enter Shop",
      home_btn_lookbook: "View Lookbook",
      home_hero_img_alt:
        "Editorial fashion model in immersive abstract color styling",
      home_phi_eyebrow: "Philosophy",
      home_phi_h2: "A Digital Art Museum You Can Wear",
      home_phi_p1:
        "TCDA treats garments as moving gallery walls. Every drop starts as abstract digital artwork and is translated into textile, silhouette, and motion.",
      home_phi_p2:
        "Our world is built for quiet intensity: neutral space, accurate color rendering, and deliberate visual rhythm.",
      home_phi_link: "Explore Brand Story",
      home_feat_eyebrow: "Featured Collection",
      home_feat_h2: "Chromatic Drift",
      home_feat_link: "View All Pieces",
      home_journey_eyebrow: "Journey",
      home_journey_h2: "Art Inspiration to Purchase Decision",
      home_journey_p:
        "Start with gallery immersion, understand the philosophy, then discover pieces designed for real-world wear.",
      home_journey_shop: "Shop Collection",
      home_journey_lookbook: "Open Lookbook",
      home_hero_title: "Art you can wear.",
      home_hero_lead_new:
        "TCDA is an art gallery and a fashion label at once. Enter through worldbuilding, discover artwork, then choose the piece that becomes part of your story.",
      home_cta_collection: "View Collection",
      home_cta_artwork: "View Artwork",
      home_art_eyebrow: "Featured Artwork",
      home_art_h2: "Gallery Fragments",
      home_art_link: "Open Art Archive",
      home_art_meta: "Artwork",
      home_col_eyebrow_new: "Collection",
      home_col_h2_new: "Hoodie / T-shirt / Shoes",
      home_col_link_new: "Go to Shop",
      home_cat_hoodie: "Hoodie",
      home_cat_hoodie_desc: "Structured silhouettes for layered daily wear.",
      home_cat_tshirt: "T-shirt",
      home_cat_tshirt_desc:
        "High-fidelity all-over print with gallery-grade color.",
      home_cat_shoes: "Shoes",
      home_cat_shoes_desc:
        "Movement-focused pieces to complete the visual language.",
      home_story_eyebrow: "Brand Story",
      home_story_h2: "Wear Art. Liberate Sensibility.",
      home_story_p1:
        "We do not sell garments as objects. We design an entry point into a world where color, memory, and motion become identity.",
      home_story_p2:
        "The path is intentional: world view, artwork, collection, trust, and then purchase.",
      home_story_link: "Read Concept",
      home_social_eyebrow: "Social",
      home_social_h2: "Instagram Journal",
      home_social_p:
        "Follow artwork studies, in-progress drops, and editorial previews.",
      home_social_btn: "Open Instagram",
      home_social_lookbook: "View Lookbook",
      home_footer_line:
        "Transcend Color Digital Apparel / Art Gallery + Fashion EC",

      /* ─── brand.html ─── */
      brand_eyebrow: "Brand",
      brand_h1_html: "Art Becomes Clothing,<br />Clothing Becomes Voice.",
      brand_lead:
        "TCDA exists to merge abstract digital art with premium garment craft. We design wearable pieces that carry emotional color architecture into everyday movement.",
      brand_hero_img_alt:
        "Creative director shaping a digital art fashion garment",
      brand_concept_eyebrow: "Wearable Art",
      brand_concept_h2: "Concept",
      brand_concept_p:
        "Each release starts from an original digital canvas. Layers of color, noise, and gradients are mapped to texture, cut, and silhouette, preserving visual intensity in physical form.",
      brand_method_eyebrow: "Creative Philosophy",
      brand_method_h2: "Method",
      brand_method_p:
        "We remove visual noise so the artwork can breathe. Neutral environments, disciplined typography, and cinematic spacing place focus where it belongs: on color and shape.",
      brand_process_eyebrow: "Storytelling",
      brand_process_h2: "Three-Step Creative Process",
      brand_step1_meta: "01 Art Creation",
      brand_step1_h3: "Digital Abstraction",
      brand_step1_p:
        "Original artwork is generated and curated for emotion, rhythm, and chromatic precision.",
      brand_step2_meta: "02 Textile Translation",
      brand_step2_h3: "Material Dialogue",
      brand_step2_p:
        "Color data is translated into print and fabric behavior while preserving tonal depth.",
      brand_step3_meta: "03 Editorial Realization",
      brand_step3_h3: "Wearable Expression",
      brand_step3_p:
        "Final garments are shaped for cinematic presence, comfort, and lasting visual identity.",
      brand_footer_p: "TCDA Brand Story",
      brand_footer_link: "Continue to Collection",

      /* ─── collection.html ─── */
      col_eyebrow: "Collection",
      col_h1: "Gallery of Wearable Color Works",
      col_lead:
        "Each item is presented as a standalone gallery piece with focus on shape, light, and chromatic impact.",
      col_drop_eyebrow: "Current Drop",
      col_drop_h2: "Chromatic Drift Series",
      col_drop_link: "Shop This Drop",
      col_footer_p: "TCDA Collection",
      col_footer_link: "Open Product Page",

      /* ─── lookbook.html ─── */
      lb_eyebrow: "Lookbook",
      lb_h1: "Editorial Frames in Motion",
      lb_lead:
        "Large-scale fashion imagery designed to immerse viewers before product decision.",
      lb_vol_eyebrow: "Volume 01",
      lb_vol_h2: "Echoes of Colorfield",
      lb_ch1_meta: "Chapter 01",
      lb_ch1_h3: "Threshold",
      lb_ch1_p: "A calm opening where silhouette meets chromatic density.",
      lb_ch2_meta: "Chapter 02",
      lb_ch2_h3: "Interference",
      lb_ch2_p: "Color gradients shift with body movement and light.",
      lb_ch3_meta: "Chapter 03",
      lb_ch3_h3: "Release",
      lb_ch3_p: "Garment as visual language and personal signature.",
      lb_footer_p: "TCDA Lookbook",
      lb_footer_link: "Go to Shop",

      /* ─── archive.html ─── */
      arc_eyebrow: "Archive",
      arc_h1: "Original Digital Artwork Library",
      arc_lead:
        "The source archive where abstract works are curated before being transformed into garments.",
      arc_art_eyebrow: "Artworks",
      arc_art_h2: "Spectrum Fragments",
      arc_a019_h3: "Color Echo Plane",
      arc_a027_h3: "Vapor Contour Grid",
      arc_a031_h3: "Muted Prism Shift",
      arc_footer_p: "TCDA Archive",
      arc_footer_link: "View Garment Translations",

      /* ─── shop.html ─── */
      shop_eyebrow: "Shop",
      shop_h1: "Minimal Product Grid",
      shop_lead:
        "Clean cards, high-resolution previews, and a secure checkout placeholder ready for future API integration.",
      shop_checkout_btn: "Secure Checkout Placeholder",
      shop_checkout_status:
        "Checkout backend ready for future Stripe/Printful integration.",
      shop_footer_p: "TCDA Shop",
      shop_footer_tech:
        "Semantic markup, lightweight code, WebP optimized visuals.",

      /* ─── product page ─── */
      prod_cnj_eyebrow: "Outerwear / Limited Edition",
      prod_cnj_title: "Chroma Noise Jacket",
      prod_cnj_tag1: "Artwork Mapped Print",
      prod_cnj_tag2: "Unisex Fit",
      prod_cnj_tag3: "Limited Drop",
      prod_cnj_art_h2: "Artwork Description",
      prod_cnj_art_p:
        "Inspired by digital archive piece A-019, this jacket captures cyan interference and dark granular rhythm. The structure is shaped to preserve color impact under movement.",
      prod_cnj_mat_h2: "Material Information",
      prod_cnj_mat_li1: "Shell: 100% recycled technical polyester",
      prod_cnj_mat_li2: "Lining: breathable cupro blend",
      prod_cnj_mat_li3: "Print: high-fidelity transfer for color accuracy",
      prod_cnj_mat_li4: "Production: small-batch craftsmanship, made in Japan",
      prod_cnj_size_meta: "Size",
      prod_cnj_add: "Add to Cart",
      prod_cnj_checkout: "Secure Checkout Placeholder",
      prod_cnj_back: "Back to Shop",
      prod_cnj_status:
        "Future integrations: Stripe, Printful API, order system, customer accounts.",
      prod_cnj_notice:
        "Cloudflare-compatible architecture and HTTPS-first deployment recommended.",
      prod_cnj_size_table: "Size Chart",
      prod_cnj_size_col_size: "Size",
      prod_cnj_size_col_chest: "Chest Width",
      prod_cnj_size_col_sleeve: "Sleeve Length",
      prod_cnj_size_col_length: "Total Length",
      prod_related_eyebrow: "Related Products",
      prod_related_h2: "Complete the Story",
      prod_footer_p: "TCDA Product Page",
      prod_footer_link: "See Original Artwork Archive",

      /* Shared product names / categories */
      cat_outerwear: "Outerwear",
      cat_dress: "Dress",
      cat_shirt: "Shirt",
      cat_coat: "Coat",
      cat_bottoms: "Bottoms",
      cat_set: "Set",
      prod_chroma_jacket: "Chroma Noise Jacket",
      prod_spectral_dress: "Spectral Veil Dress",
      prod_prism_shirt: "Prism Silence Shirt",
      prod_cyan_coat: "Cyan Echo Coat",
      prod_afterglow: "Afterglow Trousers",
      prod_monochrome: "Monochrome Drift Set",
      prod_spectrum_fold: "Spectrum Fold Dress",

      /* Language / currency switcher UI */
      lang_label: "Language",
      currency_label: "Currency",
    },

    /* ── 中文（简体）─────────────────────────────────────────── */
    zh: {
      title_home: "TCDA | 穿上艺术，解放感性",
      title_brand: "品牌 | TCDA",
      title_collection: "系列 | TCDA",
      title_lookbook: "造型册 | TCDA",
      title_archive: "档案馆 | TCDA",
      title_shop: "商店 | TCDA",
      title_product_cnj: "色彩噪点夹克 | TCDA",
      nav_home: "首页",
      nav_art: "艺术",
      nav_brand: "品牌",
      nav_about: "关于",
      nav_collection: "系列",
      nav_lookbook: "造型册",
      nav_archive: "档案馆",
      nav_shop: "商店",
      nav_open_menu: "打开菜单",
      nav_close_menu: "关闭菜单",
      nav_menu: "菜单",
      cart_label: "购物车",
      cart_added: "已添加",
      cart_add: "加入购物车",
      footer_tagline: "超越色彩数字服装 / 穿上艺术，解放感性",
      footer_tech: "支持 HTTPS、Cloudflare，包含安全结账占位符。",
      skip_link: "跳转到内容",
      home_eyebrow: "超越色彩数字服装",
      home_h1_html: "穿上艺术，<br />解放感性。",
      home_lead:
        "一个高端数字艺术服装品牌，将抽象色彩构成转化为可穿戴的表达。体验从艺术开始，进入哲学，再走向商品发现。",
      home_btn_shop: "进入商店",
      home_btn_lookbook: "查看造型册",
      home_hero_img_alt: "沉浸式抽象色彩造型的时尚模特",
      home_phi_eyebrow: "哲学",
      home_phi_h2: "一件可以穿的数字艺术博物馆",
      home_phi_p1:
        "TCDA 将服装视为移动的画廊墙。每次发布都从抽象数字艺术作品开始，转化为面料、轮廓与动态。",
      home_phi_p2:
        "我们的世界为宁静的强度而建：中性空间、精准的色彩呈现，以及刻意的视觉节奏。",
      home_phi_link: "探索品牌故事",
      home_feat_eyebrow: "精选系列",
      home_feat_h2: "色彩漂移",
      home_feat_link: "查看所有作品",
      home_journey_eyebrow: "旅程",
      home_journey_h2: "从艺术灵感到购买决策",
      home_journey_p:
        "从沉浸式画廊体验开始，理解哲学，然后发现为现实穿着而设计的作品。",
      home_journey_shop: "选购系列",
      home_journey_lookbook: "打开造型册",
      home_hero_title: "可穿的艺术。",
      home_hero_lead_new:
        "TCDA 同时是艺术画廊与时装品牌。从世界观进入，发现作品，再选择成为你故事一部分的单品。",
      home_cta_collection: "查看系列",
      home_cta_artwork: "查看作品",
      home_art_eyebrow: "精选作品",
      home_art_h2: "画廊片段",
      home_art_link: "打开艺术档案",
      home_art_meta: "作品",
      home_col_eyebrow_new: "系列",
      home_col_h2_new: "连帽衫 / T恤 / 鞋履",
      home_col_link_new: "前往商店",
      home_cat_hoodie: "连帽衫",
      home_cat_hoodie_desc: "为日常叠穿打造的结构化轮廓。",
      home_cat_tshirt: "T恤",
      home_cat_tshirt_desc: "画廊级色彩表现的高保真满版印花。",
      home_cat_shoes: "鞋履",
      home_cat_shoes_desc: "强调行动感，完善整体视觉语言。",
      home_story_eyebrow: "品牌故事",
      home_story_h2: "穿上艺术，解放感性。",
      home_story_p1:
        "我们销售的不是衣物本身，而是一个由色彩、记忆与运动构成的世界入口。",
      home_story_p2: "路径是刻意设计的：世界观、作品、系列、信赖，然后购买。",
      home_story_link: "阅读理念",
      home_social_eyebrow: "社交",
      home_social_h2: "Instagram 日志",
      home_social_p: "关注作品研究、上新进度与编辑视觉预告。",
      home_social_btn: "打开 Instagram",
      home_social_lookbook: "查看造型册",
      home_footer_line: "Transcend Color Digital Apparel / 艺术画廊 + 时装电商",
      brand_eyebrow: "品牌",
      brand_h1_html: "艺术化为服装，<br />服装化为声音。",
      brand_lead:
        "TCDA 致力于将抽象数字艺术与高端服装工艺融合。我们设计的可穿戴作品将情感色彩架构带入日常运动。",
      brand_hero_img_alt: "创意总监塑造数字艺术时装",
      brand_concept_eyebrow: "可穿戴艺术",
      brand_concept_h2: "概念",
      brand_concept_p:
        "每件作品始于一幅原创数字画布。色彩、噪点和渐变层次被映射到质感、裁剪和轮廓，在实体形态中保留视觉强度。",
      brand_method_eyebrow: "创意哲学",
      brand_method_h2: "方法",
      brand_method_p:
        "我们去除视觉噪点，让艺术品自由呼吸。中性环境、严谨的排版和电影质感的间距，将焦点放在色彩与形状上。",
      brand_process_eyebrow: "叙事",
      brand_process_h2: "三步创意流程",
      brand_step1_meta: "01 艺术创作",
      brand_step1_h3: "数字抽象",
      brand_step1_p: "原创作品以情感、节奏和色彩精度为目标，经过生成与策展。",
      brand_step2_meta: "02 纺织转化",
      brand_step2_h3: "材料对话",
      brand_step2_p: "色彩数据被转化为印刷和面料行为，同时保留色调深度。",
      brand_step3_meta: "03 编辑实现",
      brand_step3_h3: "可穿戴表达",
      brand_step3_p: "最终服装以电影质感、舒适度和持久视觉认同为目标成形。",
      brand_footer_p: "TCDA 品牌故事",
      brand_footer_link: "继续查看系列",
      col_eyebrow: "系列",
      col_h1: "可穿戴色彩作品画廊",
      col_lead: "每件作品作为独立画廊展品呈现，专注于形状、光线和色彩冲击。",
      col_drop_eyebrow: "当前发布",
      col_drop_h2: "色彩漂移系列",
      col_drop_link: "选购本系列",
      col_footer_p: "TCDA 系列",
      col_footer_link: "打开商品页面",
      lb_eyebrow: "造型册",
      lb_h1: "动态中的编辑帧",
      lb_lead: "大型时装影像，旨在产品决策前让观者沉浸其中。",
      lb_vol_eyebrow: "第 01 辑",
      lb_vol_h2: "色域回响",
      lb_ch1_meta: "第 01 章",
      lb_ch1_h3: "门槛",
      lb_ch1_p: "轮廓与色彩密度相遇的宁静开篇。",
      lb_ch2_meta: "第 02 章",
      lb_ch2_h3: "干涉",
      lb_ch2_p: "色彩渐变随身体运动和光线移动。",
      lb_ch3_meta: "第 03 章",
      lb_ch3_h3: "释放",
      lb_ch3_p: "服装作为视觉语言与个人签名。",
      lb_footer_p: "TCDA 造型册",
      lb_footer_link: "前往商店",
      arc_eyebrow: "档案馆",
      arc_h1: "原创数字艺术库",
      arc_lead: "在转化为服装之前，抽象作品在此进行策展的源档案。",
      arc_art_eyebrow: "艺术作品",
      arc_art_h2: "光谱碎片",
      arc_a019_h3: "色彩回响平面",
      arc_a027_h3: "蒸汽轮廓网格",
      arc_a031_h3: "静音棱镜偏移",
      arc_footer_p: "TCDA 档案馆",
      arc_footer_link: "查看服装转化",
      shop_eyebrow: "商店",
      shop_h1: "极简商品网格",
      shop_lead:
        "简洁卡片、高分辨率预览，以及为未来 API 集成准备好的安全结账占位符。",
      shop_checkout_btn: "安全结账占位符",
      shop_checkout_status: "结账后端已准备好，等待未来 Stripe/Printful 集成。",
      shop_footer_p: "TCDA 商店",
      shop_footer_tech: "语义标记，轻量代码，WebP 优化视觉。",
      prod_cnj_eyebrow: "外套 / 限量版",
      prod_cnj_title: "色彩噪点夹克",
      prod_cnj_tag1: "艺术映射印花",
      prod_cnj_tag2: "中性剪裁",
      prod_cnj_tag3: "限量发售",
      prod_cnj_art_h2: "艺术作品说明",
      prod_cnj_art_p:
        "灵感来自数字档案作品 A-019，这件夹克捕捉了青色干涉与深色颗粒节奏。结构经过设计，在运动中保留色彩冲击。",
      prod_cnj_mat_h2: "材料信息",
      prod_cnj_mat_li1: "外壳：100% 再生技术聚酯",
      prod_cnj_mat_li2: "里衬：透气混纺铜氨纤维",
      prod_cnj_mat_li3: "印花：高保真转印，色彩精准",
      prod_cnj_mat_li4: "生产：小批量工艺，日本制造",
      prod_cnj_size_meta: "尺码",
      prod_cnj_add: "加入购物车",
      prod_cnj_checkout: "安全结账占位符",
      prod_cnj_back: "返回商店",
      prod_cnj_status: "未来集成：Stripe、Printful API、订单系统、客户账户。",
      prod_cnj_notice: "推荐使用 Cloudflare 兼容架构和 HTTPS 优先部署。",
      prod_cnj_size_table: "尺码表",
      prod_cnj_size_col_size: "尺码",
      prod_cnj_size_col_chest: "胸宽",
      prod_cnj_size_col_sleeve: "袖长",
      prod_cnj_size_col_length: "总长",
      prod_related_eyebrow: "相关商品",
      prod_related_h2: "完成故事",
      prod_footer_p: "TCDA 商品页面",
      prod_footer_link: "查看原创艺术档案",
      cat_outerwear: "外套",
      cat_dress: "连衣裙",
      cat_shirt: "衬衫",
      cat_coat: "大衣",
      cat_bottoms: "裤装",
      cat_set: "套装",
      prod_chroma_jacket: "色彩噪点夹克",
      prod_spectral_dress: "光谱面纱连衣裙",
      prod_prism_shirt: "棱镜静默衬衫",
      prod_cyan_coat: "青色回响大衣",
      prod_afterglow: "余晖长裤",
      prod_monochrome: "单色漂移套装",
      prod_spectrum_fold: "光谱折叠连衣裙",
      lang_label: "语言",
      currency_label: "货币",
    },

    /* ── Español ───────────────────────────────────────────────── */
    es: {
      title_home: "TCDA | Viste el Arte, Libera la Sensibilidad",
      title_brand: "Marca | TCDA",
      title_collection: "Colección | TCDA",
      title_lookbook: "Lookbook | TCDA",
      title_archive: "Archivo | TCDA",
      title_shop: "Tienda | TCDA",
      title_product_cnj: "Chaqueta Chroma Noise | TCDA",
      nav_home: "Inicio",
      nav_art: "Arte",
      nav_brand: "Marca",
      nav_about: "Acerca de",
      nav_collection: "Colección",
      nav_lookbook: "Lookbook",
      nav_archive: "Archivo",
      nav_shop: "Tienda",
      nav_open_menu: "Abrir menú",
      nav_close_menu: "Cerrar menú",
      nav_menu: "Menú",
      cart_label: "Carrito",
      cart_added: "Añadido",
      cart_add: "Añadir al carrito",
      footer_tagline:
        "Transcend Color Digital Apparel / Viste el Arte, Libera la Sensibilidad.",
      footer_tech:
        "Listo para HTTPS, compatible con Cloudflare, con marcador de pago seguro.",
      skip_link: "Saltar al contenido",
      home_eyebrow: "Transcend Color Digital Apparel",
      home_h1_html: "Viste el Arte,<br />Libera la Sensibilidad.",
      home_lead:
        "Una casa de moda digital premium donde composiciones cromáticas abstractas se convierten en expresión portable. La experiencia comienza con el arte, luego pasa a la filosofía y al descubrimiento de productos.",
      home_btn_shop: "Entrar a la Tienda",
      home_btn_lookbook: "Ver Lookbook",
      home_hero_img_alt: "Modelo editorial con estilismo abstracto e inmersivo",
      home_phi_eyebrow: "Filosofía",
      home_phi_h2: "Un Museo de Arte Digital que Puedes Vestir",
      home_phi_p1:
        "TCDA trata las prendas como paredes de galería en movimiento. Cada lanzamiento comienza como una obra de arte digital abstracta que se traduce en tejido, silueta y movimiento.",
      home_phi_p2:
        "Nuestro mundo está construido para la intensidad silenciosa: espacio neutro, representación precisa del color y ritmo visual deliberado.",
      home_phi_link: "Explorar la Historia de la Marca",
      home_feat_eyebrow: "Colección Destacada",
      home_feat_h2: "Chromatic Drift",
      home_feat_link: "Ver Todas las Piezas",
      home_journey_eyebrow: "Recorrido",
      home_journey_h2: "De la Inspiración Artística a la Decisión de Compra",
      home_journey_p:
        "Comienza con la inmersión en la galería, comprende la filosofía y descubre piezas diseñadas para el uso cotidiano.",
      home_journey_shop: "Comprar Colección",
      home_journey_lookbook: "Abrir Lookbook",
      home_hero_title: "Arte que puedes vestir.",
      home_hero_lead_new:
        "TCDA es al mismo tiempo una galería de arte y una marca de moda. Entra por el universo visual, descubre obras y elige la pieza que se convierte en parte de tu historia.",
      home_cta_collection: "Ver Colección",
      home_cta_artwork: "Ver Obras",
      home_art_eyebrow: "Obras Destacadas",
      home_art_h2: "Fragmentos de Galería",
      home_art_link: "Abrir Archivo de Arte",
      home_art_meta: "Obra",
      home_col_eyebrow_new: "Colección",
      home_col_h2_new: "Hoodie / T-shirt / Shoes",
      home_col_link_new: "Ir a la Tienda",
      home_cat_hoodie: "Hoodie",
      home_cat_hoodie_desc: "Siluetas estructuradas para capas de uso diario.",
      home_cat_tshirt: "T-shirt",
      home_cat_tshirt_desc:
        "Impresión all-over de alta fidelidad con color de nivel galería.",
      home_cat_shoes: "Shoes",
      home_cat_shoes_desc:
        "Piezas centradas en el movimiento para completar el lenguaje visual.",
      home_story_eyebrow: "Historia de Marca",
      home_story_h2: "Wear Art. Liberate Sensibility.",
      home_story_p1:
        "No vendemos prendas como objetos. Diseñamos una entrada a un mundo donde color, memoria y movimiento se vuelven identidad.",
      home_story_p2:
        "El recorrido es intencional: visión del mundo, obra, colección, confianza y luego compra.",
      home_story_link: "Leer Concepto",
      home_social_eyebrow: "Social",
      home_social_h2: "Diario de Instagram",
      home_social_p:
        "Sigue estudios de obra, avances de drops y previews editoriales.",
      home_social_btn: "Abrir Instagram",
      home_social_lookbook: "Ver Lookbook",
      home_footer_line:
        "Transcend Color Digital Apparel / Galería de Arte + Fashion EC",
      brand_eyebrow: "Marca",
      brand_h1_html:
        "El Arte se Convierte en Ropa,<br />la Ropa se Convierte en Voz.",
      brand_lead:
        "TCDA existe para fusionar el arte digital abstracto con la confección premium. Diseñamos piezas portables que llevan la arquitectura cromática emocional al movimiento cotidiano.",
      brand_hero_img_alt:
        "Director creativo dando forma a una prenda de moda digital",
      brand_concept_eyebrow: "Arte Portable",
      brand_concept_h2: "Concepto",
      brand_concept_p:
        "Cada lanzamiento comienza desde un lienzo digital original. Las capas de color, ruido y degradados se mapean en textura, corte y silueta, preservando la intensidad visual en forma física.",
      brand_method_eyebrow: "Filosofía Creativa",
      brand_method_h2: "Método",
      brand_method_p:
        "Eliminamos el ruido visual para que la obra respire. Entornos neutros, tipografía disciplinada y espaciado cinematográfico enfocan la atención donde corresponde: en el color y la forma.",
      brand_process_eyebrow: "Narrativa",
      brand_process_h2: "Proceso Creativo en Tres Pasos",
      brand_step1_meta: "01 Creación Artística",
      brand_step1_h3: "Abstracción Digital",
      brand_step1_p:
        "La obra original se genera y selecciona por emoción, ritmo y precisión cromática.",
      brand_step2_meta: "02 Traducción Textil",
      brand_step2_h3: "Diálogo Material",
      brand_step2_p:
        "Los datos de color se traducen en comportamiento de impresión y tejido conservando la profundidad tonal.",
      brand_step3_meta: "03 Realización Editorial",
      brand_step3_h3: "Expresión Portable",
      brand_step3_p:
        "Las prendas finales se moldean para una presencia cinematográfica, confort e identidad visual duradera.",
      brand_footer_p: "Historia de la Marca TCDA",
      brand_footer_link: "Continuar a la Colección",
      col_eyebrow: "Colección",
      col_h1: "Galería de Obras de Color Portables",
      col_lead:
        "Cada pieza se presenta como una obra de galería independiente con énfasis en forma, luz e impacto cromático.",
      col_drop_eyebrow: "Lanzamiento Actual",
      col_drop_h2: "Serie Chromatic Drift",
      col_drop_link: "Comprar Este Lanzamiento",
      col_footer_p: "Colección TCDA",
      col_footer_link: "Abrir Página del Producto",
      lb_eyebrow: "Lookbook",
      lb_h1: "Fotogramas Editoriales en Movimiento",
      lb_lead:
        "Imágenes de moda a gran escala diseñadas para sumergir al espectador antes de la decisión de compra.",
      lb_vol_eyebrow: "Volumen 01",
      lb_vol_h2: "Ecos de Campo de Color",
      lb_ch1_meta: "Capítulo 01",
      lb_ch1_h3: "Umbral",
      lb_ch1_p:
        "Una apertura tranquila donde la silueta se encuentra con la densidad cromática.",
      lb_ch2_meta: "Capítulo 02",
      lb_ch2_h3: "Interferencia",
      lb_ch2_p:
        "Los degradados de color cambian con el movimiento del cuerpo y la luz.",
      lb_ch3_meta: "Capítulo 03",
      lb_ch3_h3: "Liberación",
      lb_ch3_p: "La prenda como lenguaje visual y firma personal.",
      lb_footer_p: "Lookbook TCDA",
      lb_footer_link: "Ir a la Tienda",
      arc_eyebrow: "Archivo",
      arc_h1: "Biblioteca de Arte Digital Original",
      arc_lead:
        "El archivo fuente donde las obras abstractas son seleccionadas antes de transformarse en prendas.",
      arc_art_eyebrow: "Obras de Arte",
      arc_art_h2: "Fragmentos del Espectro",
      arc_a019_h3: "Plano de Eco de Color",
      arc_a027_h3: "Cuadrícula de Contorno de Vapor",
      arc_a031_h3: "Desplazamiento de Prisma Silenciado",
      arc_footer_p: "Archivo TCDA",
      arc_footer_link: "Ver Traducciones de Prendas",
      shop_eyebrow: "Tienda",
      shop_h1: "Cuadrícula de Productos Minimalista",
      shop_lead:
        "Tarjetas limpias, vistas previas en alta resolución y un marcador de pago seguro listo para futura integración de API.",
      shop_checkout_btn: "Marcador de Pago Seguro",
      shop_checkout_status:
        "Backend de pago listo para futura integración Stripe/Printful.",
      shop_footer_p: "Tienda TCDA",
      shop_footer_tech:
        "Marcado semántico, código ligero, visuales optimizados en WebP.",
      prod_cnj_eyebrow: "Exterior / Edición Limitada",
      prod_cnj_title: "Chaqueta Chroma Noise",
      prod_cnj_tag1: "Estampado Mapeado de Arte",
      prod_cnj_tag2: "Corte Unisex",
      prod_cnj_tag3: "Lanzamiento Limitado",
      prod_cnj_art_h2: "Descripción de la Obra",
      prod_cnj_art_p:
        "Inspirada en la pieza de archivo digital A-019, esta chaqueta captura la interferencia cian y el ritmo granular oscuro. La estructura está diseñada para preservar el impacto del color en movimiento.",
      prod_cnj_mat_h2: "Información de Materiales",
      prod_cnj_mat_li1: "Exterior: 100% poliéster técnico reciclado",
      prod_cnj_mat_li2: "Forro: mezcla de cupro transpirable",
      prod_cnj_mat_li3:
        "Estampado: transferencia de alta fidelidad para precisión cromática",
      prod_cnj_mat_li4:
        "Producción: artesanía en pequeños lotes, fabricado en Japón",
      prod_cnj_size_meta: "Talla",
      prod_cnj_add: "Añadir al Carrito",
      prod_cnj_checkout: "Marcador de Pago Seguro",
      prod_cnj_back: "Volver a la Tienda",
      prod_cnj_status:
        "Integraciones futuras: Stripe, API de Printful, sistema de pedidos, cuentas de clientes.",
      prod_cnj_notice:
        "Se recomienda arquitectura compatible con Cloudflare y despliegue con HTTPS primero.",
      prod_cnj_size_table: "Tabla de Tallas",
      prod_cnj_size_col_size: "Talla",
      prod_cnj_size_col_chest: "Ancho de Pecho",
      prod_cnj_size_col_sleeve: "Largo de Manga",
      prod_cnj_size_col_length: "Largo Total",
      prod_related_eyebrow: "Productos Relacionados",
      prod_related_h2: "Completa la Historia",
      prod_footer_p: "Página de Producto TCDA",
      prod_footer_link: "Ver Archivo de Arte Original",
      cat_outerwear: "Exterior",
      cat_dress: "Vestido",
      cat_shirt: "Camisa",
      cat_coat: "Abrigo",
      cat_bottoms: "Pantalones",
      cat_set: "Conjunto",
      prod_chroma_jacket: "Chaqueta Chroma Noise",
      prod_spectral_dress: "Vestido Spectral Veil",
      prod_prism_shirt: "Camisa Prism Silence",
      prod_cyan_coat: "Abrigo Cyan Echo",
      prod_afterglow: "Pantalones Afterglow",
      prod_monochrome: "Conjunto Monochrome Drift",
      prod_spectrum_fold: "Vestido Spectrum Fold",
      lang_label: "Idioma",
      currency_label: "Moneda",
    },

    /* ── العربية ──────────────────────────────────────────────── */
    ar: {
      title_home: "TCDA | ارتدِ الفن، حرِّر الإحساس",
      title_brand: "العلامة التجارية | TCDA",
      title_collection: "المجموعة | TCDA",
      title_lookbook: "كتاب الأزياء | TCDA",
      title_archive: "الأرشيف | TCDA",
      title_shop: "المتجر | TCDA",
      title_product_cnj: "جاكيت كروما نويز | TCDA",
      nav_home: "الرئيسية",
      nav_art: "الفن",
      nav_brand: "العلامة التجارية",
      nav_about: "حول",
      nav_collection: "المجموعة",
      nav_lookbook: "كتاب الأزياء",
      nav_archive: "الأرشيف",
      nav_shop: "المتجر",
      nav_open_menu: "فتح القائمة",
      nav_close_menu: "إغلاق القائمة",
      nav_menu: "القائمة",
      cart_label: "السلة",
      cart_added: "تمت الإضافة",
      cart_add: "أضف إلى السلة",
      footer_tagline: "تجاوز لون الملابس الرقمية / ارتدِ الفن، حرِّر الإحساس.",
      footer_tech: "جاهز لـ HTTPS، متوافق مع Cloudflare، يتضمن نقطة دفع آمنة.",
      skip_link: "تخطى إلى المحتوى",
      home_eyebrow: "تجاوز لون الملابس الرقمية",
      home_h1_html: "ارتدِ الفن،<br />حرِّر الإحساس.",
      home_lead:
        "دار أزياء فنية رقمية راقية تحوِّل التكوينات اللونية المجردة إلى تعبير يمكن ارتداؤه. تبدأ التجربة بالفن، ثم تنتقل إلى الفلسفة، ثم اكتشاف المنتج.",
      home_btn_shop: "ادخل إلى المتجر",
      home_btn_lookbook: "عرض كتاب الأزياء",
      home_hero_img_alt: "موديل أزياء بتصميم ألوان مجردة غامر",
      home_phi_eyebrow: "الفلسفة",
      home_phi_h2: "متحف فن رقمي يمكنك ارتداؤه",
      home_phi_p1:
        "تعامل TCDA الملابس كجدران معرض متحركة. يبدأ كل إصدار كعمل فني رقمي مجرد ويُترجم إلى نسيج وصورة ظلية وحركة.",
      home_phi_p2:
        "عالمنا مبني للكثافة الهادئة: مساحة محايدة، تصوير دقيق للألوان، وإيقاع بصري متعمد.",
      home_phi_link: "استكشف قصة العلامة التجارية",
      home_feat_eyebrow: "المجموعة المميزة",
      home_feat_h2: "الانجراف الكروماتي",
      home_feat_link: "عرض جميع القطع",
      home_journey_eyebrow: "الرحلة",
      home_journey_h2: "من الإلهام الفني إلى قرار الشراء",
      home_journey_p:
        "ابدأ بالانغماس في المعرض، وافهم الفلسفة، ثم اكتشف القطع المصممة للارتداء في العالم الحقيقي.",
      home_journey_shop: "تسوق المجموعة",
      home_journey_lookbook: "فتح كتاب الأزياء",
      home_hero_title: "فن يمكنك ارتداؤه.",
      home_hero_lead_new:
        "TCDA معرض فني وعلامة أزياء في الوقت نفسه. ادخل عبر العالم البصري، اكتشف الأعمال، ثم اختر القطعة التي تصبح جزءًا من قصتك.",
      home_cta_collection: "عرض المجموعة",
      home_cta_artwork: "عرض الأعمال",
      home_art_eyebrow: "أعمال مختارة",
      home_art_h2: "شظايا المعرض",
      home_art_link: "فتح أرشيف الفن",
      home_art_meta: "عمل فني",
      home_col_eyebrow_new: "المجموعة",
      home_col_h2_new: "Hoodie / T-shirt / Shoes",
      home_col_link_new: "اذهب إلى المتجر",
      home_cat_hoodie: "هودي",
      home_cat_hoodie_desc: "صور ظلية منظمة للارتداء اليومي متعدد الطبقات.",
      home_cat_tshirt: "تي شيرت",
      home_cat_tshirt_desc: "طباعة شاملة عالية الدقة بألوان بمستوى المعرض.",
      home_cat_shoes: "أحذية",
      home_cat_shoes_desc: "قطع تركّز على الحركة لإكمال اللغة البصرية.",
      home_story_eyebrow: "قصة العلامة",
      home_story_h2: "ارتدِ الفن. حرر الحس.",
      home_story_p1:
        "نحن لا نبيع الملابس كأشياء فقط. نصمم مدخلًا إلى عالم يصبح فيه اللون والذاكرة والحركة هوية.",
      home_story_p2:
        "المسار مقصود: رؤية العالم، العمل الفني، المجموعة، الثقة، ثم الشراء.",
      home_story_link: "اقرأ المفهوم",
      home_social_eyebrow: "اجتماعي",
      home_social_h2: "يوميات إنستغرام",
      home_social_p:
        "تابع دراسات الأعمال، تقدم الإصدارات، والمعاينات التحريرية.",
      home_social_btn: "فتح إنستغرام",
      home_social_lookbook: "عرض كتاب الأزياء",
      home_footer_line:
        "Transcend Color Digital Apparel / معرض فني + تجارة أزياء",
      brand_eyebrow: "العلامة التجارية",
      brand_h1_html: "الفن يصبح ملبسًا،<br />والملبس يصبح صوتًا.",
      brand_lead:
        "توجد TCDA لدمج الفن الرقمي المجرد مع صناعة الملابس الراقية. نصمم قطعًا قابلة للارتداء تحمل البنية اللونية العاطفية في الحركة اليومية.",
      brand_hero_img_alt: "المدير الإبداعي يشكّل قطعة أزياء فنية رقمية",
      brand_concept_eyebrow: "فن قابل للارتداء",
      brand_concept_h2: "المفهوم",
      brand_concept_p:
        "يبدأ كل إصدار من لوحة رقمية أصلية. تُعيّن طبقات اللون والضوضاء والتدرجات على الملمس والقص والصورة الظلية، مع الحفاظ على الكثافة البصرية في الشكل المادي.",
      brand_method_eyebrow: "الفلسفة الإبداعية",
      brand_method_h2: "المنهج",
      brand_method_p:
        "نزيل الضوضاء البصرية حتى يتنفس العمل الفني. البيئات المحايدة والطباعة المنضبطة والتباعد السينمائي تضع التركيز حيث ينتمي: على اللون والشكل.",
      brand_process_eyebrow: "السرد",
      brand_process_h2: "عملية إبداعية من ثلاث خطوات",
      brand_step1_meta: "٠١ الإبداع الفني",
      brand_step1_h3: "التجريد الرقمي",
      brand_step1_p:
        "يُولَّد العمل الأصلي ويُنتقى للعاطفة والإيقاع والدقة اللونية.",
      brand_step2_meta: "٠٢ الترجمة النسيجية",
      brand_step2_h3: "حوار المواد",
      brand_step2_p:
        "تُترجم بيانات اللون إلى سلوك البطاقة والقماش مع الحفاظ على العمق النغمي.",
      brand_step3_meta: "٠٣ الإدراك التحريري",
      brand_step3_h3: "تعبير قابل للارتداء",
      brand_step3_p:
        "تُشكَّل الملابس النهائية للحضور السينمائي والراحة والهوية البصرية الدائمة.",
      brand_footer_p: "قصة علامة TCDA التجارية",
      brand_footer_link: "تابع إلى المجموعة",
      col_eyebrow: "المجموعة",
      col_h1: "معرض أعمال لونية قابلة للارتداء",
      col_lead:
        "تُقدَّم كل قطعة كعمل معرض مستقل مع التركيز على الشكل والضوء والتأثير اللوني.",
      col_drop_eyebrow: "الإصدار الحالي",
      col_drop_h2: "سلسلة الانجراف الكروماتي",
      col_drop_link: "تسوق هذا الإصدار",
      col_footer_p: "مجموعة TCDA",
      col_footer_link: "فتح صفحة المنتج",
      lb_eyebrow: "كتاب الأزياء",
      lb_h1: "إطارات تحريرية في الحركة",
      lb_lead: "صور أزياء واسعة النطاق مصممة لإغراق المشاهدين قبل قرار الشراء.",
      lb_vol_eyebrow: "المجلد ٠١",
      lb_vol_h2: "أصداء حقل الألوان",
      lb_ch1_meta: "الفصل ٠١",
      lb_ch1_h3: "العتبة",
      lb_ch1_p: "افتتاح هادئ حيث تلتقي الصورة الظلية بكثافة لونية.",
      lb_ch2_meta: "الفصل ٠٢",
      lb_ch2_h3: "التداخل",
      lb_ch2_p: "تتحول تدرجات اللون مع حركة الجسم والضوء.",
      lb_ch3_meta: "الفصل ٠٣",
      lb_ch3_h3: "الإفراج",
      lb_ch3_p: "الملبس كلغة بصرية وتوقيع شخصي.",
      lb_footer_p: "كتاب أزياء TCDA",
      lb_footer_link: "الذهاب إلى المتجر",
      arc_eyebrow: "الأرشيف",
      arc_h1: "مكتبة الأعمال الفنية الرقمية الأصلية",
      arc_lead:
        "أرشيف المصدر حيث تُنتقى الأعمال المجردة قبل تحويلها إلى ملابس.",
      arc_art_eyebrow: "الأعمال الفنية",
      arc_art_h2: "شظايا الطيف",
      arc_a019_h3: "مستوى صدى الألوان",
      arc_a027_h3: "شبكة كفاف البخار",
      arc_a031_h3: "تحول المنشور الصامت",
      arc_footer_p: "أرشيف TCDA",
      arc_footer_link: "عرض ترجمات الملابس",
      shop_eyebrow: "المتجر",
      shop_h1: "شبكة منتجات مبسطة",
      shop_lead:
        "بطاقات نظيفة، معاينات عالية الدقة، ونقطة دفع آمنة جاهزة لتكامل واجهة برمجة التطبيقات المستقبلية.",
      shop_checkout_btn: "نقطة الدفع الآمنة",
      shop_checkout_status:
        "الواجهة الخلفية للدفع جاهزة لتكامل Stripe/Printful المستقبلي.",
      shop_footer_p: "متجر TCDA",
      shop_footer_tech: "ترميز دلالي، كود خفيف، مرئيات محسّنة بـ WebP.",
      prod_cnj_eyebrow: "جاكيت خارجي / طبعة محدودة",
      prod_cnj_title: "جاكيت كروما نويز",
      prod_cnj_tag1: "طباعة مرسومة بالعمل الفني",
      prod_cnj_tag2: "مقاس يونيسكس",
      prod_cnj_tag3: "إصدار محدود",
      prod_cnj_art_h2: "وصف العمل الفني",
      prod_cnj_art_p:
        "مستوحى من قطعة الأرشيف الرقمي A-019، يلتقط هذا الجاكيت التداخل السيان والإيقاع الحبيبي الداكن. الهيكل مصمم للحفاظ على تأثير اللون أثناء الحركة.",
      prod_cnj_mat_h2: "معلومات المواد",
      prod_cnj_mat_li1: "الغلاف الخارجي: 100% بوليستر تقني معاد تدويره",
      prod_cnj_mat_li2: "البطانة: مزيج تنفسي من الكوبرو",
      prod_cnj_mat_li3: "الطباعة: نقل عالي الدقة لضبط الألوان",
      prod_cnj_mat_li4: "الإنتاج: حرفية في دفعات صغيرة، صُنع في اليابان",
      prod_cnj_size_meta: "الحجم",
      prod_cnj_add: "أضف إلى السلة",
      prod_cnj_checkout: "نقطة الدفع الآمنة",
      prod_cnj_back: "العودة إلى المتجر",
      prod_cnj_status:
        "تكاملات مستقبلية: Stripe، Printful API، نظام الطلبات، حسابات العملاء.",
      prod_cnj_notice:
        "يُنصح بالبنية المتوافقة مع Cloudflare والنشر الذي يُعطي الأولوية لـ HTTPS.",
      prod_related_eyebrow: "منتجات ذات صلة",
      prod_related_h2: "أكمل القصة",
      prod_footer_p: "صفحة منتج TCDA",
      prod_footer_link: "عرض أرشيف الأعمال الفنية الأصلية",
      cat_outerwear: "جاكيت خارجي",
      cat_dress: "فستان",
      cat_shirt: "قميص",
      cat_coat: "معطف",
      cat_bottoms: "بناطيل",
      cat_set: "طقم",
      prod_chroma_jacket: "جاكيت كروما نويز",
      prod_spectral_dress: "فستان الحجاب الطيفي",
      prod_prism_shirt: "قميص صمت المنشور",
      prod_cyan_coat: "معطف الصدى السيان",
      prod_afterglow: "بناطيل الوهج المتأخر",
      prod_monochrome: "طقم الانجراف أحادي اللون",
      prod_spectrum_fold: "فستان ثنية الطيف",
      lang_label: "اللغة",
      currency_label: "العملة",
    },

    /* ── 日本語 ───────────────────────────────────────────────── */
    ja: {
      title_home: "TCDA | アートを着る、感性を解放する",
      title_brand: "ブランド | TCDA",
      title_collection: "コレクション | TCDA",
      title_lookbook: "ルックブック | TCDA",
      title_archive: "アーカイブ | TCDA",
      title_shop: "ショップ | TCDA",
      title_product_cnj: "TCDA クロマノイズジャケット",
      nav_home: "ホーム",
      nav_art: "アート",
      nav_brand: "ブランド",
      nav_about: "ABOUT",
      nav_collection: "コレクション",
      nav_lookbook: "ルックブック",
      nav_archive: "アーカイブ",
      nav_shop: "ショップ",
      nav_open_menu: "メニューを開く",
      nav_close_menu: "メニューを閉じる",
      nav_menu: "メニュー",
      cart_label: "カート",
      cart_added: "追加済み",
      cart_add: "カートに追加",
      footer_tagline:
        "Transcend Color Digital Apparel / アートを着る、感性を解放する。",
      footer_tech:
        "HTTPS対応、Cloudflare互換、セキュアチェックアウトプレースホルダー搭載。",
      skip_link: "コンテンツへスキップ",
      home_eyebrow: "Transcend Color Digital Apparel",
      home_h1_html: "アートを着る、<br />感性を解放する。",
      home_lead:
        "抽象的なクロマティック構成が着用可能な表現となる、プレミアムデジタルアートアパレルハウス。体験はまずアートから始まり、哲学へ、そしてプロダクトの発見へと続きます。",
      home_btn_shop: "ショップへ入る",
      home_btn_lookbook: "ルックブックを見る",
      home_hero_img_alt: "没入型抽象カラースタイリングのファッションモデル",
      home_phi_eyebrow: "フィロソフィー",
      home_phi_h2: "着用できるデジタルアート美術館",
      home_phi_p1:
        "TCDAは、ガーメントを動く美術館の壁として扱います。すべてのドロップは抽象デジタルアート作品から始まり、テキスタイル、シルエット、そしてモーションへと翻訳されます。",
      home_phi_p2:
        "私たちの世界は静かな強度のために構築されています。ニュートラルな空間、正確な色彩再現、そして意図的なビジュアルリズム。",
      home_phi_link: "ブランドストーリーを探る",
      home_feat_eyebrow: "フィーチャードコレクション",
      home_feat_h2: "クロマティックドリフト",
      home_feat_link: "全作品を見る",
      home_journey_eyebrow: "ジャーニー",
      home_journey_h2: "アートのインスピレーションから購買決定へ",
      home_journey_p:
        "ギャラリーへの没入から始め、哲学を理解し、リアルワールドのウェアのために設計されたピースを発見してください。",
      home_journey_shop: "コレクションをショップする",
      home_journey_lookbook: "ルックブックを開く",
      home_hero_title: "Art you can wear.",
      home_hero_lead_new:
        "TCDAはアートギャラリーであり、同時にファッションブランドです。世界観から入り、作品を発見し、あなたの物語の一部になる一着を選びます。",
      home_cta_collection: "コレクションを見る",
      home_cta_artwork: "アートを見る",
      home_art_eyebrow: "注目アートワーク",
      home_art_h2: "ギャラリーフラグメント",
      home_art_link: "アートアーカイブを開く",
      home_art_meta: "アートワーク",
      home_col_eyebrow_new: "コレクション",
      home_col_h2_new: "Hoodie / T-shirt / Shoes",
      home_col_link_new: "ショップへ",
      home_cat_hoodie: "フーディ",
      home_cat_hoodie_desc: "日常のレイヤードを想定した構築的シルエット。",
      home_cat_tshirt: "Tシャツ",
      home_cat_tshirt_desc:
        "ギャラリー品質の発色を持つ高精細オールオーバープリント。",
      home_cat_shoes: "シューズ",
      home_cat_shoes_desc:
        "ビジュアル言語を完成させる、動きに焦点を当てたピース。",
      home_story_eyebrow: "ブランドストーリー",
      home_story_h2: "Wear Art. Liberate Sensibility.",
      home_story_p1:
        "私たちは物としての服を売るのではなく、色・記憶・動きがアイデンティティになる世界への入口を設計します。",
      home_story_p2:
        "導線は意図的です。世界観、作品、コレクション、信頼、そして購入。",
      home_story_link: "コンセプトを読む",
      home_social_eyebrow: "ソーシャル",
      home_social_h2: "Instagram Journal",
      home_social_p:
        "作品研究、ドロップ進行、エディトリアルの予告をフォローしてください。",
      home_social_btn: "Instagramを開く",
      home_social_lookbook: "ルックブックを見る",
      home_footer_line:
        "Transcend Color Digital Apparel / アートギャラリー + ファッションEC",
      brand_eyebrow: "ブランド",
      brand_h1_html: "アートが衣服になり、<br />衣服が声になる。",
      brand_lead:
        "TCDAは、抽象デジタルアートとプレミアムガーメントクラフトを融合させるために存在します。日常の動きに感情的なカラーアーキテクチャを運ぶ着用可能な作品をデザインしています。",
      brand_hero_img_alt:
        "デジタルアートファッションガーメントを形成するクリエイティブディレクター",
      brand_concept_eyebrow: "ウェアラブルアート",
      brand_concept_h2: "コンセプト",
      brand_concept_p:
        "各リリースはオリジナルのデジタルキャンバスから始まります。色彩、ノイズ、グラデーションのレイヤーがテクスチャ、カット、シルエットにマッピングされ、物理的な形にビジュアルの強度が保持されます。",
      brand_method_eyebrow: "クリエイティブフィロソフィー",
      brand_method_h2: "メソッド",
      brand_method_p:
        "アート作品が息吹けるよう視覚的ノイズを取り除きます。ニュートラルな環境、規律ある組版、映画的なスペーシングが、色と形という本来の場所に焦点を当てます。",
      brand_process_eyebrow: "ストーリーテリング",
      brand_process_h2: "3ステップクリエイティブプロセス",
      brand_step1_meta: "01 アート制作",
      brand_step1_h3: "デジタル抽象",
      brand_step1_p:
        "オリジナルアートワークは感情、リズム、クロマティックな精度のために生成・キュレーションされます。",
      brand_step2_meta: "02 テキスタイル翻訳",
      brand_step2_h3: "素材との対話",
      brand_step2_p:
        "カラーデータはトーンの深みを保ちながら、プリントと生地の振る舞いに翻訳されます。",
      brand_step3_meta: "03 エディトリアル実現",
      brand_step3_h3: "ウェアラブル表現",
      brand_step3_p:
        "最終的なガーメントは映画的な存在感、快適さ、そして持続するビジュアルアイデンティティのために形成されます。",
      brand_footer_p: "TCDAブランドストーリー",
      brand_footer_link: "コレクションへ続く",
      col_eyebrow: "コレクション",
      col_h1: "着用可能なカラーワークスのギャラリー",
      col_lead:
        "各アイテムは形、光、そしてクロマティックな影響に焦点を当てた独立したギャラリーピースとして提示されます。",
      col_drop_eyebrow: "現在のドロップ",
      col_drop_h2: "クロマティックドリフトシリーズ",
      col_drop_link: "このドロップをショップする",
      col_footer_p: "TCDAコレクション",
      col_footer_link: "商品ページを開く",
      lb_eyebrow: "ルックブック",
      lb_h1: "モーション中のエディトリアルフレーム",
      lb_lead:
        "プロダクト決定前に視聴者を没入させるために設計された大規模ファッションイメージ。",
      lb_vol_eyebrow: "ボリューム 01",
      lb_vol_h2: "カラーフィールドのエコー",
      lb_ch1_meta: "チャプター 01",
      lb_ch1_h3: "しきい値",
      lb_ch1_p:
        "シルエットがクロマティックな密度と出会う、穏やかなオープニング。",
      lb_ch2_meta: "チャプター 02",
      lb_ch2_h3: "干渉",
      lb_ch2_p: "カラーグラデーションが体の動きと光に合わせて変化します。",
      lb_ch3_meta: "チャプター 03",
      lb_ch3_h3: "リリース",
      lb_ch3_p: "ビジュアル言語と個人のシグネチャーとしてのガーメント。",
      lb_footer_p: "TCDAルックブック",
      lb_footer_link: "ショップへ",
      arc_eyebrow: "アーカイブ",
      arc_h1: "オリジナルデジタルアートワークライブラリ",
      arc_lead:
        "ガーメントに変換される前に抽象作品がキュレーションされるソースアーカイブ。",
      arc_art_eyebrow: "アートワーク",
      arc_art_h2: "スペクトラムフラグメンツ",
      arc_a019_h3: "カラーエコープレーン",
      arc_a027_h3: "ヴェイパーコンタワグリッド",
      arc_a031_h3: "ミュートプリズムシフト",
      arc_footer_p: "TCDAアーカイブ",
      arc_footer_link: "ガーメント翻訳を見る",
      shop_eyebrow: "ショップ",
      shop_h1: "ミニマルプロダクトグリッド",
      shop_lead:
        "クリーンなカード、高解像度プレビュー、そして将来のAPI統合に向けたセキュアチェックアウトプレースホルダー。",
      shop_checkout_btn: "セキュアチェックアウトプレースホルダー",
      shop_checkout_status:
        "チェックアウトバックエンドは将来のStripe/Printful統合に向けて準備済み。",
      shop_footer_p: "TCDAショップ",
      shop_footer_tech:
        "セマンティックマークアップ、軽量コード、WebP最適化ビジュアル。",
      prod_cnj_eyebrow: "アウターウェア / 限定版",
      prod_cnj_title: "クロマノイズジャケット",
      prod_cnj_tag1: "アートワークマッピングプリント",
      prod_cnj_tag2: "ユニセックスフィット",
      prod_cnj_tag3: "限定ドロップ",
      prod_cnj_art_h2: "アートワーク説明",
      prod_cnj_art_p:
        "デジタルアーカイブ作品A-019からインスピレーションを得たこのジャケットは、シアンの干渉とダークなグレイン状のリズムを捉えています。ストラクチャーは動きの中でカラーインパクトを保持するように設計されています。",
      prod_cnj_mat_h2: "素材情報",
      prod_cnj_mat_li1: "シェル：100%リサイクルテクニカルポリエステル",
      prod_cnj_mat_li2: "ライニング：ブレザブルキュプラブレンド",
      prod_cnj_mat_li3: "プリント：カラー精度のための高品位転写",
      prod_cnj_mat_li4: "生産：スモールバッチクラフトマンシップ、日本製",
      prod_cnj_size_meta: "サイズ",
      prod_cnj_add: "カートに追加",
      prod_cnj_checkout: "セキュアチェックアウトプレースホルダー",
      prod_cnj_back: "ショップに戻る",
      prod_cnj_status:
        "将来の統合：Stripe、Printful API、注文システム、顧客アカウント。",
      prod_cnj_notice:
        "Cloudflare互換アーキテクチャとHTTPSファースト展開を推奨します。",
      prod_cnj_size_table: "サイズ表",
      prod_cnj_size_col_size: "サイズ",
      prod_cnj_size_col_chest: "胸幅",
      prod_cnj_size_col_sleeve: "袖丈",
      prod_cnj_size_col_length: "総丈",
      prod_related_eyebrow: "関連商品",
      prod_related_h2: "ストーリーを完成させる",
      prod_footer_p: "TCDA商品ページ",
      prod_footer_link: "オリジナルアートワークアーカイブを見る",
      cat_outerwear: "アウターウェア",
      cat_dress: "ドレス",
      cat_shirt: "シャツ",
      cat_coat: "コート",
      cat_bottoms: "ボトムス",
      cat_set: "セット",
      prod_chroma_jacket: "クロマノイズジャケット",
      prod_spectral_dress: "スペクトラルヴェイルドレス",
      prod_prism_shirt: "プリズムサイレンスシャツ",
      prod_cyan_coat: "シアンエコーコート",
      prod_afterglow: "アフターグロートラウザーズ",
      prod_monochrome: "モノクロームドリフトセット",
      prod_spectrum_fold: "スペクトラムフォールドドレス",
      lang_label: "言語",
      currency_label: "通貨",
    },
  };

  /* ── 2. Supported languages config ──────────────────────────── */
  const LANGUAGES = [
    { code: "en", label: "English",  nativeLabel: "English" },
    { code: "zh", label: "Chinese",  nativeLabel: "中文" },
    { code: "es", label: "Spanish",  nativeLabel: "Español" },
    { code: "ar", label: "Arabic",   nativeLabel: "العربية", rtl: true },
    { code: "ja", label: "Japanese", nativeLabel: "日本語" },
  ];

  const STORAGE_KEY_LANG = "tcda-lang-v1";
  const DEFAULT_LANG = "en";

  /* ── 3. Core helpers ─────────────────────────────────────────── */
  function detectLang() {
    const stored = localStorage.getItem(STORAGE_KEY_LANG);
    if (stored && TRANSLATIONS[stored]) return stored;
    const browserLang = (navigator.language || "en").slice(0, 2).toLowerCase();
    if (TRANSLATIONS[browserLang]) return browserLang;
    return DEFAULT_LANG;
  }

  function t(key, lang) {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS[DEFAULT_LANG];
    return dict[key] !== undefined ? dict[key] : (TRANSLATIONS[DEFAULT_LANG][key] || key);
  }

  /* ── 4. Apply translations to DOM ───────────────────────────── */
  function apply(lang) {
    /* Update html attributes */
    document.documentElement.lang = lang;
    const langConfig = LANGUAGES.find((l) => l.code === lang);
    document.documentElement.dir = (langConfig && langConfig.rtl) ? "rtl" : "ltr";

    /* Text content nodes */
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key, lang);
    });

    /* Inner HTML nodes (for <br> etc.) */
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key, lang);
    });

    /* Individual attributes: data-i18n-attr='{"aria-label":"key","placeholder":"key2"}' */
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      try {
        const map = JSON.parse(el.getAttribute("data-i18n-attr"));
        Object.entries(map).forEach(([attr, key]) => {
          el.setAttribute(attr, t(key, lang));
        });
      } catch (_) {}
    });

    /* Page title */
    const titleKey = document.documentElement.getAttribute("data-page-title-key");
    if (titleKey) document.title = t(titleKey, lang);

    /* Sync switcher UI */
    document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
      const active = btn.getAttribute("data-lang-btn") === lang;
      btn.setAttribute("aria-pressed", String(active));
      btn.classList.toggle("is-active", active);
    });

    /* Store preference */
    localStorage.setItem(STORAGE_KEY_LANG, lang);
  }

  /* ── 5. Public API ───────────────────────────────────────────── */
  global.TCDAi18n = {
    languages: LANGUAGES,
    t,
    apply,
    detectLang,
    getCurrentLang: () => localStorage.getItem(STORAGE_KEY_LANG) || DEFAULT_LANG,
  };
})(window);
