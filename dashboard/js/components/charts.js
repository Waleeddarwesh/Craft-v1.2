/* Chart Helpers — Chart.js Wrappers */
const Charts = (() => {
    const defaultColors = {
        primary: 'hsl(250, 80%, 60%)', primaryLight: 'hsla(250, 80%, 60%, 0.15)',
        accent: 'hsl(170, 80%, 50%)', accentLight: 'hsla(170, 80%, 50%, 0.15)',
        success: 'hsl(145, 65%, 50%)', warning: 'hsl(40, 95%, 55%)',
        danger: 'hsl(0, 75%, 55%)', info: 'hsl(210, 85%, 58%)',
        text: 'hsl(230, 15%, 60%)', grid: 'hsla(230, 20%, 30%, 0.3)'
    };
    const palette = ['#7c5cfc','#2dd4a8','#f59e0b','#ef4444','#3b82f6','#ec4899','#8b5cf6','#14b8a6'];
    const stored = {};

    function base(type, canvasId, config) {
        if (stored[canvasId]) stored[canvasId].destroy();
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;
        Chart.defaults.color = defaultColors.text;
        Chart.defaults.font.family = 'Inter, sans-serif';
        const chart = new Chart(ctx, { type, ...config });
        stored[canvasId] = chart;
        return chart;
    }

    function line(canvasId, labels, datasets, opts = {}) {
        return base('line', canvasId, {
            data: { labels, datasets: datasets.map((ds, i) => ({
                borderColor: palette[i], backgroundColor: palette[i] + '20',
                borderWidth: 2, pointRadius: 3, pointHoverRadius: 5,
                tension: 0.4, fill: true, ...ds
            }))},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: datasets.length > 1, labels: { boxWidth: 12, padding: 16 } } },
                scales: { x: { grid: { color: defaultColors.grid } }, y: { grid: { color: defaultColors.grid }, beginAtZero: true } }, ...opts }
        });
    }

    function bar(canvasId, labels, datasets, opts = {}) {
        return base('bar', canvasId, {
            data: { labels, datasets: datasets.map((ds, i) => ({
                backgroundColor: palette[i] + 'cc', borderColor: palette[i],
                borderWidth: 1, borderRadius: 6, ...ds
            }))},
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: datasets.length > 1, labels: { boxWidth: 12, padding: 16 } } },
                scales: { x: { grid: { display: false } }, y: { grid: { color: defaultColors.grid }, beginAtZero: true } }, ...opts }
        });
    }

    function doughnut(canvasId, labels, data, opts = {}) {
        return base('doughnut', canvasId, {
            data: { labels, datasets: [{ data, backgroundColor: palette.slice(0, data.length), borderWidth: 0, hoverOffset: 8 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '70%', plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, padding: 12 } } }, ...opts }
        });
    }

    return { line, bar, doughnut, palette };
})();
