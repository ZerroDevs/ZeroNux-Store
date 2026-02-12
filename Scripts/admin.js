// ============================================
// FIREBASE CONFIGURATION
// ============================================
// ============================================
// FIREBASE CONFIGURATION
// ============================================
// Config moved to Scripts/firebase-config.js

// Initialize References
const database = window.database || firebase.database();
const auth = window.auth || firebase.auth();
const productsRef = database.ref('products');
const settingsRef = database.ref('settings');
const promosRef = database.ref('promos');
const ordersRef = database.ref('orders');
const studentBooksRef = database.ref('studentBooks');
const bookRequestsRef = database.ref('bookRequests');

// ============================================
// TAB SWITCHING
// ============================================
function switchTab(tabName) {
    // Remove active class from all tabs and content
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Add active class to the clicked tab button
    const clickedBtn = document.querySelector(`.tab-btn[onclick*="'${tabName}'"]`);
    if (clickedBtn) {
        clickedBtn.classList.add('active');
    }
    const tabContent = document.getElementById(`tab-${tabName}`);
    if (tabContent) {
        tabContent.classList.add('active');
    } else {
        console.error(`Tab content not found: tab-${tabName}`);
    }
}


// ============================================
// ORDERS MANAGEMENT
// ============================================
function loadOrders() {
    const ordersList = document.getElementById('orders-list');
    ordersList.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">جاري التحميل...</td></tr>';

    ordersRef.on('value', (snapshot) => {
        const orders = snapshot.val();
        ordersList.innerHTML = '';

        if (!orders) {
            ordersList.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">لا توجد طلبات بعد</td></tr>';
            updateOrderStats(0, 0, 0);
            return;
        }

        const ordersArray = Object.entries(orders).map(([id, data]) => ({ id, ...data }));
        ordersArray.sort((a, b) => b.timestamp - a.timestamp); // Newest first

        let pendingCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;

        ordersArray.forEach(order => {
            // Count by status
            if (order.status === 'pending') pendingCount++;
            else if (order.status === 'completed') completedCount++;
            else if (order.status === 'cancelled') cancelledCount++;

            const row = document.createElement('tr');
            const date = new Date(order.timestamp);
            const formattedDate = date.toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            const statusText = {
                'pending': 'قيد الانتظار',
                'processing': 'قيد التنفيذ',
                'shipped': 'تم الشحن',
                'completed': 'مكتملة',
                'cancelled': 'ملغاة'
            };

            // Calculate approximate USD value for the switcher
            const isLyd = order.currency === 'LYD';
            const totalUSD = isLyd ? (order.finalTotal / (window.exchangeRate || 9)) : order.finalTotal;
            const displayPrice = isLyd ? `${order.finalTotal.toFixed(2)} د.ل` : `$${parseFloat(order.finalTotal).toFixed(2)}`;

            row.innerHTML = `
                <td><input type="checkbox" class="bulk-check" value="${order.id}" data-type="orders"></td>
                <td><strong>${order.orderId || order.id.slice(-6)}</strong></td>
                <td>${formattedDate}</td>
                <td>${order.items ? order.items.length : 0} منتج</td>
                <td><span class="price-display" data-usd="${parseFloat(totalUSD).toFixed(2)}">${displayPrice}</span></td>
                <td><span class="order-status-badge status-${order.status}">${statusText[order.status] || order.status}</span></td>
                <td>
                    <div class="order-actions">
                        <button class="btn btn-secondary" onclick="viewOrderDetails('${order.id}')" title="عرض التفاصيل">👁️</button>
                        <select onchange="updateOrderStatus('${order.id}', this.value)" class="status-select" style="padding: 0.4rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 6px; cursor: pointer;">
                            <option value="">تغيير الحالة</option>
                            <option value="pending" ${order.status === 'pending' ? 'disabled' : ''}>قيد الانتظار</option>
                            <option value="processing" ${order.status === 'processing' ? 'disabled' : ''}>قيد التنفيذ</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'disabled' : ''}>تم الشحن</option>
                            <option value="completed" ${order.status === 'completed' ? 'disabled' : ''}>مكتملة</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'disabled' : ''}>ملغاة</option>
                        </select>
                        <button class="btn btn-danger" onclick="deleteOrder('${order.id}')" title="حذف">🗑️</button>
                    </div>
                </td>
            `;
            ordersList.appendChild(row);
        });

        updateOrderStats(pendingCount, completedCount, cancelledCount);
    });
}

function updateOrderStats(pending, completed, cancelled) {
    document.getElementById('orders-pending').textContent = pending;
    document.getElementById('orders-completed').textContent = completed;
    document.getElementById('orders-cancelled').textContent = cancelled;
}

function updateOrderStatus(orderId, newStatus) {
    if (!newStatus) return;

    ordersRef.child(orderId).update({
        status: newStatus,
        lastUpdated: Date.now()
    }).then(() => {
        showNotification(`تم تحديث حالة الطلب إلى: ${newStatus === 'pending' ? 'قيد الانتظار' : newStatus === 'completed' ? 'مكتملة' : 'ملغاة'}`);
        if (window.adminLog) window.adminLog.orderStatus(orderId, newStatus === 'pending' ? 'قيد الانتظار' : newStatus === 'completed' ? 'مكتملة' : 'ملغاة');
    }).catch(error => {
        showNotification('حدث خطأ: ' + error.message, 'error');
    });
}

function deleteOrder(orderId) {
    showConfirmModal(
        'حذف الطلب',
        'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.',
        () => {
            ordersRef.child(orderId).remove()
                .then(() => {
                    showNotification('تم حذف الطلب بنجاح');
                    if (window.adminLog) window.adminLog.orderDeleted(orderId);
                })
                .catch(error => {
                    showNotification('حدث خطأ: ' + error.message, 'error');
                });
        }
    );
}

function viewOrderDetails(orderId) {
    ordersRef.child(orderId).once('value', (snapshot) => {
        const order = snapshot.val();
        if (!order) {
            showNotification('الطلب غير موجود', 'error');
            return;
        }

        const date = new Date(order.timestamp);
        const formattedDate = date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const statusText = {
            'pending': 'قيد الانتظار',
            'processing': 'قيد التنفيذ',
            'shipped': 'تم الشحن',
            'completed': 'مكتملة',
            'cancelled': 'ملغاة'
        };

        let itemsHtml = order.items.map(item => `
            <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <span>${item.name}</span>
                <span>${order.currency === 'LYD' ? `${item.price.toFixed(2)} د.ل` : `$${item.price.toFixed(2)}`}</span>
            </div>
        `).join('');

        const discountHtml = order.discount ? `
            <div style="color: #4caf50; margin-top: 0.5rem;">
                <strong>كود الخصم:</strong> ${order.discount.code} (-${order.discount.value}%)
            </div>
        ` : '';

        const contentHtml = `
            <h2 style="margin: 0 0 1.5rem 0; color: #667eea;">📋 تفاصيل الطلب</h2>
            
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1rem;">
                <p style="margin: 0.5rem 0;"><strong>رقم الطلب:</strong> ${order.orderId}</p>
                <p style="margin: 0.5rem 0;"><strong>التاريخ:</strong> ${formattedDate}</p>
                <p style="margin: 0.5rem 0;"><strong>الحالة:</strong> <span class="order-status-badge status-${order.status}">${statusText[order.status] || order.status}</span></p>
                ${order.customerPhone ? `<p style="margin: 0.5rem 0; color: #4facfe;"><strong>📞 رقم الهاتف:</strong> ${order.customerPhone}</p>` : ''}
            </div>
            
            <h3 style="margin: 1.5rem 0 1rem 0;">المنتجات:</h3>
            <div style="background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 8px;">
                ${itemsHtml}
                <div style="display: flex; justify-content: space-between; padding: 1rem 0 0.5rem 0; margin-top: 1rem; border-top: 2px solid rgba(255,255,255,0.2); font-weight: bold;">
                    <span>المجموع الأصلي:</span>
                    <span>${order.currency === 'LYD' ? `${order.total.toFixed(2)} د.ل` : `$${order.total.toFixed(2)}`}</span>
                </div>
                ${discountHtml}
                <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; font-size: 1.2rem; font-weight: bold; color: #4caf50;">
                    <span>المجموع النهائي:</span>
                    <span>${order.currency === 'LYD' ? `${order.finalTotal.toFixed(2)} د.ل` : `$${order.finalTotal.toFixed(2)}`}</span>
                </div>
            </div>
        `;

        showCustomModal(contentHtml, { width: '500px' });
    });
}

// ============================================
// PROMO CODES MANAGEMENT
// ============================================
// Load Promo Codes
function loadPromos() {
    const promoList = document.getElementById('promo-list');
    promoList.innerHTML = '<p style="color:white; opacity:0.7;">جاري التحميل...</p>';

    promosRef.on('value', (snapshot) => {
        const promos = snapshot.val();
        promoList.innerHTML = '';

        if (!promos || Object.keys(promos).length === 0) {
            promoList.innerHTML = '<p style="color:white; opacity:0.5; grid-column: 1/-1;">لا توجد كوبونات نشطة حالياً</p>';
            return;
        }

        Object.keys(promos).forEach(id => {
            const promo = promos[id];
            const promoCard = document.createElement('div');
            promoCard.className = 'product-card'; // Reuse style
            promoCard.style.padding = '1rem';
            promoCard.style.border = '1px solid rgba(0, 184, 148, 0.3)';

            // Format Date
            let expiryText = 'غير محدد';
            if (promo.expiryDate) {
                expiryText = new Date(promo.expiryDate).toLocaleDateString('ar-EG');
            }

            // Usage
            const usageText = promo.maxUses ? `${promo.usedCount || 0}/${promo.maxUses}` : `${promo.usedCount || 0} (مفتوح)`;

            promoCard.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <h3 style="margin:0; color:#00b894; font-family:monospace; font-size:1.2rem;">${promo.code}</h3>
                    <span style="background:#00b894; color:white; padding:2px 8px; border-radius:4px;">${promo.discount}%-</span>
                </div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.7); line-height:1.6;">
                    <p style="margin:0;">📅 ينتهي: ${expiryText}</p>
                    <p style="margin:0;">👥 الاستخدام: ${usageText}</p>
                </div>
                <button onclick="deletePromo('${id}')" style="width:100%; margin-top:10px; background:rgba(245, 87, 108, 0.1); color:#f5576c; border:1px solid #f5576c; padding:5px; border-radius:4px; cursor:pointer;">حذف الكوبون</button>
            `;
            promoList.appendChild(promoCard);
        });
    });
}

// Add New Promo
document.getElementById('promo-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const code = document.getElementById('promo-code').value.toUpperCase().trim();
    const discount = parseInt(document.getElementById('promo-discount').value);
    const expiry = document.getElementById('promo-expiry').value;
    const limit = document.getElementById('promo-limit').value;

    if (!code || !discount) return;

    const newPromo = {
        code: code,
        discount: discount,
        expiryDate: expiry ? new Date(expiry).getTime() : null,
        maxUses: limit ? parseInt(limit) : null,
        usedCount: 0,
        createdAt: Date.now()
    };

    promosRef.push(newPromo)
        .then(() => {
            showNotification('تم إنشاء الكوبون بنجاح! 🎟️');
            if (window.adminLog) window.adminLog.promoCreated(code);
            document.getElementById('promo-form').reset();
        })
        .catch(err => showNotification('خطأ: ' + err.message, 'error'));
});

// Delete Promo
window.deletePromo = function (id) {
    showConfirmModal(
        'حذف الكوبون',
        'هل أنت متأكد من حذف هذا الكوبون؟',
        () => {
            promosRef.child(id).remove().then(() => {
                if (window.adminLog) window.adminLog.promoDeleted(id.slice(-6));
            });
        }
    );
};

// ============================================
// SETTINGS MANAGEMENT
// ============================================
// Theme Presets Logic
window.applyThemePreset = function (preset) {
    const primaryInput = document.getElementById('theme-primary');
    const secondaryInput = document.getElementById('theme-secondary');
    const accentInput = document.getElementById('theme-accent');
    const bgPrimaryInput = document.getElementById('theme-bg-primary');
    const bgSecondaryInput = document.getElementById('theme-bg-secondary');
    const textPrimaryInput = document.getElementById('theme-text-primary');
    const textSecondaryInput = document.getElementById('theme-text-secondary');

    const presetNameInput = document.getElementById('theme-preset-name');

    if (preset === 'purple') {
        primaryInput.value = '#667eea';
        secondaryInput.value = '#f5576c';
        accentInput.value = '#4facfe';
        bgPrimaryInput.value = '#0f0f1e';
        bgSecondaryInput.value = '#1a1a2e';
        textPrimaryInput.value = '#ffffff';
        textSecondaryInput.value = '#b3b3b3';
        presetNameInput.value = 'purple';
    } else if (preset === 'red') {
        primaryInput.value = '#e53935';
        secondaryInput.value = '#ff5252';
        accentInput.value = '#ff1744';
        bgPrimaryInput.value = '#1a0505';
        bgSecondaryInput.value = '#2d0a0a';
        textPrimaryInput.value = '#ffffff';
        textSecondaryInput.value = '#ffa8a8';
        presetNameInput.value = 'red';
    } else if (preset === 'blue') {
        primaryInput.value = '#1e88e5';
        secondaryInput.value = '#42a5f5';
        accentInput.value = '#2979ff';
        bgPrimaryInput.value = '#05131a';
        bgSecondaryInput.value = '#0a232e';
        textPrimaryInput.value = '#ffffff';
        textSecondaryInput.value = '#a8d5ff';
        presetNameInput.value = 'blue';
    } else if (preset === 'pitchblack') {
        primaryInput.value = '#ffffff';
        secondaryInput.value = '#333333';
        accentInput.value = '#ffffff';
        bgPrimaryInput.value = '#000000';
        bgSecondaryInput.value = '#0a0a0a';
        textPrimaryInput.value = '#e0e0e0';
        textSecondaryInput.value = '#888888';
        presetNameInput.value = 'pitchblack';
    } else if (preset === 'light') {
        primaryInput.value = '#2563eb';
        secondaryInput.value = '#1d4ed8';
        accentInput.value = '#3b82f6';
        bgPrimaryInput.value = '#f3f4f6';
        bgSecondaryInput.value = '#ffffff';
        textPrimaryInput.value = '#111827';
        textSecondaryInput.value = '#4b5563';
        presetNameInput.value = 'light';
    } else {
        presetNameInput.value = 'custom';
    }
};

// Listen for color changes to set preset to custom
['theme-primary', 'theme-secondary', 'theme-accent', 'theme-bg-primary', 'theme-bg-secondary', 'theme-text-primary', 'theme-text-secondary'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
        document.getElementById('theme-preset-name').value = 'custom';
    });
});

// Load settings (exchange rate, phone, facebook, email, theme)
function loadSettings() {
    settingsRef.once('value', (snapshot) => {
        const settings = snapshot.val();
        if (settings) {
            if (settings.exchangeRate) {
                document.getElementById('exchange-rate').value = settings.exchangeRate;
                window.exchangeRate = parseFloat(settings.exchangeRate);
                document.dispatchEvent(new CustomEvent('settings-loaded'));
            }
            if (settings.phoneNumber) document.getElementById('contact-phone').value = settings.phoneNumber;
            if (settings.facebookUrl) document.getElementById('facebook-url').value = settings.facebookUrl;
            if (settings.contactEmail) document.getElementById('contact-email').value = settings.contactEmail;

            // Hero Settings
            if (settings.heroTitle) document.getElementById('hero-title').value = settings.heroTitle;
            if (settings.heroSubtitle) document.getElementById('hero-subtitle').value = settings.heroSubtitle;
            if (settings.heroDescription) document.getElementById('hero-description').value = settings.heroDescription;
            if (settings.heroImage) document.getElementById('hero-image').value = settings.heroImage;

            // Populate Categories Dropdown and Input
            if (settings.storeCategories) {
                document.getElementById('store-categories').value = settings.storeCategories;
                populateCategoryDropdown(settings.storeCategories);
            } else {
                // Default defaults
                populateCategoryDropdown('برامج, ألعاب, اشتراكات');
            }

            // Announcement Bar
            if (settings.announcementEnabled !== undefined) {
                document.getElementById('announcement-enabled').checked = settings.announcementEnabled;
            }
            if (settings.announcementText) {
                document.getElementById('announcement-text').value = settings.announcementText;
            }

            // Maintenance Mode
            if (settings.maintenanceEnabled !== undefined) {
                const checkbox = document.getElementById('maintenance-enabled');
                checkbox.checked = settings.maintenanceEnabled;
                document.getElementById('maintenance-fields').style.display = settings.maintenanceEnabled ? 'flex' : 'none';
            }
            if (settings.maintenancePreset) {
                document.getElementById('maintenance-preset').value = settings.maintenancePreset;
                if (settings.maintenancePreset === 'custom') {
                    document.getElementById('custom-message-field').style.display = 'block';
                }
            }
            if (settings.maintenanceCustomMessage) {
                document.getElementById('maintenance-custom-message').value = settings.maintenanceCustomMessage;
            }

            // Theme Settings
            if (settings.theme) {
                if (settings.theme.primary) document.getElementById('theme-primary').value = settings.theme.primary;
                if (settings.theme.secondary) document.getElementById('theme-secondary').value = settings.theme.secondary;
                if (settings.theme.accent) document.getElementById('theme-accent').value = settings.theme.accent;
                if (settings.theme.bgPrimary) document.getElementById('theme-bg-primary').value = settings.theme.bgPrimary;
                if (settings.theme.bgSecondary) document.getElementById('theme-bg-secondary').value = settings.theme.bgSecondary;
                if (settings.theme.textPrimary) document.getElementById('theme-text-primary').value = settings.theme.textPrimary;
                if (settings.theme.textSecondary) document.getElementById('theme-text-secondary').value = settings.theme.textSecondary;
                if (settings.theme.preset) document.getElementById('theme-preset-name').value = settings.theme.preset;
                if (settings.theme.effect) document.getElementById('theme-effect').value = settings.theme.effect;
            }
        } else {
            // Default exchange rate
            document.getElementById('exchange-rate').value = 9;
            window.exchangeRate = 9;
            populateCategoryDropdown('برامج, ألعاب, اشتراكات');
        }
    });
}

function populateCategoryDropdown(categoriesString) {
    const select = document.getElementById('product-category');
    const currentVal = select.value;
    select.innerHTML = '<option value="general">عام</option>';

    if (categoriesString) {
        const categories = categoriesString.split(',').map(c => c.trim()).filter(c => c);
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            select.appendChild(option);
        });
    }

    // Restore selection if possible, otherwise default
    // We only restore if the option exists now
    // Actually for 'Edit' mode, we need to set value AFTER populating.
}

// Save settings handler
document.getElementById('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const exchangeRate = parseFloat(document.getElementById('exchange-rate').value);
    const phoneNumber = document.getElementById('contact-phone').value;
    const facebookUrl = document.getElementById('facebook-url').value;
    const contactEmail = document.getElementById('contact-email').value;

    const heroTitle = document.getElementById('hero-title').value;
    const heroSubtitle = document.getElementById('hero-subtitle').value;
    const heroDescription = document.getElementById('hero-description').value;
    const heroImage = document.getElementById('hero-image').value;

    const storeCategories = document.getElementById('store-categories').value;

    const announcementEnabled = document.getElementById('announcement-enabled').checked;
    const announcementText = document.getElementById('announcement-text').value;

    const maintenanceEnabled = document.getElementById('maintenance-enabled').checked;
    const maintenancePreset = document.getElementById('maintenance-preset').value;
    const maintenanceCustomMessage = document.getElementById('maintenance-custom-message').value;

    // Theme Data
    const themeData = {
        primary: document.getElementById('theme-primary').value,
        secondary: document.getElementById('theme-secondary').value,
        accent: document.getElementById('theme-accent').value,
        bgPrimary: document.getElementById('theme-bg-primary').value,
        bgSecondary: document.getElementById('theme-bg-secondary').value,
        textPrimary: document.getElementById('theme-text-primary').value,
        textSecondary: document.getElementById('theme-text-secondary').value,
        preset: document.getElementById('theme-preset-name').value,
        // Save Effect
        effect: document.getElementById('theme-effect').value
    };

    const settingsData = {
        exchangeRate: exchangeRate,
        phoneNumber: phoneNumber,
        facebookUrl: facebookUrl,
        contactEmail: contactEmail,
        heroTitle: heroTitle,
        heroSubtitle: heroSubtitle,
        heroDescription: heroDescription,
        heroImage: heroImage,
        storeCategories: storeCategories,
        announcementEnabled: announcementEnabled,
        announcementText: announcementText,
        maintenanceEnabled: maintenanceEnabled,
        maintenancePreset: maintenancePreset,
        maintenanceCustomMessage: maintenanceCustomMessage,
        theme: themeData,
        lastUpdated: Date.now() // Keep lastUpdated
    };

    settingsRef.update(settingsData) // Use update instead of set to avoid overwriting entire settings
        .then(() => {
            showNotification('تم حفظ الإعدادات بنجاح! 💾');
            if (window.adminLog) window.adminLog.settingsSaved();
            // Update dropdown immediately
            populateCategoryDropdown(storeCategories);
        })
        .catch((error) => {
            showNotification('حدث خطأ: ' + error.message, 'error');
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
            loadSettings();
            loadPromos(); // Load Promos
            loadOrders(); // Load orders when admin logs in
            loadStudentBooks(); // Load student books
            loadBookRequests(); // Load book requests
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

        // Reset stats
        let totalStats = 0;
        let visibleStats = 0;
        let hiddenStats = 0;
        let totalValue = 0; // Track total value

        if (!products || Object.keys(products).length === 0) {
            productsList.innerHTML = `
                <div class="empty-state">
                    <p>لا توجد منتجات بعد</p>
                    <p>ابدأ بإضافة منتجك الأول!</p>
                </div>
            `;
            updateStats(0, 0, 0, 0);
            return;
        }

        Object.keys(products).forEach(id => {
            const product = products[id];

            // Count stats
            totalStats++;
            totalValue += parseFloat(product.price) || 0; // Add product price to total
            if (product.visible !== false) {
                visibleStats++;
            } else {
                hiddenStats++;
            }

            const card = createProductCard(id, product);
            productsList.appendChild(card);
        });

        // Update UI
        updateStats(totalStats, visibleStats, hiddenStats, totalValue);
    });
}

// Update stats UI
function updateStats(total, visible, hidden, value) {
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-visible').textContent = visible;
    document.getElementById('stat-hidden').textContent = hidden;
    document.getElementById('stat-value').innerHTML = `<span class="price-display" data-usd="${value.toFixed(2)}">$${value.toFixed(2)}</span>`;
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

    // Add Checkbox for Bulk Actions
    const checkboxHtml = `
        <div class="product-select-overlay" style="position: absolute; top: 10px; right: 10px; z-index: 10;">
            <input type="checkbox" class="bulk-check" value="${id}" data-type="products" style="width: 20px; height: 20px; cursor: pointer;">
        </div>
    `;

    const visibilityBtn = `
        <button class="btn btn-visibility ${product.visible === false ? 'btn-hidden' : ''}" onclick="toggleVisibility('${id}', ${product.visible !== false})">
            ${product.visible === false ? '👁️‍🗨️ مخفي' : '👁️ مرئي'}
        </button>
    `;

    // Stock status display
    let stockHtml = '';
    if (product.trackStock) {
        const stock = product.stock || 0;
        const threshold = product.lowStockThreshold || 5;
        let stockStatus = '';
        let stockColor = '';

        if (stock === 0) {
            stockStatus = 'نفذ المخزون';
            stockColor = '#f44336';
        } else if (stock <= threshold) {
            stockStatus = 'مخزون منخفض';
            stockColor = '#ff9800';
        } else {
            stockStatus = 'متوفر';
            stockColor = '#4caf50';
        }

        stockHtml = `
            <div style="margin: 0.5rem 0; padding: 0.5rem; background: rgba(255,255,255,0.05); border-radius: 6px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 0.9rem;">📦 المخزون:</span>
                    <span style="font-weight: bold; color: ${stockColor};">${stock} قطعة</span>
                </div>
                <div style="font-size: 0.85rem; color: ${stockColor}; margin-top: 0.25rem;">
                    ${stockStatus}
                </div>
            </div>
        `;
    }

    card.innerHTML = `
        ${checkboxHtml}
        <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        ${badgeHtml}
        <h3>${product.name}</h3>
        <p class="price">
            ${product.priceType === 'range'
            ? `<span class="price-display" data-usd="${product.priceMin}">$${product.priceMin}</span> - <span class="price-display" data-usd="${product.priceMax}">$${product.priceMax}</span>`
            : product.priceType === 'negotiable'
                ? '🤝 قابل للتفاوض'
                : product.priceType === 'contact'
                    ? '📞 تواصل للسعر'
                    : `<span class="price-display" data-usd="${product.price}">$${product.price}</span>`
        }
            ${product.category && product.category !== 'general' ? `<span style="font-size: 0.8em; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; margin-right: 5px;">${product.category}</span>` : ''}
        </p>
        ${stockHtml}
        <p class="description">${product.description.substring(0, 100)}${product.description.length > 100 ? '...' : ''}</p>
        <div class="product-actions">
            <button class="btn btn-copy" onclick="copyProductLink('${id}')" title="نسخ الرابط">🔗</button>
            ${visibilityBtn}
            <button class="btn btn-edit" onclick="editProduct('${id}')">تعديل</button>
            <button class="btn btn-delete" onclick="deleteProduct('${id}')">حذف</button>
        </div>
    `;

    if (product.visible === false) {
        card.classList.add('product-hidden');
    }

    return card;
}

// Image File Upload handling with Compression
document.getElementById('image-file').addEventListener('change', function (e) {
    handleImageUpload(e.target.files[0], 'product-image', 'image-file');
});

// Additional Images Handling with Compression
document.getElementById('additional-images-file').addEventListener('change', function (e) {
    const files = Array.from(e.target.files);

    if (currentAdditionalImages.length + files.length > 5) {
        showNotification('لا يمكن إضافة أكثر من 5 صور إضافية.', 'error');
        this.value = '';
        return;
    }

    files.forEach(file => {
        handleImageUpload(file, null, null, true);
    });

    this.value = '';
});

// Generic Image Handler
function handleImageUpload(file, inputId, fileInputId, isAdditional = false) {
    if (!file) return;

    // Check file type
    if (!file.type.match('image.*')) {
        showNotification('يرجى اختيار ملف صورة صالح', 'error');
        return;
    }

    // Allow up to 10MB input, but we will compress it down
    if (file.size > 10 * 1024 * 1024) {
        showNotification('حجم الصورة كبير جداً (الحد الأقصى 10 ميجابايت)', 'error');
        if (fileInputId) document.getElementById(fileInputId).value = '';
        return;
    }

    showNotification('جاري معالجة الصورة...', 'success');

    compressImage(file, 800, 0.7).then(base64String => {
        if (isAdditional) {
            currentAdditionalImages.push(base64String);
            renderAdditionalImages();
        } else {
            document.getElementById(inputId).value = base64String;

            // Show preview
            const container = document.getElementById(fileInputId).parentNode;
            const existingPreview = container.querySelector('.image-preview-feedback');
            if (existingPreview) existingPreview.remove();

            const preview = document.createElement('div');
            preview.className = 'image-preview-feedback';
            preview.innerHTML = `
                <div style="margin-top: 10px; position: relative; width: 100px; height: 100px; border-radius: 8px; border: 2px solid #00b894;">
                    <img src="${base64String}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="Preview">
                    <button type="button" class="btn-remove-image" title="إزالة الصورة">✕</button>
                </div>
                <span style="display: block; color: #00b894; font-size: 0.85rem; margin-top: 5px;">✅ تم ضغط واختيار الصورة</span>
            `;
            container.appendChild(preview);

            preview.querySelector('.btn-remove-image').addEventListener('click', function () {
                document.getElementById(fileInputId).value = '';
                document.getElementById(inputId).value = '';
                preview.remove();
            });
        }
    }).catch(err => {
        console.error('Compression error:', err);
        showNotification('فشل معالجة الصورة. حاول بملف آخر.', 'error');
    });
}

// Image Compression Utility
function compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function (event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                // Compress to JPEG (even if input was PNG/HEIC) to save space
                const dataUrl = canvas.toDataURL('image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = error => reject(error);
        };
        reader.onerror = error => reject(error);
    });
}

// Additional Images Handling
let currentAdditionalImages = [];

document.getElementById('additional-images-file').addEventListener('change', function (e) {
    const files = Array.from(e.target.files);

    // Check limits
    if (currentAdditionalImages.length + files.length > 5) {
        showNotification('لا يمكن إضافة أكثر من 5 صور إضافية.', 'error');
        this.value = '';
        return;
    }

    files.forEach(file => {
        if (file.size > 1024 * 1024) {
            showNotification(`حجم الملف ${file.name} كبير جداً (يجب أن يكون أقل من 1 ميجابايت).`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            currentAdditionalImages.push(e.target.result);
            renderAdditionalImages();
        };
        reader.readAsDataURL(file);
    });

    // Clear input so same files can be selected again if needed (though we handle duplicates via array)
    this.value = '';
});

function renderAdditionalImages() {
    const container = document.getElementById('additional-images-preview');
    container.innerHTML = '';

    currentAdditionalImages.forEach((img, index) => {
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.width = '80px';
        div.style.height = '80px';

        div.innerHTML = `
            <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.2);">
            <button type="button" onclick="removeAdditionalImage(${index})" style="
                position: absolute; top: -5px; right: -5px; 
                background: #f44336; color: white; border: none; 
                border-radius: 50%; width: 20px; height: 20px; 
                display: flex; align-items: center; justify-content: center; 
                cursor: pointer; font-size: 12px;
            ">✕</button>
        `;
        container.appendChild(div);
    });
}

window.removeAdditionalImage = function (index) {
    currentAdditionalImages.splice(index, 1);
    renderAdditionalImages();
};

// Toggle stock fields visibility
document.getElementById('track-stock').addEventListener('change', function () {
    const stockFields = document.getElementById('stock-fields');
    stockFields.style.display = this.checked ? 'flex' : 'none';
});

// Add/Update product
document.getElementById('product-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const trackStock = document.getElementById('track-stock').checked;

    const priceType = document.getElementById('price-type').value;
    const productData = {
        name: document.getElementById('product-name').value,
        priceType: priceType,
        price: priceType === 'fixed' ? parseFloat(document.getElementById('product-price').value) || 0 : 0,
        priceMin: priceType === 'range' ? parseFloat(document.getElementById('price-min').value) || 0 : null,
        priceMax: priceType === 'range' ? parseFloat(document.getElementById('price-max').value) || 0 : null,
        shortDesc: document.getElementById('product-short-desc').value,
        description: document.getElementById('product-description').value,
        badge: document.getElementById('product-badge').value,
        category: document.getElementById('product-category').value,
        image: document.getElementById('product-image').value,
        features: parseFeatures(document.getElementById('product-features').value),
        visible: true, // Default to visible
        timestamp: Date.now(),
        // Stock Management
        trackStock: trackStock,
        stock: trackStock ? parseInt(document.getElementById('product-stock').value) || 0 : null,
        lowStockThreshold: trackStock ? parseInt(document.getElementById('low-stock-threshold').value) || 5 : null,
        // Gallery
        additionalImages: currentAdditionalImages
    };

    // Preserve visibility status if editing
    if (editingProductId) {
        delete productData.visible;
    }

    // Validate image presence
    if (!productData.image) {
        showNotification('يرجى إضافة رابط صورة أو اختيار صورة من جهازك', 'error');
        return;
    }

    if (editingProductId) {
        // Update existing product
        productsRef.child(editingProductId).update(productData)
            .then(() => {
                showNotification('تم تحديث المنتج بنجاح! ✅');
                if (window.adminLog) window.adminLog.productEdited(productData.name);
                resetForm();
            })
            .catch((error) => {
                showNotification('حدث خطأ: ' + error.message, 'error');
            });
    } else {
        // Add new product
        productsRef.push(productData)
            .then(() => {
                showNotification('تم إضافة المنتج بنجاح! 🎉');
                if (window.adminLog) window.adminLog.productAdded(productData.name);
                resetForm();
            })
            .catch((error) => {
                showNotification('حدث خطأ: ' + error.message, 'error');
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
    // Switch to Products tab first
    switchTab('products');

    productsRef.child(id).once('value', (snapshot) => {
        const product = snapshot.val();

        document.getElementById('product-id').value = id;
        document.getElementById('product-name').value = product.name;
        // Load price type
        const pt = product.priceType || 'fixed';
        document.getElementById('price-type').value = pt;
        document.getElementById('product-price').value = product.price || '';
        document.getElementById('price-min').value = product.priceMin || '';
        document.getElementById('price-max').value = product.priceMax || '';
        togglePriceFields();
        document.getElementById('product-short-desc').value = product.shortDesc || '';
        document.getElementById('product-description').value = product.description;
        document.getElementById('product-badge').value = product.badge;
        document.getElementById('product-category').value = product.category || 'general'; // Load Category
        document.getElementById('product-image').value = product.image;
        document.getElementById('product-features').value = formatFeatures(product.features);

        // Load stock data
        const trackStockCheckbox = document.getElementById('track-stock');
        trackStockCheckbox.checked = product.trackStock || false;
        if (product.trackStock) {
            document.getElementById('stock-fields').style.display = 'flex';
            document.getElementById('product-stock').value = product.stock || 0;
            document.getElementById('low-stock-threshold').value = product.lowStockThreshold || 5;
        } else {
            document.getElementById('stock-fields').style.display = 'none';
        }

        // Load Gallery
        if (product.additionalImages) {
            currentAdditionalImages = product.additionalImages;
            renderAdditionalImages();
        } else {
            currentAdditionalImages = [];
            renderAdditionalImages();
        }

        editingProductId = id;
        document.getElementById('form-title').textContent = 'تعديل المنتج';
        document.getElementById('submit-btn').textContent = 'تحديث المنتج';
        document.getElementById('cancel-btn').style.display = 'inline-block';

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// Toggle product visibility
window.toggleVisibility = function (id, currentStatus) {
    const newStatus = !currentStatus;
    productsRef.child(id).update({ visible: newStatus })
        .then(() => {
            showNotification(newStatus ? 'المنتج الآن مرئي 👁️' : 'تم إخفاء المنتج 👁️‍🗨️');
            if (window.adminLog) window.adminLog.productVisibility(id.slice(-6), newStatus);
        })
        .catch((error) => {
            showNotification('حدث خطأ: ' + error.message, 'error');
        });
};

// Delete product
window.deleteProduct = function (id) {
    showConfirmModal(
        'حذف المنتج',
        'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن استعادته.',
        () => {
            productsRef.child(id).remove()
                .then(() => {
                    showNotification('تم حذف المنتج بنجاح! 🗑️');
                    if (window.adminLog) window.adminLog.productDeleted(id.slice(-6));
                })
                .catch((error) => {
                    showNotification('حدث خطأ: ' + error.message, 'error');
                });
        }
    );
};

// Reset form
function resetForm() {
    document.getElementById('product-form').reset();
    document.getElementById('product-id').value = '';

    // Clear custom file input
    document.getElementById('image-file').value = '';
    const existingPreview = document.querySelector('.image-preview-feedback');
    if (existingPreview) existingPreview.remove();

    // Clear Gallery
    currentAdditionalImages = [];
    renderAdditionalImages();
    document.getElementById('additional-images-file').value = '';

    editingProductId = null;
    document.getElementById('form-title').textContent = 'إضافة منتج جديد';
    document.getElementById('submit-btn').textContent = 'إضافة المنتج';
    document.getElementById('cancel-btn').style.display = 'none';
}

// Cancel edit
document.getElementById('cancel-btn').addEventListener('click', resetForm);

// Show Notification (Toast)
window.showNotification = function (message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = type === 'success' ? '✅' : '❌';

    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;

    container.appendChild(toast);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
};

// Copy Product Link
window.copyProductLink = function (id) {
    // Using simple query parameter for product deep linking
    // We hardcode the domain as per user request to avoid subpath issues
    const link = `https://www.zeronux.store/index.html?product=${id}`;

    navigator.clipboard.writeText(link).then(() => {
        showNotification('تم نسخ رابط المنتج! 🔗');
    }).catch(err => {
        showNotification('فشل نسخ الرابط', 'error');
    });
};

// ============================================
// STUDENT BOOKS MANAGEMENT
// ============================================
let editingBookId = null;

// Toggle book price field
window.toggleBookPriceField = function () {
    const type = document.getElementById('book-price-type').value;
    document.getElementById('book-price-field').style.display = type === 'fixed' ? 'block' : 'none';
};

// Load student books in admin
function loadStudentBooks() {
    const booksList = document.getElementById('admin-books-list');
    if (!booksList) return;
    booksList.innerHTML = '<div class="loading">جاري تحميل الكتب...</div>';

    studentBooksRef.on('value', (snapshot) => {
        const books = snapshot.val();
        booksList.innerHTML = '';

        if (!books || Object.keys(books).length === 0) {
            booksList.innerHTML = '<div class="empty-state"><p>لا توجد كتب بعد</p><p>ابدأ بإضافة كتابك الأول!</p></div>';
            return;
        }

        Object.keys(books).forEach(id => {
            const book = books[id];
            const card = document.createElement('div');
            card.className = 'product-card' + (book.visible === false ? ' product-hidden' : '');

            const priceText = book.priceType === 'contact'
                ? '📞 تواصل للسعر'
                : `<span class="price-display" data-usd="${parseFloat(book.price || 0).toFixed(2)}">$${parseFloat(book.price || 0).toFixed(2)}</span>`;

            card.innerHTML = `
                <img src="${book.image || 'https://via.placeholder.com/300x200?text=📖'}" alt="${book.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=📖'">
                <h3>${book.name}</h3>
                <p class="price">${priceText}</p>
                <div class="product-actions">
                    <button class="btn btn-visibility ${book.visible === false ? 'btn-hidden' : ''}" onclick="toggleBookVisibility('${id}', ${book.visible !== false})">
                        ${book.visible === false ? '👁️‍🗨️ مخفي' : '👁️ مرئي'}
                    </button>
                    <button class="btn btn-edit" onclick="editBook('${id}')">تعديل</button>
                    <button class="btn btn-delete" onclick="deleteBook('${id}')">حذف</button>
                </div>
            `;
            booksList.appendChild(card);
        });
    });
}

// Book form submit handler
document.getElementById('book-form').addEventListener('submit', (e) => {
    e.preventDefault();

    const priceType = document.getElementById('book-price-type').value;
    const bookData = {
        name: document.getElementById('book-name').value,
        image: document.getElementById('book-image').value,
        priceType: priceType,
        price: priceType === 'fixed' ? parseFloat(document.getElementById('book-price').value) || 0 : 0,
        visible: true,
        timestamp: Date.now()
    };

    if (editingBookId) {
        delete bookData.visible; // preserve visibility on edit
        studentBooksRef.child(editingBookId).update(bookData)
            .then(() => {
                showNotification('تم تحديث الكتاب بنجاح! ✅');
                if (window.adminLog) window.adminLog.bookEdited(bookData.name);
                resetBookForm();
            })
            .catch(err => showNotification('خطأ: ' + err.message, 'error'));
    } else {
        studentBooksRef.push(bookData)
            .then(() => {
                showNotification('تم إضافة الكتاب بنجاح! 📚');
                if (window.adminLog) window.adminLog.bookAdded(bookData.name);
                resetBookForm();
            })
            .catch(err => showNotification('خطأ: ' + err.message, 'error'));
    }
});

// Edit book
window.editBook = function (id) {
    studentBooksRef.child(id).once('value', (snapshot) => {
        const book = snapshot.val();
        document.getElementById('book-id').value = id;
        document.getElementById('book-name').value = book.name;
        document.getElementById('book-image').value = book.image || '';
        document.getElementById('book-price-type').value = book.priceType || 'fixed';
        document.getElementById('book-price').value = book.price || '';
        toggleBookPriceField();

        editingBookId = id;
        document.getElementById('book-form-title').textContent = 'تعديل الكتاب';
        document.getElementById('book-submit-btn').textContent = 'تحديث الكتاب';
        document.getElementById('book-cancel-btn').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

// Toggle book visibility
window.toggleBookVisibility = function (id, currentStatus) {
    studentBooksRef.child(id).update({ visible: !currentStatus })
        .then(() => showNotification(!currentStatus ? 'الكتاب الآن مرئي 👁️' : 'تم إخفاء الكتاب 👁️‍🗨️'))
        .catch(err => showNotification('خطأ: ' + err.message, 'error'));
};

// Delete book
window.deleteBook = function (id) {
    showConfirmModal(
        'حذف الكتاب',
        'هل أنت متأكد من حذف هذا الكتاب؟',
        () => {
            studentBooksRef.child(id).remove()
                .then(() => {
                    showNotification('تم حذف الكتاب 🗑️');
                    if (window.adminLog) window.adminLog.bookDeleted(id.slice(-6));
                })
                .catch(err => showNotification('خطأ: ' + err.message, 'error'));
        }
    );
};

// Reset book form
function resetBookForm() {
    document.getElementById('book-form').reset();
    document.getElementById('book-id').value = '';
    editingBookId = null;
    document.getElementById('book-form-title').textContent = '📚 إضافة كتاب جديد';
    document.getElementById('book-submit-btn').textContent = 'إضافة الكتاب';
    document.getElementById('book-cancel-btn').style.display = 'none';
    document.getElementById('book-price-field').style.display = 'block';
}

// Cancel book edit
document.getElementById('book-cancel-btn').addEventListener('click', resetBookForm);

// ============================================
// BOOK REQUESTS MANAGEMENT
// ============================================
function loadBookRequests() {
    const requestsList = document.getElementById('book-requests-list');
    if (!requestsList) return;
    requestsList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">جاري التحميل...</td></tr>';

    bookRequestsRef.on('value', (snapshot) => {
        const requests = snapshot.val();
        requestsList.innerHTML = '';

        if (!requests) {
            requestsList.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: rgba(255,255,255,0.5);">لا توجد طلبات كتب بعد</td></tr>';
            return;
        }

        const requestsArray = Object.entries(requests).map(([id, data]) => ({ id, ...data }));
        requestsArray.sort((a, b) => b.timestamp - a.timestamp);

        requestsArray.forEach(req => {
            const row = document.createElement('tr');
            const date = new Date(req.timestamp);
            const formattedDate = date.toLocaleDateString('ar-EG', {
                year: 'numeric', month: 'short', day: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });

            row.innerHTML = `
                <td><strong>${req.name}</strong></td>
                <td dir="ltr">${req.phone}</td>
                <td>${req.bookName}</td>
                <td>${req.description || '—'}</td>
                <td>${formattedDate}</td>
                <td>
                    <button class="btn btn-danger" onclick="deleteBookRequest('${req.id}')" title="حذف">🗑️</button>
                </td>
            `;
            requestsList.appendChild(row);
        });
    });
}

// Delete book request
window.deleteBookRequest = function (id) {
    showConfirmModal(
        'حذف الطلب',
        'هل أنت متأكد من حذف هذا الطلب؟',
        () => {
            bookRequestsRef.child(id).remove()
                .then(() => showNotification('تم حذف الطلب'))
                .catch(err => showNotification('خطأ: ' + err.message, 'error'));
        }
    );
};

// ============================================
// INITIALIZATION
// ============================================
// Maintenance Mode Toggle Handlers
document.getElementById('maintenance-enabled').addEventListener('change', function () {
    const maintenanceFields = document.getElementById('maintenance-fields');
    maintenanceFields.style.display = this.checked ? 'flex' : 'none';
    if (!this.checked) {
        document.getElementById('custom-message-field').style.display = 'none';
    } else {
        // Show custom field if preset is custom
        const preset = document.getElementById('maintenance-preset').value;
        if (preset === 'custom') {
            document.getElementById('custom-message-field').style.display = 'block';
        }
    }
});

document.getElementById('maintenance-preset').addEventListener('change', function () {
    const customField = document.getElementById('custom-message-field');
    customField.style.display = this.value === 'custom' ? 'block' : 'none';
});

document.addEventListener('DOMContentLoaded', () => {
    // Check authentication state
    checkAuthState();
});
