// Symptom Mapper - Enhanced NLP with Fuzzy Matching and Extended Intents
import symptomsData from '../data/symptoms.json';

// Common symptom keywords and their mappings
const symptomKeywords = {
    // Digestive
    'constipation': ['constipated', 'constipation', 'hard stool', 'difficulty passing', 'irregular bowel'],
    'bloating': ['bloated', 'bloating', 'gas', 'gassy', 'fullness', 'distended'],
    'acidity': ['acid', 'acidic', 'heartburn', 'acid reflux', 'burning stomach', 'sour taste'],
    'slow digestion': ['heavy after eating', 'food sits', 'sluggish digestion', 'slow metabolism'],
    'diarrhea': ['loose stool', 'watery stool', 'frequent bowel', 'runny stomach'],
    'indigestion': ['indigestion', 'stomach upset', 'stomach ache', 'stomach pain', 'tummy ache', 'digestive issues', 'digestion problem'],

    // Mental
    'anxiety': ['anxious', 'worried', 'nervous', 'panic', 'worry', 'fear', 'scared', 'restless mind'],
    'irritability': ['irritable', 'angry', 'frustrated', 'short tempered', 'agitated', 'annoyed'],
    'lethargy': ['lethargic', 'unmotivated', 'apathetic', 'don\'t care', 'no motivation'],
    'stress': ['stressed', 'overwhelmed', 'pressure', 'tense', 'tension', 'burnout'],
    'depression': ['depressed', 'sad', 'low mood', 'hopeless', 'down', 'unhappy', 'no interest'],

    // Sleep
    'insomnia': ['can\'t sleep', 'trouble sleeping', 'sleepless', 'awake at night', 'difficulty sleeping', 'restless night', 'sleep problems'],
    'excessive sleep': ['oversleep', 'too much sleep', 'always sleepy', 'hard to wake up', 'sleep too much'],

    // Skin
    'dry skin': ['dry', 'flaky', 'rough skin', 'cracked skin', 'scaly'],
    'skin rashes': ['rash', 'rashes', 'hives', 'red patches', 'itchy skin', 'eczema'],
    'oily skin': ['oily', 'greasy skin', 'acne', 'pimples', 'breakouts'],

    // Physical
    'fatigue': ['tired', 'exhausted', 'no energy', 'fatigued', 'worn out', 'drained', 'low energy'],
    'joint pain': ['joint', 'joints hurt', 'stiff joints', 'arthritis', 'joint stiffness'],
    'headaches': ['headache', 'head pain', 'migraine', 'head hurts'],
    'weight gain': ['gaining weight', 'weight gain', 'putting on weight', 'getting heavier', 'obesity'],
    'weight loss': ['losing weight', 'weight loss', 'getting thin', 'losing mass', 'underweight'],
    'cold hands': ['cold hands', 'cold feet', 'cold extremities', 'poor circulation'],
    'congestion': ['congested', 'stuffy nose', 'blocked nose', 'sinus', 'mucus', 'sinusitis'],
    'hair loss': ['hair fall', 'losing hair', 'thinning hair', 'hair loss', 'balding'],
    'back pain': ['backache', 'back pain', 'lower back', 'sciatica', 'spine pain'],
    'nausea': ['nauseous', 'feeling sick', 'vomiting', 'morning sickness'],
    'dizziness': ['dizzy', 'lightheaded', 'vertigo', 'spinning'],
    'muscle cramps': ['cramps', 'muscle spasm', 'leg cramp', 'charley horse'],
    'excessive sweating': ['sweating', 'night sweats', 'perspiration'],
    'eye problems': ['eye strain', 'dry eyes', 'blurry vision', 'itchy eyes'],
    'fever': ['fever', 'temperature', 'chills', 'body heat'],
    'bad breath': ['bad breath', 'halitosis', 'mouth odor'],
    'throat problems': ['sore throat', 'scratchy throat', 'throat pain', 'hoarse voice'],
    'dental problems': ['tooth pain', 'gum problems', 'bleeding gums', 'toothache']
};

// Emotional keywords for empathetic responses
const emotionalKeywords = {
    distress: ['help', 'struggling', 'suffering', 'terrible', 'awful', 'miserable', 'frustrated', 'desperate', 'please help'],
    mild: ['little', 'slight', 'sometimes', 'occasionally', 'bit', 'minor'],
    severe: ['very', 'extremely', 'severe', 'constant', 'always', 'terrible', 'unbearable', 'chronic', 'intense'],
    duration: ['days', 'weeks', 'months', 'years', 'long time', 'chronic']
};

// Identity-related keywords
const identityKeywords = [
    'who are you', 'what are you', 'your name', 'what is ayurwell',
    'about ayurwell', 'who made you', 'what can you do', 'what do you do',
    'introduce yourself', 'tell me about yourself', 'are you a bot',
    'are you human', 'are you ai', 'what is this'
];

// Emergency keywords
const emergencyKeywords = [
    'suicide', 'suicidal', 'kill myself', 'want to die', 'end my life',
    'heart attack', 'chest pain', 'call 911', 'emergency', 'severe bleeding',
    'unconscious', 'seizure', 'stroke', 'can\'t breathe', 'choking',
    'overdose', 'poisoning', 'severe allergic'
];

// Thank you keywords
const thanksKeywords = [
    'thank you', 'thanks', 'thank', 'helpful', 'that helps',
    'great advice', 'appreciate', 'wonderful', 'awesome', 'perfect',
    'good answer', 'nice', 'great', 'excellent', 'very helpful'
];

// Goodbye keywords
const goodbyeKeywords = [
    'bye', 'goodbye', 'see you', 'take care', 'good night',
    'talk later', 'gotta go', 'leaving', 'quit', 'exit', 'end chat'
];

// Herb-related keywords
const herbKeywords = [
    'ashwagandha', 'tulsi', 'brahmi', 'triphala', 'turmeric', 'neem',
    'amla', 'shatavari', 'ginger', 'licorice', 'guggulu', 'arjuna',
    'herb', 'herbal', 'medicine', 'remedy', 'supplement', 'ayurvedic herb',
    'trikatu', 'chyawanprash', 'guduchi', 'punarnava', 'shilajit',
    'bhringaraj', 'manjistha'
];

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

/**
 * Extract symptoms from natural language input with fuzzy matching
 */
export function extractSymptoms(text) {
    const lowerText = text.toLowerCase();
    const foundSymptoms = [];

    for (const [symptom, keywords] of Object.entries(symptomKeywords)) {
        for (const keyword of keywords) {
            let matched = false;

            // Exact substring match
            if (lowerText.includes(keyword)) {
                matched = true;
            }

            // Fuzzy match: check each word in the user's text
            if (!matched) {
                const userWords = lowerText.split(/\s+/);
                const keywordWords = keyword.split(/\s+/);
                for (const uw of userWords) {
                    for (const kw of keywordWords) {
                        if (uw.length > 3 && kw.length > 3) {
                            const dist = levenshtein(uw, kw);
                            if (dist <= (uw.length <= 5 ? 1 : 2)) {
                                matched = true;
                                break;
                            }
                        }
                    }
                    if (matched) break;
                }
            }

            if (matched) {
                let severity = 1;
                if (emotionalKeywords.severe.some(word => lowerText.includes(word))) {
                    severity = 2;
                } else if (emotionalKeywords.mild.some(word => lowerText.includes(word))) {
                    severity = 0.5;
                }

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
 */
export function hasEmotionalDistress(text) {
    const lowerText = text.toLowerCase();
    return emotionalKeywords.distress.some(word => lowerText.includes(word));
}

/**
 * Detect the primary intent of the message
 */
export function detectIntent(text) {
    const lowerText = text.toLowerCase().trim();

    // Identity check
    if (identityKeywords.some(k => lowerText.includes(k))) {
        return { intent: 'identity', data: null };
    }

    // Emergency check (highest priority)
    if (emergencyKeywords.some(k => lowerText.includes(k))) {
        return { intent: 'emergency', data: null };
    }

    // Greeting check
    if (isGreeting(text)) {
        return { intent: 'greeting', data: null };
    }

    // Thanks check
    if (thanksKeywords.some(k => lowerText.includes(k)) && lowerText.length < 50) {
        return { intent: 'thanks', data: null };
    }

    // Goodbye check
    if (goodbyeKeywords.some(k => lowerText === k || lowerText.startsWith(k + ' '))) {
        return { intent: 'goodbye', data: null };
    }

    // Prakriti request
    if (isPrakritiRequest(text)) {
        return { intent: 'prakriti', data: null };
    }

    // Routine request
    const routineRequest = isRoutineRequest(text);
    if (routineRequest) {
        return { intent: 'routine', data: routineRequest };
    }

    // Diet request
    const dietRequest = isDietRequest(text);
    if (dietRequest) {
        return { intent: 'diet', data: dietRequest };
    }

    // Symptom check
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

    // Yoga/stress request
    const yogaKeywords = ['yoga', 'pranayama', 'breathing', 'meditation', 'stress management', 'relaxation'];
    if (yogaKeywords.some(k => lowerText.includes(k))) {
        const doshaMatch = ['vata', 'pitta', 'kapha'].find(d => lowerText.includes(d));
        return { intent: 'yoga', data: { dosha: doshaMatch } };
    }

    // Herb request
    if (herbKeywords.some(k => lowerText.includes(k))) {
        return { intent: 'herbs', data: { query: text } };
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
