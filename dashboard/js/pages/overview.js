/* Overview / Dashboard Home Page */
const OverviewPage = (() => {
    async function render(container) {
        container.innerHTML = `
            <div class="page-header"><div><h1>Dashboard Overview</h1><p>Welcome back! Here's what's happening today.</p></div></div>
            <div class="overview-grid" id="overview-stats">
                ${Array(6).fill('<div class="skeleton skeleton-card"></div>').join('')}
            </div>
            <div class="overview-charts">
                <div class="card"><div class="card-header"><span class="card-title">Revenue Trend</span></div><div class="chart-container"><canvas id="chart-revenue"></canvas></div></div>
                <div class="card"><div class="card-header"><span class="card-title">Orders by Status</span></div><div class="chart-container"><canvas id="chart-orders-status"></canvas></div></div>
            </div>
            <div class="overview-bottom">
                <div class="card"><div class="card-header"><span class="card-title">Recent Orders</span></div><div id="recent-orders-table"></div></div>
                <div class="card"><div class="card-header"><span class="card-title">Pending Returns</span></div><div id="pending-returns-list"></div></div>
            </div>`;
        loadStats();
        loadCharts();
        loadRecentOrders();
        loadPendingReturns();
    }

    async function loadStats() {
        try {
            const stats = await API.get('/admin-api/stats/');
            const icons = {
                revenue: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>',
                orders: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>',
                users: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
                returns: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
                products: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
                withdrawals: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>'
            };
            document.getElementById('overview-stats').innerHTML =
                StatsCard.render('Total Revenue', `EGP ${(stats.total_revenue || 0).toLocaleString()}`, icons.revenue, 'accent', stats.revenue_change) +
                StatsCard.render('Total Orders', stats.total_orders || 0, icons.orders, 'primary', stats.orders_change) +
                StatsCard.render('Active Users', stats.active_users || 0, icons.users, 'info') +
                StatsCard.render('Pending Returns', stats.pending_returns || 0, icons.returns, 'warning') +
                StatsCard.render('Products In Stock', stats.products_in_stock || 0, icons.products, 'success') +
                StatsCard.render('Pending Withdrawals', stats.pending_withdrawals || 0, icons.withdrawals, 'danger');
            Sidebar.updateBadge('pending_returns', stats.pending_returns || 0);
            Sidebar.updateBadge('pending_withdrawals', stats.pending_withdrawals || 0);
        } catch {
            document.getElementById('overview-stats').innerHTML =
                StatsCard.render('Total Revenue', 'EGP 0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/></svg>', 'accent') +
                StatsCard.render('Total Orders', '0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/></svg>', 'primary') +
                StatsCard.render('Active Users', '0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>', 'info') +
                StatsCard.render('Pending Returns', '0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/></svg>', 'warning') +
                StatsCard.render('Products', '0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/></svg>', 'success') +
                StatsCard.render('Withdrawals', '0', '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/></svg>', 'danger');
        }
    }

    async function loadCharts() {
        try {
            const data = await API.get('/admin-api/charts/');
            if (data && data.revenue_labels) {
                Charts.line('chart-revenue', data.revenue_labels, [{ label: 'Revenue', data: data.revenue_data }]);
                Charts.doughnut('chart-orders-status', data.status_labels || ['Created','Delivered','Cancelled'], data.status_data || [0,0,0]);
            } else {
                Charts.line('chart-revenue', ['Jan','Feb','Mar','Apr','May'], [{ label: 'Revenue', data: [0,0,0,0,0] }]);
                Charts.doughnut('chart-orders-status', ['No Data'], [1]);
            }
        } catch {
            Charts.line('chart-revenue', ['Jan','Feb','Mar','Apr','May'], [{ label: 'Revenue', data: [0,0,0,0,0] }]);
            Charts.doughnut('chart-orders-status', ['No Data'], [1]);
        }
    }

    async function loadRecentOrders() {
        try {
            const orders = await API.get('/admin-api/orders/');
            const recent = (orders || []).slice(0, 5);
            const el = document.getElementById('recent-orders-table');
            if (recent.length === 0) { el.innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);padding:var(--space-8)">No orders yet</p>'; return; }
            el.innerHTML = '<table class="data-table"><thead><tr><th>Order #</th><th>Customer</th><th>Status</th><th>Amount</th></tr></thead><tbody>' +
                recent.map(o => `<tr>
                    <td style="font-family:var(--font-mono);font-size:var(--fs-xs)">${o.order_number || o.id?.slice(0,8)}</td>
                    <td style="font-size:var(--fs-xs)">${o.user_email || '—'}</td>
                    <td>${statusBadge(o.status)}</td>
                    <td>EGP ${parseFloat(o.final_amount || o.total_amount || 0).toLocaleString()}</td>
                </tr>`).join('') +
                '</tbody></table>';
        } catch { document.getElementById('recent-orders-table').innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);padding:var(--space-8)">Could not load orders</p>'; }
    }

    async function loadPendingReturns() {
        try {
            const data = await API.get('/admin-api/returns/');
            const returns = (data || []).filter(r => r.status === 'new').slice(0, 5);
            const el = document.getElementById('pending-returns-list');
            if (returns.length === 0) { el.innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);padding:var(--space-8)">No pending returns</p>'; return; }
            el.innerHTML = returns.map(r => `<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--space-3) 0;border-bottom:1px solid var(--clr-surface-border)">
                <div><div style="font-size:var(--fs-sm);font-weight:var(--fw-medium)">${r.product_name || 'Product'}</div><div style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${r.reason || ''}</div></div>
                <span class="badge badge-warning">EGP ${parseFloat(r.amount || 0).toFixed(2)}</span>
            </div>`).join('');
        } catch { document.getElementById('pending-returns-list').innerHTML = '<p style="text-align:center;color:var(--clr-text-muted);padding:var(--space-8)">Could not load returns</p>'; }
    }

    function statusBadge(s) {
        const map = { created: 'info', ready_to_ship: 'primary', 'on my way': 'warning', 'delivered successfully': 'success', cancelled: 'danger', 'failed delivery': 'danger' };
        return `<span class="badge badge-${map[s] || 'neutral'} badge-dot">${(s || 'unknown').replace(/_/g, ' ')}</span>`;
    }

    return { render };
})();
