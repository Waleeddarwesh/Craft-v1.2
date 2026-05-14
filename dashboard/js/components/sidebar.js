/* Sidebar Navigation Component */
const Sidebar = (() => {
    const ICONS = {
        overview: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
        orders: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>',
        returns: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
        products: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
        users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
        payments: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
        withdrawals: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
        courses: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>',
        reviews: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        coupons: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
        reports: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>',
        notifications: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
        logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>'
    };

    const NAV_ITEMS = [
        { section: 'Main', items: [
            { route: 'overview', label: 'Overview', icon: 'overview' },
            { route: 'orders', label: 'Orders', icon: 'orders' },
            { route: 'returns', label: 'Returns', icon: 'returns', badgeKey: 'pending_returns' },
            { route: 'products', label: 'Products', icon: 'products' },
        ]},
        { section: 'Management', items: [
            { route: 'users', label: 'Users', icon: 'users' },
            { route: 'payments', label: 'Payments', icon: 'payments' },
            { route: 'withdrawals', label: 'Withdrawals', icon: 'withdrawals', badgeKey: 'pending_withdrawals' },
            { route: 'coupons', label: 'Coupons', icon: 'coupons' },
        ]},
        { section: 'Content', items: [
            { route: 'courses', label: 'Courses', icon: 'courses' },
            { route: 'reviews', label: 'Reviews', icon: 'reviews' },
            { route: 'notifications', label: 'Notifications', icon: 'notifications' },
        ]},
        { section: 'Analytics', items: [
            { route: 'reports', label: 'Reports', icon: 'reports' },
        ]}
    ];

    function render(container) {
        const current = Router.getCurrentRoute();
        let html = `
            <div class="sidebar-brand">
                <div class="sidebar-brand-icon">C</div>
                <span class="sidebar-brand-text">Craft Admin</span>
            </div>
            <nav class="sidebar-nav">`;

        NAV_ITEMS.forEach(section => {
            html += `<div class="sidebar-section"><div class="sidebar-section-label">${section.section}</div>`;
            section.items.forEach(item => {
                const active = current === item.route ? 'active' : '';
                html += `<div class="nav-item ${active}" data-route="${item.route}" onclick="Router.navigate('#${item.route}')">
                    ${ICONS[item.icon]}
                    <span class="nav-label">${item.label}</span>
                    ${item.badgeKey ? `<span class="nav-badge" id="badge-${item.badgeKey}" style="display:none">0</span>` : ''}
                </div>`;
            });
            html += '</div>';
        });

        html += `</nav>
            <div class="sidebar-footer">
                <div class="nav-item" onclick="Auth.logout()">
                    ${ICONS.logout}
                    <span class="nav-label">Sign Out</span>
                </div>
            </div>`;

        container.innerHTML = html;
    }

    function updateBadge(key, count) {
        const badge = document.getElementById(`badge-${key}`);
        if (badge) {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline' : 'none';
        }
    }

    function toggleCollapse() {
        document.getElementById('sidebar').classList.toggle('collapsed');
    }

    return { render, updateBadge, toggleCollapse };
})();
