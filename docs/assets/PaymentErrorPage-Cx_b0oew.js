import{u as r,j as e,L as a}from"./index-CCtZEIlB.js";function n(){const{language:t}=r();return e.jsxs("div",{className:"min-h-screen bg-black text-white flex items-center justify-center overflow-hidden relative",children:[e.jsx("div",{className:"fixed pointer-events-none",style:{inset:"-20% -10%",background:"repeating-linear-gradient(170deg, rgba(255,255,255,.04) 0px, rgba(255,255,255,.04) 1px, transparent 1px, transparent 60px)",animation:"drape 14s ease-in-out infinite"}}),e.jsx("style",{children:`
        @keyframes drape {
          0%   { transform: skewY(-1.5deg) translateY(0);    opacity: .18; }
          50%  { transform: skewY(1deg)    translateY(-12px); opacity: .26; }
          100% { transform: skewY(-1.5deg) translateY(0);    opacity: .18; }
        }
        @keyframes lightwash {
          0%   { opacity: 0;   transform: translateX(-30%) rotate(-8deg); }
          50%  { opacity: .07; }
          100% { opacity: 0;   transform: translateX(60%)  rotate(-8deg); }
        }
      `}),e.jsx("div",{className:"fixed pointer-events-none",style:{inset:0,width:"200%",background:"linear-gradient(100deg, transparent 30%, rgba(255,255,255,.6) 50%, transparent 70%)",animation:"lightwash 9s ease-in-out infinite"}}),e.jsxs("div",{className:"relative z-10 flex flex-col items-center text-center px-6",children:[e.jsx("div",{className:"mb-16",children:e.jsx("img",{src:"/icons/tcda_logo.webp",alt:"TCDA",style:{height:32,opacity:.7}})}),e.jsx("p",{className:"text-[0.65rem] font-light tracking-[0.5em] uppercase text-white/35 mb-5",children:"Payment Error"}),e.jsx("h1",{className:"text-3xl md:text-5xl font-extralight tracking-wide leading-tight mb-5",children:"Payment failed."}),e.jsxs("p",{className:"text-[0.8rem] font-light tracking-wider text-white/40 leading-relaxed mb-12",children:["決済が完了していませんでした。",e.jsx("br",{}),"カートの内容は保持されています。"]}),e.jsx(a,{to:`/${t}/cart`,className:"inline-block px-10 py-3 border border-white/25 text-[0.7rem] font-light tracking-[0.3em] uppercase hover:border-white/70 hover:bg-white/5 transition-all duration-300 mb-10",children:"カートへ戻る"}),e.jsx("div",{className:"flex gap-8",children:e.jsx(a,{to:`/${t}/contact`,className:"text-[0.6rem] font-light tracking-[0.35em] uppercase text-white/25 hover:text-white/70 transition-colors duration-300",children:"サポートへ"})})]})]})}export{n as PaymentErrorPage};
