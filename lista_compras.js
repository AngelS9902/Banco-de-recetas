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
// Grupo virtual para items que ya están en casa (no es una tienda real)
const PANTRY = 'Refri / Alacena';

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

// Convierte (qty, unit) a gramos para inventario/precio.
// ml y L se tratan como g (1:1) por defecto — funciona para líquidos típicos.
function unitToGrams(qty, unit, food) {
  qty = parseFloat(qty) || 0;
  switch(unit) {
    case 'kg': return qty * 1000;
    case 'L':  return qty * 1000;
    case 'ml': return qty;
    case 'g':  return qty;
    case 'unidad':
      return (food && food.gramos_por_unidad) ? qty * food.gramos_por_unidad : 0;
    default: return qty;
  }
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
  if (raw && Array.isArray(raw.recipes)) {
    if (!raw.purchased) raw.purchased = {};
    return raw;
  }
  return { recipes: [], inventory: {}, prices: {}, purchased: {}, store: '', weekStart: '' };
}
function shopSet(s) { cloudSet('shop_list', s); }

function historyGet() { return cloudGet('shop_history', []) || []; }
function historySet(h) { cloudSet('shop_history', h); }

function priceDbGet() { return cloudGet('price_db', {}) || {}; }
function priceDbSet(db) { cloudSet('price_db', db); }

// Devuelve el snapshot de precio más reciente para un alimento.
// Si preferStore se pasa, prioriza esa tienda; sino busca cualquiera.
// Retorna { pricePer100g, store, date, fromPreferredStore } o null.
function lastHistoricalPrice(food_id, preferStore) {
  const db = priceDbGet();
  if (!db[food_id]) return null;
  // Tienda preferida primero
  if (preferStore && db[food_id][preferStore] && db[food_id][preferStore].length) {
    const arr = db[food_id][preferStore].slice().sort((a,b) => (b.date||'').localeCompare(a.date||''));
    const s = arr[0];
    return { pricePer100g: s.pricePer100g, price: s.price, qty: s.qty, unit: s.unit, store: preferStore, date: s.date, fromPreferredStore: true };
  }
  // Cualquier tienda — más reciente global
  let best = null;
  for (const store in db[food_id]) {
    (db[food_id][store]||[]).forEach(s => {
      if (!best || (s.date||'') > (best.date||'')) best = { ...s, store };
    });
  }
  if (best) return { pricePer100g: best.pricePer100g, price: best.price, qty: best.qty, unit: best.unit, store: best.store, date: best.date, fromPreferredStore: false };
  return null;
}

function storesGet() {
  const s = cloudGet('stores', null);
  if (Array.isArray(s) && s.length) return s;
  return DEFAULT_STORES.slice();
}
function storesSet(arr) { cloudSet('stores', arr); }

// Mapeo persistente: food_id -> tienda asignada
function foodStoresGet() { return cloudGet('food_stores', {}) || {}; }
function foodStoresSet(m) { cloudSet('food_stores', m); }
function getFoodStore(food_id) {
  const m = foodStoresGet();
  return m[food_id] || null;
}
function assignFoodStore(food_id, store) {
  const m = foodStoresGet();
  if (!store) delete m[food_id]; else m[food_id] = store;
  foodStoresSet(m);
  // Si la tienda no existe en la lista global, agrégala
  if (store) {
    const stores = storesGet();
    if (!stores.includes(store)) { stores.push(store); storesSet(stores); }
  }
  renderAll();
}

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

// ─── RENDER: HEADER ──────────────────────────────────────────────────────────
function renderHeader() {
  const shop = shopGet();
  // Asegura weekStart inicializado
  if (!shop.weekStart) { shop.weekStart = mondayOf(todayISO()); shopSet(shop); }
  const weekEnd = plusDays(shop.weekStart, 6);
  document.getElementById('weekLabel').textContent = `${fmtDate(shop.weekStart)} – ${fmtDate(weekEnd)}`;
  const stores = storesGet();
  const storeLabel = document.getElementById('storeLabel');
  if (storeLabel) storeLabel.textContent = `${stores.length} tienda${stores.length===1?'':'s'}`;
  const wsInput = document.getElementById('weekStartInput');
  if (wsInput) {
    wsInput.value = shop.weekStart;
    wsInput.onchange = (e) => {
      const s = shopGet();
      s.weekStart = mondayOf(e.target.value);
      shopSet(s);
      renderHeader();
    };
  }
}

// addStore() — ya no se usa desde header pero la dejamos por si HTML legacy
function addStore() { /* deprecated — usar openStoreMenu por item */ }

// ─── RENDER: RECETAS CHIPS ───────────────────────────────────────────────────
function renderRecipes() {
  const shop = shopGet();
  const cont = document.getElementById('recipesChips');
  document.getElementById('recipesCount').textContent = `${shop.recipes.length} receta${shop.recipes.length===1?'':'s'}`;
  if (shop.recipes.length === 0) {
    cont.innerHTML = `<div class="empty-state" style="padding:1rem">Sin recetas. Vuelve al <a href="home.html" style="color:var(--accent)">banco</a> y agrega con el botón 🛒.</div>`;
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

// ─── RENDER: TABLA DE INGREDIENTES AGRUPADA POR TIENDA ───────────────────────
function renderIngredients() {
  const { agg, legacy } = aggregateIngredients();
  const shop = shopGet();
  const keys = Object.keys(agg).sort((a,b) => agg[a].food.nombre.localeCompare(agg[b].food.nombre));

  document.getElementById('ingrCount').textContent = `${keys.length} producto${keys.length===1?'':'s'}`;

  const wrap = document.getElementById('ingrTableWrap');
  if (keys.length === 0) {
    wrap.innerHTML = `<div class="empty-state" style="padding:1rem">Sin ingredientes para sumar. Agrega recetas con ingredientes estructurados.</div>`;
  } else {
    // Calcular split por food_id: cuánto va a pantry y cuánto a comprar
    const UNASSIGNED = '__unassigned__';
    const groups = {}; // groupName -> [{ food_id, kind: 'pantry'|'buy' }]
    keys.forEach(k => {
      const it = agg[k];
      const inv = shop.inventory[k] || {qty:0, unit:'g'};
      const invG = unitToGrams(inv.qty, inv.unit, it.food);
      const buyG = Math.max(0, it.totalGrams - invG);
      // Pantry row si hay inventario
      if (invG > 0) {
        if (!groups[PANTRY]) groups[PANTRY] = [];
        groups[PANTRY].push({ food_id: k, kind: 'pantry' });
      }
      // Buy row si falta por comprar
      if (buyG > 0) {
        const store = getFoodStore(k) || UNASSIGNED;
        if (!groups[store]) groups[store] = [];
        groups[store].push({ food_id: k, kind: 'buy' });
      }
    });
    // Orden: Refri primero, tiendas alfabéticas, Sin asignar al final
    const allGroups = Object.keys(groups);
    const ordered = [];
    if (groups[PANTRY]) ordered.push(PANTRY);
    allGroups.filter(s => s !== PANTRY && s !== UNASSIGNED).sort((a,b) => a.localeCompare(b)).forEach(s => ordered.push(s));
    if (groups[UNASSIGNED]) ordered.push(UNASSIGNED);

    wrap.innerHTML = ordered.map(groupName => {
      const isUnassigned = groupName === UNASSIGNED;
      const isPantry = groupName === PANTRY;
      const rows = groups[groupName];
      // Stats por grupo
      let groupBuyTotal = 0;     // costo proporcional (lo que la receta usa)
      let groupPkgTotal = 0;     // costo paquete (lo que realmente gastas si "en carrito")
      let savedTotal = 0;        // ahorro (solo pantry)
      let purchasedCount = 0;
      rows.forEach(({food_id, kind}) => {
        const it = agg[food_id];
        const inv = shop.inventory[food_id] || {qty:0, unit:'g'};
        const invG = unitToGrams(inv.qty, inv.unit, it.food);
        const buyG = Math.max(0, it.totalGrams - invG);
        const price = shop.prices[food_id] || {};
        const pkgG = unitToGrams(price.qty, price.unit, it.food);
        const hp = (parseFloat(price.price)>0) ? null : lastHistoricalPrice(food_id, isPantry ? null : groupName);
        const pricePerG = (parseFloat(price.price)>0 && pkgG>0)
          ? (parseFloat(price.price)/pkgG)
          : (hp ? hp.pricePer100g/100 : 0);
        if (kind === 'pantry') {
          savedTotal += pricePerG * invG;
        } else { // buy
          groupBuyTotal += pricePerG * buyG;
          if (shop.purchased && shop.purchased[food_id]) {
            purchasedCount++;
            if (parseFloat(price.price)>0) groupPkgTotal += parseFloat(price.price);
          }
        }
      });
      const statsTxt = isPantry
        ? `${rows.length} item${rows.length===1?'':'s'}${savedTotal>0?` · ahorro ${fmtMoney(savedTotal)}`:''}`
        : `${rows.length} item${rows.length===1?'':'s'}` +
          (purchasedCount>0?` · ${purchasedCount} en carrito`:'') +
          (groupPkgTotal>0?` · pagado ${fmtMoney(groupPkgTotal)}`:'') +
          (groupBuyTotal>0?` · receta ${fmtMoney(groupBuyTotal)}`:'');

      const headHtml = isPantry
        ? `<div class="lc-store-group-head lc-store-pantry">
             <div class="lc-store-group-title">🏠 ${escapeHtml(PANTRY)}</div>
             <div class="lc-store-group-stats">${statsTxt}</div>
           </div>`
        : isUnassigned
          ? `<div class="lc-store-group-head lc-store-unassigned">
               <div class="lc-store-group-title">📦 Sin tienda asignada</div>
               <div class="lc-store-group-stats">${statsTxt}</div>
             </div>`
          : `<div class="lc-store-group-head">
               <div class="lc-store-group-title">🏪 ${escapeHtml(groupName)}</div>
               <div class="lc-store-group-stats">${statsTxt}</div>
             </div>`;

      // Encabezado de tabla diferente para pantry vs buy
      const theadHtml = isPantry
        ? `<tr>
             <th class="lc-th-check" title="Marcar como cubierto">✓</th>
             <th>Producto</th>
             <th>Tengo</th>
             <th>Necesito</th>
             <th>Ahorro<br><span class="lc-th-sub">vs comprar</span></th>
           </tr>`
        : `<tr>
             <th class="lc-th-check" title="Marcar como en carrito">✓</th>
             <th>Producto</th>
             <th>A comprar<br><span class="lc-th-sub">de Necesito</span></th>
             <th>Precio paquete<br><span class="lc-th-sub">$ por cantidad</span></th>
             <th>Costo<br><span class="lc-th-sub">receta · paquete</span></th>
           </tr>`;

      const bodyHtml = rows.map(({food_id, kind}) =>
        kind === 'pantry'
          ? renderPantryRow(agg[food_id], shop)
          : renderIngrRow(agg[food_id], shop, isUnassigned ? null : groupName)
      ).join('');

      return `
        <div class="lc-store-group ${isUnassigned?'lc-store-group-dashed':''} ${isPantry?'lc-store-group-pantry':''}">
          ${headHtml}
          <div class="lc-table-wrap">
          <table class="lc-table">
            <thead>${theadHtml}</thead>
            <tbody>${bodyHtml}</tbody>
          </table>
          </div>
        </div>
      `;
    }).join('');
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

// Fila Pantry (Refri/Alacena): muestra lo que ya tienes
function renderPantryRow(item, shop) {
  const { food, totalGrams } = item;
  const display = chooseDisplayUnit(item);
  const inv = shop.inventory[item.food_id] || {qty:0, unit: display.unit};
  const invGrams = unitToGrams(inv.qty, inv.unit, food);
  const showUnitToggle = food.gramos_por_unidad ? true : false;

  // Ahorro: usa precio actual o histórico
  const price = shop.prices[item.food_id] || {};
  const pkgGrams = unitToGrams(price.qty, price.unit, food);
  let pricePerG = 0;
  let isHist = false;
  if (parseFloat(price.price) > 0 && pkgGrams > 0) {
    pricePerG = parseFloat(price.price) / pkgGrams;
  } else {
    const hp = lastHistoricalPrice(item.food_id, null);
    if (hp) { pricePerG = hp.pricePer100g/100; isHist = true; }
  }
  const ahorro = pricePerG * invGrams;

  const needLabel = display.unit==='unidad'
    ? `${(totalGrams/food.gramos_por_unidad).toFixed(1)}u`
    : `${Math.round(totalGrams)}g`;
  const sourcesTxt = item.sources.map(s => `${s.qty}${s.unit==='unidad'?'u':s.unit} (${s.recipeName})`).join(' + ');
  const isFullyCovered = invGrams >= totalGrams;

  return `
    <tr data-fid="${item.food_id}" data-kind="pantry" class="${isFullyCovered?'lc-row-done':''}">
      <td class="lc-td-check">
        <input type="checkbox" class="lc-check-done" ${isFullyCovered?'checked':''}
               onchange="togglePantryFull('${item.food_id}', this.checked)"
               title="Marcar como ya cubierto del todo">
      </td>
      <td>
        <div class="lc-prod-name">${escapeHtml(food.nombre)}</div>
        <div class="lc-prod-sub" title="${escapeHtml(sourcesTxt)}">${escapeHtml(sourcesTxt)}</div>
      </td>
      <td>
        <div class="lc-inv-row">
          <input type="number" min="0" step="0.1" value="${inv.qty||''}"
                 placeholder="0"
                 onchange="setInventory('${item.food_id}', this.value, document.querySelector('[data-fid=\\'${item.food_id}\\'][data-kind=\\'pantry\\'] .lc-inv-unit').value)"
                 class="lc-inv-input">
          <select class="lc-inv-unit" onchange="setInventory('${item.food_id}', document.querySelector('[data-fid=\\'${item.food_id}\\'][data-kind=\\'pantry\\'] .lc-inv-input').value, this.value)">
            <option value="g" ${inv.unit==='g'?'selected':''}>g</option>
            <option value="kg" ${inv.unit==='kg'?'selected':''}>kg</option>
            <option value="ml" ${inv.unit==='ml'?'selected':''}>ml</option>
            <option value="L" ${inv.unit==='L'?'selected':''}>L</option>
            ${showUnitToggle ? `<option value="unidad" ${inv.unit==='unidad'?'selected':''}>u</option>` : ''}
          </select>
        </div>
      </td>
      <td class="lc-need"><strong>${needLabel}</strong></td>
      <td class="lc-cost">
        ${ahorro > 0
          ? `<div class="lc-cost-saved-strong">${fmtMoney(ahorro)}</div>${isHist?`<div class="lc-sub" style="font-size:9px">hist.</div>`:''}`
          : '<span class="lc-sub">—</span>'}
      </td>
    </tr>
  `;
}

// Fila Buy: en tienda asignada o sin asignar. Checkbox = "en carrito"
function renderIngrRow(item, shop, assignedStore) {
  const { food, totalGrams } = item;
  const display = chooseDisplayUnit(item);
  const inv = shop.inventory[item.food_id] || {qty:0, unit:'g'};
  const invGrams = unitToGrams(inv.qty, inv.unit, food);
  const buyGrams = Math.max(0, totalGrams - invGrams);
  const buyDisplay = display.unit === 'unidad'
    ? (buyGrams / food.gramos_por_unidad)
    : buyGrams;

  const sourcesTxt = item.sources.map(s => `${s.qty}${s.unit==='unidad'?'u':s.unit} (${s.recipeName})`).join(' + ');

  const price = shop.prices[item.food_id] || {price:'', qty:'', unit: display.unit};
  let costo = null;
  const pkgGrams = unitToGrams(price.qty, price.unit, food);
  if (parseFloat(price.price) > 0 && pkgGrams > 0) {
    costo = (parseFloat(price.price) / pkgGrams) * buyGrams;
  }

  const histPrice = (parseFloat(price.price) > 0) ? null : lastHistoricalPrice(item.food_id, assignedStore);

  const unitLabel = display.unit === 'unidad' ? 'u' : 'g';
  const needFmt = display.unit === 'unidad'
    ? (display.qty % 1 === 0 ? display.qty.toFixed(0) : display.qty.toFixed(1))
    : Math.round(display.qty);
  const buyQtyFmt = display.unit === 'unidad'
    ? (buyDisplay % 1 === 0 ? buyDisplay.toFixed(0) : buyDisplay.toFixed(1))
    : Math.round(buyDisplay);

  const showUnitToggle = food.gramos_por_unidad ? true : false;
  const inCart = !!(shop.purchased && shop.purchased[item.food_id]);
  const pkgPrice = parseFloat(price.price) || 0;

  return `
    <tr data-fid="${item.food_id}" data-kind="buy" class="${inCart?'lc-row-cart':''}">
      <td class="lc-td-check">
        <input type="checkbox" class="lc-check-done" ${inCart?'checked':''}
               onchange="toggleInCart('${item.food_id}', this.checked, ${assignedStore?'true':'false'})"
               title="${assignedStore?'Marcar como ya en el carrito':'Marcar como ya cubierto (lo mueve a Refri/Alacena)'}">
      </td>
      <td>
        <div class="lc-prod-name">${escapeHtml(food.nombre)}</div>
        <div class="lc-prod-sub" title="${escapeHtml(sourcesTxt)}">${escapeHtml(sourcesTxt)}</div>
        ${assignedStore
          ? `<div class="lc-prod-store"><button class="lc-store-badge" onclick="openStoreMenu('${item.food_id}', this)" title="Cambiar tienda">🏪 ${escapeHtml(assignedStore)} ▾</button></div>`
          : `<div class="lc-prod-store"><button class="lc-store-assign" onclick="openStoreMenu('${item.food_id}', this)">+ asignar tienda</button></div>`}
      </td>
      <td class="lc-buy">
        <strong>${buyQtyFmt}${unitLabel}</strong>
        <div class="lc-sub">de ${needFmt}${unitLabel}</div>
      </td>
      <td>
        <div class="lc-price-row">
          $<input type="number" min="0" step="0.01" value="${price.price||''}" placeholder="${histPrice?histPrice.price:'0'}"
                  onchange="setPrice('${item.food_id}', 'price', this.value)"
                  class="lc-price-input ${histPrice?'lc-price-from-hist':''}">
          /
          <input type="number" min="0" step="0.1" value="${price.qty||''}" placeholder="${histPrice?histPrice.qty:'0'}"
                 onchange="setPrice('${item.food_id}', 'qty', this.value)"
                 class="lc-price-qty ${histPrice?'lc-price-from-hist':''}">
          <select onchange="setPrice('${item.food_id}', 'unit', this.value)" class="lc-price-unit">
            <option value="g" ${(price.unit||(histPrice&&histPrice.unit))==='g'?'selected':''}>g</option>
            <option value="kg" ${(price.unit||(histPrice&&histPrice.unit))==='kg'?'selected':''}>kg</option>
            <option value="ml" ${(price.unit||(histPrice&&histPrice.unit))==='ml'?'selected':''}>ml</option>
            <option value="L" ${(price.unit||(histPrice&&histPrice.unit))==='L'?'selected':''}>L</option>
            ${showUnitToggle ? `<option value="unidad" ${(price.unit||(histPrice&&histPrice.unit))==='unidad'?'selected':''}>u</option>` : ''}
          </select>
        </div>
        ${histPrice ? `<div class="lc-hist-hint">Último: $${histPrice.price}/${histPrice.qty}${histPrice.unit} · ${escapeHtml(histPrice.store)} <button class="lc-apply-hist" onclick="applyHistPrice('${item.food_id}')">aplicar</button></div>`:''}
      </td>
      <td class="lc-cost">
        ${costo!=null && costo>0
          ? `<div>${fmtMoney(costo)}</div>${pkgPrice>0 ? `<div class="lc-sub lc-cost-pkg ${inCart?'lc-cost-pkg-active':''}">pago ${fmtMoney(pkgPrice)}</div>` : ''}`
          : '—'}
      </td>
    </tr>
  `;
}

// ─── MENÚ FLOTANTE DE ASIGNACIÓN DE TIENDA ───────────────────────────────────
function openStoreMenu(food_id, btn) {
  closeStoreMenu();
  const stores = storesGet();
  const current = getFoodStore(food_id) || '';
  const menu = document.createElement('div');
  menu.className = 'lc-store-menu';
  menu.id = '__lc_store_menu__';
  menu.innerHTML = `
    <div class="lc-store-menu-title">Asignar tienda</div>
    ${stores.map(s => `
      <button class="lc-store-menu-opt ${s===current?'lc-store-menu-active':''}" onclick="assignFoodStore('${food_id}','${escapeHtml(s).replace(/'/g,"\\'")}');closeStoreMenu()">${escapeHtml(s)}${s===current?' ✓':''}</button>
    `).join('')}
    <div class="lc-store-menu-sep"></div>
    <div class="lc-store-menu-new">
      <input type="text" id="__lc_new_store__" placeholder="Nueva tienda…" class="lc-store-menu-input">
      <button class="lc-store-menu-add" onclick="addStoreFromMenu('${food_id}')">＋</button>
    </div>
    ${current ? `<button class="lc-store-menu-clear" onclick="assignFoodStore('${food_id}','');closeStoreMenu()">🗑 Quitar asignación</button>` : ''}
  `;
  document.body.appendChild(menu);
  // Posicionar bajo el botón
  const r = btn.getBoundingClientRect();
  menu.style.left = Math.min(r.left, window.innerWidth - 240) + 'px';
  menu.style.top = (r.bottom + window.scrollY + 4) + 'px';
  // Click fuera cierra
  setTimeout(() => {
    document.addEventListener('click', outsideStoreMenuClick, { once: false });
  }, 0);
}
function outsideStoreMenuClick(e) {
  const menu = document.getElementById('__lc_store_menu__');
  if (menu && !menu.contains(e.target) && !e.target.closest('.lc-store-badge') && !e.target.closest('.lc-store-assign')) {
    closeStoreMenu();
  }
}
function closeStoreMenu() {
  const m = document.getElementById('__lc_store_menu__');
  if (m) m.remove();
  document.removeEventListener('click', outsideStoreMenuClick);
}
function addStoreFromMenu(food_id) {
  const inp = document.getElementById('__lc_new_store__');
  if (!inp) return;
  const v = inp.value.trim();
  if (!v) return;
  assignFoodStore(food_id, v);
  closeStoreMenu();
}

function applyHistPrice(food_id) {
  const s = shopGet();
  const assigned = getFoodStore(food_id);
  const hp = lastHistoricalPrice(food_id, assigned);
  if (!hp) return;
  if (!s.prices) s.prices = {};
  s.prices[food_id] = { price: hp.price, qty: hp.qty, unit: hp.unit || 'g' };
  shopSet(s);
  renderIngredients();
}

// Pantry row checkbox: si check, llena inv = totalNeeded
function togglePantryFull(food_id, checked) {
  const { agg } = aggregateIngredients();
  const item = agg[food_id];
  if (!item) return;
  const s = shopGet();
  if (!s.inventory) s.inventory = {};
  if (checked) {
    const food = item.food;
    const display = chooseDisplayUnit(item);
    if (display.unit === 'unidad' && food.gramos_por_unidad) {
      s.inventory[food_id] = { qty: Math.round((item.totalGrams/food.gramos_por_unidad) * 100)/100, unit: 'unidad' };
    } else {
      s.inventory[food_id] = { qty: Math.round(item.totalGrams * 100)/100, unit: 'g' };
    }
  } else {
    delete s.inventory[food_id];
  }
  shopSet(s);
  renderIngredients();
}

// Buy row checkbox: si hay tienda asignada → marca/desmarca "en carrito".
// Si NO hay tienda (Sin asignar): auto-llena inventario (mueve a Refri/Alacena).
function toggleInCart(food_id, checked, hasStore) {
  const s = shopGet();
  if (!s.purchased) s.purchased = {};
  if (!s.inventory) s.inventory = {};
  if (!hasStore) {
    // Sin tienda: el check significa "ya tengo todo" → llenar inventario
    if (checked) {
      const { agg } = aggregateIngredients();
      const item = agg[food_id];
      if (!item) return;
      const food = item.food;
      const display = chooseDisplayUnit(item);
      if (display.unit === 'unidad' && food.gramos_por_unidad) {
        s.inventory[food_id] = { qty: Math.round((item.totalGrams/food.gramos_por_unidad)*100)/100, unit: 'unidad' };
      } else {
        s.inventory[food_id] = { qty: Math.round(item.totalGrams*100)/100, unit: 'g' };
      }
    } else {
      delete s.inventory[food_id];
    }
  } else {
    // Con tienda: toggle "en carrito"
    if (checked) s.purchased[food_id] = true;
    else delete s.purchased[food_id];
  }
  shopSet(s);
  renderIngredients();
}

// Compat (por si llaman desde otro lado): redirige a togglePantryFull
function toggleItemDone(food_id, checked) { togglePantryFull(food_id, checked); }

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
    // Defaults sugeridos al cambiar de unidad
    if (value === 'kg' && !s.prices[food_id].qty) s.prices[food_id].qty = 1;
    if (value === 'L'  && !s.prices[food_id].qty) s.prices[food_id].qty = 1;
    if (value === 'g'  && !s.prices[food_id].qty) s.prices[food_id].qty = 1000;
    if (value === 'ml' && !s.prices[food_id].qty) s.prices[food_id].qty = 1000;
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
  const keys = Object.keys(agg);
  let costoReceta = 0;     // proporcional sobre lo que se necesita comprar
  let costoCarrito = 0;    // suma de precio paquete de items "en carrito"
  let ahorro = 0;          // pricePerG * invGrams
  let withPrice = 0;
  const storeTotalsPkg = {}; // store -> sum pkg cost (en carrito)
  const storeTotalsReceta = {}; // store -> sum proporcional

  keys.forEach(k => {
    const item = agg[k];
    const food = item.food;
    const inv = shop.inventory[k] || {qty:0, unit:'g'};
    const invGrams = unitToGrams(inv.qty, inv.unit, food);
    const buyGrams = Math.max(0, item.totalGrams - invGrams);
    const price = shop.prices[k] || {};
    const pkgGrams = unitToGrams(price.qty, price.unit, food);
    const hasPrice = parseFloat(price.price) > 0 && pkgGrams > 0;
    const pricePerG = hasPrice ? (parseFloat(price.price) / pkgGrams) : 0;
    const store = getFoodStore(k);
    if (hasPrice && buyGrams > 0) withPrice++;
    if (invGrams > 0 && pricePerG > 0) ahorro += pricePerG * invGrams;
    if (buyGrams > 0 && pricePerG > 0) {
      const c = pricePerG * buyGrams;
      costoReceta += c;
      if (store) storeTotalsReceta[store] = (storeTotalsReceta[store]||0) + c;
    }
    if (shop.purchased && shop.purchased[k] && store && parseFloat(price.price) > 0) {
      costoCarrito += parseFloat(price.price);
      storeTotalsPkg[store] = (storeTotalsPkg[store]||0) + parseFloat(price.price);
    }
  });

  // Resumen HTML: lo construimos en totalEstimado para mostrar todo
  const totalEl = document.getElementById('totalEstimado');
  const itemsEl = document.getElementById('itemsConPrecio');
  if (totalEl) {
    const storeNames = Array.from(new Set([...Object.keys(storeTotalsPkg), ...Object.keys(storeTotalsReceta)])).sort();
    const storesHtml = storeNames.map(s => `
      <div class="lc-total-row">
        <span>🏪 ${escapeHtml(s)}</span>
        <span>${storeTotalsPkg[s]?fmtMoney(storeTotalsPkg[s]):'<span class="lc-sub">$0</span>'}
          <span class="lc-sub">· receta ${fmtMoney(storeTotalsReceta[s]||0)}</span>
        </span>
      </div>`).join('');
    totalEl.innerHTML = `
      ${storesHtml}
      <div class="lc-total-row lc-total-grand"><span>Pagado total</span><span>${fmtMoney(costoCarrito)}</span></div>
      <div class="lc-total-row"><span class="lc-sub">Costo por receta</span><span class="lc-sub">${fmtMoney(costoReceta)}</span></div>
      ${ahorro>0?`<div class="lc-total-row"><span class="lc-sub" style="color:var(--green)">Ahorro de alacena</span><span class="lc-sub" style="color:var(--green)">${fmtMoney(ahorro)}</span></div>`:''}
    `;
  }
  if (itemsEl) itemsEl.textContent = `${withPrice} / ${keys.length}`;
}

// ─── CERRAR SEMANA ───────────────────────────────────────────────────────────
function closeWeek() {
  const shop = shopGet();
  if (shop.recipes.length === 0) { alert('La lista está vacía.'); return; }

  const { agg } = aggregateIngredients();
  const keys = Object.keys(agg);
  // Avisar si hay items sin tienda asignada (no bloquea)
  const unassigned = keys.filter(k => !getFoodStore(k));
  if (unassigned.length > 0) {
    const msg = 'Hay ' + unassigned.length + ' producto(s) sin tienda asignada. No quedara registro de tienda para ellos.\n\nCerrar la semana del ' + fmtDate(shop.weekStart) + ' de todos modos?';
    if (!confirm(msg)) return;
  } else {
    if (!confirm('Cerrar la semana del ' + fmtDate(shop.weekStart) + '?\n\nSe guarda en historial y se vacia la lista actual.')) return;
  }

  const items = [];
  let total = 0;
  const storeTotals = {};
  keys.forEach(k => {
    const item = agg[k];
    const food = item.food;
    const itemStore = getFoodStore(k) || '(sin tienda)';
    const inv = shop.inventory[k] || {qty:0, unit:'g'};
    const invGrams = unitToGrams(inv.qty, inv.unit, food);
    const buyGrams = Math.max(0, item.totalGrams - invGrams);
    const price = shop.prices[k] || {};
    const pkgGrams = unitToGrams(price.qty, price.unit, food);
    let costo = 0;
    let pricePer100g = null;
    if (parseFloat(price.price) > 0 && pkgGrams > 0) {
      const pricePerG = parseFloat(price.price) / pkgGrams;
      costo = pricePerG * buyGrams;
      pricePer100g = pricePerG * 100;
      total += costo;
      storeTotals[itemStore] = (storeTotals[itemStore]||0) + costo;
    }
    items.push({
      food_id: k,
      name: food.nombre,
      store: itemStore,
      needGrams: Math.round(item.totalGrams),
      buyGrams: Math.round(buyGrams),
      pricePackage: parseFloat(price.price) || 0,
      qtyPackage: parseFloat(price.qty) || 0,
      unitPackage: price.unit || 'g',
      costo: Math.round(costo*100)/100,
      pricePer100g: pricePer100g != null ? Math.round(pricePer100g*100)/100 : null,
      inCart: !!(shop.purchased && shop.purchased[k]),
    });
    if (pricePer100g != null && getFoodStore(k)) {
      const storeForDb = getFoodStore(k);
      const db = priceDbGet();
      if (!db[k]) db[k] = {};
      if (!db[k][storeForDb]) db[k][storeForDb] = [];
      db[k][storeForDb].push({
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
    total: Math.round(total*100)/100,
    storeTotals: Object.fromEntries(Object.entries(storeTotals).map(([k,v]) => [k, Math.round(v*100)/100])),
    recipes: shop.recipes.map(r => r.name),
    items,
  });
  historySet(history);

  const newShop = {
    recipes: [],
    inventory: {},
    prices: {},
    purchased: {},
    weekStart: plusDays(shop.weekStart, 7),
  };
  shopSet(newShop);
  alert('Semana guardada. Total: ' + fmtMoney(total));
  renderAll();
}

function clearAll() {
  if (!confirm('Vaciar la lista actual? (no se guarda en historial)')) return;
  const s = shopGet();
  s.recipes = [];
  s.inventory = {};
  s.prices = {};
  s.purchased = {};
  shopSet(s);
  renderAll();
}

// HISTORIAL
function renderHistory() {
  const history = historyGet().slice().sort((a,b) => b.weekStart.localeCompare(a.weekStart));
  document.getElementById('historyCount').textContent = history.length + ' semana' + (history.length===1?'':'s');
  const cont = document.getElementById('historyList');
  if (history.length === 0) {
    cont.innerHTML = '<div class="empty-state" style="padding:1rem">Sin historial. Cierra una semana para empezar a comparar.</div>';
    return;
  }
  cont.innerHTML = history.map(w => {
    const storeChips = w.storeTotals
      ? Object.entries(w.storeTotals).map(([s,t]) => '<span class="lc-tag-store">' + escapeHtml(s) + ' ' + fmtMoney(t) + '</span>').join(' ')
      : (w.store ? '<span class="lc-tag-store">' + escapeHtml(w.store) + '</span>' : '');
    return '<details class="lc-history"><summary>' +
      '<div><strong>' + fmtDate(w.weekStart) + ' - ' + fmtDate(w.weekEnd) + '</strong> ' + storeChips + '</div>' +
      '<div class="lc-history-total">' + fmtMoney(w.total) + '</div></summary>' +
      '<div class="lc-history-body">' +
        '<div class="lc-sub" style="margin-bottom:8px">' + w.recipes.length + ' recetas - ' + w.items.length + ' productos</div>' +
        '<table class="lc-table lc-table-compact">' +
          '<thead><tr><th>Producto</th><th>Tienda</th><th>Compra</th><th>$/100g</th><th>Costo</th></tr></thead>' +
          '<tbody>' +
            w.items.map(i =>
              '<tr><td>' + escapeHtml(i.name) + '</td>' +
              '<td>' + escapeHtml(i.store || w.store || '-') + '</td>' +
              '<td>' + i.buyGrams + 'g</td>' +
              '<td>' + (i.pricePer100g!=null?fmtMoney(i.pricePer100g):'-') + '</td>' +
              '<td>' + fmtMoney(i.costo) + '</td></tr>'
            ).join('') +
          '</tbody></table>' +
        '<div style="margin-top:10px"><button class="btn-cancel" onclick="deleteWeek(\'' + w.id + '\')">Eliminar esta semana</button></div>' +
      '</div></details>';
  }).join('');
}

function deleteWeek(id) {
  if (!confirm('Eliminar esta semana del historial? (Tambien se borran sus precios del comparador)')) return;
  const history = historyGet();
  const w = history.find(x => x.id === id);
  historySet(history.filter(x => x.id !== id));
  if (w) {
    const db = priceDbGet();
    const storesToClean = new Set();
    if (w.store) storesToClean.add(w.store);
    (w.items||[]).forEach(it => { if (it.store) storesToClean.add(it.store); });
    Object.keys(db).forEach(fid => {
      storesToClean.forEach(st => {
        if (!db[fid][st]) return;
        db[fid][st] = db[fid][st].filter(s => s.date !== w.weekStart);
        if (db[fid][st].length === 0) delete db[fid][st];
      });
      if (Object.keys(db[fid]).length === 0) delete db[fid];
    });
    priceDbSet(db);
  }
  renderAll();
}

// COMPARADOR
function renderComparator() {
  const db = priceDbGet();
  const foodIds = Object.keys(db);
  const cont = document.getElementById('comparatorWrap');
  if (foodIds.length === 0) {
    cont.innerHTML = '<div class="empty-state" style="padding:1rem">Sin datos. Cierra al menos una semana con precios para empezar a comparar.</div>';
    return;
  }
  const storesSet = new Set();
  foodIds.forEach(fid => Object.keys(db[fid]).forEach(s => storesSet.add(s)));
  const stores = Array.from(storesSet).sort();
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
      const last = snaps[snaps.length-1].pricePer100g;
      perStore[s] = {min, last, n: snaps.length};
      if (min < bestPrice) { bestPrice = min; bestStore = s; }
    });
    return {fid, name, perStore, bestStore};
  }).sort((a,b) => a.name.localeCompare(b.name));
  cont.innerHTML = '<div class="lc-table-wrap"><table class="lc-table lc-table-compact"><thead><tr><th>Producto</th>' +
    stores.map(s => '<th>' + escapeHtml(s) + '<br><span class="lc-th-sub">$/100g (min - ult)</span></th>').join('') +
    '<th>Mejor</th></tr></thead><tbody>' +
    rows.map(r =>
      '<tr><td><strong>' + escapeHtml(r.name) + '</strong></td>' +
      stores.map(s => {
        const p = r.perStore[s];
        if (!p) return '<td class="lc-comp-empty">-</td>';
        const isBest = s === r.bestStore;
        return '<td class="' + (isBest?'lc-comp-best':'') + '"><div>' + fmtMoney(p.min) + '</div><div class="lc-sub">ult ' + fmtMoney(p.last) + ' - n=' + p.n + '</div></td>';
      }).join('') +
      '<td><span class="lc-tag-best">' + escapeHtml(r.bestStore || '-') + '</span></td></tr>'
    ).join('') +
    '</tbody></table></div>';
}

// INIT
function renderAll() {
  renderHeader();
  renderRecipes();
  renderIngredients();
  renderHistory();
  renderComparator();
}
