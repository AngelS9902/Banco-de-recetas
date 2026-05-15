// ═══════════════════════════════════════════════════════════════════════════
// AUTH — Wrapper de Supabase Auth.
// Mantiene la API antigua (getCurrentUser, requireAuth, isAdmin, etc.) para
// que el resto del código siga funcionando sin cambios masivos.
// ═══════════════════════════════════════════════════════════════════════════

// Cache local del usuario actual (poblado por refreshSession)
let _currentUser = null;

// ─── SESSION ──────────────────────────────────────────────────────────────
async function refreshSession() {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { _currentUser = null; return null; }
  // role/profile lo leemos de cloudStorage si está disponible, sino default
  let role = 'user', username = user.email || user.id;
  if (typeof cloudReady === 'function' && cloudReady()) {
    const prof = cloudGet('profile', {});
    role = prof.role || 'user';
    username = prof.name || username;
  }
  _currentUser = {
    id: user.id,
    email: user.email,
    username,
    role,
    createdAt: new Date(user.created_at).getTime(),
  };
  return _currentUser;
}

function getCurrentUser() { return _currentUser; }
function getCurrentUserId() { return _currentUser ? _currentUser.id : null; }
function isAdmin() { return _currentUser && _currentUser.role === 'admin'; }

// ─── SIGNUP / LOGIN / LOGOUT ──────────────────────────────────────────────
async function signupUser(email, password, username) {
  email = (email || '').trim();
  if ((password || '').length < 6) throw new Error('Contraseña mínimo 6 caracteres');
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
    options: {
      data: { name: username || email.split('@')[0] }
    }
  });
  if (error) throw new Error('Signup: ' + error.message);
  return data.user;
}

async function loginUser(email, password) {
  email = (email || '').trim();
  const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) throw new Error('Login: ' + error.message);
  // Si es primera vez, crea el profile en user_data
  await ensureProfileExists(data.user);
  return data.user;
}

async function ensureProfileExists(user) {
  if (!user) return;
  const { data, error } = await supabaseClient
    .from('user_data')
    .select('key')
    .eq('user_id', user.id)
    .eq('key', 'profile')
    .maybeSingle();
  if (data) return; // ya existe
  // Crear profile inicial
  const name = (user.user_metadata && user.user_metadata.name) || (user.email || '').split('@')[0];
  await supabaseClient.from('user_data').insert({
    user_id: user.id,
    key: 'profile',
    value: {
      name, age: 25, weight: 70, height: 170,
      sex: 'male', activity: 'moderate', role: 'user'
    }
  });
}

async function logout() {
  await supabaseClient.auth.signOut();
  if (typeof cloudClearCache === 'function') cloudClearCache();
  _currentUser = null;
  location.href = 'login.html';
}

// ─── ESTADO INICIAL ───────────────────────────────────────────────────────
async function authInitialState() {
  const user = await refreshSession();
  return user ? 'logged_in' : 'login';
}

// ─── GUARD: usar al inicio de páginas protegidas ──────────────────────────
async function requireAuth() {
  const user = await refreshSession();
  if (!user) {
    location.replace('login.html');
    throw new Error('redirect_to_login');
  }
  return user;
}

// ─── PASSWORD CHANGE (propio usuario) ─────────────────────────────────────
async function changeMyPassword(newPassword) {
  if ((newPassword || '').length < 6) throw new Error('Contraseña mínimo 6 caracteres');
  const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  if (error) throw new Error(error.message);
}

// ─── IMPERSONATION — deshabilitado en modo cloud (requiere service_role) ──
function isImpersonating() { return false; }
function stopImpersonating() {}
function impersonationBannerHTML() { return ''; }

// ─── ADMIN OPS — placeholders por ahora ───────────────────────────────────
async function getUsers() {
  // Para listar usuarios necesitas service_role o un edge function.
  // Por ahora retorna solo al usuario actual.
  return _currentUser ? [_currentUser] : [];
}

// ─── TOP BAR + DRAWER UI ──────────────────────────────────────────────────
function userMenuHTML() { return ''; } // legacy

function topBarHTML(opts) {
  opts = opts || {};
  const showCart = opts.showCart !== false;
  const cartCount = opts.cartCount || 0;
  const notifCount = opts.notifCount || 0;
  const cartBtn = showCart ? `
    <a class="top-bar-btn-cart" href="lista_compras.html" title="Lista de compras">
      🛒 Lista${cartCount > 0 ? `<span class="cart-badge">${cartCount}</span>` : ''}
    </a>` : '';
  const notifBtn = notifCount > 0 ? `
    <button class="top-bar-btn" title="Notificaciones" onclick="alert('Próximamente: notificaciones')">
      🔔<span class="notif-badge">${notifCount}</span>
    </button>` : '';
  return `
    <div class="top-bar">
      <div class="top-bar-left">
        <button class="top-bar-btn" onclick="toggleMenu()" title="Menú" aria-label="Abrir menú">≡</button>
      </div>
      <div class="top-bar-right">
        ${notifBtn}
        ${cartBtn}
      </div>
    </div>
  `;
}

function menuDrawerHTML() {
  const u = getCurrentUser();
  if (!u) return '';
  const initials = (u.username || '?').slice(0, 2).toUpperCase();
  return `
    <div class="menu-drawer-overlay" id="menuDrawerOverlay" onclick="toggleMenu()"></div>
    <div class="menu-drawer" id="menuDrawer">
      <button class="menu-close" onclick="toggleMenu()" aria-label="Cerrar menú">×</button>
      <div class="menu-drawer-header">
        <div class="menu-avatar">${escapeHtmlAuth(initials)}</div>
        <div class="menu-user-info">
          <div class="menu-user-name">${escapeHtmlAuth(u.username)}</div>
          <div class="menu-user-role">${u.role === 'admin' ? 'Administrador' : 'Usuario'}</div>
        </div>
      </div>
      <div class="menu-section-label">Navegación</div>
      <a class="menu-item" href="home.html"><span class="menu-item-icon">🍽</span> Banco de recetas</a>
      <a class="menu-item" href="lista_compras.html"><span class="menu-item-icon">🛒</span> Lista de compras</a>
      <a class="menu-item" href="mi_cuenta.html"><span class="menu-item-icon">👤</span> Mi cuenta</a>
      <div class="menu-divider"></div>
      <button class="menu-item menu-item-logout" onclick="logout()"><span class="menu-item-icon">⎋</span> Cerrar sesión</button>
    </div>
  `;
}

function toggleMenu() {
  const drawer = document.getElementById('menuDrawer');
  const overlay = document.getElementById('menuDrawerOverlay');
  if (!drawer || !overlay) return;
  drawer.classList.toggle('open');
  overlay.classList.toggle('open');
}

function mountTopBarAndDrawer(opts) {
  const headerEl = document.querySelector('.header');
  if (headerEl && !document.querySelector('.top-bar')) {
    headerEl.insertAdjacentHTML('afterbegin', topBarHTML(opts));
  }
  if (!document.getElementById('menuDrawer')) {
    document.body.insertAdjacentHTML('beforeend', menuDrawerHTML());
  }
}

function escapeHtmlAuth(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
