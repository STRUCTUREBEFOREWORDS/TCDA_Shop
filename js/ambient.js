(function(){
  var PATH="/images/サイト全体用/",PREFIX="img1-",COUNT=36,N=8;
  var wrap=document.getElementById("page-ambient");
  if(!wrap)return;
  function rnd(a,b){return Math.random()*(b-a)+a;}
  var all=Array.from({length:COUNT},function(_,i){
    return PATH+PREFIX+String(i+1).padStart(3,"0")+".webp";
  }).sort(function(){return Math.random()-.5;}).slice(0,N);
  var DUR=11,els=[];
  function anim(el){
    el.style.transform="translate("+rnd(-6,6)+"%,"+rnd(-4,4)+"%) scale("+rnd(.97,1.03)+")";
    el.style.opacity=rnd(.025,.07);
  }
  all.forEach(function(src){
    var img=document.createElement("img");
    img.loading="lazy";img.decoding="async";
    img.style.cssText="position:absolute;width:"+rnd(14,32)+"vw;left:"+rnd(-4,86)+"vw;top:"+rnd(-4,86)+"vh;opacity:0;object-fit:cover;aspect-ratio:1/1;filter:blur("+rnd(1,2.5)+"px) saturate(0.4);transition:transform "+DUR+"s ease,opacity "+DUR+"s ease;";
    wrap.appendChild(img);els.push(img);
    img.src=src;
    img.onload=function(){requestAnimationFrame(function(){anim(img);});};
  });
  setInterval(function(){
    els.forEach(function(el){if(Math.random()<.6)anim(el);});
  },DUR*1000);
})();
