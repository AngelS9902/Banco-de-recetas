// ═══════════════════════════════════════════════════════════════════════════
// CLOUD STORAGE — Reemplaza localStorage con la tabla user_data de Supabase.
// Pattern: cache en memoria. Lecturas sync (desde cache), escrituras async
// (cache inmediato + upsert en background).
// ═══════════════════════════════════════════════════════════════════════════

const _cache = new Map();
let _userId = null;
let _ready = false;
let _pendingWrites = 0;

// Cargar todos los datos del usuario al boot. Llamar después de auth.
async function initCloudStorage() {
  const { data: { user }, error: authErr } = await supabaseClient.auth.getUser();
  if (authErr || !user) {
    console.warn('initCloudStorage: no hay sesión');
    return false;
  }
  _userId = user.id;
  const { data, error } = await supabaseClient
    .from('user_data').select('key, value')
    .eq('user_id', _userId);
  if (error) {
    console.error('initCloudStorage error:', error);
    return false;
  }
  _cache.clear();
  (data || []).forEach(row => _cache.set(row.key, row.value));
  _ready = true;
  return true;
}

function cloudReady() { return _ready; }
function cloudUserId() { return _userId; }

// Lectura sync (desde cache)
function cloudGet(key, fallback = null) {
  if (!_ready) {
    console.warn('cloudGet antes de init:', key);
    return fallback;
  }
  const v = _cache.get(key);
  return (v === undefined || v === null) ? fallback : v;
}

// Escritura: actualiza cache inmediato, hace upsert en background
function cloudSet(key, value) {
  if (!_ready || !_userId) {
    console.warn('cloudSet antes de init:', key);
    return Promise.resolve();
  }
  _cache.set(key, value);
  _pendingWrites++;
  return supabaseClient.from('user_data').upsert({
    user_id: _userId,
    key,
    value,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,key' }).then(({ error }) => {
    _pendingWrites--;
    if (error) console.error(`cloudSet error [${key}]:`, error);
  });
}

// Para debugging / barra de estado
function cloudPendingWrites() { return _pendingWrites; }

// Borrar todas las keys del cache local (logout)
function cloudClearCache() {
  _cache.clear();
  _userId = null;
  _ready = false;
}
