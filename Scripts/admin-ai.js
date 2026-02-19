// ============================================
// AI WORKER - Multi-Provider Integration
// Supports: Groq, Cerebras, SambaNova, OpenRouter
// ============================================

const AdminAI = (() => {
    'use strict';

    // ─── Provider Definitions ───
    const PROVIDERS = {
        groq: {
            name: 'Groq',
            icon: '⚡',
            color: '#f55036',
            apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
            keyPrefix: 'gsk_',
            keyPlaceholder: 'gsk_xxxxxxxxxxxxxxxxxxxxxxxx',
            description: 'أسرع مزود — سرعات استجابة فائقة',
            website: 'https://console.groq.com/keys',
            models: {
                'llama-3.3-70b-versatile': {
                    name: 'Llama 3.3 70B Versatile',
                    provider: 'Meta', params: '70B', context: 131072,
                    description: 'أقوى نموذج Llama — متعدد المهام', icon: '🦙'
                },
                'llama-3.1-8b-instant': {
                    name: 'Llama 3.1 8B Instant',
                    provider: 'Meta', params: '8B', context: 131072,
                    description: 'سريع وخفيف — مثالي للمهام البسيطة', icon: '⚡'
                },
                'meta-llama/llama-4-scout-17b-16e-instruct': {
                    name: 'Llama 4 Scout 17B',
                    provider: 'Meta', params: '17B', context: 131072,
                    description: 'أحدث نموذج من Meta — متعدد الوسائط', icon: '🔭'
                },
                'meta-llama/llama-4-maverick-17b-128e-instruct': {
                    name: 'Llama 4 Maverick 17B',
                    provider: 'Meta', params: '17B', context: 131072,
                    description: 'قوي في البرمجة والاستدلال', icon: '🚀'
                },
                'gemma2-9b-it': {
                    name: 'Gemma 2 9B',
                    provider: 'Google', params: '9B', context: 8192,
                    description: 'نموذج Google المفتوح — متوازن', icon: '💎'
                },
                'mistral-saba-24b': {
                    name: 'Mistral Saba 24B',
                    provider: 'Mistral AI', params: '24B', context: 32768,
                    description: 'يدعم العربية بشكل ممتاز', icon: '🌊'
                },
                'qwen/qwen3-32b': {
                    name: 'Qwen 3 32B',
                    provider: 'Alibaba', params: '32B', context: 131072,
                    description: 'نموذج صيني قوي — متعدد اللغات', icon: '🐉'
                },
                'deepseek-r1-distill-llama-70b': {
                    name: 'DeepSeek R1 Distill 70B',
                    provider: 'DeepSeek', params: '70B', context: 131072,
                    description: 'متخصص في الاستدلال والتفكير', icon: '🔬'
                }
            }
        },
        cerebras: {
            name: 'Cerebras',
            icon: '🧠',
            color: '#ff6b35',
            apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
            keyPrefix: 'csk-',
            keyPlaceholder: 'csk-xxxxxxxxxxxxxxxxxxxxxxxx',
            description: 'سرعة فائقة — أسرع استدلال في العالم',
            website: 'https://cloud.cerebras.ai/',
            models: {
                'llama-3.3-70b': {
                    name: 'Llama 3.3 70B',
                    provider: 'Meta', params: '70B', context: 8192,
                    description: 'أقوى نموذج Llama على Cerebras', icon: '🦙'
                },
                'llama-3.1-8b': {
                    name: 'Llama 3.1 8B',
                    provider: 'Meta', params: '8B', context: 8192,
                    description: 'سريع وخفيف', icon: '⚡'
                },
                'llama-4-scout-17b-16e-instruct': {
                    name: 'Llama 4 Scout 17B',
                    provider: 'Meta', params: '17B', context: 131072,
                    description: 'أحدث إصدار من Llama 4', icon: '🔭'
                },
                'qwen-3-32b': {
                    name: 'Qwen 3 32B',
                    provider: 'Alibaba', params: '32B', context: 32768,
                    description: 'نموذج متعدد اللغات قوي', icon: '🐉'
                }
            }
        },
        sambanova: {
            name: 'SambaNova',
            icon: '🔶',
            color: '#ff8c00',
            apiUrl: 'https://api.sambanova.ai/v1/chat/completions',
            keyPrefix: '',
            keyPlaceholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            description: 'يدعم Llama 405B مجاناً — الأقوى',
            website: 'https://cloud.sambanova.ai/apis',
            models: {
                'Meta-Llama-3.1-8B-Instruct': {
                    name: 'Llama 3.1 8B',
                    provider: 'Meta', params: '8B', context: 8192,
                    description: 'سريع وخفيف', icon: '⚡'
                },
                'Meta-Llama-3.1-70B-Instruct': {
                    name: 'Llama 3.1 70B',
                    provider: 'Meta', params: '70B', context: 8192,
                    description: 'قوي ومتعدد المهام', icon: '🦙'
                },
                'Meta-Llama-3.1-405B-Instruct': {
                    name: 'Llama 3.1 405B ⭐',
                    provider: 'Meta', params: '405B', context: 8192,
                    description: 'أكبر نموذج مفتوح المصدر في العالم!', icon: '👑'
                },
                'Meta-Llama-3.3-70B-Instruct': {
                    name: 'Llama 3.3 70B',
                    provider: 'Meta', params: '70B', context: 8192,
                    description: 'أحدث Llama 3.3', icon: '🚀'
                },
                'DeepSeek-R1': {
                    name: 'DeepSeek R1',
                    provider: 'DeepSeek', params: '671B', context: 8192,
                    description: 'أقوى نموذج استدلال مفتوح المصدر', icon: '🔬'
                },
                'Qwen2.5-72B-Instruct': {
                    name: 'Qwen 2.5 72B',
                    provider: 'Alibaba', params: '72B', context: 8192,
                    description: 'نموذج متعدد اللغات', icon: '🐉'
                }
            }
        },
        openrouter: {
            name: 'OpenRouter',
            icon: '🌐',
            color: '#6366f1',
            apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
            keyPrefix: 'sk-or-',
            keyPlaceholder: 'sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx',
            description: 'أكبر مجموعة نماذج مجانية — 50+ نموذج',
            website: 'https://openrouter.ai/keys',
            extraHeaders: {
                'HTTP-Referer': window.location.origin,
                'X-Title': 'ZeroNux Store Admin'
            },
            models: {
                'meta-llama/llama-3.3-70b-instruct:free': {
                    name: 'Llama 3.3 70B',
                    provider: 'Meta', params: '70B', context: 131072,
                    description: 'أقوى نموذج مجاني عالي الأداء', icon: '🦙'
                },
                'google/gemma-2-9b-it:free': {
                    name: 'Gemma 2 9B',
                    provider: 'Google', params: '9B', context: 8192,
                    description: 'سريع ومتوازن من Google', icon: '💎'
                },
                'mistralai/mistral-7b-instruct:free': {
                    name: 'Mistral 7B',
                    provider: 'Mistral', params: '7B', context: 32768,
                    description: 'خفيف وسريع جداً', icon: '⚡'
                },
                'qwen/qwen-2-7b-instruct:free': {
                    name: 'Qwen 2 7B',
                    provider: 'Alibaba', params: '7B', context: 32768,
                    description: 'أداء ممتاز في اللغة العربية', icon: '🐉'
                }
            }
        }
    };

    // ─── State ───
    let currentProvider = 'groq';
    let providerApiKeys = {};

    // ─── Provider Management ───
    function getProviders() { return PROVIDERS; }
    function getCurrentProvider() { return currentProvider; }

    function setCurrentProvider(providerId) {
        if (PROVIDERS[providerId]) currentProvider = providerId;
    }

    function getProviderInfo(providerId) {
        return PROVIDERS[providerId || currentProvider] || null;
    }

    function getModels(providerId) {
        const p = PROVIDERS[providerId || currentProvider];
        return p ? p.models : {};
    }

    // ─── API Key Management ───
    function getApiKey(providerId) {
        const pid = providerId || currentProvider;
        // Return stored key if exists
        if (providerApiKeys[pid]) return providerApiKeys[pid];

        // Only return input value if we are querying the CURRENT active provider
        if (pid === currentProvider) {
            const input = document.getElementById('ai-api-key');
            return input ? input.value.trim() : '';
        }

        return '';
    }

    function setApiKey(providerId, key) {
        providerApiKeys[providerId] = key;
    }

    function setAllApiKeys(keysObj) {
        providerApiKeys = keysObj || {};
    }

    // ─── Model Selection ───
    function getSelectedModel() {
        const select = document.getElementById('groq-model-select');
        let val = select ? select.value : '';

        // Validation: Ensure model belongs to current provider
        // This prevents using stale/removed models from settings
        const models = getModels();
        if (!models[val]) {
            val = Object.keys(models)[0] || '';
        }
        return val;
    }

    function getModelInfo(modelId) {
        // Handle case where modelId might be invalid/stale
        const models = getModels();
        if (!models[modelId]) {
            // Fallback to first model
            const firstId = Object.keys(models)[0];
            return models[firstId] || null;
        }
        return models[modelId];
    }

    // ─── Chat API ───
    async function chat(prompt, options = {}) {
        const provider = PROVIDERS[options.provider || currentProvider];
        const apiKey = options.apiKey || getApiKey(options.provider || currentProvider);
        const model = options.model || getSelectedModel();

        if (!apiKey) {
            throw new Error(`مفتاح API غير موجود لـ ${provider.name}. أضفه في الإعدادات → AI / API`);
        }

        const messages = options.messages || [
            {
                role: 'system',
                content: options.systemPrompt || 'أنت مساعد ذكاء اصطناعي لمتجر إلكتروني. أجب باللغة العربية بشكل مختصر ومفيد.'
            },
            { role: 'user', content: prompt }
        ];

        const body = {
            model: model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 1024,
            top_p: options.topP ?? 1,
            stream: false
        };

        const headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        };

        if (provider.extraHeaders) {
            Object.assign(headers, provider.extraHeaders);
        }

        try {
            const response = await fetch(provider.apiUrl, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = errorData.error?.message || `HTTP ${response.status}`;

                // Customize common errors
                if (response.status === 401) {
                    errorMsg = 'مفتاح API غير صحيح أو غير صالح الاستخدام.';
                } else if (response.status === 402) {
                    errorMsg = 'نفذ رصيد الحساب (أو الخطة المجانية).';
                } else if (errorMsg.includes('User not found')) {
                    errorMsg = 'مفتاح API هذا غير مرتبط بحساب صالح على OpenRouter.';
                }

                throw new Error(`${errorMsg} (${provider.name})`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error(`تعذر الاتصال بـ ${provider.name}. تحقق من اتصال الإنترنت.`);
            }
            throw error;
        }
    }

    // ─── Test Connection ───
    async function testConnection() {
        try {
            const model = getSelectedModel();
            const response = await chat('قل "مرحباً" فقط.', { maxTokens: 20, temperature: 0 });
            return { success: true, message: response, model, provider: currentProvider };
        } catch (error) {
            return { success: false, message: error.message, model: getSelectedModel(), provider: currentProvider };
        }
    }

    // ─── Helper Functions ───
    async function generateProductDescription(productName, category) {
        return await chat(
            `اكتب وصفاً جذاباً ومختصراً (3-4 أسطر) لمنتج رقمي اسمه "${productName}" في تصنيف "${category}". الوصف يجب أن يكون تسويقي وباللغة العربية.`,
            { systemPrompt: 'أنت كاتب محتوى تسويقي محترف لمتجر إلكتروني. اكتب أوصاف منتجات قصيرة وجذابة وخالية من الحشو.', temperature: 0.8 }
        );
    }

    async function generateAnnouncement(topic) {
        return await chat(
            `اكتب نص إعلان قصير (سطر واحد فقط) لشريط إعلانات متجر إلكتروني عن: "${topic}". يجب أن يكون جذاباً ومختصراً ويحتوي على إيموجي.`,
            { systemPrompt: 'أنت كاتب إعلانات محترف. اكتب نصوص إعلانية قصيرة جذابة مع إيموجي مناسبة.', maxTokens: 100, temperature: 0.9 }
        );
    }

    // ─── Public API ───
    return {
        PROVIDERS,
        get MODELS() { return getModels(currentProvider); },
        chat,
        testConnection,
        getApiKey,
        setApiKey,
        setAllApiKeys,
        getSelectedModel,
        getModelInfo,
        getModels,
        getProviders,
        getCurrentProvider,
        setCurrentProvider,
        getProviderInfo,
        generateProductDescription,
        generateAnnouncement
    };
})();

window.AdminAI = AdminAI;
