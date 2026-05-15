// ─── SEED DATA ───────────────────────────────────────────────────────────────
const SEED = {
  desayunos:[
    {id:'d1',name:'Overnight oats clásico',kcal:430,prot:25,carbs:58,fat:9,badges:['Frío','Prep domingo'],tip:'Prep 5 frascos el domingo. Dura toda la semana refrigerado.',ingredients:['80g avena GV','15g chía OKKO','200ml leche Lala','120g yogurt griego','1 cdita maple sin azúcar','½ cdita vainilla','½ plátano (al momento)'],steps:['Mezcla todo en frasco excepto el plátano','Tapa y refrigera mínimo 6 horas','Al comer: agrega plátano en rebanadas encima']},
    {id:'d2',name:'Overnight oats de chocolate',kcal:445,prot:26,carbs:60,fat:10,badges:['Frío','Prep domingo'],tip:'Misma base que el clásico — solo agrega cacao. Sabe a postre.',ingredients:['80g avena GV','15g chía OKKO','200ml leche Lala','120g yogurt griego','1 cda cacao en polvo sin azúcar','1 cdita maple sin azúcar','½ cdita vainilla'],steps:['Mezcla todo bien hasta disolver el cacao','Tapa y refrigera mínimo 6 horas','Opcional: plátano en rebanadas encima al comer']},
    {id:'d3',name:'Baked oats cinnamon roll',kcal:320,prot:18,carbs:44,fat:8,badges:['Prep domingo','Colación trabajo'],tip:'2 piezas = ~320 kcal / ~18g prot. Dura toda la semana. Necesitas polvo para hornear (~$15 MXN).',ingredients:['300g avena GV (rinde 12 piezas)','240g yogurt griego','2 huevos','200ml leche Lala','2 cdas maple sin azúcar','1 cdita vainilla','1 cdita polvo para hornear','Relleno: 2 cdas azúcar morena + 2 cditas canela + 1 cdita mantequilla','Glaseado: 3 cdas yogurt + 1 cdita maple + canela'],steps:['Precalienta horno 175°C','Mezcla ingredientes base en tazón','Mezcla relleno en tazón pequeño','Engrasa molde cupcakes, llena ¾ cada cavidad','½ cdita relleno encima + swirl con palillo','Hornea 18–22 min','Glaseado al momento de comer']},
    {id:'d4',name:'Avena caliente con plátano',kcal:420,prot:22,carbs:62,fat:8,badges:['Caliente','10 min'],tip:'Textura uniforme y cremosa si se revuelve bien constantemente.',ingredients:['80g avena GV','250ml leche Lala','120g yogurt griego (encima al servir)','½ plátano en rebanadas','1 cdita maple','Canela al gusto'],steps:['Calienta leche en olla a fuego medio','Agrega avena, revuelve constantemente ~5 min hasta cremosa','Sirve, agrega yogurt griego, plátano, maple y canela encima']},
    {id:'d5',name:'Huevos revueltos cremosos + tostada',kcal:380,prot:24,carbs:28,fat:18,badges:['Caliente','10 min'],tip:'Fuego bajo = textura sedosa. Fuego alto = textura seca y gomosa.',ingredients:['3 huevos','2 rebanadas pan integral o blanco','1 cdita aceite o mantequilla','Sal, pimienta, Tapatío'],steps:['Bate huevos con sal y pimienta','Sartén a fuego BAJO con aceite — esto es clave','Agrega huevos, revuelve despacio con espátula ~4 min','Retira antes de que estén secos — quedan cremosos','Sirve sobre pan tostado con Tapatío']},
    {id:'d6',name:'Avocado toast con huevo estrellado',kcal:410,prot:22,carbs:30,fat:22,badges:['Caliente','10 min'],tip:'Aguacate machacado = textura uniforme, sin trozos. Clásico y saciante.',ingredients:['2 rebanadas pan tostado','½ aguacate maduro','2 huevos','Jugo de ½ limón','Sal, pimienta, Tapatío'],steps:['Tuesta el pan','Machaca aguacate + sal + limón hasta pasta uniforme','Unta aguacate sobre el pan','Estrella huevos en sartén a fuego medio','Coloca huevos encima + Tapatío']},
    {id:'d7',name:'Quesadilla de huevo con tortilla de harina',kcal:420,prot:26,carbs:35,fat:18,badges:['Caliente','8 min'],tip:'Rápido, económico y familiar. Ideal para días con prisa.',ingredients:['2 tortillas de harina','3 huevos','30g queso Oaxaca o manchego rallado','Sal, pimienta, Tapatío'],steps:['Revuelve huevos con sal, cocina a fuego bajo, retira','En sartén: tortilla + queso + huevos revueltos encima','Dobla a la mitad, 1 min por lado hasta dorar','Sirve con Tapatío']}
  ],
  comidas:[
    {id:'c1',name:'Bowl pollo al taco + papas',kcal:620,prot:60,carbs:38,fat:18,badges:['Mexicano','Semana 1'],tip:'Papas bien cocidas hasta suaves — sin resistencia al morder.',ingredients:['200g pechuga cocida desmenuzada','200g papas en cubos cocidas muy suaves','80g jitomate picado','50g cebolla picada','½ jalapeño sin semillas','2 cdas yogurt griego','Cilantro, jugo de 1 limón','Sazonador al taco'],steps:['Hierve 1kg pechuga con ajo y sal ~25 min (prep domingo)','Desmenuzar + sazonar con taco seasoning, dividir en 5','Calienta pollo y papas 2 min en microondas','Arma bowl + yogurt + limón + cilantro encima']},
    {id:'c2',name:'Chicharrón en salsa verde',kcal:520,prot:40,carbs:35,fat:22,badges:['Mexicano','30 min'],tip:'El chicharrón se suaviza completamente en la salsa — textura uniforme.',ingredients:['500g chicharrón prensado','500g tomatillo verde','2 chiles serranos o jalapeños','½ cebolla, 2 dientes ajo, cilantro','Sal, 1 cda aceite','Arroz blanco como acompañamiento'],steps:['Hierve tomatillos + chiles + cebolla + ajo 10 min','Licúa con cilantro y sal hasta salsa uniforme','Calienta aceite, vierte salsa, cocina 5 min','Agrega chicharrón, cocina 8–10 min hasta suavizar']},
    {id:'c3',name:'Picadillo de res con papa',kcal:540,prot:42,carbs:38,fat:20,badges:['Mexicano','35 min'],tip:'Solo papa, sin zanahoria. Papas absorben el sabor del guiso.',ingredients:['600g carne molida de res','400g papa en cubos pequeños','2 jitomates picados','½ cebolla picada, 2 dientes ajo','Sal, comino, pimienta, 1 cda aceite','Arroz rojo sin verduras como acompañamiento'],steps:['Sofríe cebolla + ajo 2 min','Agrega carne, dora y desgrasa','Agrega jitomate + sal + comino, cocina 5 min','Incorpora papas + ½ taza agua','Tapa, cocina fuego bajo 15 min hasta papas muy suaves']},
    {id:'c4',name:'Guiso de res con papa en salsa verde',kcal:510,prot:44,carbs:32,fat:18,badges:['Mexicano','40 min'],tip:'Las papas absorben todo el sabor de la salsa verde.',ingredients:['600g bistec de res en tiras o cubos','400g papa en cubos','400g tomatillo verde','2 chiles serranos','½ cebolla, 2 dientes ajo, cilantro','Sal, comino, 1 cda aceite'],steps:['Licúa tomatillos cocidos + chiles + ajo + cilantro','Sella la carne en aceite, reserva','Sofríe cebolla, agrega salsa, cocina 5 min','Regresa carne + papas + ½ taza agua','Cocina fuego bajo 20 min hasta todo muy suave']},
    {id:'c5',name:'Milanesa de pollo guisada con jitomate',kcal:520,prot:52,carbs:28,fat:16,badges:['Mexicano','30 min'],tip:'El jitomate se deshace completamente — sin trozos, solo salsa.',ingredients:['4 milanesas de pollo (~600g)','2 jitomates en rodajas','1 cebolla en rodajas','2 dientes ajo, orégano','Sal, pimienta, 1 cda aceite','Arroz blanco o papas como acompañamiento'],steps:['Sazona milanesas con sal, pimienta, ajo','Sella en sartén con poco aceite 3 min por lado','Coloca cebolla y jitomate encima de cada milanesa','Tapa, fuego bajo, cocina 12 min']},
    {id:'c6',name:'Spaghetti rojo con pollo',kcal:580,prot:48,carbs:65,fat:12,badges:['Pasta','30 min'],tip:'Licúa jitomate con cebolla y ajo para salsa 100% lisa sin trozos.',ingredients:['400g spaghetti','600g pechuga pollo en cubos','400g jitomate licuado','½ cebolla, 3 dientes ajo','Sal, pimienta, orégano, 1 cda aceite'],steps:['Cuece spaghetti al dente, escurre','Sofríe cebolla + ajo, agrega pollo hasta dorar','Vierte jitomate licuado + sal + orégano, cocina 8 min','Mezcla con spaghetti, integra 2 min']},
    {id:'c7',name:'Spaghetti verde (morrón + queso crema)',kcal:620,prot:44,carbs:68,fat:18,badges:['Pasta','25 min'],tip:'Salsa licuada = textura 100% cremosa y uniforme. Perfecta para tu perfil sensorial.',ingredients:['400g spaghetti','500g pechuga cocida desmenuzada','2 chiles morrón verde (o poblano asado)','200g queso crema Philadelphia','½ cebolla, 2 dientes ajo','½ taza leche o caldo de pollo','Sal, pimienta'],steps:['Cuece spaghetti, escurre','Licúa morrón + queso crema + leche + ajo + sal hasta crema lisa','Calienta salsa a fuego bajo, agrega pollo','Incorpora spaghetti, integra 2 min']},
    {id:'c8',name:'Pasta cremosa con pollo',kcal:600,prot:50,carbs:62,fat:16,badges:['Pasta','25 min'],tip:'Yogurt griego en lugar de crema = misma textura, el doble de proteína.',ingredients:['400g pasta (penne o spaghetti)','600g pechuga en cubos','200g yogurt griego','3 dientes ajo','50g queso manchego rallado','Sal, pimienta, orégano, 1 cda aceite'],steps:['Cuece pasta, reserva ½ taza agua de cocción, escurre','Dora pollo con ajo y sal','Baja fuego, agrega yogurt + agua de pasta, revuelve','Agrega queso, mezcla hasta crema','Incorpora pasta, integra bien']},
    {id:'c9',name:'Pasta cheesesteak (carne molida)',kcal:620,prot:48,carbs:60,fat:20,badges:['Internacional','30 min'],tip:'Cebolla y morrón bien cocidos hasta que desaparezcan — sin textura crujiente.',ingredients:['400g pasta corta (penne o fusilli)','500g carne molida de res','1 cebolla en cubos finos','1 chile morrón verde en cubos finos','150g queso crema','200ml leche','Sal, pimienta, salsa inglesa, 1 cda aceite'],steps:['Cuece pasta, escurre','Sofríe cebolla + morrón hasta muy suaves ~8 min','Agrega carne, dora y desgrasa','Baja fuego, agrega queso crema + leche hasta crema','Mezcla con pasta + salsa inglesa']},
    {id:'c10',name:'Butter chicken con arroz',kcal:580,prot:55,carbs:48,fat:14,badges:['Internacional','30 min'],tip:'No hiervas fuerte al final o el yogurt se corta. Salsa completamente lisa.',ingredients:['700g pechuga en cubos','200g yogurt griego','400g jitomate licuado','½ cebolla, 3 dientes ajo','1 cdita garam masala o curry en polvo','1 cdita comino, 1 cdita paprika','Sal, 1 cda aceite','Arroz blanco (150g cocido por porción)'],steps:['Marina pollo con yogurt + ajo + especias mínimo 30 min','Sofríe cebolla en aceite','Agrega pollo marinado, cocina 8 min','Vierte jitomate licuado, cocina 10 min','Baja fuego, agrega resto de yogurt sin hervir fuerte','Sirve sobre arroz']},
    {id:'c11',name:'Pollo a la miel con arroz',kcal:560,prot:52,carbs:52,fat:12,badges:['Internacional','25 min'],tip:'Ingrediente extra: salsa soya (~$25 MXN). Sabor dulce-salado muy saciante.',ingredients:['700g pechuga en cubos o tiras','3 cdas miel o maple','3 cdas salsa soya','3 dientes ajo machacados','1 cdita vinagre o limón','Sal, pimienta, 1 cda aceite','Arroz blanco (150g cocido por porción)'],steps:['Mezcla miel + soya + ajo + vinagre','Dora pollo en aceite caliente 5 min','Vierte salsa, cocina 8 min hasta glaseado brillante','Sirve sobre arroz']},
    {id:'c12',name:'Sesame chicken con arroz',kcal:570,prot:50,carbs:55,fat:14,badges:['Internacional','25 min'],tip:'La maicena hace la salsa lisa y brillante. Más intenso que el pollo a la miel.',ingredients:['700g pechuga en cubos','3 cdas salsa soya','2 cdas miel o maple','1 cda vinagre','2 dientes ajo','1 cdita maicena disuelta en agua','Sal, 1 cda aceite','Arroz blanco (150g cocido por porción)'],steps:['Mezcla soya + miel + vinagre + ajo + maicena disuelta','Dora pollo en aceite caliente hasta dorado','Vierte salsa, cocina 5 min revolviendo hasta que espese y brille','Sirve sobre arroz']}
  ],
  cenas:[
    {id:'ce1',name:'Atún + arroz + papas al horno + aguacate',kcal:580,prot:52,carbs:60,fat:14,badges:['10 min','Sin cocinar'],tip:'Arroz y papas se calientan en microondas — 5 min de prep activo.',ingredients:['2 latas atún en agua escurrido','150g arroz cocido (del prep dominical)','200g papas en cubos al horno (del prep dominical)','¼ aguacate','Jugo de 1–2 limones','Sal, pimienta, Tapatío'],steps:['Calienta arroz y papas en microondas 2 min','Abre y escurre latas de atún','Sirve todo por separado en el plato','Parte aguacate + limón encima de todo']},
    {id:'ce2',name:'Quesadillas de atún con salsa verde',kcal:520,prot:44,carbs:42,fat:18,badges:['12 min','1 sartén'],tip:'Queso fundido = textura uniforme por dentro. Rápido y económico.',ingredients:['2 tortillas de harina','2 latas atún escurrido','50g queso manchego o Oaxaca rallado','Salsa verde al gusto','Limón, sal'],steps:['Mezcla atún con limón y sal','Calienta sartén a fuego medio','Tortilla + queso + atún, dobla a la mitad','2 min por lado hasta dorar','Sirve con salsa verde encima']},
    {id:'ce3',name:'Huevos a la mexicana con tortillas',kcal:490,prot:28,carbs:40,fat:22,badges:['12 min','1 sartén'],tip:'Jitomate bien cocido hasta deshacerse = textura uniforme, sin trozos.',ingredients:['3 huevos','1 jitomate picado fino','¼ cebolla picada fina','1 jalapeño picado (opcional)','Sal, 1 cdita aceite','3 tortillas de maíz o harina'],steps:['Sofríe cebolla + jalapeño 2 min hasta suave','Agrega jitomate, cocina 3 min hasta que se deshaga','Agrega huevos batidos, revuelve fuego bajo hasta cocidos','Sirve con tortillas calientes']},
    {id:'ce4',name:'Pollo a la plancha con papas y yogurt',kcal:540,prot:55,carbs:38,fat:14,badges:['20 min'],tip:'Papas en microondas = sin horno, sin esperar. El yogurt funciona como crema pero con proteína.',ingredients:['250g pechuga de pollo','200g papas en cubos','3 cdas yogurt griego','Ajo en polvo, sal, pimienta, limón, Tapatío'],steps:['Papas en cubos al microondas 6 min en recipiente tapado con agua','Sazona pollo con ajo, sal, pimienta','Sella en sartén caliente 4 min por lado','Sirve con papas + yogurt griego + limón + Tapatío']},
    {id:'ce5',name:'Sopa de fideo con pollo desmenuzado',kcal:510,prot:42,carbs:52,fat:12,badges:['20 min','1 olla'],tip:'Usa el pollo del prep dominical — solo haces la sopa.',ingredients:['80g fideo seco','150g pollo cocido desmenuzado (del prep dominical)','1 jitomate licuado','¼ cebolla, 1 diente ajo','500ml agua o caldo','Sal, comino, 1 cdita aceite'],steps:['Dora el fideo en aceite ~3 min','Agrega jitomate licuado con cebolla y ajo, cocina 2 min','Vierte agua + sal + comino','Hierve 8 min hasta fideo suave','Agrega pollo desmenuzado, calienta 2 min']},
    {id:'ce6',name:'Milanesa de res al horno',kcal:550,prot:50,carbs:32,fat:18,badges:['25 min','Horno'],tip:'Misma textura crujiente que frita pero sin aceite extra.',ingredients:['250g milanesa de res','1 huevo batido','Pan molido (o galletas saladas molidas)','Sal, pimienta, ajo en polvo','Limón al servir','Arroz o papas como acompañamiento'],steps:['Precalienta horno a 200°C','Sazona milanesa con sal, pimienta, ajo','Pasa por huevo batido, luego pan molido','Coloca en charola con gotitas aceite','Hornea 12 min, voltea, 8 min más hasta dorada']},
    {id:'ce7',name:'Chilaquiles verdes con huevo',kcal:560,prot:38,carbs:48,fat:20,badges:['20 min','Mexicano'],tip:'Tu favorito de siempre. Agrega pollo del prep para +15g proteína.',ingredients:['10–12 totopos','2 huevos estrellados o revueltos','150ml salsa verde','3 cdas yogurt griego (en lugar de crema)','Queso fresco, cilantro, cebolla'],steps:['Calienta salsa verde en sartén 2 min','Agrega totopos, mezcla hasta cubrir con salsa','Cocina 2–3 min hasta semi-suaves','Sirve con huevos + yogurt + queso + cilantro encima']},
    {id:'ce8',name:'Caldo de pollo con papa y fideos',kcal:490,prot:45,carbs:48,fat:10,badges:['30 min','1 olla'],tip:'La cena más reconfortante del banco. Papas bien cocidas hasta que se deshagan.',ingredients:['150g pollo desmenuzado del prep','1 papa mediana en cubos','50g fideo o pasta pequeña','600ml agua o caldo','¼ cebolla, 1 diente ajo, cilantro','Sal, limón'],steps:['Hierve agua con cebolla, ajo y sal','Agrega papas en cubos, cocina 10 min','Agrega fideo y pollo, cocina 8 min más','Rectifica sal, sirve con limón y cilantro']},
    {id:'ce9',name:'Pollo a la miel express con arroz',kcal:560,prot:50,carbs:52,fat:12,badges:['25 min','1 sartén'],tip:'Con arroz del prep dominical esto se hace en 12 minutos.',ingredients:['250g pechuga en tiras','1 cda miel o maple','1 cda salsa soya','1 diente ajo','150g arroz cocido','Sal, pimienta, 1 cdita aceite'],steps:['Dora pollo en sartén caliente 5 min','Mezcla miel + soya + ajo, vierte encima','Cocina 5 min hasta glaseado brillante','Calienta arroz en microondas 2 min, sirve junto']},
    {id:'ce10',name:'Tacos de frijoles con queso',kcal:530,prot:28,carbs:62,fat:16,badges:['15 min','Mexicano'],tip:'3 tacos, no 6. Agrega yogurt griego como aderezo para subir proteína.',ingredients:['3 tortillas de maíz','150g frijoles refritos','50g queso manchego o Oaxaca','Salsa verde al gusto','Limón, sal'],steps:['Calienta frijoles en sartén o microondas','Calienta tortillas en comal','Unta frijoles + queso en cada tortilla','Dobla y calienta en comal 1 min por lado','Sirve con salsa verde y limón']}
  ],
  colaciones:[
    {id:'col1',name:'Baked oats cinnamon roll (2 piezas)',kcal:320,prot:18,carbs:44,fat:8,badges:['Prep domingo','Anti-Oxxo'],tip:'12 piezas duran toda la semana. Sin refrigeración por unas horas — perfecto para llevar al trabajo.',ingredients:['300g avena GV (rinde 12 piezas)','240g yogurt griego','2 huevos','200ml leche Lala','2 cdas maple sin azúcar','1 cdita vainilla','1 cdita polvo para hornear','Relleno: azúcar morena + canela + mantequilla','Glaseado: yogurt + maple + canela'],steps:['Precalienta horno 175°C','Mezcla ingredientes base','Mezcla relleno por separado','Llena molde cupcakes ¾ + relleno + swirl con palillo','Hornea 18–22 min','Lleva 2 piezas al trabajo en tupper']}
  ]
};

// ─── STATE (poblado en initApp tras cargar cloudStorage) ──────────────────────
const EMPTY_DATA = {desayunos:[], comidas:[], cenas:[], colaciones:[]};
const DEFAULT_PROFILE_TMPL = {age:25, weight:70, height:170, sex:'male', activity:'light'};

let CURRENT_USER = null;
let data = EMPTY_DATA;
const selected = {};
const daySelectedServings = {}; // porciones a contar en el día por categoría
const editingMap = {};
let profile = { name: '', ...DEFAULT_PROFILE_TMPL };
let macroTargets = null;

// Base de datos de alimentos
const BASE_FOODS = (window.FOODS_DB && window.FOODS_DB.foods) ? window.FOODS_DB.foods : [];
let CUSTOM_FOODS = [];
let FOODS = [...BASE_FOODS];
let FOODS_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));

// Entry point — llamado por el <script> de home.html tras initCloudStorage
function initApp() {
  CURRENT_USER = getCurrentUser();
  data = cloudGet('recipes', null) || JSON.parse(JSON.stringify(EMPTY_DATA));
  profile = cloudGet('profile', null) || { name: CURRENT_USER.username, ...DEFAULT_PROFILE_TMPL };
  CUSTOM_FOODS = cloudGet('custom_foods', []) || [];
  rebuildFoodsIndex();
  renderProfile();
  renderAll();
  updateTotals();
}

function save() { cloudSet('recipes', data); }
function saveProfileLS() { cloudSet('profile', profile); }
function saveCustomFoods() { cloudSet('custom_foods', CUSTOM_FOODS); }

// ─── SHOPPING LIST (GLOBAL, PERSISTIDA EN LA NUBE) ────────────────────────────
function shopListGet() {
  const raw = cloudGet('shop_list', null);
  if (raw && Array.isArray(raw.recipes)) return raw;
  return { recipes: [], inventory: {}, prices: {}, store: '', weekStart: '' };
}
function shopListSet(obj) { cloudSet('shop_list', obj); }
function isRecipeInShop(id) { return shopListGet().recipes.some(r => r.id === id); }
function addRecipeToShop(id, cat) {
  const list = shopListGet();
  if (list.recipes.some(r => r.id === id)) return;
  const r = (data[cat]||[]).find(x => x.id === id);
  if (!r) return;
  // desired_servings inicia igual a base_servings (sin escalar)
  const baseS = r.base_servings || 1;
  list.recipes.push({id, cat, name: r.name, addedAt: Date.now(), desired_servings: baseS, base_servings: baseS});
  shopListSet(list);
  updateCartBadge();
}
function removeRecipeFromShop(id) {
  const list = shopListGet();
  list.recipes = list.recipes.filter(r => r.id !== id);
  shopListSet(list);
  updateCartBadge();
}

// Actualiza el contador del botón "Lista" en el top-bar
function updateCartBadge() {
  const btn = document.querySelector('.top-bar-btn-cart');
  if (!btn) return;
  const n = shopListGet().recipes.length;
  const existing = btn.querySelector('.cart-badge');
  if (n > 0) {
    if (existing) existing.textContent = n;
    else btn.insertAdjacentHTML('beforeend', `<span class="cart-badge">${n}</span>`);
  } else if (existing) {
    existing.remove();
  }
}

function rebuildFoodsIndex() {
  FOODS = [...BASE_FOODS, ...CUSTOM_FOODS];
  FOODS_BY_ID = Object.fromEntries(FOODS.map(f => [f.id, f]));
}

function escapeHtml(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ─── UNIT CONVERSION ──────────────────────────────────────────────────────────
const GENERIC_DENSITIES = { cda: 15, cdita: 5, taza: 240 };

function convertToGrams(qty, unit, food) {
  qty = parseFloat(qty) || 0;
  if (qty <= 0) return 0;
  switch(unit) {
    case 'g':     return qty;
    case 'kg':    return qty * 1000;
    case 'mg':    return qty / 1000;
    case 'ml':    return qty;
    case 'l':     return qty * 1000;
    case 'cda':   return qty * ((food.densidades && food.densidades.cda) || GENERIC_DENSITIES.cda);
    case 'cdita': return qty * ((food.densidades && food.densidades.cdita) || GENERIC_DENSITIES.cdita);
    case 'taza':  return qty * ((food.densidades && food.densidades.taza) || GENERIC_DENSITIES.taza);
    case 'unidad':
      if (food.gramos_por_unidad) return qty * food.gramos_por_unidad;
      return 0;
    default: return 0;
  }
}

function calcRecipeMacros(structuredIngr) {
  const totals = {kcal:0, prot:0, carbs:0, fat:0, fiber:0, sugars:0, sodium:0};
  for (const ing of structuredIngr) {
    const food = FOODS_BY_ID[ing.food_id];
    if (!food) continue;
    const grams = convertToGrams(ing.qty, ing.unit, food);
    const factor = grams / 100;
    totals.kcal   += food.por_100g.kcal * factor;
    totals.prot   += food.por_100g.prot * factor;
    totals.carbs  += food.por_100g.carbs * factor;
    totals.fat    += food.por_100g.fat * factor;
    totals.fiber  += food.por_100g.fiber * factor;
    totals.sugars += food.por_100g.sugars * factor;
    totals.sodium += food.por_100g.sodium_mg * factor;
  }
  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }
  return totals;
}

function formatIngrLine(ing) {
  const food = FOODS_BY_ID[ing.food_id];
  if (!food) return `${ing.qty} ${ing.unit} de ${ing.food_id} (no encontrado)`;
  const unitLabel = {g:'g', kg:'kg', mg:'mg', ml:'ml', l:'l',
                     cda:'cda', cdita:'cdita', taza:'taza', unidad: ing.qty==1?'unidad':'unidades'}[ing.unit] || ing.unit;
  return `${ing.qty} ${unitLabel} — ${food.nombre}${food.estado && food.estado!=='liquida' && food.estado!=='solida' && food.estado!=='seca' && food.estado!=='seco' ? ' ('+food.estado+')' : ''}`;
}

// ─── PROFILE / MACROS ─────────────────────────────────────────────────────────
function calcMacros(p) {
  const sexConst = (p.sex === 'female') ? -161 : 5;
  const bmr = 10*p.weight + 6.25*p.height - 5*p.age + sexConst;
  const factors = {sedentary:1.2, light:1.375, moderate:1.55, active:1.725};
  const tdee = bmr * (factors[p.activity] || 1.375);
  const target = tdee - 400;
  const calMin = Math.round((target - 100)/10)*10;
  const calMax = Math.round((target + 100)/10)*10;
  const protMin = Math.round(p.weight * 1.6);
  const protMax = Math.round(p.weight * 2.0);
  const fatMin = Math.round(p.weight * 0.7);
  const fatMax = Math.round(p.weight * 1.0);
  const calProtMid = ((protMin+protMax)/2)*4;
  const calFatMid = ((fatMin+fatMax)/2)*9;
  const calCarbMid = ((calMin+calMax)/2) - calProtMid - calFatMid;
  const carbsMid = Math.max(80, calCarbMid/4);
  const carbsMin = Math.max(60, Math.round(carbsMid - 35));
  const carbsMax = Math.round(carbsMid + 35);
  return {calMin, calMax, protMin, protMax, carbsMin, carbsMax, fatMin, fatMax};
}

function renderProfile() {
  macroTargets = calcMacros(profile);
  const pills = document.getElementById('profilePills');
  pills.innerHTML = `
    <span class="meta-pill">${profile.name}</span>
    <span class="meta-pill">${profile.age} años</span>
    <span class="meta-pill">${profile.weight} kg</span>
    <span class="meta-pill">${(profile.height/100).toFixed(2)} m</span>
    <button class="meta-pill meta-edit" onclick="toggleProfileEdit()" title="Editar mis datos">✎ Editar</button>
  `;
  // Refresca badge del carrito en el top-bar
  updateCartBadge();
  document.getElementById('mb-kcal').textContent  = `${macroTargets.calMin}–${macroTargets.calMax}`;
  document.getElementById('mb-prot').textContent  = `${macroTargets.protMin}–${macroTargets.protMax}g`;
  document.getElementById('mb-carbs').textContent = `${macroTargets.carbsMin}–${macroTargets.carbsMax}g`;
  document.getElementById('mb-fat').textContent   = `${macroTargets.fatMin}–${macroTargets.fatMax}g`;
  document.getElementById('footer').innerHTML =
    `Banco de Recetas · ${profile.name}`;
  document.getElementById('p_name').value = profile.name;
  document.getElementById('p_age').value = profile.age;
  document.getElementById('p_weight').value = profile.weight;
  document.getElementById('p_height').value = profile.height;
  document.getElementById('p_sex').value = profile.sex || 'male';
  document.getElementById('p_activity').value = profile.activity;
}

function toggleProfileEdit() {
  document.getElementById('profileEdit').classList.toggle('open');
}

function saveProfile() {
  const name = document.getElementById('p_name').value.trim() || CURRENT_USER.username;
  const age = parseInt(document.getElementById('p_age').value) || profile.age;
  const weight = parseFloat(document.getElementById('p_weight').value) || profile.weight;
  const height = parseInt(document.getElementById('p_height').value) || profile.height;
  const sex = document.getElementById('p_sex').value || profile.sex || 'male';
  const activity = document.getElementById('p_activity').value || profile.activity;
  profile = {name, age, weight, height, sex, activity};
  saveProfileLS();
  renderProfile();
  updateTotals();
  toggleProfileEdit();
}

// ─── CARD HTML ────────────────────────────────────────────────────────────────
function cardHTML(r, cat) {
  const badgesHTML = (r.badges||[]).map(b => `<span class="badge b-default">${escapeHtml(b)}</span>`).join('');
  const ingrHTML = (r.ingredients||[]).map(i => `<li>${escapeHtml(i)}</li>`).join('');
  const stepsHTML = (r.steps||[]).map(s => `<li>${escapeHtml(s)}</li>`).join('');
  const tipHTML = r.tip ? `<div class="tip">${escapeHtml(r.tip)}</div>` : '';
  const baseS = r.base_servings || 1;
  const isActive = selected[cat] === r.id;
  const dayS = daySelectedServings[cat] || 1;
  const dayBtnLabel = isActive ? '✓ En el día' : '＋ Agregar al día';
  const dayBtnClass = isActive ? 'btn-day active' : 'btn-day';
  const portionPickerHTML = (isActive && baseS > 1) ? `
    <div class="day-servings-picker" id="day-pick-${cat}">
      <span class="day-servings-label">Porciones hoy:</span>
      <button type="button" onclick="adjustDayServings('${cat}',-1)">−</button>
      <input type="number" id="day-serv-${cat}" min="0.5" max="${baseS}" step="0.5" value="${dayS}" onchange="setDayServings('${cat}', this.value)">
      <button type="button" onclick="adjustDayServings('${cat}',1)">+</button>
      <span class="day-servings-of">/ ${baseS}</span>
    </div>` : '';
  return `
<div class="card" id="card-${r.id}" data-id="${r.id}" data-cat="${cat}" data-kcal="${r.kcal}" data-prot="${r.prot}" data-carbs="${r.carbs}" data-fat="${r.fat}">
  <div class="card-actions">
    <button class="${dayBtnClass}" onclick="toggleDay('${r.id}','${cat}',this)">${dayBtnLabel}</button>
    <button class="btn-shop" onclick="toggleShop('${r.id}','${cat}',this)">🛒 Lista de compras</button>
  </div>
  ${portionPickerHTML}
  <div class="card-title">${escapeHtml(r.name)}<span class="recipe-servings-badge" title="Porciones que rinde la receta">🍽 ${r.base_servings || 1} porc.</span></div>
  ${badgesHTML ? `<div class="badges">${badgesHTML}</div>` : ''}
  <div class="divider"></div>
  <div class="macros">
    <div class="macro"><span class="ml">Calorías</span><span class="mv">${r.kcal} kcal</span></div>
    <div class="macro"><span class="ml">Proteína</span><span class="mv">${r.prot}g</span></div>
    <div class="macro"><span class="ml">Carbs</span><span class="mv">${r.carbs}g</span></div>
    <div class="macro"><span class="ml">Grasa</span><span class="mv">${r.fat}g</span></div>
  </div>
  <div class="divider"></div>
  <div class="sec-label">Ingredientes</div>
  <ul class="ingr-list" id="ingr-${r.id}">${ingrHTML}</ul>
  ${stepsHTML ? `<div class="sec-label">Pasos</div><ol class="step-list">${stepsHTML}</ol>` : ''}
  ${tipHTML}
  <div class="card-bottom-actions">
    <button class="btn-edit" onclick="openEditForm('${cat}','${r.id}')">✎ Editar</button>
    <button class="btn-delete" onclick="deleteRecipe('${r.id}','${cat}')">🗑 Eliminar</button>
  </div>
</div>`;
}

// ─── RENDER ───────────────────────────────────────────────────────────────────
function renderCat(cat) {
  const grid = document.getElementById('grid-' + cat);
  const count = document.getElementById('count-' + cat);
  const list = data[cat] || [];
  count.textContent = list.length + ' recetas';
  grid.innerHTML = list.length === 0
    ? '<div class="empty-state">Aún no hay recetas aquí. Usa el botón de arriba para agregar una.</div>'
    : list.map(r => cardHTML(r, cat)).join('');
  if (selected[cat]) {
    const btn = document.querySelector(`#card-${selected[cat]} .btn-day`);
    if (btn) { btn.textContent = '✓ En el día'; btn.classList.add('active'); }
  }
  syncShopButtons();
}

function renderAll() {
  ['desayunos','comidas','cenas','colaciones'].forEach(renderCat);
  syncShopButtons();
  updateShopPanel();
}

// ─── TOGGLE DAY (con animación FLIP) ──────────────────────────────────────────
const ANIM_MS = 480;

function clearAnimStyles(el) {
  el.style.transition = '';
  el.style.transform = '';
  el.style.opacity = '';
  el.style.transformOrigin = '';
  el.classList.remove('is-flying','is-selected-anim');
}

function toggleDay(id, cat, btn) {
  const grid = document.getElementById('grid-' + cat);
  const allCards = Array.from(grid.querySelectorAll('.card'));
  const selectedCard = document.getElementById('card-' + id);
  if (!selectedCard) return;

  if (selected[cat] === id) {
    selected[cat] = null;
    delete daySelectedServings[cat];
    const oldPick = document.getElementById('day-pick-' + cat);
    if (oldPick) oldPick.remove();
    btn.textContent = '＋ Agregar al día';
    btn.classList.remove('active');

    const selFrom = selectedCard.getBoundingClientRect();
    allCards.forEach(c => c.classList.remove('card-hidden'));
    const selTo = selectedCard.getBoundingClientRect();
    const dxSel = selFrom.left - selTo.left;
    const dySel = selFrom.top - selTo.top;
    if (dxSel || dySel) {
      selectedCard.classList.add('is-selected-anim');
      selectedCard.style.transition = 'none';
      selectedCard.style.transform = `translate(${dxSel}px, ${dySel}px)`;
      requestAnimationFrame(() => {
        selectedCard.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.4,0,.2,1)`;
        selectedCard.style.transform = '';
      });
    }
    allCards.forEach(c => {
      if (c === selectedCard) return;
      const cRect = c.getBoundingClientRect();
      const dx = selFrom.left - cRect.left;
      const dy = selFrom.top - cRect.top;
      c.classList.add('is-flying');
      c.style.transformOrigin = 'top left';
      c.style.transition = 'none';
      c.style.transform = `translate(${dx}px, ${dy}px) scale(.7)`;
      c.style.opacity = '0';
      requestAnimationFrame(() => {
        c.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.34,1.2,.64,1), opacity ${ANIM_MS-80}ms ease`;
        c.style.transform = '';
        c.style.opacity = '';
      });
    });
    setTimeout(() => allCards.forEach(clearAnimStyles), ANIM_MS + 60);

  } else {
    if (selected[cat]) {
      const prev = document.querySelector(`#card-${selected[cat]} .btn-day`);
      if (prev) { prev.textContent = '＋ Agregar al día'; prev.classList.remove('active'); }
      const prevPick = document.getElementById('day-pick-' + cat);
      if (prevPick) prevPick.remove();
    }
    selected[cat] = id;
    daySelectedServings[cat] = 1;
    btn.textContent = '✓ En el día';
    btn.classList.add('active');
    // Insertar picker si la receta rinde más de 1 porción
    const r = (data[cat]||[]).find(x => x.id === id);
    const baseS = r && (r.base_servings || 1);
    if (baseS > 1 && !document.getElementById('day-pick-' + cat)) {
      const actions = selectedCard.querySelector('.card-actions');
      if (actions) {
        actions.insertAdjacentHTML('afterend', `
    <div class="day-servings-picker" id="day-pick-${cat}">
      <span class="day-servings-label">Porciones hoy:</span>
      <button type="button" onclick="adjustDayServings('${cat}',-1)">−</button>
      <input type="number" id="day-serv-${cat}" min="0.5" max="${baseS}" step="0.5" value="1" onchange="setDayServings('${cat}', this.value)">
      <button type="button" onclick="adjustDayServings('${cat}',1)">+</button>
      <span class="day-servings-of">/ ${baseS}</span>
    </div>`);
      }
    }

    const selFirst = selectedCard.getBoundingClientRect();

    allCards.forEach(c => {
      if (c === selectedCard) return;
      const cRect = c.getBoundingClientRect();
      const dx = selFirst.left - cRect.left;
      const dy = selFirst.top - cRect.top;
      c.classList.add('is-flying');
      c.style.transformOrigin = 'top left';
      c.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.4,0,.2,1), opacity ${ANIM_MS-100}ms ease ${60}ms`;
      requestAnimationFrame(() => {
        c.style.transform = `translate(${dx}px, ${dy}px) scale(.7)`;
        c.style.opacity = '0';
      });
    });

    setTimeout(() => {
      allCards.forEach(c => {
        if (c === selectedCard) clearAnimStyles(c);
        else { c.classList.add('card-hidden'); clearAnimStyles(c); }
      });

      const selLast = selectedCard.getBoundingClientRect();
      const dxSel = selFirst.left - selLast.left;
      const dySel = selFirst.top - selLast.top;
      if (dxSel || dySel) {
        selectedCard.classList.add('is-selected-anim');
        selectedCard.style.transition = 'none';
        selectedCard.style.transform = `translate(${dxSel}px, ${dySel}px)`;
        requestAnimationFrame(() => {
          selectedCard.style.transition = `transform ${ANIM_MS}ms cubic-bezier(.4,0,.2,1)`;
          selectedCard.style.transform = '';
        });
        setTimeout(() => clearAnimStyles(selectedCard), ANIM_MS + 60);
      }
    }, ANIM_MS);
  }
  updateTotals();
}

function updateTotals() {
  const cats = ['desayunos','comidas','cenas','colaciones'];
  let kcal=0,prot=0,carbs=0,fat=0;
  const names = [];
  let any = false;

  cats.forEach(cat => {
    const id = selected[cat];
    if (!id) return;
    const r = (data[cat]||[]).find(x=>x.id===id);
    if (!r) return;
    const baseS = r.base_servings || 1;
    const dayS = daySelectedServings[cat] || 1;
    const factor = dayS / baseS;
    kcal  += r.kcal  * factor;
    prot  += r.prot  * factor;
    carbs += r.carbs * factor;
    fat   += r.fat   * factor;
    const portionLabel = (baseS > 1) ? ` (${dayS}/${baseS})` : '';
    names.push(r.name + portionLabel);
    any = true;
  });

  kcal  = Math.round(kcal);
  prot  = Math.round(prot);
  carbs = Math.round(carbs);
  fat   = Math.round(fat);

  document.getElementById('selectedMealsText').textContent = any ? names.join(' · ') : 'Sin selecciones';

  if (!any) {
    ['kcal','prot','carbs','fat'].forEach(k => {
      document.getElementById('tv-'+k).textContent = '—';
      document.getElementById('tf-'+k).style.width = '0%';
      document.getElementById('tc-'+k).classList.remove('ok','low','high');
    });
    return;
  }

  const setVal = (key, val, min, max, unit='') => {
    document.getElementById('tv-'+key).textContent = val + unit;
    const pct = Math.min(100, Math.round(val/max*100));
    document.getElementById('tf-'+key).style.width = pct+'%';
    const tc = document.getElementById('tc-'+key);
    tc.classList.remove('ok','low','high');
    if (val < min-20) tc.classList.add('low');
    else if (val > max+50) tc.classList.add('high');
    else tc.classList.add('ok');
  };

  const t = macroTargets || calcMacros(profile);
  setVal('kcal', kcal, t.calMin, t.calMax);
  setVal('prot', prot, t.protMin, t.protMax, 'g');
  setVal('carbs', carbs, t.carbsMin, t.carbsMax, 'g');
  setVal('fat', fat, t.fatMin, t.fatMax, 'g');
}

// ─── DAY SERVINGS (porciones a contar en el día) ─────────────────────────────
function setDayServings(cat, val) {
  const id = selected[cat];
  if (!id) return;
  const r = (data[cat]||[]).find(x => x.id === id);
  const baseS = (r && r.base_servings) || 1;
  let v = parseFloat(val);
  if (isNaN(v) || v <= 0) v = 1;
  v = Math.min(baseS, Math.max(0.5, v));
  v = Math.round(v * 2) / 2; // snap a 0.5
  daySelectedServings[cat] = v;
  const input = document.getElementById('day-serv-' + cat);
  if (input) input.value = v;
  updateTotals();
}

function adjustDayServings(cat, delta) {
  const cur = daySelectedServings[cat] || 1;
  setDayServings(cat, cur + delta);
}

// ─── SHOPPING ────────────────────────────────────────────────────────────────
// Toggle: agrega/quita la receta de la lista global de compras
function toggleShop(id, cat, btn) {
  if (isRecipeInShop(id)) {
    removeRecipeFromShop(id);
    btn.textContent = '🛒 Lista de compras';
    btn.classList.remove('active');
    document.getElementById('card-'+id).classList.remove('shopping-active');
  } else {
    addRecipeToShop(id, cat);
    btn.textContent = '✓ En lista';
    btn.classList.add('active');
    document.getElementById('card-'+id).classList.add('shopping-active');
  }
  updateShopPanel();
}

function updateShopPanel() {
  const list = shopListGet();
  const panel = document.getElementById('shopPanel');
  const count = list.recipes.length;
  if (count === 0) { panel.classList.remove('visible'); return; }
  panel.classList.add('visible');
  document.getElementById('shopCount').textContent = `${count} receta${count===1?'':'s'}`;
  // Calcula # de ingredientes únicos sumando estructurados
  const uniq = new Set();
  let legacy = 0;
  list.recipes.forEach(r => {
    const rec = (data[r.cat]||[]).find(x => x.id === r.id);
    if (!rec) return;
    if (rec.ingredients_structured && rec.ingredients_structured.length) {
      rec.ingredients_structured.forEach(i => uniq.add(i.food_id));
    } else {
      legacy++;
    }
  });
  const subtxt = document.getElementById('shopSubtext');
  if (subtxt) {
    const parts = [];
    if (uniq.size) parts.push(`${uniq.size} ingrediente${uniq.size===1?'':'s'} únicos`);
    if (legacy) parts.push(`${legacy} con texto libre`);
    subtxt.textContent = parts.join(' · ');
  }
}

// Sincroniza el estado visual de las tarjetas con la lista guardada
function syncShopButtons() {
  const ids = new Set(shopListGet().recipes.map(r => r.id));
  document.querySelectorAll('.card').forEach(card => {
    const id = card.dataset.id;
    const btn = card.querySelector('.btn-shop');
    if (!btn) return;
    if (ids.has(id)) {
      btn.textContent = '✓ En lista';
      btn.classList.add('active');
      card.classList.add('shopping-active');
    } else {
      btn.textContent = '🛒 Lista de compras';
      btn.classList.remove('active');
      card.classList.remove('shopping-active');
    }
  });
}

const _shopClearBtn = document.getElementById('shopClearAll');
if (_shopClearBtn) {
  _shopClearBtn.onclick = () => {
    if (!confirm('¿Vaciar toda la lista de compras? (no se guarda en historial)')) return;
    const list = shopListGet();
    list.recipes = [];
    list.inventory = {};
    list.prices = {};
    shopListSet(list);
    syncShopButtons();
    updateShopPanel();
  };
}

// ─── DELETE ───────────────────────────────────────────────────────────────────
function deleteRecipe(id, cat) {
  if (!confirm('¿Eliminar esta receta?')) return;
  data[cat] = data[cat].filter(r => r.id !== id);
  if (selected[cat] === id) {
    selected[cat] = null;
    updateTotals();
  }
  save();
  renderCat(cat);
  if (!selected[cat]) {
    const grid = document.getElementById('grid-' + cat);
    if (grid) grid.querySelectorAll('.card').forEach(c => c.classList.remove('card-hidden'));
  }
}

// ─── FORM ─────────────────────────────────────────────────────────────────────
function toggleForm(cat) {
  const formEl = document.getElementById('form-'+cat);
  const isOpen = formEl.classList.toggle('open');
  if (isOpen && !formEl.innerHTML.trim()) {
    editingMap[cat] = null;
    buildForm(cat);
  } else if (!isOpen) {
    editingMap[cat] = null;
    formEl.innerHTML = '';
  }
}

function openEditForm(cat, id) {
  const formEl = document.getElementById('form-'+cat);
  formEl.classList.add('open');
  buildForm(cat, id);
  formEl.scrollIntoView({behavior:'smooth', block:'start'});
}

// ─── AUTOCOMPLETE ─────────────────────────────────────────────────────────────
function normalizeStr(s) {
  return (s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
}

function searchFoods(query) {
  const q = normalizeStr((query||'').trim());
  if (!q) {
    // Sin query: muestra una mezcla — los más comunes y categorías populares
    return FOODS.slice().sort((a,b) => a.nombre.localeCompare(b.nombre)).slice(0, 15);
  }
  const scored = [];
  for (const f of FOODS) {
    const nN = normalizeStr(f.nombre);
    const nI = normalizeStr(f.id);
    const nC = normalizeStr(f.categoria);
    const nE = normalizeStr(f.estado||'');
    let score = -1;
    if (nN.startsWith(q) || nI.startsWith(q)) score = 100;
    else if (nN.split(/[\s,()\-]+/).some(w => w.startsWith(q))) score = 80;
    else if (nN.includes(q)) score = 50;
    else if (nC.startsWith(q)) score = 30;
    else if (nE.includes(q)) score = 20;
    if (score >= 0) scored.push({f, score});
  }
  scored.sort((a,b) => b.score - a.score || a.f.nombre.localeCompare(b.f.nombre));
  return scored.slice(0, 15).map(x => x.f);
}

function onFoodSearch(cat, idx) {
  const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
  if (!row) return;
  const input = row.querySelector('.ingr-food-input');
  const sugg = row.querySelector('.ingr-suggestions');
  const query = input.value;
  const matches = searchFoods(query);

  // Si el input ya no coincide con el seleccionado, limpia el hidden
  const hidden = row.querySelector('.ingr-food');
  if (hidden.value) {
    const f = FOODS_BY_ID[hidden.value];
    if (!f || f.nombre !== input.value) {
      hidden.value = '';
      input.classList.remove('has-selection');
      onIngrChange(cat, idx);
    }
  }

  let html = '';
  if (matches.length === 0) {
    html = `<div class="sugg-empty">Sin resultados para "${escapeHtml(query)}"</div>`;
  } else {
    html = matches.map(f => {
      const estadoTxt = f.estado ? ` · ${escapeHtml(f.estado)}` : '';
      const customTag = f.tipo === 'custom' ? ' · <em class="sugg-custom-tag">tuyo</em>' : '';
      return `<div class="sugg-item" onmousedown="event.preventDefault();selectFood('${cat}',${idx},'${f.id}')">
        <div class="sugg-name">${escapeHtml(f.nombre)}</div>
        <div class="sugg-meta">${escapeHtml(f.categoria)}${estadoTxt} · ${f.por_100g.kcal} kcal/100g${customTag}</div>
      </div>`;
    }).join('');
  }
  html += `<div class="sugg-newfood" onmousedown="event.preventDefault();openNewFoodFromRow('${cat}',${idx})">＋ Crear producto nuevo${query ? ' ("'+escapeHtml(query)+'")' : ''}</div>`;
  sugg.innerHTML = html;
  sugg.classList.add('open');
}

function selectFood(cat, idx, foodId) {
  const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
  const food = FOODS_BY_ID[foodId];
  if (!row || !food) return;
  const input = row.querySelector('.ingr-food-input');
  input.value = food.nombre;
  input.classList.add('has-selection');
  row.querySelector('.ingr-food').value = foodId;
  row.querySelector('.ingr-suggestions').classList.remove('open');
  onIngrChange(cat, idx);
}

function onFoodBlur(cat, idx) {
  setTimeout(() => {
    const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
    if (!row) return;
    const sugg = row.querySelector('.ingr-suggestions');
    if (sugg) sugg.classList.remove('open');
  }, 180);
}

// ─── INGREDIENT ROW ───────────────────────────────────────────────────────────
function buildIngredientRowHTML(cat, idx) {
  return `
    <div class="ingr-row" data-row="${idx}">
      <div class="ingr-food-wrap">
        <input type="text" class="ingr-food-input" placeholder="Buscar… ej. &quot;poll&quot;"
               oninput="onFoodSearch('${cat}',${idx})"
               onfocus="onFoodSearch('${cat}',${idx})"
               onblur="onFoodBlur('${cat}',${idx})"
               autocomplete="off">
        <input type="hidden" class="ingr-food" value="">
        <div class="ingr-suggestions"></div>
      </div>
      <input type="number" class="ingr-qty" placeholder="100" min="0" step="0.1" onchange="onIngrChange('${cat}',${idx})">
      <select class="ingr-unit" onchange="onIngrChange('${cat}',${idx})">
        <option value="g">g</option>
        <option value="kg">kg</option>
        <option value="mg">mg</option>
        <option value="ml">ml</option>
        <option value="l">l</option>
        <option value="cda">cda</option>
        <option value="cdita">cdita</option>
        <option value="taza">taza</option>
        <option value="unidad" disabled>unidad</option>
      </select>
      <button class="btn-row-del" type="button" onclick="removeIngredientRow('${cat}',${idx})" title="Eliminar">×</button>
    </div>`;
}

function buildForm(cat, editId) {
  const editing = editId ? (data[cat]||[]).find(r => r.id === editId) : null;
  editingMap[cat] = editing ? editId : null;

  const titulo = editing ? 'Editar receta' : 'Nueva receta';
  const btnTxt = editing ? '💾 Guardar cambios' : '＋ Agregar receta';
  const legacyWarn = (editing && (!editing.ingredients_structured || editing.ingredients_structured.length === 0))
    ? `<div class="ingr-text-mode">⚠️ Esta receta tiene ingredientes en formato antiguo. Si agregas ingredientes aquí, las macros se recalcularán. Si dejas vacío, se conservan los ingredientes y macros originales.</div>`
    : '';
  const previewInit = editing
    ? `${editing.kcal} kcal · ${editing.prot}g prot · ${editing.carbs}g carbs · ${editing.fat}g grasa`
    : 'Macros se calculan automáticamente al agregar ingredientes';
  const previewCls = editing ? 'macros-preview' : 'macros-preview empty';

  document.getElementById('form-'+cat).innerHTML = `
    <h3>${titulo}</h3>
    <div class="form-grid">
      <div class="form-group form-full">
        <label>Nombre de la receta *</label>
        <input type="text" id="f_${cat}_name" placeholder="Ej: Pollo al limón con arroz" value="${editing ? escapeHtml(editing.name) : ''}">
      </div>
      <div class="form-group form-full">
        <label>Tags / Etiquetas <span style="text-transform:none;letter-spacing:0;font-weight:400">(separadas por coma)</span></label>
        <input type="text" id="f_${cat}_badges" placeholder="Ej: 25 min, Mexicano, Prep domingo" value="${editing ? escapeHtml((editing.badges||[]).join(', ')) : ''}">
      </div>
      <div class="form-group">
        <label>Porciones que rinde <span style="text-transform:none;letter-spacing:0;font-weight:400">(con las cantidades que ingreses)</span></label>
        <div class="servings-input-wrap">
          <button type="button" onclick="adjustServingsInput('f_${cat}_servings',-1)">−</button>
          <input type="number" id="f_${cat}_servings" min="1" max="50" step="1" value="${editing ? (editing.base_servings||1) : 1}">
          <button type="button" onclick="adjustServingsInput('f_${cat}_servings',1)">+</button>
        </div>
      </div>
      <div class="form-group form-full">
        <label>Ingredientes</label>
        <div class="ingr-builder" id="ingr-rows-${cat}"></div>
        <div class="ingr-actions">
          <button class="btn-add-ingr" type="button" onclick="addIngredientRow('${cat}')">＋ Agregar ingrediente</button>
          <button class="btn-newfood-global" type="button" onclick="openNewFoodModal('${cat}',null,'')">🆕 Crear producto nuevo</button>
        </div>
        ${legacyWarn}
        <div class="${previewCls}" id="macros-preview-${cat}">${previewInit}</div>
      </div>
      <div class="form-group form-full">
        <label>Pasos <span style="text-transform:none;letter-spacing:0;font-weight:400">(uno por línea)</span></label>
        <textarea id="f_${cat}_steps" placeholder="Cuece el arroz con sal&#10;Sazona el pollo con ajo y pimienta&#10;Sella en sartén 4 min por lado">${editing ? escapeHtml((editing.steps||[]).join('\n')) : ''}</textarea>
      </div>
      <div class="form-group form-full">
        <label>Comentario / Tip <span style="text-transform:none;letter-spacing:0;font-weight:400">(opcional)</span></label>
        <input type="text" id="f_${cat}_tip" placeholder="Ej: Puedes prep el domingo para toda la semana" value="${editing ? escapeHtml(editing.tip||'') : ''}">
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-submit" onclick="addRecipe('${cat}')">${btnTxt}</button>
      <button class="btn-cancel" onclick="closeForm('${cat}')">Cancelar</button>
    </div>
  `;

  if (editing && editing.ingredients_structured && editing.ingredients_structured.length) {
    for (const ing of editing.ingredients_structured) {
      addIngredientRow(cat);
      const rows = document.querySelectorAll(`#ingr-rows-${cat} .ingr-row`);
      const lastRow = rows[rows.length - 1];
      if (!lastRow) continue;
      const food = FOODS_BY_ID[ing.food_id];
      const idx = parseInt(lastRow.dataset.row);
      if (food) {
        lastRow.querySelector('.ingr-food-input').value = food.nombre;
        lastRow.querySelector('.ingr-food-input').classList.add('has-selection');
        lastRow.querySelector('.ingr-food').value = ing.food_id;
      }
      lastRow.querySelector('.ingr-qty').value = ing.qty;
      onIngrChange(cat, idx);
      lastRow.querySelector('.ingr-unit').value = ing.unit;
    }
    updateMacrosPreview(cat);
  } else {
    addIngredientRow(cat);
  }
}

const ingrRowCounters = {};

function addIngredientRow(cat) {
  ingrRowCounters[cat] = (ingrRowCounters[cat] || 0) + 1;
  const idx = ingrRowCounters[cat];
  const container = document.getElementById('ingr-rows-'+cat);
  if (!container) return;
  container.insertAdjacentHTML('beforeend', buildIngredientRowHTML(cat, idx));
}

function adjustServingsInput(inputId, delta) {
  const el = document.getElementById(inputId);
  if (!el) return;
  const cur = parseInt(el.value) || 1;
  el.value = Math.max(1, Math.min(50, cur + delta));
  el.dispatchEvent(new Event('change', {bubbles:true}));
}

function removeIngredientRow(cat, idx) {
  const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
  if (row) row.remove();
  updateMacrosPreview(cat);
}

function onIngrChange(cat, idx) {
  const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
  if (!row) return;
  const foodSel = row.querySelector('.ingr-food');
  const unitSel = row.querySelector('.ingr-unit');
  const foodId = foodSel.value;
  const food = FOODS_BY_ID[foodId];
  const unidadOpt = unitSel.querySelector('option[value="unidad"]');
  if (food && food.gramos_por_unidad) {
    unidadOpt.disabled = false;
    unidadOpt.textContent = `unidad (${food.gramos_por_unidad}g)`;
  } else {
    unidadOpt.disabled = true;
    unidadOpt.textContent = 'unidad';
    if (unitSel.value === 'unidad') unitSel.value = 'g';
  }
  updateMacrosPreview(cat);
}

function readStructuredIngr(cat) {
  const rows = document.querySelectorAll(`#ingr-rows-${cat} .ingr-row`);
  const out = [];
  rows.forEach(row => {
    const food_id = row.querySelector('.ingr-food').value;
    const qty = parseFloat(row.querySelector('.ingr-qty').value);
    const unit = row.querySelector('.ingr-unit').value;
    if (food_id && qty > 0) out.push({food_id, qty, unit});
  });
  return out;
}

function updateMacrosPreview(cat) {
  const preview = document.getElementById('macros-preview-'+cat);
  if (!preview) return;
  const ingr = readStructuredIngr(cat);
  if (ingr.length === 0) {
    // Si estamos editando, no resetees el preview a "empty" — muestra los macros originales
    const editId = editingMap[cat];
    if (editId) {
      const orig = (data[cat]||[]).find(r => r.id === editId);
      if (orig) {
        preview.className = 'macros-preview';
        preview.textContent = `${orig.kcal} kcal · ${orig.prot}g prot · ${orig.carbs}g carbs · ${orig.fat}g grasa (original)`;
        return;
      }
    }
    preview.className = 'macros-preview empty';
    preview.textContent = 'Macros se calculan automáticamente al agregar ingredientes';
    return;
  }
  const m = calcRecipeMacros(ingr);
  preview.className = 'macros-preview';
  preview.textContent = `${m.kcal} kcal · ${m.prot}g prot · ${m.carbs}g carbs · ${m.fat}g grasa · ${m.fiber}g fibra · ${m.sodium}mg sodio`;
}

function closeForm(cat) {
  const formEl = document.getElementById('form-'+cat);
  formEl.classList.remove('open');
  formEl.innerHTML = '';
  ingrRowCounters[cat] = 0;
  editingMap[cat] = null;
}

function addRecipe(cat) {
  const name = document.getElementById(`f_${cat}_name`).value.trim();
  if (!name) { alert('El nombre es obligatorio.'); return; }

  const editId = editingMap[cat];
  const editing = editId ? data[cat].find(r => r.id === editId) : null;
  const structured = readStructuredIngr(cat);

  let kcal, prot, carbs, fat, fiber, sugars, sodium;
  let ingredients, ingredients_structured, auto_macros;

  if (structured.length > 0) {
    const m = calcRecipeMacros(structured);
    kcal = Math.round(m.kcal);
    prot = Math.round(m.prot);
    carbs = Math.round(m.carbs);
    fat = Math.round(m.fat);
    fiber = m.fiber;
    sugars = m.sugars;
    sodium = m.sodium;
    ingredients = structured.map(formatIngrLine);
    ingredients_structured = structured;
    auto_macros = true;
  } else if (editing) {
    // Edición sin agregar ingredientes nuevos → conserva originales
    kcal = editing.kcal;
    prot = editing.prot;
    carbs = editing.carbs;
    fat = editing.fat;
    fiber = editing.fiber;
    sugars = editing.sugars;
    sodium = editing.sodium;
    ingredients = editing.ingredients || [];
    ingredients_structured = editing.ingredients_structured;
    auto_macros = editing.auto_macros || false;
  } else {
    alert('Agrega al menos un ingrediente válido (alimento + cantidad).');
    return;
  }

  const badges = (document.getElementById(`f_${cat}_badges`).value||'').split(',').map(b=>b.trim()).filter(Boolean);
  const steps = (document.getElementById(`f_${cat}_steps`).value||'').split('\n').map(l=>l.trim()).filter(Boolean);
  const tip = document.getElementById(`f_${cat}_tip`).value.trim();
  const base_servings = Math.max(1, parseInt(document.getElementById(`f_${cat}_servings`).value) || 1);

  if (editing) {
    Object.assign(editing, {
      name, kcal, prot, carbs, fat, fiber, sugars, sodium,
      badges, tip, ingredients, steps,
      ingredients_structured, auto_macros, base_servings,
    });
  } else {
    const id = cat[0] + 'u' + Date.now();
    data[cat].push({
      id, name, kcal, prot, carbs, fat, fiber, sugars, sodium,
      badges, tip, ingredients, steps,
      ingredients_structured, auto_macros, base_servings,
    });
  }

  save();
  closeForm(cat);
  renderCat(cat);
  updateTotals();
}

// ─── NEW FOOD MODAL ───────────────────────────────────────────────────────────
let newFoodContext = null; // {cat, idx, prefillName}

function openNewFoodFromRow(cat, idx) {
  const row = document.querySelector(`#ingr-rows-${cat} [data-row="${idx}"]`);
  const input = row ? row.querySelector('.ingr-food-input') : null;
  openNewFoodModal(cat, idx, input ? input.value : '');
}

function openNewFoodModal(cat, idx, prefillName) {
  newFoodContext = {cat, idx, prefillName: prefillName || ''};
  const modal = document.getElementById('newFoodModal');
  modal.innerHTML = `
    <div class="modal">
      <h3>Crear producto nuevo</h3>
      <div class="modal-sub">Se guarda en tu base local y queda disponible en todas las recetas. Valores por <strong>100 g</strong> del producto.</div>
      <div class="modal-grid">
        <div class="form-group form-full">
          <label>Nombre del producto *</label>
          <input type="text" id="nf_nombre" value="${escapeHtml(prefillName)}" placeholder="Ej: Pollo rostizado Costco">
        </div>
        <div class="form-group">
          <label>Categoría</label>
          <select id="nf_categoria">
            <option value="pollo">Pollo</option>
            <option value="res">Res</option>
            <option value="cerdo">Cerdo</option>
            <option value="pescado">Pescado</option>
            <option value="huevo">Huevo</option>
            <option value="lacteo">Lácteo</option>
            <option value="grano">Grano</option>
            <option value="legumbre">Legumbre</option>
            <option value="verdura">Verdura</option>
            <option value="fruta">Fruta</option>
            <option value="semilla">Semilla</option>
            <option value="grasa">Grasa</option>
            <option value="endulzante">Endulzante</option>
            <option value="condimento">Condimento</option>
            <option value="especia">Especia</option>
            <option value="otro" selected>Otro</option>
          </select>
        </div>
        <div class="form-group">
          <label>Estado (opc)</label>
          <input type="text" id="nf_estado" placeholder="cocido / crudo / seco">
        </div>
        <div class="form-group">
          <label>Kcal / 100g *</label>
          <input type="number" id="nf_kcal" min="0" step="0.1" placeholder="200">
        </div>
        <div class="form-group">
          <label>Proteína g / 100g *</label>
          <input type="number" id="nf_prot" min="0" step="0.1" placeholder="20">
        </div>
        <div class="form-group">
          <label>Carbos g / 100g *</label>
          <input type="number" id="nf_carbs" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group">
          <label>Grasa g / 100g *</label>
          <input type="number" id="nf_fat" min="0" step="0.1" placeholder="10">
        </div>
        <div class="form-group">
          <label>Fibra g / 100g</label>
          <input type="number" id="nf_fiber" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group">
          <label>Azúcares g / 100g</label>
          <input type="number" id="nf_sugars" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group">
          <label>Sodio mg / 100g</label>
          <input type="number" id="nf_sodium" min="0" step="0.1" placeholder="0">
        </div>
        <div class="form-group form-full">
          <label>Gramos por unidad (opc) <span style="text-transform:none;letter-spacing:0;font-weight:400">— si se cuenta por pieza</span></label>
          <input type="number" id="nf_gxu" min="0" step="0.1" placeholder="Ej: 50 (1 huevo) o 118 (1 plátano)">
        </div>
      </div>
      <div class="form-actions">
        <button class="btn-submit" onclick="saveNewFood()">Guardar producto</button>
        <button class="btn-cancel" onclick="closeNewFoodModal()">Cancelar</button>
      </div>
    </div>
  `;
  modal.classList.add('open');
}

function closeNewFoodModal() {
  document.getElementById('newFoodModal').classList.remove('open');
  newFoodContext = null;
}

function saveNewFood() {
  const nombre = document.getElementById('nf_nombre').value.trim();
  if (!nombre) { alert('El nombre es obligatorio.'); return; }
  const kcal = parseFloat(document.getElementById('nf_kcal').value);
  const prot = parseFloat(document.getElementById('nf_prot').value);
  const carbs = parseFloat(document.getElementById('nf_carbs').value);
  const fat = parseFloat(document.getElementById('nf_fat').value);
  if ([kcal,prot,carbs,fat].some(v => isNaN(v))) {
    alert('Kcal, proteína, carbos y grasa son obligatorios.'); return;
  }
  const fiber = parseFloat(document.getElementById('nf_fiber').value) || 0;
  const sugars = parseFloat(document.getElementById('nf_sugars').value) || 0;
  const sodium_mg = parseFloat(document.getElementById('nf_sodium').value) || 0;
  const categoria = document.getElementById('nf_categoria').value;
  const estado = document.getElementById('nf_estado').value.trim();
  const gxu = parseFloat(document.getElementById('nf_gxu').value);

  const baseId = 'custom_' + normalizeStr(nombre).replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
  let id = baseId || ('custom_' + Date.now());
  let n = 2;
  while (FOODS_BY_ID[id]) { id = baseId + '_' + n; n++; }

  const newFood = {
    id, nombre, categoria,
    por_100g: { kcal, prot, carbs, fat, fiber, sugars, sodium_mg },
    tipo: 'custom',
    fuente: { db: 'Usuario (custom)' },
  };
  if (estado) newFood.estado = estado;
  if (!isNaN(gxu) && gxu > 0) newFood.gramos_por_unidad = gxu;

  CUSTOM_FOODS.push(newFood);
  saveCustomFoods();
  rebuildFoodsIndex();

  // Auto-seleccionar en la fila desde donde se invoco (si aplica)
  if (newFoodContext && newFoodContext.cat && newFoodContext.idx != null) {
    selectFood(newFoodContext.cat, newFoodContext.idx, id);
  }
  closeNewFoodModal();
}

// INIT — se llama desde la página HTML después de initCloudStorage()
// (Ver función initApp() arriba)
