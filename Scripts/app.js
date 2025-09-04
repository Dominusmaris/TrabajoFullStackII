
// Global cart & order helpers
const LS_CART_KEY = "cartItems";
const LS_ORDERS_KEY = "orders";

function getCart(){ try { return JSON.parse(localStorage.getItem(LS_CART_KEY) || "[]"); } catch { return []; } }
function saveCart(items){ localStorage.setItem(LS_CART_KEY, JSON.stringify(items)); updateCartBadge(); }
function clearCart(){ saveCart([]); }

function updateCartBadge(){
  const c = getCart().reduce((a,it)=>a+Number(it.qty||0),0);
  const el = document.getElementById('cart-count'); if(el){ el.textContent = c; }
}

function addToCart(item){
  const items = getCart();
  // merge by productId+variantId+message
  const idx = items.findIndex(i => i.productId===item.productId && i.variantId===item.variantId && (i.message||"")===(item.message||""));
  if(idx>=0){ items[idx].qty += item.qty; } else { items.push(item); }
  saveCart(items);
}

function removeFromCart(pid, vid, msg){
  let items = getCart();
  items = items.filter(i => !(i.productId===pid && i.variantId===vid && (i.message||"")===(msg||"")));
  saveCart(items);
}

function setQty(pid,vid,msg,qty){
  const items = getCart();
  const idx = items.findIndex(i => i.productId===pid && i.variantId===vid && (i.message||"")===(msg||""));
  if(idx>=0){ items[idx].qty = Math.max(1, Number(qty||1)); saveCart(items); }
}

// Pricing & discounts (applied per-line)
async function fetchProductCatalog(){
  const [cats, prods] = await Promise.all([
    fetch('data/categories.json').then(r=>r.json()),
    fetch('data/products.json').then(r=>r.json())
  ]);
  return {categories: cats, products: prods};
}

function computeVariantPrice(product, variantId){
  const v = (product.variants||[]).find(x=>x.id===variantId);
  const delta = v ? Number(v.priceDeltaCLP||0) : 0;
  return Number(product.basePriceCLP||0) + delta;
}

function parseBirthdate(b){ if(!b) return null; const d = new Date(b); return isNaN(d) ? null : d; }
function isBirthdayToday(birthdate){
  const d = parseBirthdate(birthdate); if(!d) return false;
  const t = new Date();
  return d.getDate()===t.getDate() && d.getMonth()===t.getMonth();
}
function getAge(birthdate){
  const d = parseBirthdate(birthdate); if(!d) return NaN;
  const t = new Date(); let age = t.getFullYear()-d.getFullYear();
  const m = t.getMonth()-d.getMonth();
  if(m<0 || (m===0 && t.getDate()<d.getDate())) age--;
  return age;
}

// rules: ≥50 => -50% (all); code FELICES50 => -10% (all); @duoc.cl + birthday => TE products free
function applyDiscounts(product, basePrice, buyer){
  let price = basePrice; const notes = [];
  const email = (buyer?.email||"").toLowerCase();
  const isDuoc = email.endsWith("@duoc.cl");
  if(isDuoc && isBirthdayToday(buyer?.birthdate) && product.categoryId==="TE"){
    return { finalPrice: 0, notes: ["Beneficio Duoc cumpleaños: ¡Gratis!"] };
  }
  const age = getAge(buyer?.birthdate);
  if(!isNaN(age) && age>=50){ price = Math.round(price*0.5); notes.push("Descuento 50% (≥50 años)"); }
  if((buyer?.discountCode||"").trim().toUpperCase()==="FELICES50"){ price = Math.round(price*0.9); notes.push("Código FELICES50: -10%"); }
  return { finalPrice: price, notes };
}

function clp(n){ return Number(n||0).toLocaleString('es-CL', {style:'currency', currency:'CLP', maximumFractionDigits:0}); }

// Orders
function getOrders(){ try { return JSON.parse(localStorage.getItem(LS_ORDERS_KEY) || "[]"); } catch { return []; } }
function saveOrders(orders){ localStorage.setItem(LS_ORDERS_KEY, JSON.stringify(orders)); }

function createOrder(payload){
  const orders = getOrders();
  const orderId = "ORD-" + Math.random().toString(36).slice(2,8).toUpperCase();
  const createdAt = new Date().toISOString();
  const order = { id: orderId, createdAt, status: "confirmado", ...payload };
  orders.push(order);
  saveOrders(orders);
  clearCart();
  return order;
}

// Shipping status simulation based on deliveryDate & timeslot
function computeStatus(order){
  try{
    const now = new Date();
    const d = new Date(order.deliveryDate + "T00:00:00");
    const timeslot = order.deliverySlot || "AM";
    const startHour = timeslot === "AM" ? 9 : 15;
    const endHour = timeslot === "AM" ? 13 : 19;
    const start = new Date(d); start.setHours(startHour,0,0,0);
    const end = new Date(d); end.setHours(endHour,0,0,0);
    if(now < start){ return "Preparando"; }
    if(now >= start && now <= end){ return "En ruta"; }
    if(now > end){ return "Entregado"; }
  }catch(e){}
  return order.status || "confirmado";
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
