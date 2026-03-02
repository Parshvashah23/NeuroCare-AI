/* ═══════════════════════════════════════════════════════════
   NeuroCare AI — Navigation Module
   Active link detection, mobile menu, shared helpers
   ═══════════════════════════════════════════════════════════ */

const NeuroCareNav = (function () {
    'use strict';

    // ── Detect current page and mark nav link active ──
    function markActiveLink() {
        const currentFile = window.location.pathname.split('/').pop() || 'index.html';

        // Top nav links
        document.querySelectorAll('.nc-nav .nav-link').forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href) return;
            const linkFile = href.split('/').pop().split('?')[0].split('#')[0];
            link.classList.toggle('active', linkFile === currentFile);
        });

        // Sidebar links
        document.querySelectorAll('.nc-sidebar .sb-item').forEach(function (link) {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const linkFile = href.split('/').pop().split('?')[0].split('#')[0];
            link.classList.toggle('active', linkFile === currentFile);
        });
    }

    // ── Mobile hamburger toggle ──
    function initMobileMenu() {
        const hamburger = document.querySelector('.nav-hamburger');
        const navLinks = document.querySelector('.nc-nav .nav-links');
        if (!hamburger || !navLinks) return;

        hamburger.addEventListener('click', function () {
            navLinks.classList.toggle('open');
            const isOpen = navLinks.classList.contains('open');
            hamburger.textContent = isOpen ? '✕' : '☰';
            hamburger.setAttribute('aria-expanded', isOpen);
        });

        // Close on link click (mobile)
        navLinks.querySelectorAll('.nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                navLinks.classList.remove('open');
                hamburger.textContent = '☰';
            });
        });
    }

    // ── Breadcrumb generation ──
    function buildBreadcrumbs(containerEl, crumbs) {
        if (!containerEl || !crumbs) return;
        containerEl.innerHTML = '';
        crumbs.forEach(function (crumb, i) {
            if (i > 0) {
                const div = document.createElement('span');
                div.className = 'divider';
                containerEl.appendChild(div);
            }
            if (crumb.href && i < crumbs.length - 1) {
                const a = document.createElement('a');
                a.href = crumb.href;
                a.textContent = crumb.label;
                containerEl.appendChild(a);
            } else {
                const span = document.createElement('span');
                span.textContent = crumb.label;
                containerEl.appendChild(span);
            }
        });
    }

    // ── Update sidebar user info ──
    function updateSidebarUser() {
        if (typeof NeuroCareAuth === 'undefined') return;
        const user = NeuroCareAuth.getCurrentUser();
        if (!user) return;

        const nameEl = document.querySelector('.nc-sidebar .sb-user-name');
        const roleEl = document.querySelector('.nc-sidebar .sb-user-role');
        const avatarEl = document.querySelector('.nc-sidebar .sb-avatar');

        if (nameEl) nameEl.textContent = user.name || user.email;
        if (roleEl) roleEl.textContent = user.role === 'clinician' ? 'Clinician' : 'Parent / Caregiver';
        if (avatarEl) avatarEl.textContent = NeuroCareAuth.getInitials(user.name);
    }

    // ── Init ──
    function init() {
        markActiveLink();
        initMobileMenu();
        updateSidebarUser();
    }

    document.addEventListener('DOMContentLoaded', init);

    return {
        markActiveLink,
        initMobileMenu,
        buildBreadcrumbs,
        updateSidebarUser,
        init
    };
})();
