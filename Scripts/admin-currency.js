// ============================================
// ADMIN CURRENCY SWITCHER
// ============================================
(function () {
    'use strict';

    // State
    let currentCurrency = localStorage.getItem('adminCurrency') || 'USD';
    let observer;

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .currency-switcher {
            display: flex;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 8px;
            padding: 4px;
            margin-right: 15px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .currency-btn {
            background: transparent;
            border: none;
            color: rgba(255, 255, 255, 0.6);
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
            font-family: inherit;
        }
        .currency-btn:hover {
            color: white;
            background: rgba(255, 255, 255, 0.05);
        }
        .currency-btn.active {
            background: #667eea;
            color: white;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .currency-code {
            font-weight: 600;
        }
    `;
    document.head.appendChild(style);

    // Inject Switcher UI
    function injectSwitcher() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions || document.querySelector('.currency-switcher')) return;

        const switcher = document.createElement('div');
        switcher.className = 'currency-switcher';
        switcher.innerHTML = `
            <button class="currency-btn ${currentCurrency === 'USD' ? 'active' : ''}" data-currency="USD">
                <span>$</span> <span class="currency-code">USD</span>
            </button>
            <button class="currency-btn ${currentCurrency === 'LYD' ? 'active' : ''}" data-currency="LYD">
                <span>د.ل</span> <span class="currency-code">LYD</span>
            </button>
        `;

        // Insert before the first button/link
        headerActions.prepend(switcher);

        // Events
        switcher.querySelectorAll('.currency-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const currency = btn.dataset.currency;
                setCurrency(currency);
            });
        });
    }

    // Set Currency
    function setCurrency(currency) {
        currentCurrency = currency;
        localStorage.setItem('adminCurrency', currency);

        // Update Buttons
        document.querySelectorAll('.currency-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.currency === currency);
        });

        // Update Prices
        updateAllPrices();
    }

    // Update All Prices
    function updateAllPrices() {
        // Exchange Rate fallback
        const rate = window.exchangeRate || 9; // Default if not yet loaded

        // Disconnect observer to prevent infinite loop
        if (observer) observer.disconnect();

        document.querySelectorAll('[data-usd]').forEach(el => {
            const usdVal = parseFloat(el.getAttribute('data-usd'));
            if (isNaN(usdVal)) return;

            if (currentCurrency === 'USD') {
                el.innerHTML = `$${usdVal.toFixed(2)}`;
            } else {
                const lydVal = usdVal * rate;
                el.innerHTML = `${lydVal.toFixed(2)} د.ل`;
            }
        });

        // Reconnect observer
        const main = document.querySelector('.admin-main');
        if (main && observer) {
            observer.observe(main, { childList: true, subtree: true });
        }
    }

    // Observe DOM for new content
    observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach(mutation => {
            // Check if added nodes contain likely dynamic content
            if (mutation.addedNodes.length > 0) {
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            updateAllPrices();
        }
    });

    // Subtree observe the main area
    const main = document.querySelector('.admin-main');
    if (main) {
        observer.observe(main, { childList: true, subtree: true });
    } else {
        document.addEventListener('DOMContentLoaded', () => {
            const m = document.querySelector('.admin-main');
            if (m) observer.observe(m, { childList: true, subtree: true });
        });
    }

    // Listen for settings loaded from admin.js
    document.addEventListener('settings-loaded', updateAllPrices);

    // Init
    function init() {
        injectSwitcher();
        // Also listen for header rebuild
        document.addEventListener('admin-header-ready', injectSwitcher);

        // Give admin.js a moment to load settings, then update initial prices
        setTimeout(updateAllPrices, 500);
        setTimeout(updateAllPrices, 2000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
