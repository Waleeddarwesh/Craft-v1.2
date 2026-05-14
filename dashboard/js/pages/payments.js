/* Payments & Transactions Page */
const PaymentsPage = (() => {
    let currentTab = 'payments';

    async function render(container) {
        container.innerHTML = `
            <div class="page-header"><div><h1>Payments & Transactions</h1><p>Monitor payment history and transaction ledger</p></div></div>
            <div class="tabs">
                <div class="tab active" data-tab="payments" onclick="PaymentsPage.switchTab('payments')">Payment History</div>
                <div class="tab" data-tab="transactions" onclick="PaymentsPage.switchTab('transactions')">Transactions</div>
            </div>
            <div id="payments-content"></div>`;
        currentTab = 'payments';
        loadTab();
    }

    function switchTab(tab) {
        currentTab = tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        loadTab();
    }

    async function loadTab() {
        if (currentTab === 'payments') await loadPayments();
        else await loadTransactions();
    }

    async function loadPayments() {
        try {
            const data = await API.get('/admin-api/payments/');
            const payments = data || [];
            DataTable.render('payments-content', {
                columns: [
                    { key: 'id', label: 'ID', render: v => `<span style="font-family:var(--font-mono);font-size:var(--fs-xs)">${(v||'').toString().slice(0,8)}</span>` },
                    { key: 'user_email', label: 'User', render: (v, r) => v || r.user || '—' },
                    { key: 'payment_status', label: 'Status', render: v => {
                        const cls = v === 'succeeded' ? 'success' : v === 'failed' ? 'danger' : 'warning';
                        return `<span class="badge badge-${cls}">${v||''}</span>`;
                    }},
                    { key: 'stripe_session_id', label: 'Stripe ID', render: v => v ? `<span style="font-family:var(--font-mono);font-size:var(--fs-xs)">${v.slice(0,15)}…</span>` : '—' },
                    { key: 'date', label: 'Date', render: v => v ? new Date(v).toLocaleString() : '—' },
                ],
                data: payments
            });
        } catch(e) { document.getElementById('payments-content').innerHTML = `<div class="empty-state"><h3>Could not load payments</h3><p>${e.message}</p></div>`; }
    }

    async function loadTransactions() {
        try {
            const data = await API.get('/admin-api/transactions/');
            const txns = data || [];
            DataTable.render('payments-content', {
                columns: [
                    { key: 'id', label: 'ID', render: v => `<span style="font-family:var(--font-mono);font-size:var(--fs-xs)">${(v||'').toString().slice(0,8)}</span>` },
                    { key: 'transaction_type', label: 'Type', render: v => `<span class="badge badge-neutral">${(v||'').replace(/_/g,' ')}</span>` },
                    { key: 'amount', label: 'Amount', render: v => { const n = parseFloat(v||0); return `<span class="${n >= 0 ? 'text-success' : 'text-danger'}">EGP ${Math.abs(n).toFixed(2)}</span>`; }},
                    { key: 'user_email', label: 'User', render: (v, r) => v || r.user || '—' },
                    { key: 'created_at', label: 'Date', render: v => v ? new Date(v).toLocaleString() : '—' },
                ],
                data: txns
            });
        } catch(e) { document.getElementById('payments-content').innerHTML = `<div class="empty-state"><h3>Could not load transactions</h3><p>${e.message}</p></div>`; }
    }

    return { render, switchTab };
})();
