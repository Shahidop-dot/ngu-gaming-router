const data = [
  {
    name:"Linksys EA6350", wifi:"Wi-Fi 5", cls:"AC1200", bands:"Dual-band",
    best:"Value / basic homes", image:"https://m.media-amazon.com/images/I/51TAjZc7FpL.jpg",
    note:"Dual-band AC1200 Gigabit router."
  },
  {
    name:"Linksys EA8100", wifi:"Wi-Fi 5", cls:"AC2600", bands:"Dual-band",
    best:"Gaming / OpenWrt setups", image:"https://cassette.sphdigital.com.sg/image/hardwarezone/d9ece4b1d62aa098f85ccfbf20a1b0c6e30a8c1861d14782479ec0b022b35d65?q=85&w=1000",
    note:"AC2600-class dual-band router with 4x4 5GHz."
  },
  {
    name:"Linksys MR9000X", wifi:"Wi-Fi 5", cls:"AC3000", bands:"Tri-band",
    best:"Mixed homes / mesh", image:"https://unitytech.uy/wp-content/uploads/2021/10/Router-Linksys-Mr9000-Mesh-Triband-Ac3000-Mu-mimo-1.jpg",
    note:"AC3000 tri-band mesh router."
  },
  {
    name:"NETGEAR XR500", wifi:"Wi-Fi 5", cls:"AC2600", bands:"Dual-band",
    best:"Gaming / DumaOS", image:"https://cdn.cs.1worldsync.com/02/3f/023f0eca-f8ba-4e9f-947f-ace686a1a490.jpg",
    note:"Gaming router with DumaOS and QoS controls."
  },
  {
    name:"NETGEAR R8000P", wifi:"Wi-Fi 5", cls:"AC4000", bands:"Tri-band",
    best:"Heavy multi-device homes", image:"https://www.netgear.com/zone3/cid/fit/1024x633/to/jpg/https/www.netgear.com/cn/media/R8000P_productcarousel_hero_image_tcm172-106347.png",
    note:"Nighthawk X6S AC4000 tri-band router."
  },
  {
    name:"NETGEAR R8500", wifi:"Wi-Fi 5", cls:"AC5300", bands:"Tri-band",
    best:"Maximum AC throughput", image:"https://www.netonnet.se/GetFile/ProductImagePrimary/%28229568%29_237837_largeHD.webp",
    note:"Nighthawk X8 AC5300 tri-band router."
  },
  {
    name:"ASUS RT-AX82U", wifi:"Wi-Fi 6", cls:"AX5400", bands:"Dual-band",
    best:"Gaming / Wi-Fi 6", image:"https://pisces.bbystatic.com/image2/BestBuy_US/images/products/6532/6532136_sd.jpg",
    note:"Wi-Fi 6 AX5400 gaming router with 160 MHz support."
  }
];

const products = document.querySelector("#products");
const table = document.querySelector("#table");
const count = document.querySelector("#count");

function waLink(name){
  const msg = encodeURIComponent(`Hi NGU, I'm interested in the ${name}. Please send me availability, price and gaming configuration details.`);
  return `https://wa.me/923700821811?text=${msg}`;
}

function render(filter="all"){
  const d = filter==="all" ? data : data.filter(x=>x.wifi===filter);
  count.textContent = d.length + " systems";
  products.innerHTML = d.map(x=>`
    <article class="product">
      <div class="product-image"><img src="${x.image}" alt="${x.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('fallback')"><div class="mini">NGU</div></div>
      <div class="body">
        <span class="badge">NGU CATALOG</span>
        <h3>${x.name}</h3>
        <p>${x.note}</p>
        <div class="specs"><span>${x.wifi}</span><span>${x.cls}</span><span>${x.bands}</span></div>
        <div class="bottom"><strong>Price on request</strong><a href="${waLink(x.name)}" target="_blank" rel="noopener">Ask about it →</a></div>
      </div>
    </article>`).join("");

  table.innerHTML = d.map(x=>`<tr><td>${x.name}</td><td>${x.wifi}</td><td>${x.cls}</td><td>${x.bands}</td><td>${x.best}</td></tr>`).join("");
}
render();

document.querySelectorAll(".filters button").forEach(b=>{
  b.onclick=()=>{
    document.querySelectorAll(".filters button").forEach(x=>x.classList.remove("active"));
    b.classList.add("active");
    render(b.dataset.f);
  };
});

const mobile = document.querySelector("#mobile");
document.querySelector("#open").onclick=()=>mobile.classList.add("open");
document.querySelector("#close").onclick=()=>mobile.classList.remove("open");
document.querySelectorAll(".mobile a").forEach(a=>a.onclick=()=>mobile.classList.remove("open"));

document.querySelector("#find").onclick=()=>{
  const speed = +document.querySelector("#speed").value;
  const use = document.querySelector("#use").value;
  const budget = document.querySelector("#budget").value;
  let p;

  if(use==="gaming" && budget==="high") p="ASUS RT-AX82U";
  else if(use==="gaming" && speed<=300) p="NETGEAR XR500";
  else if(use==="gaming") p="ASUS RT-AX82U";
  else if(use==="pc" && speed<=300) p="Linksys EA8100";
  else if(use==="home" && budget==="high") p="NETGEAR R8500";
  else if(use==="home" && budget==="mid") p="NETGEAR R8000P";
  else if(speed<=100) p="Linksys EA6350";
  else if(speed<=300) p="Linksys MR9000X";
  else p="NETGEAR R8000P";

  const item = data.find(x=>x.name===p);
  const r=document.querySelector("#result");
  r.style.display="block";
  r.innerHTML=`<span>NGU MATCH</span><strong>${item.name}</strong><p>${item.note} Recommended as a starting point based on your answers. Final choice should also consider firmware, ISP speed, wired/Wi-Fi usage and actual stock.</p><a href="${waLink(item.name)}" target="_blank" rel="noopener">Ask NGU about this router →</a>`;
};