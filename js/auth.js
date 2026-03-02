/* ═══════════════════════════════════════════════════════════
   NeuroCare AI — Auth Module
   localStorage-based authentication for demo purposes
   ═══════════════════════════════════════════════════════════ */

const NeuroCareAuth = (function () {
  'use strict';

  const AUTH_KEY = 'ncAuthUser';
  const USERS_KEY = 'ncUsers';

  // ── Helpers ──
  function _getUsers() {
    try {
      return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch { return []; }
  }

  function _saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  // ── Public API ──

  function isAuthenticated() {
    try {
      return !!localStorage.getItem(AUTH_KEY);
    } catch { return false; }
  }

  function getCurrentUser() {
    try {
      const data = localStorage.getItem(AUTH_KEY);
      return data ? JSON.parse(data) : null;
    } catch { return null; }
  }

  function login(email, password) {
    if (!email || !password) return { ok: false, error: 'Please fill in all fields.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const users = _getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existing && existing.password !== password) {
      return { ok: false, error: 'Incorrect password.' };
    }

    const user = existing || {
      email: email,
      name: email.split('@')[0],
      role: 'parent',
      createdAt: new Date().toISOString()
    };

    if (!existing) {
      user.password = password;
      users.push(user);
      _saveUsers(users);
    }

    const safeUser = { email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
    return { ok: true, user: safeUser };
  }

  function signup(name, email, password, role) {
    if (!name || !email || !password) return { ok: false, error: 'Please fill in all fields.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };

    const users = _getUsers();
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) return { ok: false, error: 'An account with this email already exists.' };

    const user = {
      email: email,
      name: name,
      role: role || 'parent',
      password: password,
      createdAt: new Date().toISOString()
    };

    users.push(user);
    _saveUsers(users);

    const safeUser = { email: user.email, name: user.name, role: user.role, createdAt: user.createdAt };
    localStorage.setItem(AUTH_KEY, JSON.stringify(safeUser));
    return { ok: true, user: safeUser };
  }

  function logout() {
    try { localStorage.removeItem(AUTH_KEY); } catch { }
    window.location.href = 'index.html';
  }

  function requireAuth(redirectUrl) {
    if (!isAuthenticated()) {
      const target = redirectUrl || window.location.href;
      window.location.href = 'login.html?redirect=' + encodeURIComponent(target);
      return false;
    }
    return true;
  }

  function getRedirectUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get('redirect') || null;
  }

  function getDashboardUrl() {
    const user = getCurrentUser();
    if (user && user.role === 'clinician') return 'clinician-dashboard.html';
    return 'parent-dashboard.html';
  }

  function getLogoUrl() {
    return isAuthenticated() ? getDashboardUrl() : 'index.html';
  }

  function getInitials(name) {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  // ── Guard Links ──
  function guardLinks() {
    document.querySelectorAll('[data-requires-auth="true"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (!isAuthenticated()) {
          e.preventDefault();
          const href = link.getAttribute('href') || link.dataset.href;
          window.location.href = 'login.html?redirect=' + encodeURIComponent(href);
        }
      });
    });
  }

  // ── Update Nav Auth State ──
  function updateNavAuth() {
    const ctaBtn = document.getElementById('navAuthBtn');
    const userEl = document.getElementById('navUserArea');

    if (isAuthenticated()) {
      const user = getCurrentUser();
      if (ctaBtn) ctaBtn.style.display = 'none';
      if (userEl) {
        userEl.style.display = 'flex';
        const avatarEl = userEl.querySelector('.nav-user-avatar');
        const nameEl = userEl.querySelector('.nav-user-name');
        if (avatarEl) avatarEl.textContent = getInitials(user.name);
        if (nameEl) nameEl.textContent = user.name || user.email;
      }
    } else {
      if (ctaBtn) ctaBtn.style.display = '';
      if (userEl) userEl.style.display = 'none';
    }
  }

  // ── Init user dropdown if present ──
  function initUserDropdown() {
    const userEl = document.getElementById('navUserArea');
    const dropdown = document.getElementById('navUserDropdown');
    if (!userEl || !dropdown) return;

    userEl.addEventListener('click', function (e) {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    document.addEventListener('click', function () {
      dropdown.classList.remove('open');
    });

    const logoutBtn = dropdown.querySelector('.logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        logout();
      });
    }
  }

  // ── Auto-init ──
  function init() {
    updateNavAuth();
    guardLinks();
    initUserDropdown();
  }

  document.addEventListener('DOMContentLoaded', init);

  return {
    isAuthenticated,
    getCurrentUser,
    login,
    signup,
    logout,
    requireAuth,
    getRedirectUrl,
    getDashboardUrl,
    getLogoUrl,
    getInitials,
    guardLinks,
    updateNavAuth,
    init
  };
})();
