/* User Management Page */
const UsersPage = (() => {
    let currentTab = 'customers';
    let userData = { customers: [], suppliers: [], delivery: [] };

    async function render(container) {
        container.innerHTML = `
            <div class="page-header"><div><h1>User Management</h1><p>Manage customers, suppliers, and delivery personnel</p></div></div>
            <div class="tabs">
                <div class="tab active" data-tab="customers" onclick="UsersPage.switchTab('customers')">Customers</div>
                <div class="tab" data-tab="suppliers" onclick="UsersPage.switchTab('suppliers')">Suppliers</div>
                <div class="tab" data-tab="delivery" onclick="UsersPage.switchTab('delivery')">Delivery</div>
            </div>
            <div id="users-table"></div>`;
        await loadUsers();
    }

    async function loadUsers() {
        try {
            const data = await API.get('/admin-api/users/');
            if (data) {
                userData.customers = (data.customers || []);
                userData.suppliers = (data.suppliers || []);
                userData.delivery = (data.delivery || []);
            }
        } catch {
            // fallback: try individual endpoints
            try { const d = await API.get('/accounts/suppliers/'); userData.suppliers = d.results || d || []; } catch {}
        }
        renderTab();
    }

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        renderTab();
    }

    function renderTab() {
        const data = userData[currentTab] || [];
        if (currentTab === 'suppliers') renderSuppliers(data);
        else if (currentTab === 'delivery') renderDelivery(data);
        else renderCustomers(data);
    }

    function renderCustomers(customers) {
        DataTable.render('users-table', {
            columns: [
                { key: 'email', label: 'Email' },
                { key: 'full_name', label: 'Name', render: (v, r) => v || `${r.first_name || ''} ${r.last_name || ''}` },
                { key: 'PhoneNO', label: 'Phone' },
                { key: 'is_verified', label: 'Verified', render: v => v ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>' },
                { key: 'Balance', label: 'Balance', render: v => `EGP ${parseFloat(v||0).toFixed(2)}` },
                { key: 'date_joined', label: 'Joined', render: v => v ? new Date(v).toLocaleDateString() : '—' },
            ],
            data: customers
        });
    }

    function renderSuppliers(suppliers) {
        DataTable.render('users-table', {
            columns: [
                { key: 'name', label: 'Name', render: (v, r) => v || r.user_name || `${r.first_name || ''} ${r.last_name || ''}` },
                { key: 'CategoryTitle', label: 'Category' },
                { key: 'Rating', label: 'Rating', render: v => `⭐ ${parseFloat(v||0).toFixed(1)}` },
                { key: 'FollowersNo', label: 'Followers' },
                { key: 'Orders', label: 'Orders', render: v => v || 0 },
                { key: 'accepted_supplier', label: 'Approved', render: (v, row) => v
                    ? '<span class="badge badge-success">Approved</span>'
                    : `<button class="btn btn-sm btn-success" onclick="UsersPage.approveSupplier('${row.id}')">Approve</button>` },
            ],
            data: suppliers
        });
    }

    function renderDelivery(delivery) {
        DataTable.render('users-table', {
            columns: [
                { key: 'name', label: 'Name', render: (v, r) => v || r.user_name || '' },
                { key: 'VehicleModel', label: 'Vehicle' },
                { key: 'plateNO', label: 'Plate No' },
                { key: 'governorate', label: 'Area' },
                { key: 'Rating', label: 'Rating', render: v => `⭐ ${parseFloat(v||0).toFixed(1)}` },
                { key: 'accepted_delivery', label: 'Approved', render: (v, row) => v
                    ? '<span class="badge badge-success">Approved</span>'
                    : `<button class="btn btn-sm btn-success" onclick="UsersPage.approveDelivery('${row.id}')">Approve</button>` },
            ],
            data: delivery
        });
    }

    async function approveSupplier(id) {
        try {
            await API.patch(`/admin-api/users/supplier/${id}/`, { accepted_supplier: true });
            Toast.success('Supplier approved');
            await loadUsers();
        } catch(e) { Toast.error(e.message); }
    }

    async function approveDelivery(id) {
        try {
            await API.patch(`/admin-api/users/delivery/${id}/`, { accepted_delivery: true });
            Toast.success('Delivery person approved');
            await loadUsers();
        } catch(e) { Toast.error(e.message); }
    }

    return { render, switchTab, approveSupplier, approveDelivery };
})();
