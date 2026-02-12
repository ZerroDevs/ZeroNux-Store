// ============================================
// STUDENTS BOOKS PAGE - FIREBASE & LOGIC
// ============================================
(function () {
    console.log("Students script initialized");

    const firebaseConfig = {
        apiKey: "AIzaSyCiS9TwRDxlpQ1Z_A6QcBi0f6307vI49ws",
        authDomain: "zeronuxstore.firebaseapp.com",
        databaseURL: "https://zeronuxstore-default-rtdb.firebaseio.com",
        projectId: "zeronuxstore",
        storageBucket: "zeronuxstore.firebasestorage.app",
        messagingSenderId: "372553296362",
        appId: "1:372553296362:web:4bca9efd5bc12e3f0f6a93",
        measurementId: "G-HSL9HN8V61"
    };

    // Initialize Firebase only if not already initialized
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const database = firebase.database();
    const studentBooksRef = database.ref('studentBooks');
    const bookRequestsRef = database.ref('bookRequests');
    const settingsRef = database.ref('settings');

    // Global State (Local to this IIFE)
    let CONTACT_NUMBER = '218916808225';
    let EXCHANGE_RATE = 1;
    let currentCurrency = 'USD';
    let allBooks = {};

    // ============================================
    // LOAD SETTINGS (theme, contact info, exchange rate)
    // ============================================
    function loadSettings() {
        settingsRef.on('value', (snapshot) => {
            const settings = snapshot.val();
            if (settings) {
                if (settings.phoneNumber) CONTACT_NUMBER = settings.phoneNumber;
                if (settings.exchangeRate) EXCHANGE_RATE = parseFloat(settings.exchangeRate) || 1;

                // Apply theme (Optional: app.js also does this, but keeping it here ensures this page specific logic works)
                if (settings.theme) {
                    const root = document.documentElement;
                    if (settings.theme.primary) {
                        root.style.setProperty('--primary', settings.theme.primary);
                        root.style.setProperty('--primary-gradient', `linear-gradient(135deg, ${settings.theme.primary} 0%, ${settings.theme.secondary || '#764ba2'} 100%)`);
                    }
                    if (settings.theme.secondary) root.style.setProperty('--secondary', settings.theme.secondary);
                    if (settings.theme.accent) root.style.setProperty('--accent', settings.theme.accent);
                    if (settings.theme.bgPrimary) root.style.setProperty('--bg-primary', settings.theme.bgPrimary);
                    if (settings.theme.bgSecondary) root.style.setProperty('--bg-secondary', settings.theme.bgSecondary);
                    if (settings.theme.textPrimary) root.style.setProperty('--text-primary', settings.theme.textPrimary);
                    if (settings.theme.textSecondary) root.style.setProperty('--text-secondary', settings.theme.textSecondary);
                }
            }
            // Re-render to update exchange rate if needed
            renderBooks();
        });
    }

    // ============================================
    // CURRENCY TOGGLE
    // ============================================
    // Listen for global currency change event from app.js
    document.addEventListener('currency-change', (e) => {
        if (e.detail && e.detail.currency) {
            currentCurrency = e.detail.currency;
            renderBooks();
        }
    });

    // Helper to format price
    function formatPrice(price) {
        if (currentCurrency === 'USD') {
            return `$${parseFloat(price).toFixed(2)}`;
        } else {
            return `${(parseFloat(price) * EXCHANGE_RATE).toFixed(2)} د.ل`;
        }
    }

    // ============================================
    // LOAD & RENDER BOOKS
    // ============================================
    function loadBooks() {
        const grid = document.getElementById('books-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="books-loading">
                <div class="spinner"></div>
                <p>جاري تحميل الكتب...</p>
            </div>
        `;

        studentBooksRef.on('value', (snapshot) => {
            allBooks = snapshot.val() || {};
            renderBooks();
        }, (error) => {
            console.error("Error loading books:", error);
            grid.innerHTML = `<p>حدث خطأ أثناء تحميل الكتب.</p>`;
        });
    }

    function renderBooks() {
        const grid = document.getElementById('books-grid');
        if (!grid) return;

        grid.innerHTML = '';

        if (!allBooks || Object.keys(allBooks).length === 0) {
            grid.innerHTML = `
                <div class="books-empty">
                    <span class="books-empty-icon">📚</span>
                    <h3>لا توجد كتب حالياً</h3>
                    <p>سيتم إضافة الكتب قريباً. يمكنك طلب كتاب من خلال النموذج أدناه</p>
                </div>
            `;
            return;
        }

        // Only show visible books
        const bookEntries = Object.entries(allBooks).filter(([id, book]) => book.visible !== false);

        if (bookEntries.length === 0) {
            grid.innerHTML = `
                <div class="books-empty">
                    <span class="books-empty-icon">📚</span>
                    <h3>لا توجد كتب حالياً</h3>
                    <p>سيتم إضافة الكتب قريباً. يمكنك طلب كتاب من خلال النموذج أدناه</p>
                </div>
            `;
            return;
        }

        bookEntries.forEach(([id, book]) => {
            const card = createBookCard(id, book);
            grid.appendChild(card);
        });
    }

    function createBookCard(id, book) {
        const card = document.createElement('div');
        card.className = 'book-card';

        const isContactPrice = book.priceType === 'contact';

        let priceHTML = '';
        let priceText = '';

        if (isContactPrice) {
            priceHTML = '<span class="book-card-price contact-price">📞 تواصل للسعر</span>';
            priceText = 'تواصل للسعر';
        } else {
            const p = formatPrice(book.price);
            priceHTML = `<span class="book-card-price">${p}</span>`;
            priceText = p;
        }

        const whatsappMsg = encodeURIComponent(`مرحباً، أريد طلب كتاب: ${book.name} - السعر: ${priceText}`);

        card.innerHTML = `
            <div class="book-card-image">
                <img src="${book.image || 'https://via.placeholder.com/300x220?text=📖'}" alt="${book.name}" onerror="this.src='https://via.placeholder.com/300x220?text=📖'">
            </div>
            <div class="book-card-info">
                <h3 class="book-card-name">${book.name}</h3>
                ${priceHTML}
                <a href="https://wa.me/${CONTACT_NUMBER}?text=${whatsappMsg}" target="_blank" class="book-order-btn">
                    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    اطلب عبر واتساب
                </a>
            </div>
        `;
        return card;
    }

    // ============================================
    // BOOK REQUEST FORM
    // ============================================
    function initRequestForm() {
        const form = document.getElementById('book-request-form');
        const successDiv = document.getElementById('request-success');
        const formDiv = document.getElementById('request-form-wrapper');

        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('.request-submit-btn');
            submitBtn.disabled = true;
            submitBtn.textContent = 'جاري الإرسال...';

            const requestData = {
                name: document.getElementById('req-name').value.trim(),
                phone: document.getElementById('req-phone').value.trim(),
                bookName: document.getElementById('req-book-name').value.trim(),
                description: document.getElementById('req-description').value.trim(),
                timestamp: Date.now(),
                status: 'new'
            };

            // Using the locally defined bookRequestsRef
            bookRequestsRef.push(requestData)
                .then(() => {
                    // Show success
                    formDiv.style.display = 'none';
                    successDiv.style.display = 'block';
                    form.reset();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'إرسال الطلب';
                })
                .catch((error) => {
                    showPageNotification('حدث خطأ: ' + error.message, 'error');
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'إرسال الطلب';
                });
        });

        // "New request" button in success view
        const newReqBtn = document.getElementById('btn-new-request');
        if (newReqBtn) {
            newReqBtn.addEventListener('click', () => {
                successDiv.style.display = 'none';
                formDiv.style.display = 'block';
            });
        }
    }

    // ============================================
    // NOTIFICATION
    // ============================================
    function showPageNotification(message, type = 'success') {
        const existing = document.querySelector('.page-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = 'page-notification';
        const bgColor = type === 'success'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #f5576c 0%, #ff6b6b 100%)';

        Object.assign(notification.style, {
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: bgColor,
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            zIndex: '10000',
            fontWeight: '600',
            fontFamily: "'Cairo', sans-serif",
            maxWidth: '300px',
            animation: 'slideInRight 0.3s ease-out'
        });
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // ============================================
    // INIT
    // ============================================
    document.addEventListener('DOMContentLoaded', () => {
        loadSettings();
        loadBooks();
        initRequestForm();
    });

})();
