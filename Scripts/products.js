
(async function(){
  const $grid = $("#product-grid");
  const $category = $("#filter-category");
  const $shape = $("#filter-shape");
  const $diet = $("#filter-diet");
  const $search = $("#filter-search");

  const {categories, products} = await fetchProductCatalog();
  categories.forEach(c => $category.append(`<option value="${c.id}">${c.name}</option>`));
  render();

  $category.on("change", render);
  $shape.on("change", render);
  $diet.on("change", render);
  $search.on("input", render);

  function passes(p){
    const fc = $category.val(), fs = $shape.val(), fd = $diet.val(), q = ($search.val()||"").toLowerCase();
    if(fc && fc!=="ALL" && p.categoryId!==fc) return false;
    if(fs && fs!=="ALL" && p.shape!==fs) return false;
    if(fd && fd!=="ALL" && !(p.dietTags||[]).includes(fd)) return false;
    if(q && !(p.name.toLowerCase().includes(q) || (p.description||"").toLowerCase().includes(q))) return false;
    return true;
  }

  function shareProduct(p){
    const url = location.origin + "/productos.html#"+p.id;
    const text = `Mira este producto: ${p.name} en 1000 Sabores`;
    if (navigator.share){
      navigator.share({title: p.name, text, url}).catch(()=>{});
    } else {
      const tw = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
      window.open(tw, "_blank");
    }
  }

  function render(){
    $grid.empty();
    const buyer = null; // discounts are previewed at checkout; to preview here, set a demo buyer if desired.
    products.filter(passes).forEach(p => {
      const v0 = (p.variants && p.variants[0]) ? p.variants[0] : null;
      const base = v0 ? (p.basePriceCLP + (v0.priceDeltaCLP||0)) : p.basePriceCLP;

      const dietBadges = (p.dietTags||[]).map(t=>`<span class="badge badge-diet me-1">${t.replace("_"," ")}</span>`).join("");
      const variantsSelect = (p.variants&&p.variants.length)?
        `<select class="form-select form-select-sm variant-select" data-product-id="${p.id}">
          ${p.variants.map(vv=>`<option value="${vv.id}" data-delta="${vv.priceDeltaCLP||0}">${vv.label}</option>`).join("")}
        </select>` : "";

      const personalization = p.personalization?.allowMessage ?
        `<div class="mt-2"><small>Permite mensaje (${p.personalization.maxChars} caracteres)</small>
         <input type="text" maxlength="${p.personalization.maxChars}" class="form-control form-control-sm input-message" placeholder="Escribe tu dedicatoria..."></div>`
        : "";

      $grid.append(`
        <div class="col-md-4 mb-4" id="${p.id}">
          <div class="card h-100">
            <img class="product-img" src="${(p.images&&p.images[0])||'https://images.unsplash.com/photo-1535141192574-5d4897c12636?auto=format&fit=crop&w=1400&q=60'}" alt="${p.name}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${p.name}</h5>
              <p class="card-text">${p.description||""}</p>
              <div class="mb-2">${dietBadges}</div>
              ${variantsSelect}
              ${personalization}
              <div class="mt-3 fw-bold">Precio: <span class="price" data-product-id="${p.id}">${clp(base)}</span></div>
              <div class="mt-auto">
                <div class="input-group mt-3">
                  <button class="btn btn-outline-secondary btn-qty" data-dir="-1">-</button>
                  <input type="number" class="form-control qty-input text-center" value="1" min="1" style="max-width: 80px;">
                  <button class="btn btn-outline-secondary btn-qty" data-dir="1">+</button>
                </div>
                <div class="d-grid gap-2 mt-2">
                  <button class="btn btn-pastel add-to-cart" data-product-id="${p.id}">Agregar al carrito</button>
                  <button class="btn btn-outline-secondary btn-share">Compartir</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      `);
    });

    $(".btn-qty").on("click", function(){
      const $wrap = $(this).closest(".input-group");
      const $inp = $wrap.find(".qty-input");
      const dir = Number($(this).data("dir"));
      $inp.val(Math.max(1, Number($inp.val()||1)+dir));
    });

    $(".add-to-cart").on("click", function(){
      const pid = $(this).data("product-id");
      const card = $(this).closest(".card");
      const product = products.find(x=>x.id===pid);
      const vid = card.find(".variant-select").val() || null;
      const qty = Math.max(1, Number(card.find(".qty-input").val()||1));
      let msg = card.find(".input-message").val()||"";
      msg = msg.trim();
      if(msg && product.personalization?.maxChars && msg.length>product.personalization.maxChars){
        alert(`El mensaje supera el máximo de ${product.personalization.maxChars} caracteres.`);
        return;
      }
      addToCart({productId:pid, variantId:vid, qty, message: msg || null});
      $(this).text("Agregado ✔").prop("disabled", true);
      setTimeout(()=>$(this).text("Agregar al carrito").prop("disabled", false), 800);
    });

    $(".btn-share").on("click", function(){
      const pid = $(this).closest(".col-md-4").attr("id");
      const p = products.find(x=>x.id===pid);
      if(p) shareProduct(p);
    });

    $(".variant-select").on("change", function(){
      const pid = $(this).data("product-id");
      const p = products.find(x=>x.id===pid);
      const delta = Number($(this).find(":selected").data("delta")||0);
      const price = (p.basePriceCLP||0)+delta;
      $(`.price[data-product-id='${pid}']`).text(clp(price));
    });
  }
})();
