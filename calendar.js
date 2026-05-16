// ═══════════════════════════════════════════════════════════════════════════
// CALENDARIO — Planeación y registro diario
// Estructura de datos: cloudGet('calendar', {}) → { "YYYY-MM-DD": dayData }
// dayData = {
//   desayuno: [entry, ...],
//   comida:   [entry, ...],
//   cena:     [entry, ...],
//   snacks:   [entry, ...],
//   water:    { ml: 0, target: 2000, entries: [{ml, time}] }
// }
// entry = { type:'recipe', cat, id, servings } | { type:'quick', name, porcion, marca, kcal, prot, carbs, fat }
// ═══════════════════════════════════════════════════════════════════════════

// Estado global
let CAL_DATA = {};
let CAL_PROFILE = null;
let CAL_RECIPES = { desayunos:[], comidas:[], cenas:[], snacks:[] };
let CAL_QUICK_ITEMS = [];
let CAL_CURRENT = null;     // {year, month} de la vista actual
let CAL_OPEN_DAY = null;    // YYYY-MM-DD del día abierto en el modal
let CAL_OPEN_SLOT = null;   // {date, slot} para el modal de agregar entrada
let CAL_CONTAINERS = [];    // tamaños de "vaso" personalizados

const DEFAULT_CONTAINERS = [
  { id:'c_glass',  name:'Vaso',    ml:250 },
  { id:'c_bottle', name:'Botella', ml:500 },
  { id:'c_thermo', name:'Termo',   ml:1000 },
];

const SLOTS = [
  { key:'desayuno', label:'Desayuno', icon:'🌅', cat:'desayunos' },
  { key:'comida',   label:'Comida',   icon:'🍽️', cat:'comidas'   },
  { key:'cena',     label:'Cena',     icon:'🌙', cat:'cenas'     },
  { key:'snacks',   label:'Snacks',   icon:'🎒', cat:'snacks'    },
];

// ─── ENTRY POINT ────────────────────────────────────────────────────────────
function initCalendar() {
  CAL_DATA = cloudGet('calendar', {}) || {};
  CAL_PROFILE = cloudGet('profile', null) || { weight:70, height:170, age:25, sex:'male', activity:'light' };
  const rec = cloudGet('recipes', null) || {};
  CAL_RECIPES = {
    desayunos: rec.desayunos || [],
    comidas:   rec.comidas   || [],
    cenas:     rec.cenas     || [],
    snacks:    rec.snacks    || rec.colaciones || [],
  };
  CAL_QUICK_ITEMS = cloudGet('quick_items', []) || [];
  CAL_CONTAINERS = cloudGet('water_containers', null) || DEFAULT_CONTAINERS.slice();

  // Mes actual por defecto
  const now = new Date();
  CAL_CURRENT = { year: now.getFullYear(), month: now.getMonth() };

  renderHeaderTargets();
  renderCalendarGrid();
}

function calSave() { cloudSet('calendar', CAL_DATA); }
function calSaveContainers() { cloudSet('water_containers', CAL_CONTAINERS); }
function calSaveQuickItems() { cloudSet('quick_items', CAL_QUICK_ITEMS); }

// ─── MACROS / WATER TARGETS ─────────────────────────────────────────────────
function calcMacrosFromProfile(p) {
  const sexConst = (p.sex === 'female') ? -161 : 5;
  const bmr = 10*p.weight + 6.25*p.height - 5*p.age + sexConst;
  const factors = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725};
  const tdee = bmr * (factors[p.activity] || 1.375);
  const target = tdee - 400;
  const calMin = Math.round((target - 100)/10)*10;
  const calMax = Math.round((target + 100)/10)*10;
  return { calMin, calMax, calMid: Math.round((calMin+calMax)/2) };
}

function waterTargetMl(p) {
  // Recomendación: ~35 ml por kg de peso corporal
  return Math.round((p.weight || 70) * 35 / 50) * 50; // redondeado a múltiplos de 50
}

function getTargets() {
  const m = calcMacrosFromProfile(CAL_PROFILE);
  return { kcalMin: m.calMin, kcalMax: m.calMax, kcalMid: m.calMid, waterMl: waterTargetMl(CAL_PROFILE) };
}

function renderHeaderTargets() {
  const t = getTargets();
  document.getElementById('calKcalTarget').textContent = `${t.kcalMin}–${t.kcalMax} kcal/día`;
  document.getElementById('calWaterTarget').textContent = `${t.waterMl} ml/día`;
}

// ─── COLOR STATUS ───────────────────────────────────────────────────────────
function dayStatus(dateStr) {
  const d = CAL_DATA[dateStr];
  if (!d) return { color: 'gray', kcal: 0, water: 0 };
  const kcal = sumDayKcal(d);
  if (kcal === 0 && (!d.water || !d.water.ml)) return { color: 'gray', kcal: 0, water: 0 };
  const t = getTargets();
  const pct = (kcal / t.kcalMid) * 100;
  let color = 'gray';
  if (kcal > 0) {
    if (pct < 90) color = 'yellow';
    else if (pct <= 110) color = 'green';
    else color = 'red';
  }
  return { color, kcal: Math.round(kcal), water: (d.water && d.water.ml) || 0 };
}

function sumDayKcal(d) {
  let total = 0;
  SLOTS.forEach(s => {
    const arr = d[s.key] || [];
    arr.forEach(e => total += entryKcal(e));
  });
  return total;
}

function entryKcal(e) {
  if (!e) return 0;
  if (e.type === 'quick') return Number(e.kcal) || 0;
  if (e.type === 'recipe') {
    const cat = e.cat;
    const r = (CAL_RECIPES[cat] || []).find(x => x.id === e.id);
    if (!r) return 0;
    const base = r.base_servings || 1;
    const per = (r.kcal || 0) / base;
    return per * (e.servings || 1);
  }
  return 0;
}

function entryMacros(e) {
  // devuelve {kcal, prot, carbs, fat}
  if (!e) return {kcal:0, prot:0, carbs:0, fat:0};
  if (e.type === 'quick') {
    return {
      kcal: Number(e.kcal)||0,
      prot: Number(e.prot)||0,
      carbs: Number(e.carbs)||0,
      fat: Number(e.fat)||0,
    };
  }
  if (e.type === 'recipe') {
    const r = (CAL_RECIPES[e.cat] || []).find(x => x.id === e.id);
    if (!r) return {kcal:0, prot:0, carbs:0, fat:0};
    const base = r.base_servings || 1;
    const f = (e.servings || 1) / base;
    return {
      kcal: Math.round((r.kcal||0) * f),
      prot: Math.round((r.prot||0) * f),
      carbs: Math.round((r.carbs||0) * f),
      fat: Math.round((r.fat||0) * f),
    };
  }
  return {kcal:0, prot:0, carbs:0, fat:0};
}

// ─── GRID MENSUAL ───────────────────────────────────────────────────────────
const MES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

function fmtDate(year, month, day) {
  const y = year;
  const m = String(month + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function todayStr() {
  const d = new Date();
  return fmtDate(d.getFullYear(), d.getMonth(), d.getDate());
}

function renderCalendarGrid() {
  const { year, month } = CAL_CURRENT;
  document.getElementById('calMonthLabel').textContent = `${MES_NOMBRES[month]} ${year}`;

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  // JS getDay(): 0=Domingo, 1=Lunes... — yo quiero Lun=0
  const firstWeekday = (firstDay.getDay() + 6) % 7;

  const grid = document.getElementById('calGrid');
  let html = '';
  const today = todayStr();

  // Celdas vacías antes del 1
  for (let i = 0; i < firstWeekday; i++) {
    html += `<div class="cal-cell cal-cell-empty"></div>`;
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = fmtDate(year, month, d);
    const status = dayStatus(dateStr);
    const isToday = (dateStr === today) ? 'cal-cell-today' : '';
    const kcalLine = status.kcal > 0 ? `<div class="cal-cell-kcal">${status.kcal} kcal</div>` : '';
    const waterLine = status.water > 0 ? `<div class="cal-cell-water">💧 ${status.water}ml</div>` : '';
    html += `
      <div class="cal-cell cal-cell-${status.color} ${isToday}" onclick="openDayDetail('${dateStr}')">
        <div class="cal-cell-day">${d}</div>
        ${kcalLine}
        ${waterLine}
      </div>
    `;
  }
  grid.innerHTML = html;
}

function calPrevMonth() {
  CAL_CURRENT.month--;
  if (CAL_CURRENT.month < 0) { CAL_CURRENT.month = 11; CAL_CURRENT.year--; }
  renderCalendarGrid();
}
function calNextMonth() {
  CAL_CURRENT.month++;
  if (CAL_CURRENT.month > 11) { CAL_CURRENT.month = 0; CAL_CURRENT.year++; }
  renderCalendarGrid();
}
function calGoToday() {
  const now = new Date();
  CAL_CURRENT = { year: now.getFullYear(), month: now.getMonth() };
  renderCalendarGrid();
  openDayDetail(todayStr());
}

// ─── DAY DETAIL MODAL ───────────────────────────────────────────────────────
function ensureDay(dateStr) {
  if (!CAL_DATA[dateStr]) {
    CAL_DATA[dateStr] = {
      desayuno: [], comida: [], cena: [], snacks: [],
      water: { ml: 0, target: waterTargetMl(CAL_PROFILE), entries: [] }
    };
  }
  if (!CAL_DATA[dateStr].water) {
    CAL_DATA[dateStr].water = { ml: 0, target: waterTargetMl(CAL_PROFILE), entries: [] };
  }
  return CAL_DATA[dateStr];
}

function openDayDetail(dateStr) {
  CAL_OPEN_DAY = dateStr;
  const d = ensureDay(dateStr);
  const targets = getTargets();

  // Totales
  let totalKcal = 0, totalProt = 0, totalCarbs = 0, totalFat = 0;
  SLOTS.forEach(s => {
    (d[s.key] || []).forEach(e => {
      const m = entryMacros(e);
      totalKcal += m.kcal; totalProt += m.prot; totalCarbs += m.carbs; totalFat += m.fat;
    });
  });
  totalKcal = Math.round(totalKcal);
  const kcalPct = Math.min(150, Math.round((totalKcal / targets.kcalMid) * 100));
  const kcalColor = kcalStatusColor(totalKcal, targets);
  const waterMl = (d.water.ml || 0);
  const waterPct = Math.min(150, Math.round((waterMl / targets.waterMl) * 100));
  const waterColor = waterStatusColor(waterMl, targets);

  // Slots HTML
  let slotsHTML = '';
  SLOTS.forEach(s => {
    const entries = d[s.key] || [];
    let entriesHTML = '';
    if (entries.length === 0) {
      entriesHTML = '<div class="day-slot-empty">— sin entradas —</div>';
    } else {
      entriesHTML = entries.map((e, idx) => {
        const m = entryMacros(e);
        const name = e.type === 'recipe'
          ? ((CAL_RECIPES[e.cat] || []).find(r => r.id === e.id) || {name:'(receta eliminada)'}).name
          : e.name;
        const sub = e.type === 'recipe'
          ? `${e.servings || 1} porción${(e.servings||1) > 1 ? 'es' : ''}`
          : [e.porcion, e.marca].filter(Boolean).join(' · ') || 'Item rápido';
        const tag = e.type === 'quick' ? '<span class="entry-tag entry-tag-quick">⚡</span>' : '';
        return `
          <div class="day-slot-entry">
            <div class="entry-info">
              <div class="entry-name">${tag}${escapeHtmlCal(name)}</div>
              <div class="entry-sub">${escapeHtmlCal(sub)} · ${m.kcal} kcal</div>
            </div>
            <button class="entry-del" onclick="removeEntry('${dateStr}','${s.key}',${idx})" title="Quitar">×</button>
          </div>
        `;
      }).join('');
    }
    slotsHTML += `
      <div class="day-slot">
        <div class="day-slot-header">
          <div class="day-slot-title">${s.icon} ${s.label}</div>
          <button class="day-slot-add" onclick="openAddEntry('${dateStr}','${s.key}')">＋ Agregar</button>
        </div>
        <div class="day-slot-entries">${entriesHTML}</div>
      </div>
    `;
  });

  // Water section
  const containerBtns = CAL_CONTAINERS.map(c => `
    <button class="water-btn" onclick="addWater('${dateStr}',${c.ml})">+${c.ml}ml<span>${escapeHtmlCal(c.name)}</span></button>
  `).join('');
  const waterEntriesHTML = (d.water.entries || []).slice().reverse().slice(0, 10).map(e => {
    const t = new Date(e.time);
    const hh = String(t.getHours()).padStart(2,'0');
    const mm = String(t.getMinutes()).padStart(2,'0');
    return `<span class="water-entry-pill">+${e.ml}ml <em>${hh}:${mm}</em></span>`;
  }).join('') || '<span class="day-slot-empty">— sin tomas registradas —</span>';

  // Fecha legible
  const dateObj = new Date(dateStr + 'T00:00:00');
  const diaSemana = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'][dateObj.getDay()];
  const titulo = `${diaSemana}, ${dateObj.getDate()} de ${MES_NOMBRES[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  document.getElementById('dayDetailModal').innerHTML = `
    <div class="modal day-detail">
      <div class="day-detail-header">
        <div>
          <h3>${titulo}</h3>
          <div class="modal-sub">Objetivo: ${targets.kcalMin}–${targets.kcalMax} kcal · ${targets.waterMl} ml de agua</div>
        </div>
        <button class="modal-close" onclick="closeDayDetail()" aria-label="Cerrar">×</button>
      </div>

      <div class="day-totals">
        <div class="day-total-card day-total-${kcalColor}">
          <div class="day-total-val">${totalKcal}</div>
          <div class="day-total-lbl">kcal · ${kcalPct}%</div>
          <div class="day-total-bar"><div class="day-total-fill day-total-fill-${kcalColor}" style="width:${Math.min(100,kcalPct)}%"></div></div>
        </div>
        <div class="day-total-card day-total-${waterColor}">
          <div class="day-total-val">${waterMl}</div>
          <div class="day-total-lbl">ml · ${waterPct}%</div>
          <div class="day-total-bar"><div class="day-total-fill day-total-fill-${waterColor}" style="width:${Math.min(100,waterPct)}%"></div></div>
        </div>
        <div class="day-total-card">
          <div class="day-total-val day-total-macros">${totalProt}<span>g</span></div>
          <div class="day-total-lbl">Proteína</div>
        </div>
        <div class="day-total-card">
          <div class="day-total-val day-total-macros">${totalCarbs}<span>g</span></div>
          <div class="day-total-lbl">Carbos</div>
        </div>
        <div class="day-total-card">
          <div class="day-total-val day-total-macros">${totalFat}<span>g</span></div>
          <div class="day-total-lbl">Grasa</div>
        </div>
      </div>

      <div class="day-slots">
        ${slotsHTML}
      </div>

      <div class="day-slot day-water-slot">
        <div class="day-slot-header">
          <div class="day-slot-title">💧 Agua</div>
          <button class="day-slot-add" onclick="openWaterContainerModal()">⚙ Vasos</button>
        </div>
        <div class="water-controls">
          ${containerBtns}
          <button class="water-btn water-btn-custom" onclick="addWaterCustom('${dateStr}')">+ Custom</button>
          <button class="water-btn water-btn-undo" onclick="undoWater('${dateStr}')" title="Deshacer última">↶</button>
        </div>
        <div class="water-entries">${waterEntriesHTML}</div>
      </div>

      <div class="day-detail-footer">
        <button class="btn-cancel" onclick="copyDayPrompt('${dateStr}')">Copiar día a…</button>
        <button class="btn-cancel" onclick="clearDayPrompt('${dateStr}')">Vaciar día</button>
      </div>
    </div>
  `;
  document.getElementById('dayDetailModal').classList.add('open');
}

function kcalStatusColor(kcal, targets) {
  if (!kcal) return 'gray';
  const pct = (kcal / targets.kcalMid) * 100;
  if (pct < 90) return 'yellow';
  if (pct <= 110) return 'green';
  return 'red';
}
function waterStatusColor(ml, targets) {
  if (!ml) return 'gray';
  const pct = (ml / targets.waterMl) * 100;
  if (pct < 80) return 'yellow';
  if (pct <= 130) return 'green';
  return 'red';
}

function closeDayDetail() {
  document.getElementById('dayDetailModal').classList.remove('open');
  CAL_OPEN_DAY = null;
  renderCalendarGrid();
}

function removeEntry(dateStr, slot, idx) {
  const d = ensureDay(dateStr);
  d[slot].splice(idx, 1);
  calSave();
  openDayDetail(dateStr);
}

// ─── WATER ──────────────────────────────────────────────────────────────────
function addWater(dateStr, ml) {
  const d = ensureDay(dateStr);
  d.water.ml = (d.water.ml || 0) + ml;
  d.water.entries = d.water.entries || [];
  d.water.entries.push({ ml, time: new Date().toISOString() });
  calSave();
  openDayDetail(dateStr);
}

function addWaterCustom(dateStr) {
  const v = prompt('¿Cuántos ml tomaste?');
  const ml = parseInt(v);
  if (!isNaN(ml) && ml > 0) addWater(dateStr, ml);
}

function undoWater(dateStr) {
  const d = ensureDay(dateStr);
  if (!d.water.entries || d.water.entries.length === 0) return;
  const last = d.water.entries.pop();
  d.water.ml = Math.max(0, (d.water.ml || 0) - (last.ml || 0));
  calSave();
  openDayDetail(dateStr);
}

function openWaterContainerModal() {
  const html = CAL_CONTAINERS.map((c, idx) => `
    <div class="ctn-row">
      <input type="text" value="${escapeHtmlCal(c.name)}" onchange="updateContainerName(${idx}, this.value)">
      <input type="number" value="${c.ml}" min="50" step="50" onchange="updateContainerMl(${idx}, this.value)">
      <span>ml</span>
      <button class="entry-del" onclick="removeContainer(${idx})" title="Eliminar">×</button>
    </div>
  `).join('');
  document.getElementById('addEntryModal').innerHTML = `
    <div class="modal">
      <h3>⚙️ Mis vasos</h3>
      <div class="modal-sub">Personaliza los tamaños rápidos de agua. Click en el botón para agregar al día.</div>
      <div class="ctn-list">${html}</div>
      <button class="btn-add-ingr" onclick="addContainer()">＋ Agregar tamaño</button>
      <div class="form-actions">
        <button class="btn-submit" onclick="saveContainers()">Guardar</button>
        <button class="btn-cancel" onclick="closeAddEntry()">Cancelar</button>
      </div>
    </div>
  `;
  document.getElementById('addEntryModal').classList.add('open');
}

function updateContainerName(idx, val) { CAL_CONTAINERS[idx].name = val; }
function updateContainerMl(idx, val) { CAL_CONTAINERS[idx].ml = Math.max(50, parseInt(val)||0); }
function removeContainer(idx) { CAL_CONTAINERS.splice(idx, 1); openWaterContainerModal(); }
function addContainer() { CAL_CONTAINERS.push({id:'c_'+Date.now(), name:'Nuevo', ml:300}); openWaterContainerModal(); }
function saveContainers() {
  calSaveContainers();
  closeAddEntry();
  if (CAL_OPEN_DAY) openDayDetail(CAL_OPEN_DAY);
}

// ─── ADD ENTRY (recetas + items rápidos) ────────────────────────────────────
function openAddEntry(dateStr, slot) {
  CAL_OPEN_SLOT = { date: dateStr, slot };
  const slotMeta = SLOTS.find(s => s.key === slot);
  const cat = slotMeta.cat;
  const recetas = CAL_RECIPES[cat] || [];

  const frecuentes = CAL_QUICK_ITEMS.slice().sort((a,b) => (b.lastUsed||0)-(a.lastUsed||0));
  const frecuentesHTML = frecuentes.length === 0
    ? '<div class="qi-empty">Aún no tienes items frecuentes.</div>'
    : frecuentes.map(item => `
        <div class="qi-chip" onclick="pickFrequent('${item.id}')">
          <div class="qi-chip-name">${escapeHtmlCal(item.name)}</div>
          <div class="qi-chip-meta">${item.kcal} kcal${item.porcion ? ' · '+escapeHtmlCal(item.porcion) : ''}</div>
          <button class="qi-chip-del" onclick="event.stopPropagation();deleteQuickItem('${item.id}')" title="Eliminar">×</button>
        </div>
      `).join('');

  const recetasOptions = recetas.length === 0
    ? '<option value="">— no hay recetas en esta categoría —</option>'
    : '<option value="">— elige una receta —</option>' + recetas.map(r => `
        <option value="${r.id}">${escapeHtmlCal(r.name)} · ${r.kcal} kcal</option>
      `).join('');

  document.getElementById('addEntryModal').innerHTML = `
    <div class="modal">
      <div class="day-detail-header">
        <h3>＋ Agregar a ${slotMeta.icon} ${slotMeta.label}</h3>
        <button class="modal-close" onclick="closeAddEntry()">×</button>
      </div>
      <div class="modal-sub">${escapeHtmlCal(dateStr)}</div>

      <div class="add-entry-section">
        <div class="qi-section-title">Receta del banco (${slotMeta.label.toLowerCase()})</div>
        <div class="add-recipe-row">
          <select id="ae_recipe">${recetasOptions}</select>
          <input type="number" id="ae_servings" value="1" min="0.25" step="0.25" title="Porciones">
          <button class="btn-submit" onclick="addRecipeEntry()">Agregar</button>
        </div>
      </div>

      <div class="qi-divider"><span>o item rápido</span></div>

      <div class="add-entry-section">
        <div class="qi-section-title">Frecuentes</div>
        <div class="qi-frecuentes">${frecuentesHTML}</div>
      </div>

      <div class="qi-divider"><span>o crea uno nuevo</span></div>

      <div class="modal-grid">
        <div class="form-group form-full">
          <label>Nombre *</label>
          <input type="text" id="qi_name" placeholder="Ej: Papas Sabritas, Rebanada Little Caesars">
        </div>
        <div class="form-group">
          <label>Porción <span style="text-transform:none;letter-spacing:0;font-weight:400">(opc)</span></label>
          <input type="text" id="qi_porcion" placeholder="Ej: 1 bolsa 45g, 2 rebanadas">
        </div>
        <div class="form-group">
          <label>Marca <span style="text-transform:none;letter-spacing:0;font-weight:400">(opc)</span></label>
          <input type="text" id="qi_marca" placeholder="Ej: Sabritas, Little Caesars">
        </div>
        <div class="form-group">
          <label>Kcal *</label>
          <input type="number" id="qi_kcal" min="0" step="1" placeholder="240">
        </div>
        <div class="form-group">
          <label>Proteína g <span style="text-transform:none;letter-spacing:0;font-weight:400">(opc)</span></label>
          <input type="number" id="qi_prot" min="0" step="0.1" placeholder="3">
        </div>
        <div class="form-group">
          <label>Carbos g <span style="text-transform:none;letter-spacing:0;font-weight:400">(opc)</span></label>
          <input type="number" id="qi_carbs" min="0" step="0.1" placeholder="28">
        </div>
        <div class="form-group">
          <label>Grasa g <span style="text-transform:none;letter-spacing:0;font-weight:400">(opc)</span></label>
          <input type="number" id="qi_fat" min="0" step="0.1" placeholder="14">
        </div>
        <div class="form-group form-full qi-save-row">
          <label class="qi-checkbox-label">
            <input type="checkbox" id="qi_save_frequent" checked>
            <span>Guardar en frecuentes para reusar después</span>
          </label>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn-submit" onclick="saveQuickEntry()">Agregar al día</button>
        <button class="btn-cancel" onclick="closeAddEntry()">Cancelar</button>
      </div>
    </div>
  `;
  document.getElementById('addEntryModal').classList.add('open');
}

function closeAddEntry() {
  document.getElementById('addEntryModal').classList.remove('open');
  CAL_OPEN_SLOT = null;
}

function addRecipeEntry() {
  if (!CAL_OPEN_SLOT) return;
  const id = document.getElementById('ae_recipe').value;
  if (!id) { alert('Elige una receta.'); return; }
  const servings = parseFloat(document.getElementById('ae_servings').value) || 1;
  const slotMeta = SLOTS.find(s => s.key === CAL_OPEN_SLOT.slot);
  const d = ensureDay(CAL_OPEN_SLOT.date);
  d[CAL_OPEN_SLOT.slot].push({ type:'recipe', cat: slotMeta.cat, id, servings });
  calSave();
  const date = CAL_OPEN_SLOT.date;
  closeAddEntry();
  openDayDetail(date);
}

function pickFrequent(qid) {
  const item = CAL_QUICK_ITEMS.find(q => q.id === qid);
  if (!item || !CAL_OPEN_SLOT) return;
  item.lastUsed = Date.now();
  calSaveQuickItems();
  const d = ensureDay(CAL_OPEN_SLOT.date);
  d[CAL_OPEN_SLOT.slot].push({
    type:'quick', name:item.name, porcion:item.porcion||'', marca:item.marca||'',
    kcal:item.kcal, prot:item.prot||0, carbs:item.carbs||0, fat:item.fat||0
  });
  calSave();
  const date = CAL_OPEN_SLOT.date;
  closeAddEntry();
  openDayDetail(date);
}

function deleteQuickItem(qid) {
  if (!confirm('¿Eliminar este item de tus frecuentes?')) return;
  CAL_QUICK_ITEMS = CAL_QUICK_ITEMS.filter(q => q.id !== qid);
  calSaveQuickItems();
  if (CAL_OPEN_SLOT) openAddEntry(CAL_OPEN_SLOT.date, CAL_OPEN_SLOT.slot);
}

function saveQuickEntry() {
  if (!CAL_OPEN_SLOT) return;
  const name = (document.getElementById('qi_name').value||'').trim();
  if (!name) { alert('El nombre es obligatorio.'); return; }
  const kcal = parseFloat(document.getElementById('qi_kcal').value);
  if (isNaN(kcal) || kcal < 0) { alert('Las kcal son obligatorias.'); return; }

  const porcion = (document.getElementById('qi_porcion').value||'').trim();
  const marca = (document.getElementById('qi_marca').value||'').trim();
  const prot = parseFloat(document.getElementById('qi_prot').value)||0;
  const carbs = parseFloat(document.getElementById('qi_carbs').value)||0;
  const fat = parseFloat(document.getElementById('qi_fat').value)||0;
  const saveFreq = document.getElementById('qi_save_frequent').checked;

  if (saveFreq) {
    CAL_QUICK_ITEMS.push({
      id:'qi_'+Date.now(), name, porcion, marca,
      kcal: Math.round(kcal), prot, carbs, fat, lastUsed: Date.now()
    });
    calSaveQuickItems();
  }

  const d = ensureDay(CAL_OPEN_SLOT.date);
  d[CAL_OPEN_SLOT.slot].push({
    type:'quick', name, porcion, marca, kcal: Math.round(kcal), prot, carbs, fat
  });
  calSave();
  const date = CAL_OPEN_SLOT.date;
  closeAddEntry();
  openDayDetail(date);
}

// ─── COPIAR / VACIAR DÍA ────────────────────────────────────────────────────
function copyDayPrompt(srcDate) {
  const target = prompt('Copiar a qué día? (formato YYYY-MM-DD)', srcDate);
  if (!target || !/^\d{4}-\d{2}-\d{2}$/.test(target)) return;
  const src = CAL_DATA[srcDate];
  if (!src) { alert('Este día no tiene datos.'); return; }
  CAL_DATA[target] = JSON.parse(JSON.stringify(src));
  // Limpiar agua (no se copia el log de tomas, solo el plan de comidas)
  CAL_DATA[target].water = { ml:0, target: src.water?.target || waterTargetMl(CAL_PROFILE), entries: [] };
  calSave();
  alert(`Comidas copiadas a ${target}. El agua se reinicia.`);
  openDayDetail(target);
}

function clearDayPrompt(dateStr) {
  if (!confirm('¿Vaciar todo este día (comidas + agua)?')) return;
  delete CAL_DATA[dateStr];
  calSave();
  closeDayDetail();
}

// ─── UTIL ───────────────────────────────────────────────────────────────────
function escapeHtmlCal(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
