// Symptom Mapper - Natural Language Processing for Symptom Detection
import symptomsData from '../data/symptoms.json';

// Common symptom keywords and their mappings
const symptomKeywords = {
    // Digestive
    'constipation': ['constipated', 'constipation', 'hard stool', 'difficulty passing', 'irregular bowel'],
    'bloating': ['bloated', 'bloating', 'gas', 'gassy', 'fullness', 'distended'],
    'acidity': ['acid', 'acidic', 'heartburn', 'acid reflux', 'burning stomach', 'sour taste'],
    'slow digestion': ['heavy after eating', 'food sits', 'sluggish digestion', 'slow metabolism'],
    'diarrhea': ['loose stool', 'watery stool', 'frequent bowel', 'runny stomach'],

    // Mental
    'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'worry', 'fear', 'scared'],
    'irritability': ['irritable', 'angry', 'frustrated', 'short tempered', 'agitated', 'annoyed'],
    'lethargy': ['lethargic', 'unmotivated', 'apathetic', 'don\'t care', 'no motivation'],
    'stress': ['stressed', 'overwhelmed', 'pressure', 'tense', 'tension'],
    'depression': ['depressed', 'sad', 'low mood', 'hopeless', 'down', 'unhappy'],

    // Sleep
    'insomnia': ['can\'t sleep', 'trouble sleeping', 'sleepless', 'awake at night', 'difficulty sleeping', 'restless night'],
    'excessive sleep': ['oversleep', 'too much sleep', 'always sleepy', 'hard to wake up', 'sleep too much'],

    // Skin
    'dry skin': ['dry', 'flaky', 'rough skin', 'cracked skin', 'scaly'],
    'skin rashes': ['rash', 'rashes', 'hives', 'red patches', 'itchy skin', 'eczema'],
    'oily skin': ['oily', 'greasy skin', 'acne', 'pimples', 'breakouts'],

    // Physical
    'fatigue': ['tired', 'exhausted', 'no energy', 'fatigued', 'worn out', 'drained', 'low energy'],
    'joint pain': ['joint', 'joints hurt', 'stiff joints', 'arthritis', 'joint stiffness'],
    'headaches': ['headache', 'head pain', 'migraine', 'head hurts'],
    'weight gain': ['gaining weight', 'weight gain', 'putting on weight', 'getting heavier'],
    'weight loss': ['losing weight', 'weight loss', 'getting thin', 'losing mass'],
    'cold hands': ['cold hands', 'cold feet', 'cold extremities', 'poor circulation'],
    'congestion': ['congested', 'stuffy nose', 'blocked nose', 'sinus', 'mucus'],
    'hair loss': ['hair fall', 'losing hair', 'thinning hair', 'hair loss', 'balding']
};

// Emotional keywords for empathetic responses
const emotionalKeywords = {
    distress: ['help', 'struggling', 'suffering', 'terrible', 'awful', 'miserable', 'frustrated'],
    mild: ['little', 'slight', 'sometimes', 'occasionally', 'bit'],
    severe: ['very', 'extremely', 'severe', 'constant', 'always', 'terrible', 'unbearable'],
    duration: ['days', 'weeks', 'months', 'years', 'long time', 'chronic']
};

/**
 * Extract symptoms from natural language input
 * @param {string} text - User's message
 * @returns {Array} Array of matched symptoms with severity
 */
export function extractSymptoms(text) {
    const lowerText = text.toLowerCase();
    const foundSymptoms = [];

    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
        for (const keyword of keywords) {
            if (lowerText.includes(keyword)) {
                // Check for severity
                let severity = 1;
                if (emotionalKeywords.severe.some(word => lowerText.includes(word))) {
                    severity = 2;
                } else if (emotionalKeywords.mild.some(word => lowerText.includes(word))) {
                    severity = 0.5;
                }

                // Find the actual symptom data
                const symptomData = symptomsData.find(s =>
                    s.name.toLowerCase() === symptom.toLowerCase()
                );

                if (symptomData && !foundSymptoms.find(s => s.id === symptomData.id)) {
                    foundSymptoms.push({
                        ...symptomData,
                        severity,
                        matchedKeyword: keyword
                    });
                }
                break;
            }
        }
    }

    return foundSymptoms;
}

/**
 * Check if the message is a greeting
 * @param {string} text - User's message
 * @returns {boolean}
 */
export function isGreeting(text) {
    const greetings = [
        'hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon',
        'good evening', 'howdy', 'greetings', 'hola', 'yo', 'sup', 'what\'s up'
    ];
    const lowerText = text.toLowerCase().trim();
    return greetings.some(g => lowerText === g || lowerText.startsWith(g + ' ') || lowerText.startsWith(g + '!') || lowerText.startsWith(g + ','));
}

/**
 * Check if the message is asking for prakriti analysis
 * @param {string} text - User's message
 * @returns {boolean}
 */
export function isPrakritiRequest(text) {
    const keywords = [
        'prakriti', 'prakruti', 'constitution', 'body type', 'dosha type',
        'my dosha', 'what dosha', 'analyze my', 'assessment', 'quiz',
        'questionnaire', 'find my dosha', 'determine my dosha'
    ];
    const lowerText = text.toLowerCase();
    return keywords.some(k => lowerText.includes(k));
}

/**
 * Check if the message is asking about routines
 * @param {string} text - User's message
 * @returns {Object|null} { dosha, type } or null
 */
export function isRoutineRequest(text) {
    const lowerText = text.toLowerCase();
    const routineKeywords = ['routine', 'daily', 'dinacharya', 'schedule', 'lifestyle'];

    if (!routineKeywords.some(k => lowerText.includes(k))) {
        return null;
    }

    const doshaMatch = {
        vata: lowerText.includes('vata'),
        pitta: lowerText.includes('pitta'),
        kapha: lowerText.includes('kapha')
    };

    const matchedDosha = Object.entries(doshaMatch).find(([_, matched]) => matched);

    return {
        dosha: matchedDosha ? matchedDosha[0] : null,
        type: 'routine'
    };
}

/**
 * Check if the message is asking about diet
 * @param {string} text - User's message
 * @returns {Object|null}
 */
export function isDietRequest(text) {
    const lowerText = text.toLowerCase();
    const dietKeywords = ['diet', 'food', 'eat', 'nutrition', 'meal', 'ahara'];

    if (!dietKeywords.some(k => lowerText.includes(k))) {
        return null;
    }

    const doshaMatch = ['vata', 'pitta', 'kapha'].find(d => lowerText.includes(d));

    return {
        dosha: doshaMatch || null,
        type: 'diet'
    };
}

/**
 * Check if the message contains emotional distress signals
 * @param {string} text - User's message
 * @returns {boolean}
 */
export function hasEmotionalDistress(text) {
    const lowerText = text.toLowerCase();
    return emotionalKeywords.distress.some(word => lowerText.includes(word));
}

/**
 * Detect the primary intent of the message
 * @param {string} text - User's message
 * @returns {Object} { intent, data }
 */
export function detectIntent(text) {
    if (isGreeting(text)) {
        return { intent: 'greeting', data: null };
    }

    if (isPrakritiRequest(text)) {
        return { intent: 'prakriti', data: null };
    }

    const routineRequest = isRoutineRequest(text);
    if (routineRequest) {
        return { intent: 'routine', data: routineRequest };
    }

    const dietRequest = isDietRequest(text);
    if (dietRequest) {
        return { intent: 'diet', data: dietRequest };
    }

    const symptoms = extractSymptoms(text);
    if (symptoms.length > 0) {
        return {
            intent: 'symptoms',
            data: {
                symptoms,
                hasDistress: hasEmotionalDistress(text)
            }
        };
    }

    // Check for yoga/stress requests
    const yogaKeywords = ['yoga', 'pranayama', 'breathing', 'meditation', 'stress management', 'relaxation'];
    if (yogaKeywords.some(k => text.toLowerCase().includes(k))) {
        const doshaMatch = ['vata', 'pitta', 'kapha'].find(d => text.toLowerCase().includes(d));
        return { intent: 'yoga', data: { dosha: doshaMatch } };
    }

    return { intent: 'general', data: null };
}

export default {
    extractSymptoms,
    isGreeting,
    isPrakritiRequest,
    isRoutineRequest,
    isDietRequest,
    hasEmotionalDistress,
    detectIntent
};
