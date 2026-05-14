/* Notifications Page */
const NotificationsPage = (() => {
    async function render(container) {
        container.innerHTML = `
            <div class="page-header">
                <div><h1>Notifications</h1><p>System notifications and alerts</p></div>
                <div class="page-header-actions">
                    <button class="btn btn-sm btn-ghost" onclick="NotificationsPage.markAllRead()">Mark all read</button>
                </div>
            </div>
            <div id="notifications-list"></div>`;
        try {
            const data = await API.get('/admin-api/notifications/');
            const notifs = data || [];
            if (notifs.length === 0) {
                document.getElementById('notifications-list').innerHTML = '<div class="empty-state"><h3>No notifications</h3><p>You\'re all caught up!</p></div>';
                return;
            }
            document.getElementById('notifications-list').innerHTML = notifs.map(n => `
                <div class="card" style="margin-bottom:var(--space-3);padding:var(--space-4) var(--space-5);${!n.is_read ? 'border-left:3px solid var(--clr-primary)' : ''}">
                    <div style="display:flex;justify-content:space-between;align-items:flex-start">
                        <div>
                            <p style="font-size:var(--fs-sm);${!n.is_read ? 'font-weight:var(--fw-semibold)' : 'color:var(--clr-text-secondary)'}">${n.message}</p>
                            <div style="display:flex;gap:var(--space-3);margin-top:var(--space-1)">
                                <span style="font-size:var(--fs-xs);color:var(--clr-text-muted)">${n.timestamp ? new Date(n.timestamp).toLocaleString() : ''}</span>
                                ${n.user_email ? `<span style="font-size:var(--fs-xs);color:var(--clr-text-muted)">· ${n.user_email}</span>` : ''}
                            </div>
                        </div>
                        ${!n.is_read ? '<span class="badge badge-primary" style="font-size:10px">New</span>' : ''}
                    </div>
                </div>
            `).join('');
            // Update notification dot
            const unread = notifs.filter(n => !n.is_read).length;
            const dot = document.getElementById('notif-dot');
            if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
        } catch(e) { document.getElementById('notifications-list').innerHTML = `<div class="empty-state"><h3>Could not load notifications</h3><p>${e.message}</p></div>`; }
    }

    async function markAllRead() {
        try {
            await API.post('/admin-api/notifications/');
            Toast.success('All notifications marked as read');
            render(document.getElementById('main-content'));
        } catch { Toast.info('Mark all read — could not complete'); }
    }

    return { render, markAllRead };
})();
