// ═══════════════════════════════════════════════════════════════════════════
// LISTA DE COMPRAS
// Página separada que lee la lista global de localStorage,
// suma ingredientes estructurados, resta lo que ya tienes en casa,
// calcula gasto y guarda historial por tienda/semana.
// ═══════════════════════════════════════════════════════════════════════════

// ─── STATE (poblado por initLista) ───────────────────────────────────────────
let CURRENT_USER = null;
const BASE_FOODS = (window.FOODS_DB && window.FOODS_DB.foods) ? window.FOODS_DB.foods : [];
let CUSTOM_FOODS = [];
let FOODS = [...BASE_FOODS];
let FOODS_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));
let RECETAS_DATA = {};

const DEFAULT_STORES = ['Walmart', 'HEB', 'Soriana', 'Aurrera', 'Costco', 'Mercado'];

// Entry point — llamado desde lista_compras.html tras initCloudStorage
function initLista() {
  CURRENT_USER = getCurrentUser();
  CUSTOM_FOODS = cloudGet('custom_foods', []) || [];
  FOODS = [...BASE_FOODS, ...CUSTOM_FOODS];
  FOODS_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));
  RECETAS_DATA = cloudGet('recipes', {}) || {};
  renderAll();
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
function fmtMoney(n) {
  if (n == null || isNaN(n)) return '$0.00';
  return '$' + n.toFixed(2);
}
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('es-MX', {day:'numeric', month:'short'});
}
function todayISO() {
  const d = new Date();
  return d.toISOString().slice(0,10);
}
function mondayOf(iso) {
  const d = iso ? new Date(iso + 'T00:00:00') : new Date();
  const day = d.getDay(); // 0=dom
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0,10);
}
function plusDays(iso, n) {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0,10);
}

const GENERIC_DENSITIES = { cda:15, cdita:5, taza:240 };
function convertToGrams(qty, unit, food) {
  qty = parseFloat(qty) || 0;
  if (qty <= 0) return 0;
  switch(unit) {
    case 'g':     return qty;
    case 'kg':    return qty * 1000;
    case 'mg':    return qty / 1000;
    case 'ml':    return qty;
    case 'l':     return qty * 1000;
    case 'cda':   return qty * ((food && food.densidades && food.densidades.cda) || GENERIC_DENSITIES.cda);
    case 'cdita': return qty * ((food && food.densidades && food.densidades.cdita) || GENERIC_DENSITIES.cdita);
    case 'taza':  return qty * ((food && food.densidades && food.densidades.taza) || GENERIC_DENSITIES.taza);
    case 'unidad':
      if (food && food.gramos_por_unidad) return qty * food.gramos_por_unidad;
      return 0;
    default: return 0;
  }
}

// ─── STATE (cloud-backed) ────────────────────────────────────────────────────
function shopGet() {
  const raw = cloudGet('shop_list', null);
  if (raw && Array.isArray(raw.recipes)) return raw;
  return { recipes: [], inventory: {}, prices: {}, store: '', weekStart: '' };
}
function shopSet(s) { cloudSet('shop_list', s); }

function historyGet() { return cloudGet('shop_history', []) || []; }
function historySet(h) { cloudSet('shop_history', h); }

function priceDbGet() { return cloudGet('price_db', {}) || {}; }
function priceDbSet(db) { cloudSet('price_db', db); }

function storesGet() {
  const s = cloudGet('stores', null);
  if (Array.isArray(s) && s.length) return s;
  return DEFAULT_STORES.slice();
}
function storesSet(arr) { cloudSet('stores', arr); }

// ─── AGGREGATION ─────────────────────────────────────────────────────────────
function aggregateIngredients() {
  const shop = shopGet();
  const agg = {}; // food_id -> { food, totalGrams, sources: [{recipeName, qty, unit}], hasUnidad }
  const legacy = []; // [{recipeName, ingredients: [str]}]
  shop.recipes.forEach(r => {
    const recipe = (RECETAS_DATA[r.cat] || []).find(x => x.id === r.id);
    if (!recipe) return;
    // Escalado por porciones: scale = desired / base
    const baseS = r.base_servings || recipe.base_servings || 1;
    const desiredS = r.desired_servings || baseS;
    const scale = desiredS / baseS;
    if (recipe.ingredients_structured && recipe.ingredients_structured.length) {
      recipe.ingredients_structured.forEach(ing => {
        const food = FOODS_BY_ID[ing.food_id];
        if (!food) return;
        const scaledQty = ing.qty * scale;
        const grams = convertToGrams(scaledQty, ing.unit, food);
        if (!agg[ing.food_id]) {
          agg[ing.food_id] = {
            food_id: ing.food_id,
            food: food,
            totalGrams: 0,
            sources: [],
            anyUnidad: false,
          };
        }
        agg[ing.food_id].totalGrams += grams;
        agg[ing.food_id].sources.push({recipeName: recipe.name, qty: scaledQty, unit: ing.unit, scale: scale});
        if (ing.unit === 'unidad') agg[ing.food_id].anyUnidad = true;
      });
    } else {
      legacy.push({recipeId: r.id, recipeName: recipe.name, ingredients: recipe.ingredients || []});
    }
  });
  return { agg, legacy };
}

// Decide unidad de visualización: si todas las fuentes son "unidad" y el alimento tiene gxu → unidades. Si no → gramos.
function chooseDisplayUnit(item) {
  const food = item.food;
  if (food.gramos_por_unidad && item.sources.every(s => s.unit === 'unidad')) {
    return {unit:'unidad', qty: item.totalGrams / food.gramos_por_unidad};
  }
  return {unit:'g', qty: item.totalGrams};
}

// ─── RENDER: HEADER + STORE ──────────────────────────────────────────────────
function renderHeader() {
  const shop = shopGet();
  // Asegura weekStart inicializado
  if (!shop.weekStart) { shop.weekStart = mondayOf(todayISO()); shopSet(shop); }
  const weekEnd = plusDays(shop.weekStart, 6);
  document.getElementById('weekLabel').textContent = `${fmtDate(shop.weekStart)} – ${fmtDate(weekEnd)}`;
  document.getElementById('storeLabel').textContent = shop.store ? '🏪 ' + shop.store : 'Sin tienda';
  document.getElementById('weekStartInput').value = shop.weekStart;

  const sel = document.getElementById('storeSelect');
  const stores = storesGet();
  sel.innerHTML = `<option value="">— Selecciona —</option>` +
    stores.map(s => `<option value="${escapeHtml(s)}" ${s===shop.store?'selected':''}>${escapeHtml(s)}</option>`).join('');
  sel.onchange = () => {
    const s = shopGet();
    s.store = sel.value;
    shopSet(s);
    renderHeader();
  };

  document.getElementById('weekStartInput').onchange = (e) => {
    const s = shopGet();
    s.weekStart = mondayOf(e.target.value);
    shopSet(s);
    renderHeader();
  };
}

function addStore() {
  const input = document.getElementById('storeNew');
  const v = input.value.trim();
  if (!v) return;
  const stores = storesGet();
  if (!stores.includes(v)) { stores.push(v); storesSet(stores); }
  input.value = '';
  const s = shopGet();
  s.store = v;
  shopSet(s);
  renderHeader();
}

// ─── RENDER: RECETAS CHIPS ───────────────────────────────────────────────────
function renderRecipes() {
  const shop = shopGet();
  const cont = document.getElementById('recipesChips');
  document.getElementById('recipesCount').textContent = `${shop.recipes.length} receta${shop.recipes.length===1?'':'s'}`;
  if (shop.recipes.length === 0) {
    cont.innerHTML = `<div class="empty-state" style="padding:1rem">Sin recetas. Vuelve al <a href="plan_angel_2.html" style="color:var(--accent)">banco</a> y agrega con el botón 🛒.</div>`;
    return;
  }
  cont.innerHTML = shop.recipes.map(r => {
    // Buscar receta para obtener base_servings actualizado si no está en r
    let baseS = r.base_servings;
    if (!baseS) {
      const recipe = (RECETAS_DATA[r.cat] || []).find(x => x.id === r.id);
      baseS = (recipe && recipe.base_servings) || 1;
    }
    const desiredS = r.desired_servings || baseS;
    const scaleNote = desiredS !== baseS
      ? `<span class="lc-chip-scale-note" title="Escalado: original ${baseS}, ajustado a ${desiredS}">×${(desiredS/baseS).toFixed(2).replace(/\.?0+$/,'')}</span>`
      : '';
    return `
    <span class="lc-chip">
      <span>${escapeHtml(r.name)}</span>
      <span class="lc-chip-servings" title="Porciones a preparar (rinde ${baseS} originales)">
        <span class="lc-chip-servings-label">🍽</span>
        <button onclick="adjustRecipeServings('${r.id}',-1)">−</button>
        <input type="number" min="1" max="50" step="1" value="${desiredS}"
               onchange="setRecipeServings('${r.id}', this.value)">
        <button onclick="adjustRecipeServings('${r.id}',1)">+</button>
      </span>
      ${scaleNote}
      <button class="lc-chip-x" onclick="removeRecipe('${r.id}')" title="Quitar">×</button>
    </span>`;
  }).join('');
}

function setRecipeServings(recipeId, value) {
  const s = shopGet();
  const r = s.recipes.find(x => x.id === recipeId);
  if (!r) return;
  const v = Math.max(1, Math.min(50, parseInt(value) || 1));
  // Asegura base_servings persistente en el item del shop
  if (!r.base_servings) {
    const recipe = (RECETAS_DATA[r.cat] || []).find(x => x.id === recipeId);
    r.base_servings = (recipe && recipe.base_servings) || 1;
  }
  r.desired_servings = v;
  shopSet(s);
  renderAll();
}

function adjustRecipeServings(recipeId, delta) {
  const s = shopGet();
  const r = s.recipes.find(x => x.id === recipeId);
  if (!r) return;
  const baseS = r.base_servings || 1;
  const cur = r.desired_servings || baseS;
  setRecipeServings(recipeId, cur + delta);
}

function removeRecipe(id) {
  const s = shopGet();
  s.recipes = s.recipes.filter(r => r.id !== id);
  shopSet(s);
  renderAll();
}

// ─── RENDER: TABLA DE INGREDIENTES ───────────────────────────────────────────
function renderIngredients() {
  const { agg, legacy } = aggregateIngredients();
  const shop = shopGet();
  const keys = Object.keys(agg).sort((a,b) => agg[a].food.nombre.localeCompare(agg[b].food.nombre));

  document.getElementById('ingrCount').textContent = `${keys.length} producto${keys.length===1?'':'s'}`;

  const wrap = document.getElementById('ingrTableWrap');
  if (keys.length === 0) {
    wrap.innerHTML = `<div class="empty-state" style="padding:1rem">Sin ingredientes para sumar. Agrega recetas con ingredientes estructurados.</div>`;
  } else {
    wrap.innerHTML = `
      <div class="lc-table-wrap">
      <table class="lc-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Necesito</th>
            <th>Ya tengo<br><span class="lc-th-sub">refri / alacena</span></th>
            <th>A comprar</th>
            <th>Precio paquete<br><span class="lc-th-sub">$ por cantidad</span></th>
            <th>Costo</th>
          </tr>
        </thead>
        <tbody>
          ${keys.map(k => renderIngrRow(agg[k], shop)).join('')}
        </tbody>
      </table>
      </div>
    `;
  }

  // Legacy
  const legacySec = document.getElementById('legacySection');
  if (legacy.length === 0) {
    legacySec.style.display = 'none';
  } else {
    legacySec.style.display = '';
    document.getElementById('legacyCount').textContent = `${legacy.length} receta${legacy.length===1?'':'s'}`;
    document.getElementById('legacyList').innerHTML = legacy.map(l => `
      <div class="lc-legacy-card">
        <div class="lc-legacy-title">${escapeHtml(l.recipeName)}</div>
        <ul class="lc-legacy-ul">
          ${l.ingredients.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </div>
    `).join('');
  }

  updateTotals();
}

function renderIngrRow(item, shop) {
  const { food, totalGrams } = item;
  const display = chooseDisplayUnit(item);
  const inv = shop.inventory[item.food_id] || {qty:0, unit: display.unit};
  // a comprar = totalGrams - inventoryGrams (convertir inv a grams)
  let invGrams = 0;
  if (inv.unit === 'unidad' && food.gramos_por_unidad) {
    invGrams = (parseFloat(inv.qty)||0) * food.gramos_por_unidad;
  } else {
    invGrams = parseFloat(inv.qty)||0;
  }
  const buyGrams = Math.max(0, totalGrams - invGrams);
  const buyDisplay = display.unit === 'unidad'
    ? (buyGrams / food.gramos_por_unidad)
    : buyGrams;

  // sources resumido
  const sourcesTxt = item.sources.map(s => `${s.qty}${s.unit==='unidad'?'u':s.unit} (${s.recipeName})`).join(' + ');

  // Precio
  const price = shop.prices[item.food_id] || {price:'', qty:'', unit: display.unit};
  // Costo estimado = (price / packageGrams) * buyGrams
  let costo = null;
  let pkgGrams = 0;
  if (price.unit === 'unidad' && food.gramos_por_unidad) {
    pkgGrams = (parseFloat(price.qty)||0) * food.gramos_por_unidad;
  } else {
    pkgGrams = parseFloat(price.qty)||0;
  }
  if (parseFloat(price.price) > 0 && pkgGrams > 0) {
    costo = (parseFloat(price.price) / pkgGrams) * buyGrams;
  }

  const unitLabel = display.unit === 'unidad' ? 'u' : 'g';
  const displayQtyFmt = display.unit === 'unidad'
    ? (display.qty % 1 === 0 ? display.qty.toFixed(0) : display.qty.toFixed(1))
    : Math.round(display.qty);
  const buyQtyFmt = display.unit === 'unidad'
    ? (buyDisplay % 1 === 0 ? buyDisplay.toFixed(0) : buyDisplay.toFixed(1))
    : Math.round(buyDisplay);

  const showUnitToggle = food.gramos_por_unidad ? true : false;

  return `
    <tr data-fid="${item.food_id}">
      <td>
        <div class="lc-prod-name">${escapeHtml(food.nombre)}</div>
        <div class="lc-prod-sub" title="${escapeHtml(sourcesTxt)}">${escapeHtml(sourcesTxt)}</div>
      </td>
      <td class="lc-need">
        <strong>${displayQtyFmt}${unitLabel}</strong>
        ${display.unit==='g' && food.gramos_por_unidad ? `<div class="lc-sub">≈ ${(totalGrams/food.gramos_por_unidad).toFixed(1)} unid</div>` : ''}
      </td>
      <td>
        <div class="lc-inv-row">
          <input type="number" min="0" step="0.1" value="${inv.qty||''}"
                 placeholder="0"
                 onchange="setInventory('${item.food_id}', this.value, document.querySelector('[data-fid=\\'${item.food_id}\\'] .lc-inv-unit').value)"
                 class="lc-inv-input">
          <select class="lc-inv-unit" onchange="setInventory('${item.food_id}', document.querySelector('[data-fid=\\'${item.food_id}\\'] .lc-inv-input').value, this.value)">
            <option value="g" ${inv.unit==='g'?'selected':''}>g</option>
            ${showUnitToggle ? `<option value="unidad" ${inv.unit==='unidad'?'selected':''}>u</option>` : ''}
          </select>
        </div>
      </td>
      <td class="lc-buy ${buyGrams===0?'lc-buy-done':''}">
        <strong>${buyQtyFmt}${unitLabel}</strong>
        ${buyGrams===0?'<div class="lc-sub" style="color:var(--green)">✓ ya tienes</div>':''}
      </td>
      <td>
        <div class="lc-price-row">
          $<input type="number" min="0" step="0.01" value="${price.price||''}" placeholder="0"
                  onchange="setPrice('${item.food_id}', 'price', this.value)"
                  class="lc-price-input">
          /
          <input type="number" min="0" step="0.1" value="${price.qty||''}" placeholder="0"
                 onchange="setPrice('${item.food_id}', 'qty', this.value)"
                 class="lc-price-qty">
          <select onchange="setPrice('${item.food_id}', 'unit', this.value)" class="lc-price-unit">
            <option value="g" ${price.unit==='g'?'selected':''}>g</option>
            <option value="kg" ${price.unit==='kg'?'selected':''}>kg</option>
            ${showUnitToggle ? `<option value="unidad" ${price.unit==='unidad'?'selected':''}>u</option>` : ''}
          </select>
        </div>
      </td>
      <td class="lc-cost">${costo!=null?fmtMoney(costo):'—'}</td>
    </tr>
  `;
}

function setInventory(food_id, qty, unit) {
  const s = shopGet();
  if (!s.inventory) s.inventory = {};
  const n = parseFloat(qty);
  if (isNaN(n) || n <= 0) {
    delete s.inventory[food_id];
  } else {
    s.inventory[food_id] = { qty: n, unit: unit || 'g' };
  }
  shopSet(s);
  renderIngredients();
}

function setPrice(food_id, field, value) {
  const s = shopGet();
  if (!s.prices) s.prices = {};
  if (!s.prices[food_id]) s.prices[food_id] = {price:'', qty:'', unit:'g'};
  if (field === 'unit') {
    s.prices[food_id].unit = value;
    // Si pasa a kg, sugerir 1; si pasa a g, sugerir 1000
    if (value === 'kg' && !s.prices[food_id].qty) s.prices[food_id].qty = 1;
    if (value === 'g' && !s.prices[food_id].qty) s.prices[food_id].qty = 1000;
  } else {
    s.prices[food_id][field] = value;
  }
  shopSet(s);
  renderIngredients();
}

// ─── TOTALS ──────────────────────────────────────────────────────────────────
function updateTotals() {
  const { agg } = aggregateIngredients();
  const shop = shopGet();
  let total = 0;
  let withPrice = 0;
  const keys = Object.keys(agg);
  keys.forEach(k => {
    const item = agg[k];
    const food = item.food;
    const inv = shop.inventory[k] || {qty:0, unit:'g'};
    let invGrams = 0;
    if (inv.unit === 'unidad' && food.gramos_por_unidad) invGrams = (parseFloat(inv.qty)||0) * food.gramos_por_unidad;
    else invGrams = parseFloat(inv.qty)||0;
    const buyGrams = Math.max(0, item.totalGrams - invGrams);
    const price = shop.prices[k] || {};
    let pkgGrams = 0;
    if (price.unit === 'kg') pkgGrams = (parseFloat(price.qty)||0) * 1000;
    else if (price.unit === 'unidad' && food.gramos_por_unidad) pkgGrams = (parseFloat(price.qty)||0) * food.gramos_por_unidad;
    else pkgGrams = parseFloat(price.qty)||0;
    if (parseFloat(price.price) > 0 && pkgGrams > 0) {
      total += (parseFloat(price.price) / pkgGrams) * buyGrams;
      if (buyGrams > 0) withPrice++;
    }
  });
  document.getElementById('totalEstimado').textContent = fmtMoney(total);
  document.getElementById('itemsConPrecio').textContent = `${withPrice} / ${keys.length}`;
}

// ─── CERRAR SEMANA ───────────────────────────────────────────────────────────
function closeWeek() {
  const shop = shopGet();
  if (shop.recipes.length === 0) { alert('La lista está vacía.'); return; }
  if (!shop.store) { alert('Selecciona o agrega una tienda primero.'); return; }
  if (!confirm(`¿Cerrar la semana del ${fmtDate(shop.weekStart)} en ${shop.store}?\n\nSe guarda en historial y se vacía la lista actual.`)) return;

  const { agg } = aggregateIngredients();
  const items = [];
  let total = 0;
  Object.keys(agg).forEach(k => {
    const item = agg[k];
    const food = item.food;
    const inv = shop.inventory[k] || {qty:0, unit:'g'};
    let invGrams = 0;
    if (inv.unit === 'unidad' && food.gramos_por_unidad) invGrams = (parseFloat(inv.qty)||0) * food.gramos_por_unidad;
    else invGrams = parseFloat(inv.qty)||0;
    const buyGrams = Math.max(0, item.totalGrams - invGrams);
    const price = shop.prices[k] || {};
    let pkgGrams = 0;
    if (price.unit === 'kg') pkgGrams = (parseFloat(price.qty)||0) * 1000;
    else if (price.unit === 'unidad' && food.gramos_por_unidad) pkgGrams = (parseFloat(price.qty)||0) * food.gramos_por_unidad;
    else pkgGrams = parseFloat(price.qty)||0;
    let costo = 0;
    let pricePer100g = null;
    if (parseFloat(price.price) > 0 && pkgGrams > 0) {
      const pricePerG = parseFloat(price.price) / pkgGrams;
      costo = pricePerG * buyGrams;
      pricePer100g = pricePerG * 100;
      total += costo;
    }
    items.push({
      food_id: k,
      name: food.nombre,
      needGrams: Math.round(item.totalGrams),
      buyGrams: Math.round(buyGrams),
      pricePackage: parseFloat(price.price) || 0,
      qtyPackage: parseFloat(price.qty) || 0,
      unitPackage: price.unit || 'g',
      costo: Math.round(costo*100)/100,
      pricePer100g: pricePer100g != null ? Math.round(pricePer100g*100)/100 : null,
    });
    // Guardar snapshot en priceDb
    if (pricePer100g != null) {
      const db = priceDbGet();
      if (!db[k]) db[k] = {};
      if (!db[k][shop.store]) db[k][shop.store] = [];
      db[k][shop.store].push({
        date: shop.weekStart,
        price: parseFloat(price.price),
        qty: parseFloat(price.qty),
        unit: price.unit,
        pricePer100g: Math.round(pricePer100g*100)/100,
      });
      priceDbSet(db);
    }
  });

  const history = historyGet();
  history.push({
    id: 'w' + Date.now(),
    weekStart: shop.weekStart,
    weekEnd: plusDays(shop.weekStart, 6),
    store: shop.store,
    total: Math.round(total*100)/100,
    recipes: shop.recipes.map(r => r.name),
    items,
  });
  historySet(history);

  // Vacía la lista (mantiene tienda como sugerencia, avanza semana)
  const newShop = {
    recipes: [],
    inventory: {},
    prices: {},
    store: shop.store,
    weekStart: plusDays(shop.weekStart, 7),
  };
  shopSet(newShop);
  alert(`✓ Semana guardada · Total: ${fmtMoney(total)}`);
  renderAll();
}

function clearAll() {
  if (!confirm('¿Vaciar la lista actual? (no se guarda en historial)')) return;
  const s = shopGet();
  s.recipes = [];
  s.inventory = {};
  s.prices = {};
  shopSet(s);
  renderAll();
}

// ─── HISTORIAL ───────────────────────────────────────────────────────────────
function renderHistory() {
  const history = historyGet().slice().sort((a,b) => b.weekStart.localeCompare(a.weekStart));
  document.getElementById('historyCount').textContent = `${history.length} semana${history.length===1?'':'s'}`;
  const cont = document.getElementById('historyList');
  if (history.length === 0) {
    cont.innerHTML = `<div class="empty-state" style="padding:1rem">Sin historial. Cierra una semana para empezar a comparar.</div>`;
    return;
  }
  cont.innerHTML = history.map(w => `
    <details class="lc-history">
      <summary>
        <div>
          <strong>${fmtDate(w.weekStart)} – ${fmtDate(w.weekEnd)}</strong>
          <span class="lc-tag-store">${escapeHtml(w.store)}</span>
        </div>
        <div class="lc-history-total">${fmtMoney(w.total)}</div>
      </summary>
      <div class="lc-history-body">
        <div class="lc-sub" style="margin-bottom:8px">${w.recipes.length} recetas · ${w.items.length} productos</div>
        <table class="lc-table lc-table-compact">
          <thead><tr><th>Producto</th><th>Compra</th><th>$/100g</th><th>Costo</th></tr></thead>
          <tbody>
            ${w.items.map(i => `
              <tr>
                <td>${escapeHtml(i.name)}</td>
                <td>${i.buyGrams}g</td>
                <td>${i.pricePer100g!=null?fmtMoney(i.pricePer100g):'—'}</td>
                <td>${fmtMoney(i.costo)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top:10px">
          <button class="btn-cancel" onclick="deleteWeek('${w.id}')">🗑 Eliminar esta semana</button>
        </div>
      </div>
    </details>
  `).join('');
}

function deleteWeek(id) {
  if (!confirm('¿Eliminar esta semana del historial? (También se borran sus precios del comparador)')) return;
  const history = historyGet();
  const w = history.find(x => x.id === id);
  historySet(history.filter(x => x.id !== id));
  // Quitar snapshots de priceDb que coincidan con esta semana+tienda
  if (w) {
    const db = priceDbGet();
    Object.keys(db).forEach(fid => {
      if (!db[fid][w.store]) return;
      db[fid][w.store] = db[fid][w.store].filter(s => s.date !== w.weekStart);
      if (db[fid][w.store].length === 0) delete db[fid][w.store];
      if (Object.keys(db[fid]).length === 0) delete db[fid];
    });
    priceDbSet(db);
  }
  renderAll();
}

// ─── COMPARADOR DE PRECIOS ───────────────────────────────────────────────────
function renderComparator() {
  const db = priceDbGet();
  const foodIds = Object.keys(db);
  const cont = document.getElementById('comparatorWrap');
  if (foodIds.length === 0) {
    cont.innerHTML = `<div class="empty-state" style="padding:1rem">Sin datos. Cierra al menos una semana con precios para empezar a comparar.</div>`;
    return;
  }
  // Recopila todas las tiendas
  const storesSet = new Set();
  foodIds.forEach(fid => Object.keys(db[fid]).forEach(s => storesSet.add(s)));
  const stores = Array.from(storesSet).sort();

  // Para cada producto: min/avg/last por tienda
  const rows = foodIds.map(fid => {
    const food = FOODS_BY_ID[fid];
    const name = food ? food.nombre : fid;
    const perStore = {};
    let bestStore = null, bestPrice = Infinity;
    stores.forEach(s => {
      const snaps = db[fid][s] || [];
      if (snaps.length === 0) { perStore[s] = null; return; }
      const prices = snaps.map(x => x.pricePer100g);
      const min = Math.min(...prices);
      const avg = prices.reduce((a,b)=>a+b,0)/prices.length;
      const last = snaps[snaps.length-1].pricePer100g;
      perStore[s] = {min, avg, last, n: snaps.length};
      if (min < bestPrice) { bestPrice = min; bestStore = s; }
    });
    return {fid, name, perStore, bestStore, bestPrice};
  }).sort((a,b) => a.name.localeCompare(b.name));

  cont.innerHTML = `
    <div class="lc-table-wrap">
    <table class="lc-table lc-table-compact">
      <thead>
        <tr>
          <th>Producto</th>
          ${stores.map(s => `<th>${escapeHtml(s)}<br><span class="lc-th-sub">$/100g (mín · últ)</span></th>`).join('')}
          <th>Mejor</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(r => `
          <tr>
            <td><strong>${escapeHtml(r.name)}</strong></td>
            ${stores.map(s => {
              const p = r.perStore[s];
              if (!p) return `<td class="lc-comp-empty">—</td>`;
              const isBest = s === r.bestStore;
              return `<td class="${isBest?'lc-comp-best':''}">
                <div>${fmtMoney(p.min)}</div>
                <div class="lc-sub">últ ${fmtMoney(p.last)} · n=${p.n}</div>
              </td>`;
            }).join('')}
            <td><span class="lc-tag-best">${escapeHtml(r.bestStore || '—')}</span></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

// ─── INIT ────────────────────────────────────────────────────────────────────
function renderAll() {
  renderHeader();
  renderRecipes();
  renderIngredients();
  renderHistory();
  renderComparator();
}
// NOTA: La página llama initLista() después de cargar cloudStorage
