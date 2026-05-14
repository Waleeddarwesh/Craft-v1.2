/* Products & Inventory Page */
const ProductsPage = (() => {
    let allProducts = [];
    let viewMode = 'grid';

    async function render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div><h1>Products & Inventory</h1><p>Manage product catalog and stock levels</p></div>
                <div class="page-header-actions">
                    <button class="btn btn-ghost btn-sm btn-primary" onclick="ProductsPage.toggleView('grid')" id="btn-grid">Grid</button>
                    <button class="btn btn-ghost btn-sm" onclick="ProductsPage.toggleView('table')" id="btn-table">Table</button>
                </div>
            </div>
            <div class="filter-bar mb-6">
                <select id="product-stock-filter" onchange="ProductsPage.applyFilter()">
                    <option value="">All Stock</option>
                    <option value="in">In Stock</option>
                    <option value="low">Low Stock (≤5)</option>
                    <option value="out">Out of Stock</option>
                </select>
            </div>
            <div id="products-view"></div>`;
        viewMode = 'grid';
        await loadProducts();
    }

    async function loadProducts() {
        try {
            const data = await API.get('/admin-api/products/');
            allProducts = data || [];
            renderView(allProducts);
        } catch(e) { document.getElementById('products-view').innerHTML = `<div class="empty-state"><h3>Could not load products</h3><p>${e.message}</p></div>`; }
    }

    function renderView(products) {
        if (viewMode === 'grid') renderGrid(products);
        else renderTableView(products);
    }

    function renderGrid(products) {
        if (products.length === 0) { document.getElementById('products-view').innerHTML = '<div class="empty-state"><h3>No products found</h3></div>'; return; }
        const base = Auth.getApiBase();
        document.getElementById('products-view').innerHTML = '<div class="product-grid">' +
            products.map(p => {
                const img = p.images && p.images.length && p.images[0].image ? `<img src="${base}${p.images[0].image}" alt="${p.ProductName}">` : '<span class="no-image">No Image</span>';
                const stock = p.Stock;
                const stockClass = stock === 0 || p.OutOfStock ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
                const stockText = stock === 0 || p.OutOfStock ? 'Out of Stock' : stock <= 5 ? `Low: ${stock}` : `${stock} in stock`;
                const price = parseFloat(p.UnitPrice || 0);
                return `<div class="product-card">
                    <div class="product-card-image">${img}</div>
                    <div class="product-card-body">
                        <div class="product-card-name">${p.ProductName}</div>
                        <div class="product-card-supplier">${p.supplier_name || ''}</div>
                        <div class="product-card-footer">
                            <span class="product-card-price">EGP ${price.toLocaleString()}</span>
                            <span class="stock-indicator ${stockClass}">${stockText}</span>
                        </div>
                    </div>
                </div>`;
            }).join('') + '</div>';
    }

    function renderTableView(products) {
        DataTable.render('products-view', {
            columns: [
                { key: 'ProductName', label: 'Product' },
                { key: 'supplier_name', label: 'Supplier' },
                { key: 'UnitPrice', label: 'Price', render: v => `EGP ${parseFloat(v||0).toLocaleString()}` },
                { key: 'Stock', label: 'Stock', render: (v, row) => {
                    const cls = v === 0 || row.OutOfStock ? 'out-of-stock' : v <= 5 ? 'low-stock' : 'in-stock';
                    return `<span class="stock-indicator ${cls}">${v}</span>`;
                }},
                { key: 'Rating', label: 'Rating', render: v => `⭐ ${parseFloat(v||0).toFixed(1)}` },
                { key: 'DiscountPercentage', label: 'Discount', render: v => v > 0 ? `<span class="badge badge-warning">${v}%</span>` : '—' },
            ],
            data: products
        });
    }

    function toggleView(mode) {
        viewMode = mode;
        document.getElementById('btn-grid').classList.toggle('btn-primary', mode === 'grid');
        document.getElementById('btn-table').classList.toggle('btn-primary', mode === 'table');
        applyFilter();
    }

    function applyFilter() {
        const stock = document.getElementById('product-stock-filter').value;
        let filtered = allProducts;
        if (stock === 'in') filtered = filtered.filter(p => p.Stock > 5 && !p.OutOfStock);
        else if (stock === 'low') filtered = filtered.filter(p => p.Stock > 0 && p.Stock <= 5);
        else if (stock === 'out') filtered = filtered.filter(p => p.Stock === 0 || p.OutOfStock);
        renderView(filtered);
    }

    return { render, toggleView, applyFilter };
})();
