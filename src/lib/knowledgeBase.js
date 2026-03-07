// Knowledge Base - Supabase-powered retrieval with fuzzy matching
import { supabase } from './supabase';
import localSymptomsData from '../data/ayurvedic_symptoms.json';

// Cache for Supabase data to avoid repeated fetches
let cachedData = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Normalize text for matching
function normalize(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// Tokenize text into words
function tokenize(text) {
    return normalize(text).split(' ').filter(w => w.length > 1);
}

// Simple Levenshtein distance for fuzzy matching
function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) =>
        Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
    );
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            matrix[i][j] = a[i - 1] === b[j - 1]
                ? matrix[i - 1][j - 1]
                : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1]);
        }
    }
    return matrix[a.length][b.length];
}

// Check if two words are fuzzy-similar
function isFuzzyMatch(word, target) {
    if (target.includes(word) || word.includes(target)) return true;
    const maxDist = word.length <= 4 ? 1 : 2;
    return levenshtein(word, target) <= maxDist;
}

// Synonym expansion map
const SYNONYMS = {
    'headache': ['head pain', 'migraine', 'head hurts', 'head ache'],
    'stomach': ['belly', 'tummy', 'abdomen', 'gastric'],
    'tired': ['fatigue', 'exhausted', 'no energy', 'low energy', 'worn out'],
    'anxious': ['anxiety', 'worried', 'nervous', 'panic', 'worry'],
    'stressed': ['stress', 'overwhelmed', 'tense', 'pressure'],
    'cant sleep': ['insomnia', 'sleepless', 'trouble sleeping', 'sleep problems'],
    'acne': ['pimples', 'breakouts', 'skin problems', 'oily skin'],
    'constipated': ['constipation', 'hard stool', 'cant poop'],
    'bloated': ['bloating', 'gas', 'gassy', 'fullness'],
    'sad': ['depression', 'depressed', 'unhappy', 'low mood'],
    'angry': ['anger', 'irritability', 'irritable', 'frustrated'],
    'hair fall': ['hair loss', 'losing hair', 'thinning hair', 'balding'],
    'weight': ['weight gain', 'weight loss', 'gaining weight', 'losing weight'],
    'joint': ['joint pain', 'joints hurt', 'arthritis', 'stiff joints'],
    'cough': ['respiratory problems', 'bronchitis', 'breathing problems'],
    'cold': ['congestion', 'stuffy nose', 'sinus', 'mucus'],
    'heartburn': ['acidity', 'acid reflux', 'burning stomach'],
    'indigestion': ['digestive problems', 'digestion', 'stomach upset'],
    'dizzy': ['dizziness', 'lightheaded', 'vertigo'],
    'sweat': ['excessive sweating', 'sweating', 'night sweats'],
    'back pain': ['backache', 'lower back', 'sciatica'],
    'cramps': ['muscle cramps', 'leg cramps', 'spasms'],
    'nausea': ['nauseous', 'feeling sick', 'vomiting'],
    'rash': ['skin rashes', 'hives', 'itchy skin', 'eczema'],
    'dry skin': ['flaky skin', 'rough skin', 'cracked skin']
};

// Expand query with synonyms
function expandQuery(query) {
    const normalizedQuery = normalize(query);
    let expanded = normalizedQuery;

    for (const [key, synonyms] of Object.entries(SYNONYMS)) {
        for (const syn of synonyms) {
            if (normalizedQuery.includes(syn)) {
                expanded += ' ' + key;
            }
        }
        if (normalizedQuery.includes(key)) {
            expanded += ' ' + synonyms.join(' ');
        }
    }

    return expanded;
}

/**
 * Fetch all data from Supabase (with caching)
 */
async function fetchSupabaseData() {
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
        console.log('[KB] Using cached data (' + cachedData.length + ' rows)');
        return cachedData;
    }

    try {
        console.log('[KB] Fetching fresh data from Supabase table: ayurvedic_symptomss');
        const { data, error } = await supabase
            .from('ayurvedic_symptomss')
            .select('symptom, dosha, description, herbal_remedy, diet_recommendation, yoga_recommendation, lifestyle_advice');

        if (error) {
            console.warn('[KB] Supabase query error:', error.message);
            console.log('[KB] Falling back to local dataset (' + localSymptomsData.length + ' rows)');
            cachedData = localSymptomsData;
            cacheTimestamp = now;
            return localSymptomsData;
        }

        console.log('[KB] Fetched', data?.length || 0, 'rows from Supabase');

        if (data && data.length > 0) {
            console.log('[KB] Using Supabase data');
            console.log('[KB] Sample row:', JSON.stringify(data[0]));
            cachedData = data;
            cacheTimestamp = now;
            return data;
        } else {
            // Supabase table is empty — use local fallback
            console.log('[KB] Supabase table is empty, using local dataset (' + localSymptomsData.length + ' rows)');
            cachedData = localSymptomsData;
            cacheTimestamp = now;
            return localSymptomsData;
        }
    } catch (err) {
        console.warn('[KB] Supabase fetch failed:', err.message);
        console.log('[KB] Falling back to local dataset (' + localSymptomsData.length + ' rows)');
        cachedData = localSymptomsData;
        cacheTimestamp = now;
        return localSymptomsData;
    }
}

/**
 * Search the Supabase knowledge base
 * @param {string} query - User's search query
 * @returns {Promise<{results: Array, confidence: number, source: string}>}
 */
export async function searchKnowledgeBase(query) {
    console.log('[KB] searchKnowledgeBase called with:', query);

    const expandedQuery = expandQuery(query);
    const queryTokens = tokenize(expandedQuery);

    console.log('[KB] Expanded:', expandedQuery);
    console.log('[KB] Tokens:', queryTokens);

    if (queryTokens.length === 0) {
        return { results: [], confidence: 0, source: 'none' };
    }

    try {
        const data = await fetchSupabaseData();

        if (!data || data.length === 0) {
            console.log('[KB] No data available');
            return { results: [], confidence: 0, source: 'none' };
        }

        // Score each row
        const scored = data.map(row => {
            let score = 0;
            const symptomNorm = normalize(row.symptom || '');
            const descNorm = normalize(row.description || '');
            const herbNorm = normalize(row.herbal_remedy || '');
            const combined = symptomNorm + ' ' + descNorm + ' ' + herbNorm;
            const combinedTokens = tokenize(combined);

            // Exact symptom name match (highest weight)
            const queryNorm = normalize(query);
            if (queryNorm.includes(symptomNorm) || symptomNorm.includes(queryNorm)) {
                score += 10;
            }

            // Check if symptom name words appear in query (handle underscores)
            const symptomWords = symptomNorm.replace(/_/g, ' ').split(' ');
            for (const sw of symptomWords) {
                if (sw.length > 2 && queryNorm.includes(sw)) {
                    score += 6;
                }
            }

            // Token-level matching
            for (const qt of queryTokens) {
                if (symptomNorm.includes(qt) || symptomNorm.replace(/_/g, ' ').includes(qt)) {
                    score += 5;
                }
                if (descNorm.includes(qt)) {
                    score += 2;
                }
                if (herbNorm.includes(qt)) {
                    score += 3;
                }
                // Fuzzy match
                for (const ct of combinedTokens) {
                    if (isFuzzyMatch(qt, ct)) {
                        score += 1;
                    }
                }
            }

            // Dosha mention bonus
            for (const d of ['vata', 'pitta', 'kapha']) {
                if (queryNorm.includes(d) && normalize(row.dosha || '') === d) {
                    score += 3;
                }
            }

            return { ...row, score };
        });

        // Filter and sort
        const matches = scored.filter(r => r.score > 0).sort((a, b) => b.score - a.score);

        if (matches.length === 0) {
            console.log('[KB] No matching rows found');
            return { results: [], confidence: 0, source: 'supabase' };
        }

        // Deduplicate top results
        const seen = new Set();
        const topResults = [];
        for (const m of matches) {
            const key = `${m.symptom}-${m.dosha}`;
            if (!seen.has(key) && topResults.length < 5) {
                seen.add(key);
                topResults.push(m);
            }
        }

        const confidence = Math.min(topResults[0].score / 15, 1);

        console.log('[KB] Top result:', topResults[0].symptom, 'score:', topResults[0].score, 'confidence:', confidence);
        console.log('[KB] Returning', topResults.length, 'results');

        return { results: topResults, confidence, source: 'supabase' };
    } catch (err) {
        console.error('[KB] Search failed:', err);
        return { results: [], confidence: 0, source: 'error' };
    }
}

/**
 * Format knowledge base results as a friendly, readable chat message
 */
export function formatKBResponse(results, query) {
    if (!results || results.length === 0) return null;

    // Group by symptom
    const grouped = {};
    for (const r of results) {
        const key = (r.symptom || '').replace(/_/g, ' ');
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(r);
    }

    let response = '';
    let count = 0;

    for (const [symptom, entries] of Object.entries(grouped)) {
        if (count > 0) response += '\n---\n\n';
        const title = symptom.charAt(0).toUpperCase() + symptom.slice(1);
        response += `## 🌿 ${title}\n\n`;

        for (const entry of entries.slice(0, 2)) {
            const dosha = (entry.dosha || '').charAt(0).toUpperCase() + (entry.dosha || '').slice(1);
            response += `**Dosha:** ${dosha}\n`;
            if (entry.description) response += `${entry.description}\n\n`;

            if (entry.herbal_remedy) {
                const herb = entry.herbal_remedy.charAt(0).toUpperCase() + entry.herbal_remedy.slice(1);
                response += `🌱 **Herbal Remedy:** ${herb}\n`;
            }
            if (entry.diet_recommendation) {
                response += `🍽️ **Diet:** ${entry.diet_recommendation}\n`;
            }
            if (entry.yoga_recommendation) {
                response += `🧘 **Yoga:** ${entry.yoga_recommendation}\n`;
            }
            if (entry.lifestyle_advice) {
                response += `💡 **Lifestyle:** ${entry.lifestyle_advice}\n`;
            }
            response += '\n';
        }
        count++;
    }

    response += `---\n> 🙏 *This guidance is from our verified Ayurvedic knowledge base. For personalized advice, please consult a qualified Ayurvedic practitioner.*`;

    return response;
}

/**
 * Log a chat interaction
 */
export async function logChatMessage(sessionId, role, content, metadata = {}) {
    // Store in localStorage
    const key = 'ayurveda_chat_log';
    try {
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        existing.push({
            session_id: sessionId,
            role,
            content: content.substring(0, 500),
            metadata,
            created_at: new Date().toISOString()
        });
        if (existing.length > 100) existing.splice(0, existing.length - 100);
        localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
        // Ignore storage errors
    }
}

export default { searchKnowledgeBase, formatKBResponse, logChatMessage };
