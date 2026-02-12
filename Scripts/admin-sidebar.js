// ============================================
// ADMIN SIDEBAR — Replace horizontal tabs with
// a beautiful categorized sidebar navigation
// ============================================
(function () {
    'use strict';

    // Category definitions: each tab is placed into a group
    const CATEGORIES = [
        {
            label: 'الرئيسية',
            icon: '🏠',
            items: [
                { tab: 'dashboard', label: 'لوحة التحكم', icon: '📊' }
            ]
        },
        {
            label: 'المتجر',
            icon: '🛒',
            items: [
                { tab: 'orders', label: 'الطلبات', icon: '📋' },
                { tab: 'products', label: 'المنتجات', icon: '📦' },
                { tab: 'coupons', label: 'الكوبونات', icon: '🎫' },
                { tab: 'reviews', label: 'التقييمات', icon: '⭐' }
            ]
        },
        {
            label: 'المحتوى',
            icon: '📄',
            items: [
                { tab: 'books', label: 'الكتب الدراسية', icon: '📚' },
                { tab: 'images', label: 'الصور', icon: '🖼️' }
            ]
        },
        {
            label: 'الأدوات',
            icon: '🔧',
            items: [
                { tab: 'support', label: 'الدعم الفني', icon: '🎧' },
                { tab: 'activity', label: 'سجل النشاط', icon: '📜' },
                { tab: 'seo', label: 'SEO', icon: '🌐' }
            ]
        },
        {
            label: 'النظام',
            icon: '⚙️',
            items: [
                { tab: 'settings', label: 'الإعدادات', icon: '⚙️' }
            ]
        }
    ];

    function injectStyles() {
        if (document.getElementById('admin-sidebar-styles')) return;
        const style = document.createElement('style');
        style.id = 'admin-sidebar-styles';
        style.textContent = `
            /* ---- Hide old horizontal tabs ---- */
            .admin-tabs {
                display: none !important;
            }

            /* ---- Dashboard becomes sidebar layout ---- */
            .admin-layout-wrapper {
                display: flex;
                flex: 1;
                min-height: 0;
            }

            /* ---- Sidebar ---- */
            .admin-sidebar {
                width: 250px;
                min-width: 250px;
                background: rgba(16, 14, 36, 0.95);
                border-left: 1px solid rgba(255,255,255,0.07);
                display: flex;
                flex-direction: column;
                overflow-y: auto;
                overflow-x: hidden;
                padding: 1rem 0;
                position: sticky;
                top: 0;
                height: 100vh;
                scrollbar-width: thin;
                scrollbar-color: rgba(255,255,255,0.1) transparent;
                z-index: 100;
                transition: width 0.3s cubic-bezier(0.4,0,0.2,1),
                            min-width 0.3s cubic-bezier(0.4,0,0.2,1),
                            transform 0.3s cubic-bezier(0.4,0,0.2,1);
            }
            .admin-sidebar::-webkit-scrollbar { width: 4px; }
            .admin-sidebar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

            /* ---- Collapsed state ---- */
            .admin-sidebar.collapsed {
                width: 62px;
                min-width: 62px;
            }
            .admin-sidebar.collapsed .sidebar-logo-text,
            .admin-sidebar.collapsed .sidebar-category-label span:not(.cat-icon),
            .admin-sidebar.collapsed .nav-label,
            .admin-sidebar.collapsed .sidebar-nav-badge {
                opacity: 0;
                width: 0;
                overflow: hidden;
                white-space: nowrap;
                transition: opacity 0.2s, width 0.2s;
            }
            .admin-sidebar.collapsed .sidebar-category-label {
                justify-content: center;
                padding: 0.5rem 0 0.3rem;
            }
            .admin-sidebar.collapsed .sidebar-logo {
                justify-content: center;
                padding: 0.5rem 0 1rem;
            }
            .admin-sidebar.collapsed .sidebar-nav-item {
                justify-content: center;
                padding: 10px 0;
                margin: 1px 6px;
                width: calc(100% - 12px);
            }
            .admin-sidebar.collapsed .sidebar-nav-item .nav-icon {
                min-width: auto;
            }
            .admin-sidebar.collapsed .sidebar-nav-item.active::before {
                right: -6px;
            }

            /* Tooltip on hover when collapsed */
            .admin-sidebar.collapsed .sidebar-nav-item {
                position: relative;
            }
            .admin-sidebar.collapsed .sidebar-nav-item:hover::after {
                content: attr(data-tooltip);
                position: absolute;
                left: calc(100% + 12px);
                top: 50%;
                transform: translateY(-50%);
                background: rgba(20,18,40,0.95);
                border: 1px solid rgba(255,255,255,0.12);
                color: white;
                padding: 5px 12px;
                border-radius: 8px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 200;
                pointer-events: none;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            }

            /* Collapse toggle button */
            .sidebar-collapse-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                border-radius: 8px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04);
                color: rgba(255,255,255,0.4);
                cursor: pointer;
                font-size: 0.8rem;
                transition: all 0.2s;
                margin-right: auto;
                flex-shrink: 0;
            }
            .sidebar-collapse-btn:hover {
                background: rgba(255,255,255,0.1);
                color: white;
            }
            .admin-sidebar.collapsed .sidebar-collapse-btn {
                margin: 0 auto;
            }

            /* Sidebar logo area */
            .sidebar-logo {
                padding: 0.5rem 1.2rem 1.2rem;
                border-bottom: 1px solid rgba(255,255,255,0.06);
                margin-bottom: 0.5rem;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .sidebar-logo img {
                width: 36px;
                height: 36px;
                border-radius: 10px;
                flex-shrink: 0;
            }
            .sidebar-logo-text {
                font-size: 0.95rem;
                font-weight: 700;
                background: linear-gradient(135deg, #667eea, #a78bfa);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                background-clip: text;
                transition: opacity 0.2s, width 0.2s;
                white-space: nowrap;
            }

            /* Category group */
            .sidebar-category {
                margin-bottom: 0.25rem;
            }
            .sidebar-category-label {
                padding: 0.5rem 1.2rem 0.3rem;
                font-size: 0.65rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1.5px;
                color: rgba(255,255,255,0.25);
                display: flex;
                align-items: center;
                gap: 6px;
            }
            .sidebar-category-label span.cat-icon {
                font-size: 0.7rem;
            }

            /* Nav items */
            .sidebar-nav-item {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 1.2rem 10px 1rem;
                margin: 1px 8px;
                border-radius: 10px;
                color: rgba(255,255,255,0.55);
                cursor: pointer;
                transition: all 0.2s ease;
                border: 1px solid transparent;
                font-size: 0.88rem;
                font-weight: 500;
                position: relative;
                font-family: 'Cairo', sans-serif;
                background: none;
                width: calc(100% - 16px);
                text-align: right;
            }
            .sidebar-nav-item:hover {
                background: rgba(255,255,255,0.05);
                color: rgba(255,255,255,0.85);
            }
            .sidebar-nav-item.active {
                background: linear-gradient(135deg, rgba(102,126,234,0.18), rgba(118,75,162,0.12));
                color: white;
                border-color: rgba(102,126,234,0.25);
                font-weight: 600;
            }
            .sidebar-nav-item.active::before {
                content: '';
                position: absolute;
                right: -8px;
                top: 50%;
                transform: translateY(-50%);
                width: 3px;
                height: 60%;
                background: linear-gradient(180deg, #667eea, #764ba2);
                border-radius: 3px;
            }
            .sidebar-nav-item .nav-icon {
                font-size: 1.05rem;
                min-width: 24px;
                text-align: center;
            }
            .sidebar-nav-item .nav-label {
                flex: 1;
            }

            /* Badge for unread counts etc */
            .sidebar-nav-badge {
                background: linear-gradient(135deg, #f093fb, #f5576c);
                color: white;
                font-size: 0.6rem;
                font-weight: 700;
                padding: 1px 7px;
                border-radius: 10px;
                min-width: 18px;
                text-align: center;
            }

            /* Content area adjustment */
            .admin-main {
                flex: 1;
                min-width: 0;
                padding: 1.5rem 2rem;
                overflow-y: auto;
            }

            /* ---- Mobile Hamburger ---- */
            .sidebar-toggle-btn {
                display: none;
                position: fixed;
                bottom: 1.5rem;
                right: 1.5rem;
                width: 50px;
                height: 50px;
                border-radius: 14px;
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                border: none;
                font-size: 1.4rem;
                cursor: pointer;
                z-index: 1001;
                box-shadow: 0 4px 20px rgba(102,126,234,0.5);
                transition: all 0.3s;
                align-items: center;
                justify-content: center;
            }
            .sidebar-toggle-btn:hover {
                transform: scale(1.05);
            }

            /* Sidebar overlay for mobile */
            .sidebar-overlay {
                display: none;
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(4px);
                z-index: 99;
            }

            /* ---- Mobile Responsive ---- */
            @media (max-width: 900px) {
                .admin-sidebar {
                    position: fixed;
                    right: 0;
                    top: 0;
                    height: 100vh;
                    transform: translateX(100%);
                    box-shadow: -8px 0 30px rgba(0,0,0,0.4);
                    z-index: 100;
                }
                .admin-sidebar.open {
                    transform: translateX(0);
                }
                .sidebar-toggle-btn {
                    display: flex;
                }
                .sidebar-overlay.open {
                    display: block;
                }
                .admin-main {
                    padding: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function buildSidebar() {
        const adminMain = document.querySelector('.admin-main');
        if (!adminMain) return;

        // Create sidebar element
        const sidebar = document.createElement('nav');
        sidebar.className = 'admin-sidebar';
        sidebar.id = 'admin-sidebar';

        // Check saved collapsed state
        const isCollapsed = localStorage.getItem('admin_sidebar_collapsed') === 'true';
        if (isCollapsed) sidebar.classList.add('collapsed');

        // Logo area + collapse button
        sidebar.innerHTML = `
            <div class="sidebar-logo">
                <img src="https://assets.zeronux.store/Logo.png" alt="Logo" onerror="this.style.display='none'">
                <span class="sidebar-logo-text">ZeroNux Admin</span>
                <button class="sidebar-collapse-btn" id="sidebar-collapse-btn" title="طي/فتح القائمة">${isCollapsed ? '→' : '←'}</button>
            </div>
        `;

        // Build category groups
        CATEGORIES.forEach(cat => {
            const group = document.createElement('div');
            group.className = 'sidebar-category';
            group.innerHTML = `
                <div class="sidebar-category-label">
                    <span class="cat-icon">${cat.icon}</span>
                    ${cat.label}
                </div>
            `;

            cat.items.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'sidebar-nav-item';
                btn.setAttribute('data-sidebar-tab', item.tab);
                btn.setAttribute('data-tooltip', item.label);
                btn.innerHTML = `
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                `;

                // Default active
                if (item.tab === 'dashboard') {
                    btn.classList.add('active');
                }

                btn.addEventListener('click', () => {
                    // Use existing switchTab
                    if (typeof switchTab === 'function') {
                        switchTab(item.tab);
                    }
                    // Update sidebar active state
                    sidebar.querySelectorAll('.sidebar-nav-item').forEach(n => n.classList.remove('active'));
                    btn.classList.add('active');

                    // Close mobile sidebar
                    closeMobileSidebar();
                });

                group.appendChild(btn);
            });

            sidebar.appendChild(group);
        });

        // Create layout wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'admin-layout-wrapper';

        // Move admin-main into wrapper
        adminMain.parentNode.insertBefore(wrapper, adminMain);
        wrapper.appendChild(sidebar);
        wrapper.appendChild(adminMain);

        // Mobile toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'sidebar-toggle-btn';
        toggleBtn.id = 'sidebar-toggle';
        toggleBtn.innerHTML = '☰';
        document.body.appendChild(toggleBtn);

        // Mobile overlay
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.id = 'sidebar-overlay';
        document.body.appendChild(overlay);

        // Toggle events
        toggleBtn.addEventListener('click', () => {
            const isOpen = sidebar.classList.contains('open');
            if (isOpen) {
                closeMobileSidebar();
            } else {
                sidebar.classList.add('open');
                overlay.classList.add('open');
                toggleBtn.innerHTML = '✕';
            }
        });

        overlay.addEventListener('click', closeMobileSidebar);

        function closeMobileSidebar() {
            sidebar.classList.remove('open');
            overlay.classList.remove('open');
            toggleBtn.innerHTML = '☰';
        }

        // Collapse toggle
        const collapseBtn = document.getElementById('sidebar-collapse-btn');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const collapsed = sidebar.classList.toggle('collapsed');
                localStorage.setItem('admin_sidebar_collapsed', collapsed);
                collapseBtn.textContent = collapsed ? '→' : '←';
            });
        }

        // Watch for dynamically injected tabs and sync sidebar active state
        watchDynamicTabs(sidebar);
    }

    // Watch for dynamic tab injections (from admin-seo.js, admin-support.js, etc.)
    // These scripts add buttons to .admin-tabs. The sidebar already has entries for them,
    // so we just need to make sure clicking them works — which it does via switchTab().
    // But we also need to handle when switchTab is called externally.
    function watchDynamicTabs(sidebar) {
        // Monkey-patch switchTab to keep sidebar in sync
        const originalSwitchTab = window.switchTab;
        if (originalSwitchTab) {
            window.switchTab = function (tabName) {
                originalSwitchTab(tabName);
                // Sync sidebar
                sidebar.querySelectorAll('.sidebar-nav-item').forEach(n => {
                    n.classList.toggle('active', n.getAttribute('data-sidebar-tab') === tabName);
                });
            };
        }
    }

    function init() {
        injectStyles();

        // Wait for admin dashboard to be visible
        const check = setInterval(() => {
            const dashboard = document.getElementById('admin-dashboard');
            const adminMain = document.querySelector('.admin-main');
            if (dashboard && adminMain && dashboard.style.display !== 'none') {
                clearInterval(check);
                // Small delay to let other scripts inject their tabs first
                setTimeout(buildSidebar, 400);
            }
        }, 300);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
