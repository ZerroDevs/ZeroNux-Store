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
const auth = firebase.auth();
const productsRef = database.ref('products');
const settingsRef = database.ref('settings');

// ============================================
// SETTINGS MANAGEMENT
// ============================================
// Load settings (exchange rate)
function loadSettings() {
    settingsRef.once('value', (snapshot) => {
        const settings = snapshot.val();
        if (settings && settings.exchangeRate) {
            document.getElementById('exchange-rate').value = settings.exchangeRate;
        } else {
            // Default exchange rate
            document.getElementById('exchange-rate').value = 9;
        }
    });
}

// Save settings
document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value);

    settingsRef.update({
        exchangeRate: exchangeRate,
        lastUpdated: Date.now()
    })
        .then(() => {
            alert('تم حفظ الإعدادات بنجاح! ✅\nسيتم تطبيق سعر الصرف الجديد على جميع الأجهزة.');
        })
        .catch((error) => {
            alert('حدث خطأ: ' + error.message);
        });
});

// ============================================
// ADMIN AUTHENTICATION (SECURE - Firebase Auth)
// NO HARDCODED PASSWORDS - 100% SECURE!
// ============================================
let currentUser = null;

// Check authentication state
function checkAuthState() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in
            currentUser = user;
            showDashboard();
            loadProducts();
            loadSettings();  // Load exchange rate settings
        } else {
            // User is signed out
            currentUser = null;
            showLoginScreen();
        }
    });
}

// Logout
function logout() {
    auth.signOut().then(() => {
        console.log('Logged out successfully');
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Show/Hide screens
function showLoginScreen() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
}

function showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
}

// Login form handler
document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('login-error');

    // Show loading
    errorEl.textContent = 'جاري تسجيل الدخول...';
    errorEl.style.color = '#4facfe';

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in successfully
            errorEl.textContent = '';
            document.getElementById('login-form').reset();
        })
        .catch((error) => {
            // Handle errors
            errorEl.style.color = '#f5576c';
            switch (error.code) {
                case 'auth/invalid-email':
                    errorEl.textContent = 'البريد الإلكتروني غير صحيح';
                    break;
                case 'auth/user-not-found':
                    errorEl.textContent = 'المستخدم غير موجود';
                    break;
                case 'auth/wrong-password':
                    errorEl.textContent = 'كلمة المرور خاطئة';
                    break;
                case 'auth/invalid-credential':
                    errorEl.textContent = 'البريد الإلكتروني أو كلمة المرور خاطئة';
                    break;
                default:
                    errorEl.textContent = 'حدث خطأ: ' + error.message;
            }
        });
});

// Logout button
document.getElementById('logout-btn').addEventListener('click', logout);

// ============================================
// PRODUCT MANAGEMENT
// ============================================
let editingProductId = null;

// Load products from Firebase
function loadProducts() {
    const productsList = document.getElementById('products-list');
    productsList.innerHTML = '<div class="loading">جاري تحميل المنتجات...</div>';

    productsRef.on('value', (snapshot) => {
        const products = snapshot.val();
        productsList.innerHTML = '';

        if (!products || Object.keys(products).length === 0) {
            productsList.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد منتجات بعد</p>
                    <p>ابدأ بإضافة منتجك الأول!</p>
                </div>
            `;
            return;
        }

        Object.keys(products).forEach(id => {
            const product = products[id];
            const card = createProductCard(id, product);
            productsList.appendChild(card);
        });
    });
}

// Create product card element
function createProductCard(id, product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    let badgeHtml = '';
    if (product.badge && product.badge !== 'none') {
        const badgeMap = {
            'new': 'جديد',
            'limited': 'عرض محدود',
            'hot': 'الأكثر مبيعاً'
        };
        badgeHtml = `<span class="product-badge badge-${product.badge}">${badgeMap[product.badge]}</span>`;
    }

    card.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        ${badgeHtml}
        <h3>${product.name}</h3>
        <p class="price">$${product.price}</p>
        <p class="description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
        <div class="product-actions">
            <button class="btn btn-edit" onclick="editProduct('${id}')">تعديل</button>
            <button class="btn btn-delete" onclick="deleteProduct('${id}')">حذف</button>
        </div>
    `;

    return card;
}

// Add/Update product
document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const productData = {
        name: document.getElementById('product-name').value,
        price: parseFloat(document.getElementById('product-price').value),
        shortDesc: document.getElementById('product-short-desc').value,
        description: document.getElementById('product-description').value,
        badge: document.getElementById('product-badge').value,
        image: document.getElementById('product-image').value,
        features: parseFeatures(document.getElementById('product-features').value),
        timestamp: Date.now()
    };

    if (editingProductId) {
        // Update existing product
        productsRef.child(editingProductId).update(productData)
            .then(() => {
                alert('تم تحديث المنتج بنجاح!');
                resetForm();
            })
            .catch((error) => {
                alert('حدث خطأ: ' + error.message);
            });
    } else {
        // Add new product
        productsRef.push(productData)
            .then(() => {
                alert('تم إضافة المنتج بنجاح!');
                resetForm();
            })
            .catch((error) => {
                alert('حدث خطأ: ' + error.message);
            });
    }
});

// Parse features from textarea
function parseFeatures(featuresText) {
    if (!featuresText.trim()) return [];

    const lines = featuresText.split('\n');
    return lines.map(line => {
        const parts = line.split('|');
        if (parts.length === 3) {
            return {
                icon: parts[0].trim(),
                title: parts[1].trim(),
                description: parts[2].trim()
            };
        }
        return null;
    }).filter(f => f !== null);
}

// Format features for editing
function formatFeatures(features) {
    if (!features || features.length === 0) return '';
    return features.map(f => `${f.icon}|${f.title}|${f.description}`).join('\n');
}

// Edit product
window.editProduct = function (id) {
    productsRef.child(id).once('value', (snapshot) => {
        const product = snapshot.val();

        document.getElementById('product-id').value = id;
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-short-desc').value = product.shortDesc || '';
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-badge').value = product.badge;
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-features').value = formatFeatures(product.features);

        editingProductId = id;
        document.getElementById('form-title').textContent = 'تعديل المنتج';
        document.getElementById('submit-btn').textContent = 'تحديث المنتج';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// Delete product
window.deleteProduct = function (id) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
        productsRef.child(id).remove()
            .then(() => {
                alert('تم حذف المنتج بنجاح!');
            })
            .catch((error) => {
                alert('حدث خطأ: ' + error.message);
            });
    }
};

// Reset form
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';
    editingProductId = null;
    document.getElementById('form-title').textContent = 'إضافة منتج جديد';
    document.getElementById('submit-btn').textContent = 'إضافة المنتج';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Cancel edit
document.getElementById('cancel-btn').addEventListener('click', resetForm);

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    checkAuthState();
});
