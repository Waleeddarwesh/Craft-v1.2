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
                let imgHtml = '';
                // Use the most recently uploaded image (last in the array) as the primary display for grid
                const validImages = p.images ? p.images.filter(img => img.image) : [];
                if (validImages.length > 0) {
                    const primaryImg = validImages[validImages.length - 1]; 
                    const safeName = p.ProductName.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    imgHtml = `<img src="${base}${primaryImg.image}" alt="${safeName}" onerror="this.style.display='none'">`;
                    if (validImages.length > 1) {
                        imgHtml += `<div class="multi-image-indicator" style="position:absolute; bottom:8px; right:8px; background:rgba(0,0,0,0.6); color:white; padding:2px 6px; border-radius:10px; font-size:10px; z-index:10;">+${validImages.length - 1}</div>`;
                    }
                } else {
                    imgHtml = '<span class="no-image">No Image</span>';
                }
                const stock = p.Stock;
                const stockClass = stock === 0 || p.OutOfStock ? 'out-of-stock' : stock <= 5 ? 'low-stock' : 'in-stock';
                const stockText = stock === 0 || p.OutOfStock ? 'Out of Stock' : stock <= 5 ? `Low: ${stock}` : `${stock} in stock`;
                const price = parseFloat(p.UnitPrice || 0);
                const safeBodyName = p.ProductName ? p.ProductName.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
                const safeSupplierName = p.supplier_name ? p.supplier_name.replace(/</g, '&lt;').replace(/>/g, '&gt;') : '';
                return `<div class="product-card">
                    <div class="product-card-image" style="position:relative;">${imgHtml}</div>
                    <div class="product-card-body">
                        <div class="product-card-name">${safeBodyName}</div>
                        <div class="product-card-supplier">${safeSupplierName}</div>
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
                { key: 'images', label: 'Images', render: (v, row) => {
                    const base = Auth.getApiBase();
                    const validImages = v ? v.filter(img => img.image) : [];
                    if (validImages.length > 0) {
                        let html = '<div style="display:flex; gap:4px; flex-wrap:wrap;">';
                        validImages.forEach(img => {
                            const safeName = row.ProductName.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                            html += `<img src="${base}${img.image}" alt="${safeName}" title="${safeName}" style="width: 36px; height: 36px; object-fit: cover; border-radius: var(--radius-sm); border:1px solid var(--clr-surface-border);" onerror="this.style.display='none'">`;
                        });
                        html += '</div>';
                        return html;
                    }
                    return '<span class="no-image" style="display:inline-block; width:36px; height:36px; line-height:36px; text-align:center; background:var(--clr-surface-border); border-radius:var(--radius-sm); font-size:10px;">None</span>';
                }},
                { key: 'ProductName', label: 'Product', render: v => v ? String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '—' },
                { key: 'supplier_name', label: 'Supplier', render: v => v ? String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;') : '—' },
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
