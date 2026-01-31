// ============================================
// FIREBASE CONFIGURATION
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCiS9TwRDxlpQ1Z_A6QcBi0f6307vI49ws",
    authDomain: "zeronuxstore.firebaseapp.com",
    databaseURL: "https://zeronuxstore-default-rtdb.firebaseio.com", // YOU NEED TO CREATE DATABASE AND UPDATE THIS!
    projectId: "zeronuxstore",
    storageBucket: "zeronuxstore.firebasestorage.app",
    messagingSenderId: "372553296362",
    appId: "1:372553296362:web:4bca9efd5bc12e3f0f6a93",
    measurementId: "G-HSL9HN8V61"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const productsRef = database.ref('products');
const settingsRef = database.ref('settings');

// ============================================
// ZERONUX STORE APPLICATION
// ============================================

// Currency conversion functionality
let EXCHANGE_RATE = 9; // Default rate, will be loaded from Firebase
let currentCurrency = 'USD';

// Global Contact Info
let CONTACT_NUMBER = '218916808225'; // Default
let FACEBOOK_URL = '';

// Load settings (Exchange Rate & Contact Info)
function loadSettings() {
    settingsRef.on('value', (snapshot) => {
        const settings = snapshot.val();
        if (settings) {
            // 1. Update Exchange Rate
            if (settings.exchangeRate) {
                EXCHANGE_RATE = settings.exchangeRate;
                updatePrices(currentCurrency);
            }

            // 2. Update Phone Number
            if (settings.phoneNumber) {
                CONTACT_NUMBER = settings.phoneNumber;

                // Update Footer Text
                const footerPhonetext = document.getElementById('footer-phone-text');
                if (footerPhonetext) footerPhonetext.textContent = CONTACT_NUMBER;

                // Update WhatsApp Button HREF
                const whatsappBtn = document.getElementById('whatsapp-button');
                if (whatsappBtn) {
                    whatsappBtn.href = `https://wa.me/${CONTACT_NUMBER}`;
                }
            }

            // 3. Update Facebook URL
            if (settings.facebookUrl) {
                FACEBOOK_URL = settings.facebookUrl;
                const fbLink = document.getElementById('footer-facebook-link');
                if (fbLink) {
                    fbLink.href = FACEBOOK_URL;
                    fbLink.style.display = 'inline-flex'; // Show if link exists
                }
            } else {
                // Hide if no link
                const fbLink = document.getElementById('footer-facebook-link');
                if (fbLink) fbLink.style.display = 'none';
            }

            // 4. Update Email
            if (settings.contactEmail) {
                const footerEmailText = document.getElementById('footer-email-text');
                if (footerEmailText) footerEmailText.textContent = settings.contactEmail;
            }

            // 5. Update Hero Section
            if (settings.heroTitle) {
                const el = document.getElementById('hero-title-text');
                if (el) el.textContent = settings.heroTitle;
            }
            if (settings.heroSubtitle) {
                const el = document.getElementById('hero-subtitle-text');
                if (el) el.textContent = settings.heroSubtitle;
            }
            if (settings.heroDescription) {
                const el = document.getElementById('hero-desc-text');
                if (el) el.textContent = settings.heroDescription;
            }
            if (settings.heroImage) {
                const el = document.querySelector('.hero-image');
                if (el) el.src = settings.heroImage;
            }
        }
    });
}

// Currency formatting
function formatCurrency(amount, currency) {
    if (currency === 'USD') {
        return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
        return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.ل`;
    }
}

// Update all prices on the page
function updatePrices(currency) {
    const priceElements = document.querySelectorAll('.product-price');

    priceElements.forEach(priceEl => {
        const usdPrice = parseFloat(priceEl.dataset.usd);

        let displayPrice;
        if (currency === 'USD') {
            displayPrice = formatCurrency(usdPrice, 'USD');
        } else {
            // Calculate LYD price dynamically using the exchange rate
            const lydPrice = usdPrice * EXCHANGE_RATE;
            displayPrice = formatCurrency(lydPrice, 'LYD');
        }

        // Animate price change
        priceEl.style.transform = 'scale(1.1)';
        setTimeout(() => {
            priceEl.textContent = displayPrice;
            priceEl.style.transform = 'scale(1)';
        }, 150);
    });
}

// Currency switcher functionality
function initCurrencySwitcher() {
    const currencyButtons = document.querySelectorAll('.currency-btn');

    currencyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            currencyButtons.forEach(b => b.classList.remove('active'));

            // Add active class to clicked button
            btn.classList.add('active');

            // Update current currency
            currentCurrency = btn.dataset.currency;

            // Update all prices
            updatePrices(currentCurrency);
        });
    });
}

// Shopping cart functionality
let cart = [];

function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    cartCount.textContent = cart.length;

    // Animate cart count
    cartCount.style.transform = 'scale(1.3)';
    setTimeout(() => {
        cartCount.style.transform = 'scale(1)';
    }, 200);
}

function addToCart(productName, price) {
    cart.push({ name: productName, price: price });
    updateCartCount();

    // Show feedback
    showNotification(`${productName} ${t.cart.added}`);
}

// Add to cart button functionality
function initAddToCartButtons() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');

    addToCartButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();

            const productCard = btn.closest('.product-card');
            const productName = productCard.querySelector('.product-name').textContent;
            const priceElement = productCard.querySelector('.product-price');
            const usdPrice = parseFloat(priceElement.dataset.usd);
            const price = currentCurrency === 'USD' ? usdPrice : usdPrice * EXCHANGE_RATE;

            addToCart(productName, price);

            // Button animation
            btn.style.transform = 'scale(0.95)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// Cart button click handler
function initCartButton() {
    const cartBtn = document.querySelector('.cart-btn');

    cartBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('السلة فارغة! 🛒');
        } else {
            showCartModal();
        }
    });
}

// Notification system
function showNotification(message) {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // Add styles
    Object.assign(notification.style, {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '12px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        zIndex: '10000',
        fontWeight: '600',
        animation: 'slideInRight 0.3s ease-out',
        maxWidth: '300px'
    });

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add to cart function
// Add to cart function
function addToCart(productName, price, image, description) {
    cart.push({
        name: productName,
        price: price,
        image: image || 'https://via.placeholder.com/100',
        description: description || ''
    });
    updateCartCount();

    // Show notification
    const message = `تمت إضافة ${productName} إلى السلة! 🛒`;
    showNotification(message);
}

// Update cart count badge
function updateCartCount() {
    const cartBtn = document.querySelector('.cart-btn');
    if (!cartBtn) return;

    let badge = cartBtn.querySelector('.cart-count');
    if (!badge) {
        badge = document.createElement('span');
        badge.className = 'cart-count';
        Object.assign(badge.style, {
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: '700'
        });
        cartBtn.style.position = 'relative';
        cartBtn.appendChild(badge);
    }
    badge.textContent = cart.length;
    badge.style.display = cart.length > 0 ? 'flex' : 'none';
}

// Initialize cart button
function initCartButton() {
    const cartBtn = document.querySelector('.cart-btn');
    if (cartBtn) {
        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showCartModal();
        });
    }
}

// Initialize add to cart buttons
function initAddToCartButtons() {
    const addToCartBtns = document.querySelectorAll('.add-to-cart-btn');
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const productName = btn.dataset.productName;
            const productPrice = parseFloat(btn.dataset.productPrice);
            const price = currentCurrency === 'USD' ? productPrice : (productPrice * EXCHANGE_RATE);
            const image = btn.dataset.productImage;
            const description = btn.dataset.productDesc;

            addToCart(productName, price, image, description);

            // Animation for button
            btn.classList.add('added');
            setTimeout(() => {
                btn.classList.remove('added');
            }, 1000);
        });
    });
}

// Cart modal
function showCartModal() {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'cart-modal-overlay';

    // Create modal
    const modal = document.createElement('div');
    modal.className = 'cart-modal';

    let cartHTML = `
        <div class="cart-modal-header">
            <h2>سلة التسوق</h2>
            <button class="close-modal-btn">&times;</button>
        </div>
        <div class="cart-items">
    `;

    let total = 0;
    cart.forEach((item, index) => {
        total += item.price;
        cartHTML += `
            <div class="cart-item">
                <div class="cart-item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="cart-item-details">
                    <span class="cart-item-name">${item.name}</span>
                    <p class="cart-item-desc">${item.description || ''}</p>
                    <span class="cart-item-price">${formatCurrency(item.price, currentCurrency)}</span>
                </div>
                <button class="remove-item-btn" data-index="${index}">&times;</button>
            </div>
        `;
    });

    cartHTML += `
        </div>
        <div class="cart-total">
            <strong>المجموع:</strong>
            <strong>${formatCurrency(total, currentCurrency)}</strong>
        </div>
        <div class="cart-actions">
            <button class="btn btn-primary checkout-btn">إتمام الطلب</button>
            <button class="btn btn-secondary clear-cart-btn">إفراغ السلة</button>
        </div>
    `;

    modal.innerHTML = cartHTML;

    // Add styles
    Object.assign(overlay.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        bottom: '0',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        zIndex: '9999',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out'
    });

    Object.assign(modal.style, {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '2rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        animation: 'slideInUp 0.3s ease-out',
        direction: 'rtl'
    });

    // Add extra styles for modal content
    const style = document.createElement('style');
    style.textContent = `
        .cart-item { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.05); border-radius: 12px; margin-bottom: 1rem; position: relative; }
        .cart-item-image { width: 60px; height: 60px; flex-shrink: 0; border-radius: 8px; overflow: hidden; background: white; }
        .cart-item-image img { width: 100%; height: 100%; object-fit: contain; }
        .cart-item-details { flex: 1; display: flex; flex-direction: column; gap: 0.25rem; }
        .cart-item-name { font-weight: 700; font-size: 1rem; }
        .cart-item-desc { font-size: 0.85rem; color: rgba(255, 255, 255, 0.6); margin: 0; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
        .cart-item-price { color: #f093fb; font-weight: 600; font-size: 0.95rem; }
        .remove-item-btn { width: 24px; height: 24px; border-radius: 50%; background: rgba(255, 59, 48, 0.2); color: #ff3b30; border: none; display: flex; align-items: center; justifyContent: center; cursor: pointer; position: absolute; top: 10px; left: 10px; font-size: 1.2rem; line-height: 1; }
        .remove-item-btn:hover { background: rgba(255, 59, 48, 0.4); }
    `;
    modal.appendChild(style);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Close modal handlers
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => closeModal(overlay));

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            closeModal(overlay);
        }
    });

    // Remove item handlers
    const removeButtons = modal.querySelectorAll('.remove-item-btn');
    removeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            cart.splice(index, 1);
            updateCartCount();
            closeModal(overlay);
            if (cart.length > 0) {
                showCartModal();
            } else {
                showNotification('تم إفراغ السلة');
            }
        });
    });

    // Clear cart handler
    const clearCartBtn = modal.querySelector('.clear-cart-btn');
    clearCartBtn.addEventListener('click', () => {
        cart = [];
        updateCartCount();
        closeModal(overlay);
        showNotification('تم مسح السلة بنجاح');
    });

    // Checkout handler
    const checkoutBtn = modal.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', () => {
        closeModal(overlay);

        // Generate WhatsApp message
        const phoneNumber = '218916808225'; // Libyan number
        let message = '🛍️ *طلب جديد من متجر زيرونكس*\n\n';

        message += '*المنتجات:*\n';

        cart.forEach((item, index) => {
            const itemPrice = formatCurrency(item.price, currentCurrency);
            message += `${index + 1}. ${item.name} - ${itemPrice}\n`;
        });

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        const totalFormatted = formatCurrency(total, currentCurrency);

        message += `\n*المجموع:* ${totalFormatted}`;

        // Encode message for URL
        const encodedMessage = encodeURIComponent(message);

        // Open WhatsApp
        // Use global CONTACT_NUMBER
        const whatsappURL = `https://wa.me/${CONTACT_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');

        // Show confirmation
        showNotification('جاري فتح واتساب...');
    });
}

function closeModal(overlay) {
    overlay.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => {
        overlay.remove();
    }, 300);
}

// Newsletter form
function initNewsletterForm() {
    const form = document.querySelector('.newsletter-form');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('شكراً لاشتراكك في النشرة البريدية! 🎉');
        form.reset();
    });
}

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = link.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar

                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });

                    // Update active link
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });
}

// Navbar scroll effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(15, 15, 30, 0.95)';
            navbar.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
        } else {
            navbar.style.background = 'rgba(15, 15, 30, 0.8)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// Product card animation on scroll
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });

    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(card);
    });
}

// Add dynamic animations to CSS
function addDynamicStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
        }
        
        @keyframes slideInUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .cart-modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .cart-modal-header h2 {
            font-family: 'Outfit', sans-serif;
            font-size: 1.75rem;
            margin: 0;
        }
        
        .close-modal-btn {
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: background 0.2s ease;
        }
        
        .close-modal-btn:hover {
            background: rgba(255, 255, 255, 0.1);
        }
        
        .cart-items {
            margin-bottom: 1.5rem;
            max-height: 400px;
            overflow-y: auto;
        }
        
        .cart-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 1rem;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            margin-bottom: 0.75rem;
        }
        
        .cart-item-name {
            flex: 1;
            font-weight: 600;
        }
        
        .cart-item-price {
            font-weight: 700;
            color: #667eea;
        }
        
        .remove-item-btn {
            padding: 0.5rem 1rem;
            background: rgba(245, 87, 108, 0.2);
            border: 1px solid #f5576c;
            border-radius: 6px;
            color: #f5576c;
            cursor: pointer;
            font-size: 0.875rem;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        
        .remove-item-btn:hover {
            background: #f5576c;
            color: white;
        }
        
        .cart-total {
            display: flex;
            justify-content: space-between;
            padding: 1.5rem 0;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            margin-bottom: 1.5rem;
            font-size: 1.25rem;
        }
        
        .cart-actions {
            display: flex;
            gap: 1rem;
        }
        
        .cart-actions .btn {
            flex: 1;
        }
    `;
    document.head.appendChild(style);
}

// Product details modal - Updated for Firebase
function showProductDetails(productId) {
    // Fetch product from Firebase
    productsRef.child(productId).once('value', (snapshot) => {
        const product = snapshot.val();
        if (!product) {
            alert('المنتج غير موجود');
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'product-modal-overlay';

        const modal = document.createElement('div');
        modal.className = 'product-modal';

        // Build features HTML
        let featuresHTML = '';
        if (product.features && product.features.length > 0) {
            product.features.forEach(feature => {
                featuresHTML += `
                    <div class="feature-item">
                        <div class="feature-icon-large">${feature.icon}</div>
                        <div class="feature-content">
                            <h4>${feature.title}</h4>
                            <p>${feature.description}</p>
                        </div>
                    </div>
                `;
            });
        } else {
            featuresHTML = `<p>${product.description}</p>`;
        }

        const priceUSD = product.price;
        const priceLYD = priceUSD * EXCHANGE_RATE;
        const displayPrice = currentCurrency === 'USD' ? formatCurrency(priceUSD, 'USD') : formatCurrency(priceLYD, 'LYD');

        modal.innerHTML = `
            <div class="product-modal-header">
                <div class="product-modal-title">
                    <h2>${product.name}</h2>
                    <p class="product-modal-subtitle">${product.shortDesc || product.description.substring(0, 100)}</p>
                </div>
                <button class="close-modal-btn">&times;</button>
            </div>
            <div class="product-modal-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/500x300?text=No+Image'">
            </div>
            <div class="product-modal-body">
                <h3 class="features-title">المميزات المتضمنة</h3>
                <div class="features-list">
                    ${featuresHTML}
                </div>
            </div>
            <div class="product-modal-footer">
                <div class="modal-price-section">
                    <span class="modal-price-label">السعر:</span>
                    <span class="modal-price">${displayPrice}</span>
                </div>
                <button class="btn btn-primary add-to-cart-modal" data-product-name="${product.name}" data-product-price="${product.price}">
                    إضافة للسلة
                </button>
            </div>
        `;

        Object.assign(overlay.style, {
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
            background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)', zIndex: '10000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.3s ease-out', padding: '1rem', overflowY: 'auto'
        });

        Object.assign(modal.style, {
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
            maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto',
            animation: 'slideInUp 0.3s ease-out', direction: 'rtl'
        });

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        // Styles for modal content
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
        .product-modal-header { padding: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: flex-start; }
        .product-modal-title h2 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin: 0 0 0.5rem 0; }
        .product-modal-subtitle { color: rgba(255, 255, 255, 0.7); font-size: 1.125rem; margin: 0; }
        .product-modal-image { padding: 0 2rem; }
        .product-modal-image img { width: 100%; max-height: 300px; object-fit: contain; border-radius: 12px; }
        .product-modal-body { padding: 2rem; }
        .features-title { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1.5rem; }
        .features-list { display: grid; gap: 1rem; }
        .feature-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; transition: all 0.2s ease; }
        .feature-item:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(102, 126, 234, 0.5); }
        .feature-icon-large { font-size: 2rem; min-width: 40px; }
        .feature-content h4 { font-size: 1.125rem; margin: 0 0 0.5rem 0; }
        .feature-content p { color: rgba(255, 255, 255, 0.7); margin: 0; line-height: 1.6; }
        .product-modal-footer { padding: 2rem; border-top: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; gap: 2rem; flex-wrap: wrap; }
        .modal-price-section { display: flex; flex-direction: column; gap: 0.5rem; }
        .modal-price-label { color: rgba(255, 255, 255, 0.7); font-size: 0.875rem; }
        .modal-price { font-size: 2rem; font-weight: 700; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .add-to-cart-modal { padding: 1rem 2rem; white-space: nowrap; }
    `;
        document.head.appendChild(modalStyles);

        const closeBtn = modal.querySelector('.close-modal-btn');
        closeBtn.addEventListener('click', () => closeModal(overlay));
        overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });

        const addToCartBtn = modal.querySelector('.add-to-cart-modal');
        addToCartBtn.addEventListener('click', () => {
            const productName = addToCartBtn.dataset.productName;
            const productPrice = parseFloat(addToCartBtn.dataset.productPrice);
            const price = currentCurrency === 'USD' ? productPrice : (productPrice * EXCHANGE_RATE);
            addToCart(productName, price, product.image, product.shortDesc || product.description.substring(0, 100));
            closeModal(overlay);
        });
    });
}

// Initialize product card click handlers
function initProductCardClick() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart-btn')) {
                const productId = card.dataset.productId;
                if (productId) {
                    showProductDetails(productId);
                }
            }
        });
    });
}

// About modal
function showAboutModal() {
    const overlay = document.createElement('div');
    overlay.className = 'about-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'about-modal';

    modal.innerHTML = `
        <div class="about-modal-header">
            <h2>من نحن</h2>
            <button class="close-modal-btn">&times;</button>
        </div>
        <div class="about-modal-body">
            <div class="about-description">
                <p>نحن متجر زيرونكس، واجهتك الأولى للحصول على أفضل المنتجات الرقمية والاشتراكات العالمية بأسعار منافسة في ليبيا. نسعى دائماً لتقديم خدمة موثوقة وسريعة لعملائنا.</p>
            </div>
            
            <div class="about-contact">
                <h3>معلومات التواصل</h3>
                
                <div class="contact-item">
                    <div class="contact-icon">📱</div>
                    <div class="contact-details">
                        <strong>الهاتف</strong>
                        <a href="tel:${CONTACT_NUMBER}">+${CONTACT_NUMBER}</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">📍</div>
                    <div class="contact-details">
                        <strong>الموقع</strong>
                        <p>ليبيا، طرابلس (متجر إلكتروني)</p>
                    </div>
                </div>
                
                <div class="contact-item" style="display: ${FACEBOOK_URL ? 'flex' : 'none'}">
                    <div class="contact-icon">👤</div>
                    <div class="contact-details">
                        <strong>فيسبوك</strong>
                        <a href="${FACEBOOK_URL || '#'}" target="_blank">تواصل معنا عبر فيسبوك</a>
                    </div>
                </div>
                
                <div class="contact-item">
                    <div class="contact-icon">🛟</div>
                    <div class="contact-details">
                        <strong>الدعم الفني</strong>
                        <p>متواجدون لخدمتكم على مدار الساعة</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)', zIndex: '10000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out', padding: '1rem', overflowY: 'auto'
    });

    Object.assign(modal.style, {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
        maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto',
        animation: 'slideInUp 0.3s ease-out', direction: 'rtl'
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    // Styles for about modal
    const aboutStyles = document.createElement('style');
    aboutStyles.textContent = `
        .about-modal-header { padding: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
        .about-modal-header h2 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin: 0; }
        .about-modal-body { padding: 2rem; }
        .about-description { margin-bottom: 2rem; }
        .about-description p { font-size: 1.125rem; line-height: 1.8; color: rgba(255, 255, 255, 0.8); margin: 0; }
        .about-contact h3 { font-family: 'Outfit', sans-serif; font-size: 1.5rem; margin-bottom: 1.5rem; }
        .contact-item { display: flex; align-items: flex-start; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; margin-bottom: 1rem; transition: all 0.2s ease; }
        .contact-item:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(102, 126, 234, 0.5); }
        .contact-icon { font-size: 2rem; min-width: 40px; }
        .contact-details { flex: 1; }
        .contact-details strong { display: block; font-size: 1rem; margin-bottom: 0.25rem; color: rgba(255, 255, 255, 0.9); }
        .contact-details p { margin: 0; color: rgba(255, 255, 255, 0.7); }
        .contact-details a { color: #4facfe; text-decoration: none; transition: color 0.2s ease; }
        .contact-details a:hover { color: #667eea; text-decoration: underline; }
    `;
    document.head.appendChild(aboutStyles);

    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => closeModal(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });
}

function initAboutLink() {
    const aboutLink = document.querySelector('[href="#about"]');
    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAboutModal();
        });
    }
}

// Contact modal
function showContactModal() {
    const overlay = document.createElement('div');
    overlay.className = 'contact-modal-overlay';

    const modal = document.createElement('div');
    modal.className = 'contact-modal';

    modal.innerHTML = `
        <div class="contact-modal-header">
            <h2>تواصل معنا</h2>
            <button class="close-modal-btn">&times;</button>
        </div>
        <div class="contact-modal-body">
            <div class="contact-description">
                <p>هل لديك استفسار؟ نحن هنا للمساعدة، يمكنك مراسلتنا مباشرة.</p>
            </div>
            
            <form class="contact-form">
                <div class="form-group">
                    <label>الاسم</label>
                    <input type="text" class="form-input" placeholder="أدخل اسمك الكريم" required>
                </div>
                
                <div class="form-group">
                    <label>البريد الإلكتروني</label>
                    <input type="email" class="form-input" placeholder="example@email.com" required>
                </div>
                
                <div class="form-group">
                    <label>الرسالة</label>
                    <textarea class="form-textarea" placeholder="كيف يمكننا مساعدتك؟" rows="5" required></textarea>
                </div>
                
                <button type="submit" class="btn btn-primary contact-submit">إرسال الرسالة</button>
            </form>
            
            <div class="contact-divider">
                <span>أو تواصل مباشرة</span>
            </div>
            
            <div class="contact-direct">
                <a href="tel:${CONTACT_NUMBER}" class="contact-link">
                    <div class="contact-link-icon">📱</div>
                    <div class="contact-link-text">
                        <strong>اتصل بنا</strong>
                        <span>+${CONTACT_NUMBER}</span>
                    </div>
                </a>
                
                <a href="${FACEBOOK_URL || '#'}" target="_blank" class="contact-link" style="display: ${FACEBOOK_URL ? 'flex' : 'none'}">
                    <div class="contact-link-icon">👤</div>
                    <div class="contact-link-text">
                        <strong>فيسبوك</strong>
                        <span>تواصل معنا عبر فيسبوك</span>
                    </div>
                </a>
            </div>
        </div>
    `;

    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', right: '0', bottom: '0',
        background: 'rgba(0, 0, 0, 0.9)', backdropFilter: 'blur(10px)', zIndex: '10000',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.3s ease-out', padding: '1rem', overflowY: 'auto'
    });

    Object.assign(modal.style, {
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '16px',
        maxWidth: '600px', width: '100%', maxHeight: '90vh', overflow: 'auto',
        animation: 'slideInUp 0.3s ease-out', direction: 'rtl'
    });

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const contactStyles = document.createElement('style');
    contactStyles.textContent = `
        .contact-modal-header { padding: 2rem; border-bottom: 1px solid rgba(255, 255, 255, 0.1); display: flex; justify-content: space-between; align-items: center; }
        .contact-modal-header h2 { font-family: 'Outfit', sans-serif; font-size: 2rem; margin: 0; }
        .contact-modal-body { padding: 2rem; }
        .contact-description { margin-bottom: 2rem; }
        .contact-description p { font-size: 1.125rem; line-height: 1.8; color: rgba(255, 255, 255, 0.8); margin: 0; }
        .contact-form { margin-bottom: 2rem; }
        .form-group { margin-bottom: 1.5rem; }
        .form-group label { display: block; font-weight: 600; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.9); }
        .form-input, .form-textarea { width: 100%; padding: 1rem; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; font-family: inherit; font-size: 1rem; transition: all 0.2s ease; }
        .form-input:focus, .form-textarea:focus { outline: none; border-color: #667eea; background: rgba(255, 255, 255, 0.08); box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1); }
        .form-input::placeholder, .form-textarea::placeholder { color: rgba(255, 255, 255, 0.4); }
        .form-textarea { resize: vertical; min-height: 120px; }
        .contact-submit { width: 100%; padding: 1rem 2rem; font-size: 1.125rem; }
        .contact-divider { text-align: center; margin: 2rem 0; position: relative; }
        .contact-divider::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 1px; background: rgba(255, 255, 255, 0.1); }
        .contact-divider span { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 0 1rem; position: relative; color: rgba(255, 255, 255, 0.6); }
        .contact-direct { display: flex; flex-direction: column; gap: 1rem; }
        .contact-link { display: flex; align-items: center; gap: 1rem; padding: 1rem; background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; text-decoration: none; transition: all 0.2s ease; }
        .contact-link:hover { background: rgba(255, 255, 255, 0.05); border-color: rgba(102, 126, 234, 0.5); }
        .contact-link-icon { font-size: 2rem; min-width: 40px; }
        .contact-link-text { display: flex; flex-direction: column; gap: 0.25rem; }
        .contact-link-text strong { color: rgba(255, 255, 255, 0.9); font-size: 1rem; }
        .contact-link-text span { color: #4facfe; font-size: 0.875rem; }
    `;
    document.head.appendChild(contactStyles);

    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => closeModal(overlay));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(overlay); });

    const contactForm = modal.querySelector('.contact-form');
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;

        // Redirect to WhatsApp with message
        // Use global CONTACT_NUMBER
        const whatsappMessage = `📧 *New Message from ZeroNux Website*\n\n*Name:* ${name}\n*Email:* ${email}\n\n*Message:*\n${message}`;
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappURL = `https://wa.me/${CONTACT_NUMBER}?text=${encodedMessage}`;
        window.open(whatsappURL, '_blank');
        closeModal(overlay);
        showNotification(contact.messageSent);
    });
}

function initContactLink() {
    const contactLink = document.querySelector('[href="#contact"]');
    if (contactLink) {
        contactLink.addEventListener('click', (e) => {
            e.preventDefault();
            showContactModal();
        });
    }
}

// Footer links handler
function initFooterLinks() {
    // About and Contact links in footer
    const footerAboutLink = document.querySelector('.footer-section a[href="#about"]');
    const footerContactLink = document.querySelector('.footer-section a[href="#contact"]');

    if (footerAboutLink) {
        footerAboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            showAboutModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    if (footerContactLink) {
        footerContactLink.addEventListener('click', (e) => {
            e.preventDefault();
            showContactModal();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // FAQ and Support links (WhatsApp)
    const footerWhatsAppLinks = document.querySelectorAll('.footer-whatsapp-link');
    footerWhatsAppLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Use global CONTACT_NUMBER
            const linkType = link.getAttribute('href');

            let message = '';
            if (linkType === '#footer-faq') {
                message = 'مرحباً، لدي استفسار بخصوص الأسئلة الشائعة.';
            } else if (linkType === '#footer-support') {
                message = 'مرحباً، أحتاج إلى مساعدة من الدعم الفني.';
            }

            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${CONTACT_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
        });
    });
}

// Logo click handler
function initLogoClick() {
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// Hero shop now button handler
function initHeroShopNow() {
    const shopNowBtn = document.querySelector('.hero-shop-now');
    if (shopNowBtn) {
        shopNowBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const productsSection = document.querySelector('#products');
            if (productsSection) {
                const offsetTop = productsSection.offsetTop - 80;
                window.scrollTo({ top: offsetTop, behavior: 'smooth' });
            }
        });
    }
}

// ============================================
// LOAD PRODUCTS FROM FIREBASE
// ============================================
function loadProductsFromFirebase() {
    const productsContainer = document.getElementById('products-container');

    // Show loading state
    productsContainer.innerHTML = '<div class="loading-products">جاري تحميل المنتجات...</div>';

    productsRef.on('value', (snapshot) => {
        const products = snapshot.val();
        productsContainer.innerHTML = '';

        if (!products || Object.keys(products).length === 0) {
            productsContainer.innerHTML = `
                <div class="no-products-message" style="text-align: center; width: 100%; padding: 4rem 1rem;">
                    <h3 style="color: rgba(255, 255, 255, 0.7); font-size: 1.5rem;">لايوجد اي عروض الان</h3>
                </div>
            `;
            return;
        }

        let visibleCount = 0;
        // Render products from Firebase
        Object.keys(products).forEach(id => {
            const product = products[id];
            // Only show if visible is not false
            if (product.visible !== false) {
                const productCard = createProductCardHTML(id, product);
                productsContainer.innerHTML += productCard;
                visibleCount++;
            }
        });

        // Check if all products were hidden
        if (visibleCount === 0) {
            productsContainer.innerHTML = `
                <div class="no-products-message" style="text-align: center; width: 100%; padding: 4rem 1rem;">
                    <h3 style="color: rgba(255, 255, 255, 0.7); font-size: 1.5rem;">لايوجد اي عروض الان</h3>
                </div>
            `;
        }

        // Re-initialize buttons and events
        initAddToCartButtons();
        initProductCardClick();

        // Check for product ID in URL (Deep Linking)
        const urlParams = new URLSearchParams(window.location.search);
        const productIdFromUrl = urlParams.get('product');

        if (productIdFromUrl && products[productIdFromUrl]) {
            // Wait a bit to ensure DOM is ready and animations play nicely
            setTimeout(() => {
                showProductDetails(productIdFromUrl);

                // Scroll to products section
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    productsSection.scrollIntoView({ behavior: 'smooth' });
                }

                // Clean URL without refreshing
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                window.history.pushState({ path: newUrl }, '', newUrl);
            }, 500);
        }
    });
}


// Create product card HTML from Firebase data
function createProductCardHTML(id, product) {
    const badgeMap = {
        'new': 'جديد',
        'limited': 'عرض محدود',
        'hot': 'الأكثر مبيعاً'
    };

    const badgeHTML = product.badge && product.badge !== 'none'
        ? `<div class="product-badge" data-badge="${product.badge}">${badgeMap[product.badge]}</div>`
        : '';

    const price = currentCurrency === 'USD'
        ? `$${product.price.toFixed(2)}`
        : `${(product.price * EXCHANGE_RATE).toFixed(2)} د.ل`;

    return `
        <div class="product-card" data-product-id="${id}">
            ${badgeHTML}
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" class="product-img" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.shortDesc || product.description.substring(0, 60) + '...'}</p>
                <div class="product-footer">
                    <span class="product-price" data-usd="${product.price}">${price}</span>
                    <button class="add-to-cart-btn" data-product-name="${product.name}" data-product-price="${product.price}" data-product-image="${product.image}" data-product-desc="${product.shortDesc || product.description.substring(0, 60) + '...'}">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 2L6 6M18 6L15 2M6 6h12l1 14H5L6 6z" />
                        </svg>
                        إضافة للسلة
                    </button>
                </div>
            </div>
        </div>
    `;
}

// WhatsApp floating button
function initWhatsAppButton() {
    const whatsappBtn = document.getElementById('whatsapp-button');
    if (whatsappBtn) {
        whatsappBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Use global CONTACT_NUMBER loaded from settings
            const message = '';
            const encodedMessage = encodeURIComponent(message);
            const whatsappURL = `https://wa.me/${CONTACT_NUMBER}?text=${encodedMessage}`;
            window.open(whatsappURL, '_blank');
        });
    }
}

// Initialize all functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load products from Firebase
    loadProductsFromFirebase();
    loadSettings();

    initCurrencySwitcher();
    initAddToCartButtons();
    initCartButton();
    initNewsletterForm();
    initSmoothScrolling();
    initNavbarScroll();
    initScrollAnimations();
    initSearch();
    addDynamicStyles();
    initProductCardClick();
    initAboutLink();
    initContactLink();
    initFooterLinks();
    initLogoClick();
    initHeroShopNow();
    initWhatsAppButton();

    console.log('ZeroNux Store initialized successfully!');
});

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('product-search');
    const productsContainer = document.getElementById('products-container');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.product-card');
            let hasVisibleProduct = false;

            productCards.forEach(card => {
                const productName = card.querySelector('.product-name').textContent.toLowerCase();
                // Also search in description for better results
                const productDesc = card.querySelector('.product-description').textContent.toLowerCase();

                if (productName.includes(query) || productDesc.includes(query)) {
                    card.style.display = 'block';
                    // Re-run animation for found items
                    card.style.animation = 'none';
                    card.offsetHeight; /* trigger reflow */
                    card.style.animation = 'fadeInUp 0.5s ease-out forwards';
                    hasVisibleProduct = true;
                } else {
                    card.style.display = 'none';
                }
            });

            // Handle no results
            const noResultsMsg = document.querySelector('.no-results-search');
            if (!hasVisibleProduct && query !== '') {
                if (!noResultsMsg) {
                    const msg = document.createElement('div');
                    msg.className = 'no-results-search';
                    msg.style.textAlign = 'center';
                    msg.style.width = '100%';
                    msg.style.gridColumn = '1 / -1';
                    msg.style.padding = '2rem';
                    msg.style.color = 'rgba(255,255,255,0.7)';
                    msg.innerHTML = '<h3>لا توجد نتائج مطابقة لبحثك 🔍</h3>';
                    productsContainer.appendChild(msg);
                }
            } else {
                if (noResultsMsg) noResultsMsg.remove();
            }
        });
    }
}
