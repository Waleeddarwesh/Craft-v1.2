/* =============================================================================
   Client-Side Hash Router
   ============================================================================= */
const Router = (() => {
    const routes = {};
    let currentPage = null;

    function register(hash, handler) {
        routes[hash] = handler;
    }

    function navigate(hash) {
        window.location.hash = hash;
    }

    function getCurrentRoute() {
        return window.location.hash.slice(1) || 'overview';
    }

    async function handleRoute() {
        const route = getCurrentRoute();
        const handler = routes[route];
        const content = document.getElementById('main-content');

        if (!handler) {
            content.innerHTML = `<div class="empty-state"><h3>Page not found</h3><p>The page "${route}" does not exist.</p></div>`;
            return;
        }

        // Show loading
        content.innerHTML = '<div class="page-loader"><div class="spinner spinner-lg"></div><p>Loading...</p></div>';
        content.style.opacity = '0';

        // Update sidebar active state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.route === route);
        });

        // Update page title
        const titles = {
            overview: 'Dashboard', orders: 'Orders', returns: 'Return Requests',
            products: 'Products', users: 'Users', payments: 'Payments',
            withdrawals: 'Withdrawals', courses: 'Courses', reviews: 'Reviews',
            coupons: 'Coupons', reports: 'Reports', notifications: 'Notifications'
        };
        document.title = `Craft Admin — ${titles[route] || route}`;

        try {
            await handler(content);
        } catch (err) {
            content.innerHTML = `<div class="empty-state"><h3>Error loading page</h3><p>${err.message}</p></div>`;
            console.error('Route error:', err);
        }

        // Animate in
        requestAnimationFrame(() => {
            content.style.transition = 'opacity 0.3s ease';
            content.style.opacity = '1';
        });
        currentPage = route;
    }

    function init() {
        window.addEventListener('hashchange', handleRoute);
        if (!window.location.hash || window.location.hash === '#') {
            window.location.hash = '#overview';
            // hashchange fires automatically since we changed the hash
        } else {
            // Hash already set (e.g. page refresh on #orders) — hashchange won't fire
            handleRoute();
        }
    }

    return { register, navigate, getCurrentRoute, init, handleRoute };
})();
