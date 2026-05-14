/* Courses Page */
const CoursesPage = (() => {
    async function render(container) {
        container.innerHTML = `
            <div class="page-header"><div><h1>Courses</h1><p>Manage craft courses and enrollments</p></div></div>
            <div id="courses-view"></div>`;
        try {
            const courses = await API.get('/admin-api/courses/');
            const list = courses || [];
            if (list.length === 0) { container.querySelector('#courses-view').innerHTML = '<div class="empty-state"><h3>No courses yet</h3><p>Courses created by suppliers will appear here.</p></div>'; return; }
            const base = Auth.getApiBase();
            container.querySelector('#courses-view').innerHTML = '<div class="product-grid">' + list.map(c => {
                const thumb = c.Thumbnail ? `<img src="${base}${c.Thumbnail}" alt="${c.CourseTitle}">` : '<span class="no-image">No Thumbnail</span>';
                return `<div class="product-card">
                    <div class="product-card-image">${thumb}</div>
                    <div class="product-card-body">
                        <div class="product-card-name">${c.CourseTitle}</div>
                        <div class="product-card-supplier">${c.supplier_name || ''} · ${c.enrollments_count || 0} enrolled · ${c.CourseHours || 0}h</div>
                        <div class="product-card-footer">
                            <span class="product-card-price">EGP ${parseFloat(c.Price||0).toLocaleString()}</span>
                            <span style="font-size:var(--fs-xs)">⭐ ${parseFloat(c.Rating||0).toFixed(1)} ${c.completed ? '<span class="badge badge-success" style="margin-left:4px">Complete</span>' : ''}</span>
                        </div>
                    </div>
                </div>`;
            }).join('') + '</div>';
        } catch(e) { container.querySelector('#courses-view').innerHTML = `<div class="empty-state"><h3>Could not load courses</h3><p>${e.message}</p></div>`; }
    }
    return { render };
})();
