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
        // Remove old listeners if any (clone node? no, simple reassignment is fine if just injected)

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

// ============================================
// GLOBAL SEARCH OVERLAY
// ============================================
function openGlobalSearchOverlay() {
    // Prevent duplicates
    if (document.getElementById('global-search-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'global-search-overlay';
    overlay.innerHTML = `
        <div class="gso-container">
            <div class="gso-header">
                <div class="gso-input-wrap">
                    <span class="gso-search-icon">🔍</span>
                    <input type="text" id="gso-input" placeholder="ابحث عن منتجات أو كتب..." autocomplete="off" autofocus>
                </div>
                <button class="gso-close-btn" aria-label="إغلاق">✕</button>
            </div>
            <div class="gso-results" id="gso-results">
                <div class="gso-hint">
                    <span style="font-size:2.5rem">🔎</span>
                    <p>اكتب للبحث في المنتجات والكتب</p>
                </div>
            </div>
        </div>
    `;

    // Inject styles (only once)
    if (!document.getElementById('gso-styles')) {
        const style = document.createElement('style');
        style.id = 'gso-styles';
        style.textContent = `
            #global-search-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(10, 10, 20, 0.96);
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                z-index: 100000;
                display: flex;
                flex-direction: column;
                animation: gsoFadeIn 0.25s ease-out;
            }
            @keyframes gsoFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes gsoSlideDown {
                from { opacity: 0; transform: translateY(-20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .gso-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
                padding: 1rem;
            }
            .gso-header {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.5rem 0 1rem;
                animation: gsoSlideDown 0.3s ease-out;
            }
            .gso-input-wrap {
                flex: 1;
                position: relative;
            }
            .gso-search-icon {
                position: absolute;
                right: 1rem;
                top: 50%;
                transform: translateY(-50%);
                font-size: 1.1rem;
                pointer-events: none;
            }
            #gso-input {
                width: 100%;
                padding: 1rem 3rem 1rem 1rem;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 14px;
                color: white;
                font-family: 'Cairo', 'Inter', sans-serif;
                font-size: 1rem;
                direction: rtl;
                outline: none;
                transition: all 0.3s ease;
            }
            #gso-input:focus {
                border-color: #667eea;
                background: rgba(255, 255, 255, 0.12);
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
            }
            #gso-input::placeholder { color: rgba(255,255,255,0.4); }
            .gso-close-btn {
                width: 44px; height: 44px;
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.05);
                color: white;
                font-size: 1.1rem;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
                flex-shrink: 0;
            }
            .gso-close-btn:hover { background: rgba(255,255,255,0.1); }
            .gso-results {
                flex: 1;
                overflow-y: auto;
                padding-bottom: 2rem;
                direction: rtl;
            }
            .gso-hint {
                text-align: center;
                color: rgba(255,255,255,0.4);
                padding: 3rem 1rem;
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.75rem;
            }
            .gso-hint p { margin: 0; font-size: 1rem; }
            .gso-section-title {
                font-size: 0.85rem;
                color: rgba(255,255,255,0.5);
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin: 1.25rem 0 0.5rem;
                padding-bottom: 0.4rem;
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .gso-item {
                display: flex;
                align-items: center;
                gap: 0.75rem;
                padding: 0.75rem;
                border-radius: 12px;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                color: white;
                animation: gsoSlideDown 0.3s ease-out both;
            }
            .gso-item:hover, .gso-item:active {
                background: rgba(255,255,255,0.06);
            }
            .gso-item-img {
                width: 50px; height: 50px;
                border-radius: 10px;
                object-fit: cover;
                background: rgba(255,255,255,0.05);
                flex-shrink: 0;
            }
            .gso-item-info {
                flex: 1;
                min-width: 0;
            }
            .gso-item-name {
                font-weight: 600;
                font-size: 0.95rem;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 2px;
            }
            .gso-item-meta {
                font-size: 0.8rem;
                color: rgba(255,255,255,0.5);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .gso-item-price {
                font-weight: 700;
                font-size: 0.9rem;
                color: #667eea;
                white-space: nowrap;
                flex-shrink: 0;
            }
            .gso-no-results {
                text-align: center;
                padding: 3rem 1rem;
                color: rgba(255,255,255,0.4);
            }
            .gso-no-results span { font-size: 2.5rem; display: block; margin-bottom: 0.75rem; }
            .gso-loading {
                text-align: center;
                padding: 2rem;
                color: rgba(255,255,255,0.5);
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // Focus input
    const input = document.getElementById('gso-input');
    setTimeout(() => input.focus(), 100);

    // Close handlers
    const closeOverlay = () => {
        overlay.style.animation = 'gsoFadeIn 0.2s ease-out reverse';
        setTimeout(() => {
            overlay.remove();
            document.body.style.overflow = '';
        }, 180);
    };

    overlay.querySelector('.gso-close-btn').onclick = closeOverlay;
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeOverlay();
    });
    document.addEventListener('keydown', function escHandler(e) {
        if (e.key === 'Escape') {
            closeOverlay();
            document.removeEventListener('keydown', escHandler);
        }
    });

    // Debounced search
    let searchTimeout;
    let cachedProducts = null;
    let cachedBooks = null;

    input.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => performGlobalSearch(input.value.trim()), 300);
    });

    function performGlobalSearch(query) {
        const resultsContainer = document.getElementById('gso-results');
        if (!resultsContainer) return;

        if (!query) {
            resultsContainer.innerHTML = `
                <div class="gso-hint">
                    <span style="font-size:2.5rem">🔎</span>
                    <p>اكتب للبحث في المنتجات والكتب</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = '<div class="gso-loading">جاري البحث...</div>';

        // Fetch data (cache after first load)
        const db = window.database || (typeof firebase !== 'undefined' && firebase.database ? firebase.database() : null);
        if (!db) {
            resultsContainer.innerHTML = '<div class="gso-no-results"><span>⚠️</span><p>قاعدة البيانات غير متوفرة</p></div>';
            return;
        }

        const fetchProducts = cachedProducts
            ? Promise.resolve(cachedProducts)
            : db.ref('products').once('value').then(snap => { cachedProducts = snap.val() || {}; return cachedProducts; });

        const fetchBooks = cachedBooks
            ? Promise.resolve(cachedBooks)
            : db.ref('studentBooks').once('value').then(snap => { cachedBooks = snap.val() || {}; return cachedBooks; });

        Promise.all([fetchProducts, fetchBooks]).then(([products, books]) => {
            const q = query.toLowerCase();
            let html = '';
            let totalResults = 0;

            // Search products
            const productResults = [];
            Object.entries(products).forEach(([id, p]) => {
                if (p.visible === false) return;
                const name = (p.name || '').toLowerCase();
                const desc = (p.description || p.shortDesc || '').toLowerCase();
                const exact = name.includes(q) || desc.includes(q);
                const fuzzy = !exact && q.length > 2 && name.split(' ').some(w => levenshteinDist(q, w) <= 2);
                if (exact || fuzzy) {
                    productResults.push({ id, ...p });
                }
            });

            // Search books
            const bookResults = [];
            Object.entries(books).forEach(([id, b]) => {
                if (b.visible === false) return;
                const name = (b.name || '').toLowerCase();
                const exact = name.includes(q);
                const fuzzy = !exact && q.length > 2 && name.split(' ').some(w => levenshteinDist(q, w) <= 2);
                if (exact || fuzzy) {
                    bookResults.push({ id, ...b });
                }
            });

            totalResults = productResults.length + bookResults.length;

            if (totalResults === 0) {
                resultsContainer.innerHTML = `
                    <div class="gso-no-results">
                        <span>🤔</span>
                        <p>لم نجد نتائج لـ "${query}"</p>
                        <p style="font-size:0.85rem;margin-top:0.5rem">جرب كلمات مفتاحية أخرى</p>
                    </div>
                `;
                return;
            }

            // Render product results
            if (productResults.length > 0) {
                html += `<div class="gso-section-title">🛍️ المنتجات (${productResults.length})</div>`;
                productResults.forEach((p, i) => {
                    const price = p.priceType === 'contact' ? '📞 تواصل' :
                        p.priceType === 'negotiable' ? '🤝 تفاوض' :
                            p.price ? `$${parseFloat(p.price).toFixed(2)}` : '';
                    html += `
                        <a href="index.html?product=${p.id}" class="gso-item" style="animation-delay: ${i * 0.05}s">
                            <img class="gso-item-img" src="${p.image || 'https://via.placeholder.com/50?text=📦'}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/50?text=📦'">
                            <div class="gso-item-info">
                                <div class="gso-item-name">${p.name}</div>
                                <div class="gso-item-meta">${p.shortDesc || (p.description || '').substring(0, 50)}</div>
                            </div>
                            <div class="gso-item-price">${price}</div>
                        </a>
                    `;
                });
            }

            // Render book results
            if (bookResults.length > 0) {
                html += `<div class="gso-section-title">📚 الكتب الدراسية (${bookResults.length})</div>`;
                bookResults.forEach((b, i) => {
                    const price = b.priceType === 'contact' ? '📞 تواصل' :
                        b.price ? `$${parseFloat(b.price).toFixed(2)}` : '';
                    html += `
                        <a href="students.html" class="gso-item" style="animation-delay: ${(productResults.length + i) * 0.05}s">
                            <img class="gso-item-img" src="${b.image || 'https://via.placeholder.com/50?text=📖'}" alt="${b.name}" onerror="this.src='https://via.placeholder.com/50?text=📖'">
                            <div class="gso-item-info">
                                <div class="gso-item-name">${b.name}</div>
                                <div class="gso-item-meta">كتاب دراسي</div>
                            </div>
                            <div class="gso-item-price">${price}</div>
                        </a>
                    `;
                });
            }

            resultsContainer.innerHTML = html;
        }).catch(err => {
            console.error('Global search error:', err);
            resultsContainer.innerHTML = '<div class="gso-no-results"><span>⚠️</span><p>حدث خطأ أثناء البحث</p></div>';
        });
    }
}

// Levenshtein distance for fuzzy matching
function levenshteinDist(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}
