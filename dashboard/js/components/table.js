/* Data Table Component */
const DataTable = (() => {
    function render(id, { columns, data, pageSize = 10, searchable = true, onRowClick = null }) {
        const state = { data, filtered: [...data], page: 1, pageSize, sortCol: null, sortDir: 'asc', search: '' };

        function getPageData() {
            const start = (state.page - 1) * state.pageSize;
            return state.filtered.slice(start, start + state.pageSize);
        }

        function totalPages() { return Math.max(1, Math.ceil(state.filtered.length / state.pageSize)); }

        function sort(col) {
            if (state.sortCol === col) state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
            else { state.sortCol = col; state.sortDir = 'asc'; }
            state.filtered.sort((a, b) => {
                let va = a[col], vb = b[col];
                if (va == null) return 1; if (vb == null) return -1;
                if (typeof va === 'string') { va = va.toLowerCase(); vb = (vb || '').toLowerCase(); }
                const cmp = va < vb ? -1 : va > vb ? 1 : 0;
                return state.sortDir === 'asc' ? cmp : -cmp;
            });
            state.page = 1;
            update();
        }

        function search(q) {
            state.search = q.toLowerCase();
            state.filtered = state.data.filter(row =>
                columns.some(c => String(row[c.key] || '').toLowerCase().includes(state.search))
            );
            state.page = 1;
            update();
        }

        function update() {
            const wrapper = document.getElementById(id);
            if (!wrapper) return;
            const rows = getPageData();
            const tp = totalPages();

            // Thead
            let thead = '<tr>';
            columns.forEach(c => {
                const sorted = state.sortCol === c.key;
                const arrow = sorted ? (state.sortDir === 'asc' ? ' ↑' : ' ↓') : '';
                thead += `<th class="${sorted ? 'sorted' : ''}" onclick="DataTable._instances['${id}'].sort('${c.key}')">${c.label}${arrow}</th>`;
            });
            thead += '</tr>';

            // Tbody
            let tbody = '';
            if (rows.length === 0) {
                tbody = `<tr><td colspan="${columns.length}" style="text-align:center;padding:var(--space-10);color:var(--clr-text-muted)">No data found</td></tr>`;
            } else {
                rows.forEach((row, i) => {
                    const clickAttr = onRowClick ? `style="cursor:pointer" onclick="DataTable._instances['${id}'].rowClick(${(state.page-1)*state.pageSize+i})"` : '';
                    tbody += `<tr ${clickAttr}>`;
                    columns.forEach(c => {
                        const val = c.render ? c.render(row[c.key], row) : (row[c.key] ?? '—');
                        tbody += `<td>${val}</td>`;
                    });
                    tbody += '</tr>';
                });
            }

            // Pagination
            let pag = `<button ${state.page <= 1 ? 'disabled' : ''} onclick="DataTable._instances['${id}'].setPage(${state.page - 1})">‹</button>`;
            for (let p = 1; p <= tp; p++) {
                if (tp > 7 && p > 2 && p < tp - 1 && Math.abs(p - state.page) > 1) {
                    if (p === 3 || p === tp - 2) pag += '<button disabled>…</button>';
                    continue;
                }
                pag += `<button class="${p === state.page ? 'active' : ''}" onclick="DataTable._instances['${id}'].setPage(${p})">${p}</button>`;
            }
            pag += `<button ${state.page >= tp ? 'disabled' : ''} onclick="DataTable._instances['${id}'].setPage(${state.page + 1})">›</button>`;

            const searchHTML = searchable ? `<div class="form-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input class="form-input" placeholder="Search..." value="${state.search}" oninput="DataTable._instances['${id}'].search(this.value)"></div>` : '';

            wrapper.innerHTML = `<div class="data-table-wrapper">
                <div class="data-table-toolbar">${searchHTML}<div class="page-info" style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${state.filtered.length} records</div></div>
                <div style="overflow-x:auto"><table class="data-table"><thead>${thead}</thead><tbody>${tbody}</tbody></table></div>
                <div class="data-table-footer"><div class="page-info">Page ${state.page} of ${tp}</div><div class="pagination">${pag}</div></div>
            </div>`;
        }

        // Store instance globally for event handlers
        if (!DataTable._instances) DataTable._instances = {};
        DataTable._instances[id] = {
            sort, search, update,
            setPage(p) { state.page = p; update(); },
            rowClick(i) { if (onRowClick) onRowClick(state.filtered[i]); },
            setData(d) { state.data = d; state.filtered = [...d]; state.page = 1; if (state.search) search(state.search); else update(); }
        };

        update();
        return DataTable._instances[id];
    }

    return { render, _instances: {} };
})();
