// ============================================
// ADMIN ACTIVITY LOG — Track all admin actions
// ============================================
(function () {
    'use strict';

    const activityRef = window.database ? window.database.ref('activityLog') : null;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
        .activity-timeline {
            max-height: 500px;
            overflow-y: auto;
            padding: 0.5rem;
        }
        .activity-timeline::-webkit-scrollbar {
            width: 6px;
        }
        .activity-timeline::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.03);
            border-radius: 3px;
        }
        .activity-timeline::-webkit-scrollbar-thumb {
            background: rgba(102,126,234,0.3);
            border-radius: 3px;
        }
        .activity-item {
            display: flex;
            gap: 12px;
            padding: 12px;
            border-radius: 10px;
            background: rgba(255,255,255,0.02);
            border: 1px solid rgba(255,255,255,0.05);
            margin-bottom: 8px;
            transition: background 0.2s;
            animation: activitySlideIn 0.3s ease-out;
        }
        .activity-item:hover {
            background: rgba(255,255,255,0.05);
        }
        @keyframes activitySlideIn {
            from { opacity: 0; transform: translateX(-10px); }
            to { opacity: 1; transform: translateX(0); }
        }
        .activity-icon {
            width: 36px;
            height: 36px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.1rem;
            flex-shrink: 0;
        }
        .activity-icon.add { background: rgba(76,175,80,0.15); }
        .activity-icon.edit { background: rgba(255,193,7,0.15); }
        .activity-icon.delete { background: rgba(244,67,54,0.15); }
        .activity-icon.status { background: rgba(33,150,243,0.15); }
        .activity-icon.settings { background: rgba(156,39,176,0.15); }
        .activity-icon.visibility { background: rgba(0,188,212,0.15); }
        .activity-body {
            flex: 1;
            min-width: 0;
        }
        .activity-text {
            font-size: 0.9rem;
            color: rgba(255,255,255,0.85);
            margin-bottom: 2px;
        }
        .activity-text strong {
            color: #667eea;
        }
        .activity-time {
            font-size: 0.75rem;
            color: rgba(255,255,255,0.35);
        }
        .activity-empty {
            text-align: center;
            padding: 2rem;
            color: rgba(255,255,255,0.3);
        }
        .activity-clear-btn {
            padding: 6px 14px;
            border: 1px solid rgba(244,67,54,0.3);
            border-radius: 8px;
            background: rgba(244,67,54,0.1);
            color: #f44336;
            font-family: 'Cairo', sans-serif;
            font-size: 0.8rem;
            cursor: pointer;
            transition: all 0.3s;
            float: left;
        }
        .activity-clear-btn:hover { background: rgba(244,67,54,0.25); }
    `;
    document.head.appendChild(style);

    // ---- Logging Functions ----
    function logActivity(type, icon, text) {
        if (!activityRef) return;

        const entry = {
            type: type,       // add, edit, delete, status, settings, visibility
            icon: icon,
            text: text,
            timestamp: Date.now()
        };

        activityRef.push(entry).catch(err => {
            console.warn('Activity log write failed:', err);
        });

        // Keep only last 100 entries
        activityRef.orderByChild('timestamp').limitToFirst(1).once('value', snapshot => {
            activityRef.once('value', fullSnap => {
                const count = fullSnap.numChildren();
                if (count > 100) {
                    // Remove oldest
                    const oldest = Object.keys(fullSnap.val())[0];
                    if (oldest) activityRef.child(oldest).remove();
                }
            });
        });
    }

    // ---- Render Timeline ----
    function renderTimeline(container) {
        if (!activityRef || !container) return;

        activityRef.orderByChild('timestamp').limitToLast(50).on('value', snapshot => {
            container.innerHTML = '';
            const entries = [];

            snapshot.forEach(child => {
                entries.push({ id: child.key, ...child.val() });
            });

            if (entries.length === 0) {
                container.innerHTML = '<div class="activity-empty">📋 لا توجد أنشطة بعد</div>';
                return;
            }

            // Reverse to show newest first
            entries.reverse().forEach(entry => {
                const item = document.createElement('div');
                item.className = 'activity-item';

                const timeStr = formatTimeAgo(entry.timestamp);

                item.innerHTML = `
                    <div class="activity-icon ${entry.type}">${entry.icon}</div>
                    <div class="activity-body">
                        <div class="activity-text">${entry.text}</div>
                        <div class="activity-time">${timeStr}</div>
                    </div>
                `;
                container.appendChild(item);
            });
        });
    }

    function formatTimeAgo(timestamp) {
        const diff = Date.now() - timestamp;
        const mins = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (mins < 1) return 'الآن';
        if (mins < 60) return `منذ ${mins} دقيقة`;
        if (hours < 24) return `منذ ${hours} ساعة`;
        if (days < 7) return `منذ ${days} يوم`;

        const date = new Date(timestamp);
        return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    // ---- Inject Activity Log Tab ----
    function injectActivityTab() {
        const tabs = document.querySelector('.admin-tabs');
        if (!tabs || document.getElementById('tab-btn-activity')) return;

        // Add tab button before Settings
        const settingsBtn = tabs.querySelector('[onclick*="settings"]');
        if (settingsBtn) {
            const activityBtn = document.createElement('button');
            activityBtn.className = 'tab-btn';
            activityBtn.id = 'tab-btn-activity';
            activityBtn.setAttribute('onclick', "switchTab('activity')");
            activityBtn.innerHTML = '<span>📝</span> السجل';
            settingsBtn.before(activityBtn);
        }

        // Add tab content
        const main = document.querySelector('.admin-main');
        if (main) {
            const tabContent = document.createElement('div');
            tabContent.id = 'tab-activity';
            tabContent.className = 'tab-content';
            tabContent.innerHTML = `
                <section class="form-section">
                    <h2>📝 سجل الأنشطة</h2>
                    <button class="activity-clear-btn" id="clear-activity-log">🗑️ مسح السجل</button>
                    <div style="clear: both; margin-bottom: 1rem;"></div>
                    <div class="activity-timeline" id="activity-timeline">
                        <div class="activity-empty">جاري التحميل...</div>
                    </div>
                </section>
            `;
            // Insert before closing </main>
            main.appendChild(tabContent);

            // Render
            renderTimeline(document.getElementById('activity-timeline'));

            // Clear button
            document.getElementById('clear-activity-log')?.addEventListener('click', () => {
                if (confirm('هل تريد مسح كل سجل الأنشطة؟')) {
                    activityRef?.remove();
                }
            });
        }
    }

    // ---- Init ----
    function init() {
        injectActivityTab();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Delay to ensure admin.js has loaded
        setTimeout(init, 100);
    }

    // ---- Global API ----
    window.adminLog = {
        productAdded: (name) => logActivity('add', '➕', `تمت إضافة منتج: <strong>${name}</strong>`),
        productEdited: (name) => logActivity('edit', '✏️', `تم تعديل منتج: <strong>${name}</strong>`),
        productDeleted: (name) => logActivity('delete', '🗑️', `تم حذف منتج: <strong>${name}</strong>`),
        productVisibility: (name, visible) => logActivity('visibility', visible ? '👁️' : '🙈', `تم ${visible ? 'إظهار' : 'إخفاء'} منتج: <strong>${name}</strong>`),
        orderStatus: (orderId, status) => logActivity('status', '📋', `تم تحديث حالة الطلب <strong>#${orderId.slice(-6)}</strong> إلى: ${status}`),
        orderDeleted: (orderId) => logActivity('delete', '🗑️', `تم حذف الطلب <strong>#${orderId.slice(-6)}</strong>`),
        settingsSaved: () => logActivity('settings', '⚙️', 'تم تحديث إعدادات المتجر'),
        bookAdded: (name) => logActivity('add', '📚', `تمت إضافة كتاب: <strong>${name}</strong>`),
        bookEdited: (name) => logActivity('edit', '✏️', `تم تعديل كتاب: <strong>${name}</strong>`),
        bookDeleted: (name) => logActivity('delete', '🗑️', `تم حذف كتاب: <strong>${name}</strong>`),
        promoCreated: (code) => logActivity('add', '🎫', `تم إنشاء كوبون: <strong>${code}</strong>`),
        promoDeleted: (code) => logActivity('delete', '🗑️', `تم حذف كوبون: <strong>${code}</strong>`),
    };
})();
