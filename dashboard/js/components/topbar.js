/* Topbar Component */
const Topbar = (() => {
    function render(container) {
        const user = Auth.getUser() || { full_name: 'Admin', email: 'admin@craft.com' };
        const initials = user.full_name ? user.full_name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() : 'A';
        container.innerHTML = `
            <div class="topbar-left">
                <div class="topbar-toggle" onclick="Sidebar.toggleCollapse();document.getElementById('mobile-overlay').style.display=document.getElementById('sidebar').classList.contains('mobile-open')?'block':'none'" id="sidebar-toggle">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </div>
                <div class="topbar-search">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input type="text" placeholder="Search anything..." id="global-search">
                </div>
            </div>
            <div class="topbar-right">
                <div class="topbar-btn" onclick="Router.navigate('#notifications')" title="Notifications">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                    <span class="notif-dot" id="notif-dot" style="display:none"></span>
                </div>
                <div class="dropdown" id="profile-dropdown">
                    <div class="topbar-profile" onclick="document.getElementById('profile-dropdown').classList.toggle('open')">
                        <div class="topbar-profile-info">
                            <div class="topbar-profile-name">${user.full_name || 'Admin'}</div>
                            <div class="topbar-profile-role">Administrator</div>
                        </div>
                        <div class="avatar">${initials}</div>
                    </div>
                    <div class="dropdown-menu">
                        <div class="dropdown-item" onclick="Router.navigate('#reports')">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                            Reports
                        </div>
                        <div class="dropdown-divider"></div>
                        <div class="dropdown-item" onclick="Auth.logout()" style="color:var(--clr-danger)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                            Sign Out
                        </div>
                    </div>
                </div>
            </div>`;
        // Close dropdown on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#profile-dropdown')) {
                document.getElementById('profile-dropdown')?.classList.remove('open');
            }
        });
        // Mobile toggle behavior
        document.getElementById('sidebar-toggle').addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                const sb = document.getElementById('sidebar');
                sb.classList.toggle('mobile-open');
                document.getElementById('mobile-overlay').style.display = sb.classList.contains('mobile-open') ? 'block' : 'none';
            }
        });
    }
    return { render };
})();
