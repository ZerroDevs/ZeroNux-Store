// ============================================
// AI WORKER - Groq API Integration
// ============================================

const AdminAI = (() => {
    // Available Groq Models (Free Tier)
    const MODELS = {
        // --- Llama Models ---
        'llama-3.3-70b-versatile': {
            name: 'Llama 3.3 70B Versatile',
            provider: 'Meta',
            params: '70B',
            context: 131072,
            description: 'أقوى نموذج Llama — متعدد المهام',
            icon: '🦙',
            category: 'llama'
        },
        'llama-3.1-8b-instant': {
            name: 'Llama 3.1 8B Instant',
            provider: 'Meta',
            params: '8B',
            context: 131072,
            description: 'سريع وخفيف — مثالي للمهام البسيطة',
            icon: '⚡',
            category: 'llama'
        },
        'llama3-8b-8192': {
            name: 'Llama 3 8B (Legacy)',
            provider: 'Meta',
            params: '8B',
            context: 8192,
            description: 'نموذج Llama 3 الأصلي — قديم',
            icon: '📦',
            category: 'llama'
        },
        'meta-llama/llama-4-scout-17b-16e-instruct': {
            name: 'Llama 4 Scout 17B',
            provider: 'Meta',
            params: '17B',
            context: 131072,
            description: 'أحدث نموذج من Meta — متعدد الوسائط',
            icon: '🔭',
            category: 'llama'
        },
        'meta-llama/llama-4-maverick-17b-128e-instruct': {
            name: 'Llama 4 Maverick 17B',
            provider: 'Meta',
            params: '17B',
            context: 131072,
            description: 'قوي في البرمجة والاستدلال',
            icon: '🚀',
            category: 'llama'
        },
        // --- Gemma Models ---
        'gemma2-9b-it': {
            name: 'Gemma 2 9B',
            provider: 'Google',
            params: '9B',
            context: 8192,
            description: 'نموذج Google المفتوح — متوازن',
            icon: '💎',
            category: 'gemma'
        },
        // --- Mistral Models ---
        'mistral-saba-24b': {
            name: 'Mistral Saba 24B',
            provider: 'Mistral AI',
            params: '24B',
            context: 32768,
            description: 'يدعم العربية بشكل ممتاز',
            icon: '🌊',
            category: 'mistral'
        },
        // --- Qwen Models ---
        'qwen/qwen3-32b': {
            name: 'Qwen 3 32B',
            provider: 'Alibaba',
            params: '32B',
            context: 131072,
            description: 'نموذج صيني قوي — متعدد اللغات',
            icon: '🐉',
            category: 'qwen'
        },
        // --- OpenAI Ecosystem ---
        'openai/gpt-oss-120b': {
            name: 'GPT OSS 120B',
            provider: 'OpenAI',
            params: '120B',
            context: 131072,
            description: 'نموذج مفتوح المصدر من OpenAI',
            icon: '🧠',
            category: 'openai'
        },
        // --- DeepSeek ---
        'deepseek-r1-distill-llama-70b': {
            name: 'DeepSeek R1 Distill 70B',
            provider: 'DeepSeek',
            params: '70B',
            context: 131072,
            description: 'متخصص في الاستدلال والتفكير',
            icon: '🔬',
            category: 'deepseek'
        }
    };

    const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

    /**
     * Get the stored API key from the settings input
     */
    function getApiKey() {
        const input = document.getElementById('groq-api-key');
        return input ? input.value.trim() : '';
    }

    /**
     * Get the selected model ID from settings
     */
    function getSelectedModel() {
        const select = document.getElementById('groq-model-select');
        return select ? select.value : 'llama-3.3-70b-versatile';
    }

    /**
     * Get model info by ID
     */
    function getModelInfo(modelId) {
        return MODELS[modelId] || null;
    }

    /**
     * Get all available models
     */
    function getAllModels() {
        return MODELS;
    }

    /**
     * Send a chat completion request to Groq API
     * @param {string} prompt - The user prompt
     * @param {object} options - Optional settings
     * @returns {Promise<string>} The AI response text
     */
    async function chat(prompt, options = {}) {
        const apiKey = options.apiKey || getApiKey();
        const model = options.model || getSelectedModel();

        if (!apiKey) {
            throw new Error('مفتاح Groq API غير موجود. أضفه في الإعدادات → AI / API');
        }

        const messages = options.messages || [
            {
                role: 'system',
                content: options.systemPrompt || 'أنت مساعد ذكاء اصطناعي لمتجر إلكتروني. أجب باللغة العربية بشكل مختصر ومفيد.'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const body = {
            model: model,
            messages: messages,
            temperature: options.temperature ?? 0.7,
            max_tokens: options.maxTokens || 1024,
            top_p: options.topP ?? 1,
            stream: false
        };

        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.error?.message || `HTTP ${response.status}`;
                throw new Error(`خطأ من Groq API: ${errorMsg}`);
            }

            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';

        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                throw new Error('تعذر الاتصال بـ Groq API. تحقق من اتصال الإنترنت.');
            }
            throw error;
        }
    }

    /**
     * Test the API connection with the current key & model
     * @returns {Promise<object>} Test result { success, message, model }
     */
    async function testConnection() {
        try {
            const model = getSelectedModel();
            const response = await chat('قل "مرحباً" فقط.', {
                maxTokens: 20,
                temperature: 0
            });

            return {
                success: true,
                message: response,
                model: model
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                model: getSelectedModel()
            };
        }
    }

    /**
     * Generate a product description
     */
    async function generateProductDescription(productName, category) {
        const prompt = `اكتب وصفاً جذاباً ومختصراً (3-4 أسطر) لمنتج رقمي اسمه "${productName}" في تصنيف "${category}". الوصف يجب أن يكون تسويقي وباللغة العربية.`;
        return await chat(prompt, {
            systemPrompt: 'أنت كاتب محتوى تسويقي محترف لمتجر إلكتروني. اكتب أوصاف منتجات قصيرة وجذابة وخالية من الحشو.',
            temperature: 0.8
        });
    }

    /**
     * Generate announcement text
     */
    async function generateAnnouncement(topic) {
        const prompt = `اكتب نص إعلان قصير (سطر واحد فقط) لشريط إعلانات متجر إلكتروني عن: "${topic}". يجب أن يكون جذاباً ومختصراً ويحتوي على إيموجي.`;
        return await chat(prompt, {
            systemPrompt: 'أنت كاتب إعلانات محترف. اكتب نصوص إعلانية قصيرة جذابة مع إيموجي مناسبة.',
            maxTokens: 100,
            temperature: 0.9
        });
    }

    // Public API
    return {
        MODELS,
        chat,
        testConnection,
        getApiKey,
        getSelectedModel,
        getModelInfo,
        getAllModels,
        generateProductDescription,
        generateAnnouncement
    };
})();

// Expose globally
window.AdminAI = AdminAI;
