// ═══════════════════════════════════════════════════════════════════════════
// AUTH — Sistema de usuarios y contraseñas (client-side, localStorage)
//
// Nota de seguridad: las contraseñas se hashean con SHA-256 pero localStorage
// no es un almacenamiento seguro. Cualquier persona con acceso al navegador
// puede leerlo. Para producción real conviene un backend con auth real.
// ═══════════════════════════════════════════════════════════════════════════

const USERS_KEY = 'app_users';
const CURRENT_USER_KEY = 'current_user_id';
const IMPERSONATE_KEY = 'impersonate_original_id';

// Map de keys legacy → suffix nuevo (para migración del primer admin)
const LEGACY_KEY_MAP = {
  'angel_v2':            'recipes',
  'angel_profile':       'profile',
  'angel_custom_foods':  'custom_foods',
  'angel_shop_list':     'shop_list',
  'angel_shop_history':  'shop_history',
  'angel_price_db':      'price_db',
  'angel_stores':        'stores',
};

// ─── HASH ────────────────────────────────────────────────────────────────────
async function hashPassword(plain) {
  const enc = new TextEncoder().encode(plain);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ─── USERS LIST ──────────────────────────────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') || []; }
  catch(e) { return []; }
}
function setUsers(u) { localStorage.setItem(USERS_KEY, JSON.stringify(u)); }

// ─── SESSION ─────────────────────────────────────────────────────────────────
function getCurrentUserId() { return localStorage.getItem(CURRENT_USER_KEY); }
function setCurrentUserId(id) { localStorage.setItem(CURRENT_USER_KEY, id); }
function clearCurrentUser() { localStorage.removeItem(CURRENT_USER_KEY); }

function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  return getUsers().find(u => u.id === id) || null;
}

function isAdmin() {
  const u = getCurrentUser();
  return u && u.role === 'admin';
}

// ─── NAMESPACED KEYS ─────────────────────────────────────────────────────────
function userKey(suffix) {
  const id = getCurrentUserId();
  if (!id) throw new Error('No hay sesión activa');
  return `user_${id}_${suffix}`;
}

// ─── DETECCIÓN DE ESTADO INICIAL ─────────────────────────────────────────────
function hasLegacyData() {
  return Object.keys(LEGACY_KEY_MAP).some(k => localStorage.getItem(k) !== null);
}

function authInitialState() {
  const users = getUsers();
  if (users.length === 0) {
    return hasLegacyData() ? 'setup_admin_migrate' : 'setup_admin_fresh';
  }
  return getCurrentUserId() ? 'logged_in' : 'login';
}

// ─── SETUP ADMIN (primer usuario, con migración opcional) ────────────────────
async function setupAdmin(username, password) {
  if (getUsers().length > 0) throw new Error('Ya existe un administrador');
  const passwordHash = await hashPassword(password);
  const adminId = 'admin_' + Date.now();
  const admin = {
    id: adminId,
    username,
    passwordHash,
    role: 'admin',
    createdAt: Date.now(),
  };
  setUsers([admin]);
  // Migra datos legacy si existen
  for (const [oldKey, suffix] of Object.entries(LEGACY_KEY_MAP)) {
    const val = localStorage.getItem(oldKey);
    if (val !== null) {
      localStorage.setItem(`user_${adminId}_${suffix}`, val);
      localStorage.removeItem(oldKey);
    }
  }
  setCurrentUserId(adminId);
  return admin;
}

// ─── SIGNUP (usuario nuevo) ──────────────────────────────────────────────────
async function signupUser(username, password) {
  username = (username || '').trim();
  if (username.length < 3) throw new Error('Usuario mínimo 3 caracteres');
  if ((password||'').length < 4) throw new Error('Contraseña mínimo 4 caracteres');
  const users = getUsers();
  if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Ese nombre de usuario ya existe');
  }
  const passwordHash = await hashPassword(password);
  const newUser = {
    id: 'u_' + Date.now(),
    username,
    passwordHash,
    role: 'user',
    createdAt: Date.now(),
  };
  users.push(newUser);
  setUsers(users);
  return newUser;
}

// ─── LOGIN ───────────────────────────────────────────────────────────────────
async function loginUser(username, password) {
  username = (username || '').trim();
  const passwordHash = await hashPassword(password || '');
  const u = getUsers().find(x =>
    x.username.toLowerCase() === username.toLowerCase() &&
    x.passwordHash === passwordHash
  );
  if (!u) throw new Error('Usuario o contraseña incorrectos');
  setCurrentUserId(u.id);
  return u;
}

// ─── LOGOUT ──────────────────────────────────────────────────────────────────
function logout() {
  localStorage.removeItem(IMPERSONATE_KEY);
  clearCurrentUser();
  location.href = 'login.html';
}

// ─── IMPERSONATION (admin → user) ────────────────────────────────────────────
function impersonate(targetUserId) {
  const me = getCurrentUser();
  if (!me || me.role !== 'admin') throw new Error('Solo admin puede impersonar');
  const target = getUsers().find(u => u.id === targetUserId);
  if (!target) throw new Error('Usuario no existe');
  // Guarda quién es el admin original
  localStorage.setItem(IMPERSONATE_KEY, me.id);
  setCurrentUserId(target.id);
}

function isImpersonating() {
  return !!localStorage.getItem(IMPERSONATE_KEY);
}

function stopImpersonating() {
  const originalId = localStorage.getItem(IMPERSONATE_KEY);
  if (!originalId) return;
  setCurrentUserId(originalId);
  localStorage.removeItem(IMPERSONATE_KEY);
}

// ─── USER MGMT (admin only) ──────────────────────────────────────────────────
function deleteUser(userId) {
  const me = getCurrentUser();
  if (!me || me.role !== 'admin') throw new Error('Solo admin');
  if (userId === me.id) throw new Error('No puedes eliminarte a ti mismo');
  // Borra keys del usuario
  const prefix = `user_${userId}_`;
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith(prefix)) localStorage.removeItem(k);
  });
  setUsers(getUsers().filter(u => u.id !== userId));
}

async function changeUserPassword(userId, newPassword) {
  if ((newPassword||'').length < 4) throw new Error('Contraseña mínimo 4 caracteres');
  const users = getUsers();
  const u = users.find(x => x.id === userId);
  if (!u) throw new Error('Usuario no existe');
  u.passwordHash = await hashPassword(newPassword);
  setUsers(users);
}

// ─── GUARD: usar al inicio de páginas protegidas ─────────────────────────────
function requireAuth() {
  if (!getCurrentUserId()) {
    location.replace('login.html');
    throw new Error('redirect_to_login');
  }
}

// ─── HEADER UI (inyectable) ──────────────────────────────────────────────────
// LEGACY: dejado por compatibilidad. Ahora preferimos topBarHTML + menuDrawerHTML.
function userMenuHTML() {
  return ''; // El menú de usuario vive en el drawer lateral, no en los pills.
}

// Top bar fija arriba del header con hamburguesa (izq) y carrito + notif (der).
// cartCount: número opcional para el badge del botón "Lista". showCart: boolean.
function topBarHTML(opts) {
  opts = opts || {};
  const showCart = opts.showCart !== false; // default true
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

// Drawer lateral con cuenta + acciones de usuario
function menuDrawerHTML() {
  const u = getCurrentUser();
  if (!u) return '';
  const initials = (u.username || '?').slice(0, 2).toUpperCase();
  const adminItem = u.role === 'admin'
    ? `<a class="menu-item" href="admin.html"><span class="menu-item-icon">⚙</span> Panel admin</a>`
    : '';
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
      <a class="menu-item" href="plan_angel_2.html"><span class="menu-item-icon">🍽</span> Banco de recetas</a>
      <a class="menu-item" href="lista_compras.html"><span class="menu-item-icon">🛒</span> Lista de compras</a>
      ${adminItem}
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

// Helper: inyecta top-bar y drawer en cualquier página. Llamar después de cargar auth.js.
function mountTopBarAndDrawer(opts) {
  const headerEl = document.querySelector('.header');
  if (headerEl && !document.querySelector('.top-bar')) {
    headerEl.insertAdjacentHTML('afterbegin', topBarHTML(opts));
  }
  if (!document.getElementById('menuDrawer')) {
    document.body.insertAdjacentHTML('beforeend', menuDrawerHTML());
  }
}

function impersonationBannerHTML() {
  if (!isImpersonating()) return '';
  const u = getCurrentUser();
  return `
    <div class="impersonate-banner">
      <span>👁 Viendo como <strong>${escapeHtmlAuth(u ? u.username : '?')}</strong></span>
      <button onclick="stopImpersonating();location.reload()">← Volver a mi cuenta</button>
    </div>
  `;
}

function escapeHtmlAuth(s) {
  return (s == null ? '' : String(s))
    .replace(/&/g,'&amp;').replace(/"/g,'&quot;')
    .replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
