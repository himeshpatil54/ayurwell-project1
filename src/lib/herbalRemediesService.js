// Herbal Remedies Service — Supabase queries with local fallback
import { supabase } from './supabase';
import localHerbsData from '../data/herbs.json';

let cachedRemedies = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 5 * 60 * 1000;

function normalize(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Fetch all herbal remedies from Supabase, fallback to local herbs.json
 */
async function fetchRemedies() {
    const now = Date.now();
    if (cachedRemedies && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedRemedies;
    }

    try {
        const { data, error } = await supabase
            .from('herbal_remedies')
            .select('*');

        if (error) {
            console.warn('[Herbs] Supabase query error:', error.message);
            cachedRemedies = transformLocalData();
            cacheTimestamp = now;
            return cachedRemedies;
        }

        if (data && data.length > 0) {
            console.log('[Herbs] Fetched', data.length, 'rows from Supabase');
            cachedRemedies = data;
            cacheTimestamp = now;
            return data;
        } else {
            console.log('[Herbs] Supabase table empty, using local fallback');
            cachedRemedies = transformLocalData();
            cacheTimestamp = now;
            return cachedRemedies;
        }
    } catch (err) {
        console.warn('[Herbs] Supabase fetch failed:', err.message);
        cachedRemedies = transformLocalData();
        cacheTimestamp = now;
        return cachedRemedies;
    }
}

/**
 * Transform local herbs.json into the same shape as Supabase data
 */
function transformLocalData() {
    // herbs.json may be an object keyed by dosha, or an array
    let herbs = [];
    if (Array.isArray(localHerbsData)) {
        herbs = localHerbsData;
    } else {
        // Flatten object { vata: [...], pitta: [...], kapha: [...] }
        for (const [dosha, items] of Object.entries(localHerbsData)) {
            if (Array.isArray(items)) {
                herbs.push(...items.map(h => ({ ...h, dosha })));
            }
        }
    }

    return herbs.map((h, i) => ({
        id: i + 1,
        herb_name: h.name || h.herb_name || h.herb || 'Unknown Herb',
        benefits: h.benefits || h.description || h.effect || '',
        preparation_method: h.preparation || h.preparation_method || h.usage || 'Consult an Ayurvedic practitioner for preparation guidance.',
        dosage: h.dosage || 'As recommended by a practitioner.',
        precautions: h.precautions || h.contraindications || 'Consult a healthcare professional before use.',
        related_symptoms: h.symptoms || h.related_symptoms || h.uses || '',
        dosha: h.dosha || ''
    }));
}

/**
 * Search herbal remedies by query
 */
export async function searchHerbalRemedies(query) {
    const data = await fetchRemedies();
    if (!query || !query.trim()) return data;

    const q = normalize(query);
    const tokens = q.split(' ').filter(w => w.length > 1);

    const scored = data.map(herb => {
        let score = 0;
        const nameNorm = normalize(herb.herb_name || '');
        const benefitsNorm = normalize(herb.benefits || '');
        const symptomsNorm = normalize(
            Array.isArray(herb.related_symptoms) ? herb.related_symptoms.join(' ') : (herb.related_symptoms || '')
        );
        const combined = nameNorm + ' ' + benefitsNorm + ' ' + symptomsNorm;

        for (const t of tokens) {
            if (nameNorm.includes(t)) score += 10;
            if (symptomsNorm.includes(t)) score += 8;
            if (benefitsNorm.includes(t)) score += 5;
            if (combined.includes(t)) score += 2;
        }

        if (q.includes(nameNorm) || nameNorm.includes(q)) score += 15;

        return { ...herb, score };
    });

    return scored.filter(h => h.score > 0).sort((a, b) => b.score - a.score);
}

/**
 * Get all remedies for browsing
 */
export async function getAllRemedies() {
    return await fetchRemedies();
}
