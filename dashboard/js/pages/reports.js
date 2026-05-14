/* Financial Reports Page */
const ReportsPage = (() => {
    let currentPeriod = 'this_month';

    async function render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div><h1>Financial Reports</h1><p>Revenue analytics and earning breakdowns</p></div>
                <div class="report-period-selector">
                    <button class="period-btn active" data-period="this_day" onclick="ReportsPage.setPeriod('this_day')">Today</button>
                    <button class="period-btn" data-period="this_month" onclick="ReportsPage.setPeriod('this_month')">This Month</button>
                    <button class="period-btn" data-period="this_year" onclick="ReportsPage.setPeriod('this_year')">This Year</button>
                </div>
            </div>
            <div class="report-kpi-grid" id="report-kpis">
                ${Array(3).fill('<div class="skeleton skeleton-card"></div>').join('')}
            </div>
            <div class="card mb-6"><div class="card-header"><span class="card-title">Income vs Outcome</span></div><div class="chart-container lg"><canvas id="chart-earnings"></canvas></div></div>`;
        currentPeriod = 'this_month';
        document.querySelector('[data-period="this_month"]')?.classList.add('active');
        document.querySelector('[data-period="this_day"]')?.classList.remove('active');
        loadReport();
    }

    function setPeriod(p) {
        currentPeriod = p;
        document.querySelectorAll('.period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === p));
        loadReport();
    }

    async function loadReport() {
        try {
            const data = await API.get('/reports/earnings/', { period: currentPeriod });
            const inc = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
            const out = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>';
            const earn = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>';

            document.getElementById('report-kpis').innerHTML =
                StatsCard.render('Total Income', `EGP ${parseFloat(data.total_income || 0).toLocaleString()}`, inc, 'success') +
                StatsCard.render('Total Outcome', `EGP ${parseFloat(data.total_outcome || 0).toLocaleString()}`, out, 'danger') +
                StatsCard.render('Net Earnings', `EGP ${parseFloat(data.total_earning || 0).toLocaleString()}`, earn, 'accent', data.percentage_change);

            const graphData = data.graph_data || [];
            if (graphData.length > 0) {
                Charts.bar('chart-earnings', graphData.map(g => g.month), [
                    { label: 'Income', data: graphData.map(g => g.income || 0) },
                    { label: 'Outcome', data: graphData.map(g => g.outcome || 0) }
                ]);
            } else {
                Charts.bar('chart-earnings', ['No Data'], [{ label: 'Income', data: [0] }, { label: 'Outcome', data: [0] }]);
            }
        } catch(e) {
            document.getElementById('report-kpis').innerHTML =
                StatsCard.render('Total Income', 'EGP 0', '', 'success') +
                StatsCard.render('Total Outcome', 'EGP 0', '', 'danger') +
                StatsCard.render('Net Earnings', 'EGP 0', '', 'accent');
            Charts.bar('chart-earnings', ['No Data'], [{ label: 'Income', data: [0] }]);
        }
    }

    return { render, setPeriod };
})();
