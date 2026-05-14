/* =============================================================================
   Craft Admin Dashboard — Main App Initialization
   ============================================================================= */
(function() {
    // Guard: redirect to login if not authenticated
    if (!Auth.isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    // Render shell components
    Sidebar.render(document.getElementById('sidebar'));
    Topbar.render(document.getElementById('topbar'));

    // Register all page routes
    Router.register('overview', OverviewPage.render);
    Router.register('orders', OrdersPage.render);
    Router.register('returns', ReturnsPage.render);
    Router.register('products', ProductsPage.render);
    Router.register('users', UsersPage.render);
    Router.register('payments', PaymentsPage.render);
    Router.register('withdrawals', WithdrawalsPage.render);
    Router.register('courses', CoursesPage.render);
    Router.register('reviews', ReviewsPage.render);
    Router.register('coupons', CouponsPage.render);
    Router.register('reports', ReportsPage.render);
    Router.register('notifications', NotificationsPage.render);

    // Start router
    Router.init();

    // Load sidebar badge counts in background
    async function loadBadges() {
        try {
            const stats = await API.get('/admin-api/stats/');
            if (stats) {
                Sidebar.updateBadge('pending_returns', stats.pending_returns || 0);
                Sidebar.updateBadge('pending_withdrawals', stats.pending_withdrawals || 0);
            }
        } catch {}
    }
    loadBadges();
})();
