/* Orders Management Page */
const OrdersPage = (() => {
    const STATUS_MAP = { created:'info', ready_to_ship:'primary', 'on my way':'warning', 'In Transmit':'warning', 'delivered to First warehouse':'info', 'delivered to Second warehouse':'info', 'delivered successfully':'success', 'failed delivery':'danger', cancelled:'danger' };

    async function render(container) {
        container.innerHTML = `
            <div class="page-header"><div><h1>Orders Management</h1><p>Track and manage all customer orders</p></div></div>
            <div class="filter-bar mb-6">
                <select id="order-status-filter" onchange="OrdersPage.applyFilter()">
                    <option value="">All Statuses</option>
                    <option value="created">Created</option>
                    <option value="ready_to_ship">Ready to Ship</option>
                    <option value="on my way">On My Way</option>
                    <option value="delivered successfully">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                </select>
                <select id="order-payment-filter" onchange="OrdersPage.applyFilter()">
                    <option value="">All Payments</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Balance">Balance</option>
                </select>
            </div>
            <div id="orders-table"></div>`;
        await loadOrders();
    }

    let allOrders = [];
    async function loadOrders() {
        try {
            const data = await API.get('/admin-api/orders/');
            allOrders = data || [];
            renderTable(allOrders);
        } catch(e) { document.getElementById('orders-table').innerHTML = `<div class="empty-state"><h3>Could not load orders</h3><p>${e.message}</p></div>`; }
    }

    function renderTable(orders) {
        DataTable.render('orders-table', {
            columns: [
                { key: 'order_number', label: 'Order #', render: v => `<span style="font-family:var(--font-mono);font-size:var(--fs-xs)">${v || '—'}</span>` },
                { key: 'user_email', label: 'Customer', render: (v, row) => `<span class="truncate" style="max-width:160px;display:inline-block">${v || row.user || '—'}</span>` },
                { key: 'final_amount', label: 'Total', render: v => `EGP ${parseFloat(v || 0).toLocaleString()}` },
                { key: 'payment_method', label: 'Payment' },
                { key: 'status', label: 'Status', render: v => `<span class="badge badge-${STATUS_MAP[v] || 'neutral'} badge-dot">${(v||'').replace(/_/g,' ')}</span>` },
                { key: 'paid', label: 'Paid', render: v => v ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>' },
                { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleDateString() : '—' },
                { key: '_actions', label: '', render: (_, row) => `<button class="btn btn-sm btn-ghost" onclick="OrdersPage.viewOrder('${row.id}')">View</button>` }
            ],
            data: orders,
            onRowClick: (row) => viewOrder(row.id)
        });
    }

    function applyFilter() {
        const status = document.getElementById('order-status-filter').value;
        const payment = document.getElementById('order-payment-filter').value;
        let filtered = allOrders;
        if (status) filtered = filtered.filter(o => o.status === status);
        if (payment) filtered = filtered.filter(o => o.payment_method === payment);
        renderTable(filtered);
    }

    async function viewOrder(id) {
        try {
            const order = allOrders.find(o => o.id === id);
            if (!order) return;
            const items = order.items || [];
            const body = `
                <div class="detail-grid mb-4">
                    <div class="detail-item"><span class="detail-label">Order Number</span><span class="detail-value">${order.order_number || ''}</span></div>
                    <div class="detail-item"><span class="detail-label">Customer</span><span class="detail-value">${order.user_email || ''}</span></div>
                    <div class="detail-item"><span class="detail-label">Status</span><span class="detail-value"><span class="badge badge-${STATUS_MAP[order.status]||'neutral'} badge-dot">${order.status}</span></span></div>
                    <div class="detail-item"><span class="detail-label">Payment</span><span class="detail-value">${order.payment_method || ''}</span></div>
                    <div class="detail-item"><span class="detail-label">Subtotal</span><span class="detail-value">EGP ${parseFloat(order.total_amount || 0).toFixed(2)}</span></div>
                    <div class="detail-item"><span class="detail-label">Discount</span><span class="detail-value">EGP ${parseFloat(order.discount_amount || 0).toFixed(2)}</span></div>
                    <div class="detail-item"><span class="detail-label">Delivery Fee</span><span class="detail-value">EGP ${parseFloat(order.delivery_fee || 0).toFixed(2)}</span></div>
                    <div class="detail-item"><span class="detail-label">Final Amount</span><span class="detail-value" style="font-weight:var(--fw-bold);color:var(--clr-accent)">EGP ${parseFloat(order.final_amount || 0).toFixed(2)}</span></div>
                    <div class="detail-item"><span class="detail-label">Paid</span><span class="detail-value">${order.paid ? '<span class="text-success">✓ Yes</span>' : '<span class="text-danger">✗ No</span>'}</span></div>
                    <div class="detail-item"><span class="detail-label">Date</span><span class="detail-value">${order.created_at ? new Date(order.created_at).toLocaleString() : ''}</span></div>
                </div>
                ${items.length ? '<h4 style="margin-bottom:var(--space-3);font-size:var(--fs-sm)">Order Items</h4><table class="data-table"><thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>' + items.map(i => `<tr><td>${i.product_name || ''}</td><td>${i.quantity}</td><td>EGP ${parseFloat(i.price||0).toFixed(2)}</td></tr>`).join('') + '</tbody></table>' : ''}`;
            Modal.open('Order Details', body, '', 'modal-lg');
        } catch (e) { Toast.error('Failed to load order: ' + e.message); }
    }

    return { render, viewOrder, applyFilter };
})();
