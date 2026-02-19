/**
 * AI Translator & Dialect Adapter Module
 * Uses Groq API (via AdminAI) to translate product fields
 * and adapt text to different Arabic dialects.
 */
(function () {
    'use strict';

    const DIALECTS = {
        fus7a: { name: 'العربية الفصحى', flag: '📖', desc: 'لغة رسمية واحترافية' },
        egyptian: { name: 'المصرية', flag: '🇪🇬', desc: 'لهجة مصرية عامية' },
        gulf: { name: 'الخليجية', flag: '🇸🇦', desc: 'لهجة خليجية' },
        libyan: { name: 'الليبية', flag: '🇱🇾', desc: 'لهجة ليبية' },
        moroccan: { name: 'المغربية', flag: '🇲🇦', desc: 'لهجة مغربية / دارجة' },
        iraqi: { name: 'العراقية', flag: '🇮🇶', desc: 'لهجة عراقية' },
        levantine: { name: 'الشامية', flag: '🇱🇧', desc: 'لهجة لبنانية/سورية' }
    };

    /**
     * Translate text between Arabic and English
     */
    async function translate(text, direction) {
        if (!text.trim()) throw new Error('النص فارغ');
        if (!window.AdminAI) throw new Error('AdminAI غير محمّل');

        const dirLabel = direction === 'ar-to-en' ? 'من العربية إلى الإنجليزية' : 'من الإنجليزية إلى العربية';

        const result = await window.AdminAI.chat(text, {
            systemPrompt: `أنت مترجم محترف متخصص في مجال المنتجات الرقمية والتقنية. ترجم النص التالي ${dirLabel}. حافظ على المعنى والسياق والنبرة التسويقية. إذا كان النص يحتوي على أسماء علامات تجارية أو مصطلحات تقنية، أبقها كما هي. أعد الترجمة فقط بدون أي شرح أو ملاحظات إضافية.`,
            maxTokens: 500,
            temperature: 0.3
        });

        return result.replace(/^["'`]+|["'`]+$/g, '').trim();
    }

    /**
     * Adapt text to a specific Arabic dialect
     */
    async function adaptDialect(text, dialectKey) {
        if (!text.trim()) throw new Error('النص فارغ');
        if (!window.AdminAI) throw new Error('AdminAI غير محمّل');

        const dialect = DIALECTS[dialectKey];
        if (!dialect) throw new Error('اللهجة غير معروفة');

        const result = await window.AdminAI.chat(text, {
            systemPrompt: `أنت خبير في اللهجات العربية. حوّل النص التالي إلى ${dialect.name}. حافظ على المعنى الأصلي والنبرة التسويقية. استخدم تعابير وكلمات شائعة في ${dialect.name}. أعد النص المحوّل فقط بدون أي شرح.`,
            maxTokens: 500,
            temperature: 0.6
        });

        return result.replace(/^["'`]+|["'`]+$/g, '').trim();
    }

    /**
     * Translate all product text fields at once
     */
    async function translateProductFields(direction) {
        const fields = [
            { id: 'product-short-desc', label: 'الوصف المختصر' },
            { id: 'product-description', label: 'الوصف الكامل' }
        ];

        let translated = 0;
        for (const field of fields) {
            const el = document.getElementById(field.id);
            if (el && el.value.trim()) {
                el.value = await translate(el.value.trim(), direction);
                translated++;
            }
        }

        // Translate features (keep emoji, translate title + desc)
        const featEl = document.getElementById('product-features');
        if (featEl && featEl.value.trim()) {
            const lines = featEl.value.trim().split('\n');
            const translatedLines = [];
            for (const line of lines) {
                const parts = line.split('|');
                if (parts.length === 3) {
                    const emoji = parts[0].trim();
                    const title = await translate(parts[1].trim(), direction);
                    const desc = await translate(parts[2].trim(), direction);
                    translatedLines.push(`${emoji}|${title}|${desc}`);
                } else {
                    translatedLines.push(await translate(line, direction));
                }
            }
            featEl.value = translatedLines.join('\n');
            translated++;
        }

        return translated;
    }

    /**
     * Adapt all product text fields to a dialect
     */
    async function adaptProductDialect(dialectKey) {
        const fields = [
            { id: 'product-short-desc' },
            { id: 'product-description' }
        ];

        let adapted = 0;
        for (const field of fields) {
            const el = document.getElementById(field.id);
            if (el && el.value.trim()) {
                el.value = await adaptDialect(el.value.trim(), dialectKey);
                adapted++;
            }
        }

        // Adapt features
        const featEl = document.getElementById('product-features');
        if (featEl && featEl.value.trim()) {
            const lines = featEl.value.trim().split('\n');
            const adaptedLines = [];
            for (const line of lines) {
                const parts = line.split('|');
                if (parts.length === 3) {
                    const emoji = parts[0].trim();
                    const title = await adaptDialect(parts[1].trim(), dialectKey);
                    const desc = await adaptDialect(parts[2].trim(), dialectKey);
                    adaptedLines.push(`${emoji}|${title}|${desc}`);
                } else {
                    adaptedLines.push(await adaptDialect(line, dialectKey));
                }
            }
            featEl.value = adaptedLines.join('\n');
            adapted++;
        }

        return adapted;
    }

    // Expose public API
    window.AITranslator = {
        DIALECTS,
        translate,
        adaptDialect,
        translateProductFields,
        adaptProductDialect
    };

})();
