document.addEventListener('DOMContentLoaded', () => {
    // Determine current page for active link highlighting
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    const headerHTML = `
    <!-- Announcement Bar -->
    <div id="announcement-bar" class="announcement-bar" style="display: none;">
        <div class="announcement-content">
            <span id="announcement-text"></span>
        </div>
    </div>

    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-content">
                <div class="logo">
                     <a href="index.html">
                        <img src="https://assets.zeronux.store/Logo.png" alt="ZeroNux Store Logo">
                    </a>
                </div>

                <button class="mobile-menu-btn" aria-label="Toggle Menu">
                    ☰
                </button>

                <div class="nav-links">
                    <a href="index.html#home" class="nav-link ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" data-i18n="nav-home">الرئيسية</a>
                    <a href="students.html" class="nav-link ${currentPage === 'students.html' ? 'active' : ''}">📚 الكتب الدراسية</a>
                    <a href="index.html#products" class="nav-link" data-i18n="nav-products">المنتجات</a>
                    
                    <!-- Mobile Quick Actions (icon row) -->
                    <div class="mobile-quick-actions">
                        <button class="mobile-quick-btn" onclick="showWishlistDrawer()" title="المفضلة">
                            <span class="quick-icon">❤️</span>
                            <span class="quick-label">المفضلة</span>
                        </button>
                        <button class="mobile-quick-btn" onclick="showRecentlyViewedDrawer()" title="شاهدت مؤخراً">
                            <span class="quick-icon">🕐</span>
                            <span class="quick-label">الأخيرة</span>
                        </button>
                        <button class="mobile-quick-btn" onclick="document.querySelector('.cart-btn').click()"
                            title="السلة">
                            <span class="quick-icon">🛒</span>
                            <span class="quick-label">السلة</span>
                        </button>
                        <a href="#about" class="mobile-quick-btn" title="من نحن"
                            style="text-decoration: none; color: inherit;">
                            <span class="quick-icon">ℹ️</span>
                            <span class="quick-label">من نحن</span>
                        </a>
                        <a href="#contact" class="mobile-quick-btn" title="اتصل بنا"
                            style="text-decoration: none; color: inherit;">
                            <span class="quick-icon">📞</span>
                            <span class="quick-label">اتصل بنا</span>
                        </a>
                    </div>
                </div>

                <div class="nav-actions">
                    <div class="currency-switcher">
                        <button class="currency-btn active" data-currency="USD">
                            <span class="currency-symbol">$</span>
                            <span class="currency-code">USD</span>
                        </button>
                        <button class="currency-btn" data-currency="LYD">
                            <span class="currency-symbol">د.ل</span>
                            <span class="currency-code">LYD</span>
                        </button>
                    </div>
                    <button class="recently-viewed-btn" aria-label="Recently Viewed">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span class="recently-viewed-count">0</span>
                    </button>
                    <button class="wishlist-btn" aria-label="Wishlist">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                        </svg>
                        <span class="wishlist-count">0</span>
                    </button>
                    <button class="cart-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            stroke-width="2">
                            <path d="M9 2L6 6M18 6L15 2M6 6h12l1 14H5L6 6z" />
                        </svg>
                        <span class="cart-count">0</span>
                    </button>
                </div>
            </div>
        </div>
    </nav>
    
    <!-- Mobile Bottom Navigation Bar -->
    <div class="mobile-bottom-nav">
        <!-- Toggle Button -->
        <button class="mobile-nav-toggle" aria-label="Toggle Navigation">
            <span class="toggle-icon">▼</span>
        </button>
        <a href="index.html#home" class="mobile-nav-item ${currentPage === 'index.html' || currentPage === '' ? 'active' : ''}" id="mobile-nav-home">
            <span class="nav-icon">🏠</span>
            <span class="nav-label">الرئيسية</span>
        </a>
        <a href="students.html" class="mobile-nav-item ${currentPage === 'students.html' ? 'active' : ''}">
            <span class="nav-icon">📚</span>
            <span class="nav-label">الكتب</span>
        </a>
        <div class="mobile-nav-item" id="mobile-nav-search">
            <span class="nav-icon">🔍</span>
            <span class="nav-label">بحث</span>
        </div>
        <div class="mobile-nav-item relative" id="mobile-nav-cart">
            <span class="nav-icon">🛒</span>
            <span class="cart-count-badge">0</span>
            <span class="nav-label">السلة</span>
        </div>
        <a href="https://wa.me/218916808225" target="_blank" class="mobile-nav-item">
            <span class="nav-icon">💬</span>
            <span class="nav-label">دعم</span>
        </a>
    </div>
    `;

    const headerContainer = document.getElementById('main-header');
    if (headerContainer) {
        headerContainer.innerHTML = headerHTML;
    }

    // Initialize Mobile Menu and Bottom Nav immediately
    initMobileMenuLogic();
});

function initMobileMenuLogic() {
    // 1. Mobile Menu Toggle (Hamburger)
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        // Toggle menu
        mobileMenuBtn.onclick = (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('active');
        };

        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('active') && !navLinks.contains(e.target) && e.target !== mobileMenuBtn) {
                navLinks.classList.remove('active');
            }
        });

        // Close when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
            });
        });
    }

    // 2. Mobile Search Button — Global Search Overlay
    const mobileSearchBtn = document.getElementById('mobile-nav-search');
    if (mobileSearchBtn) {
        mobileSearchBtn.onclick = () => {
            // On index.html with an existing search box, scroll to it
            const onIndexPage = (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/'));
            const searchInput = document.getElementById('product-search');
            if (onIndexPage && searchInput) {
                searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => searchInput.focus(), 400);
                return;
            }
            // On other pages, open global search overlay
            openGlobalSearchOverlay();
        };
    }

    // 3. Mobile Bottom Nav Toggle
    const toggleBtn = document.querySelector('.mobile-nav-toggle');
    const bottomNav = document.querySelector('.mobile-bottom-nav');

    if (toggleBtn && bottomNav) {
        // Load saved state
        const isHidden = localStorage.getItem('mobileNavHidden') === 'true';
        if (isHidden) {
            bottomNav.classList.add('nav-hidden');
            toggleBtn.querySelector('.toggle-icon').style.transform = 'rotate(180deg)';
        }

        toggleBtn.onclick = () => {
            bottomNav.classList.toggle('nav-hidden');
            const isNowHidden = bottomNav.classList.contains('nav-hidden');
            localStorage.setItem('mobileNavHidden', isNowHidden);

            // Rotate icon
            const icon = toggleBtn.querySelector('.toggle-icon');
            if (icon) icon.style.transform = isNowHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        };
    }
}
