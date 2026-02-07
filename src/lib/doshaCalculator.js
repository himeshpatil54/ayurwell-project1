// Dosha Calculator - Core Ayurvedic Analysis Engine
import symptomsData from '../data/symptoms.json';

/**
 * Calculate dosha scores from symptoms
 * @param {Array} userSymptoms - Array of symptom names or objects with severity
 * @returns {Object} Normalized dosha percentages
 */
export function calculateDoshaFromSymptoms(userSymptoms) {
    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;
    let totalWeight = 0;

    userSymptoms.forEach(symptom => {
        const symptomName = typeof symptom === 'string' ? symptom.toLowerCase() : symptom.name.toLowerCase();
        const severity = typeof symptom === 'object' ? symptom.severity || 1 : 1;

        const matchedSymptom = symptomsData.find(s =>
            s.name.toLowerCase().includes(symptomName) ||
            symptomName.includes(s.name.toLowerCase())
        );

        if (matchedSymptom) {
            vataScore += matchedSymptom.vata * severity;
            pittaScore += matchedSymptom.pitta * severity;
            kaphaScore += matchedSymptom.kapha * severity;
            totalWeight += severity;
        }
    });

    // Normalize to percentages
    if (totalWeight === 0) {
        return { vata: 33.33, pitta: 33.33, kapha: 33.33 };
    }

    const total = vataScore + pittaScore + kaphaScore;
    return {
        vata: Math.round((vataScore / total) * 100 * 10) / 10,
        pitta: Math.round((pittaScore / total) * 100 * 10) / 10,
        kapha: Math.round((kaphaScore / total) * 100 * 10) / 10
    };
}

/**
 * Calculate dosha scores from questionnaire answers
 * @param {Array} answers - Array of { questionId, optionIndex }
 * @param {Array} questions - The questionnaire questions array
 * @returns {Object} Normalized dosha percentages
 */
export function calculateDoshaFromQuestionnaire(answers, questions) {
    let vataScore = 0;
    let pittaScore = 0;
    let kaphaScore = 0;

    answers.forEach(answer => {
        const question = questions.find(q => q.id === answer.questionId);
        if (question && question.options[answer.optionIndex]) {
            const option = question.options[answer.optionIndex];
            vataScore += option.vata || 0;
            pittaScore += option.pitta || 0;
            kaphaScore += option.kapha || 0;
        }
    });

    const total = vataScore + pittaScore + kaphaScore;
    if (total === 0) {
        return { vata: 33.33, pitta: 33.33, kapha: 33.33 };
    }

    return {
        vata: Math.round((vataScore / total) * 100 * 10) / 10,
        pitta: Math.round((pittaScore / total) * 100 * 10) / 10,
        kapha: Math.round((kaphaScore / total) * 100 * 10) / 10
    };
}

/**
 * Combine symptom and questionnaire scores
 * @param {Object} symptomScores - Scores from symptoms analysis
 * @param {Object} questionnaireScores - Scores from questionnaire
 * @param {number} symptomWeight - Weight for symptom scores (0-1)
 * @returns {Object} Combined normalized scores
 */
export function combineDoshaScores(symptomScores, questionnaireScores, symptomWeight = 0.4) {
    const questionnaireWeight = 1 - symptomWeight;

    return {
        vata: Math.round((symptomScores.vata * symptomWeight + questionnaireScores.vata * questionnaireWeight) * 10) / 10,
        pitta: Math.round((symptomScores.pitta * symptomWeight + questionnaireScores.pitta * questionnaireWeight) * 10) / 10,
        kapha: Math.round((symptomScores.kapha * symptomWeight + questionnaireScores.kapha * questionnaireWeight) * 10) / 10
    };
}

/**
 * Determine the dominant dosha type
 * @param {Object} scores - { vata, pitta, kapha } percentages
 * @returns {Object} { type: string, description: string }
 */
export function getDominantDosha(scores) {
    const { vata, pitta, kapha } = scores;
    const doshas = [
        { name: 'Vata', score: vata },
        { name: 'Pitta', score: pitta },
        { name: 'Kapha', score: kapha }
    ].sort((a, b) => b.score - a.score);

    const first = doshas[0];
    const second = doshas[1];
    const third = doshas[2];

    // Check for tridoshic (all within 10% of each other)
    if (Math.abs(first.score - third.score) <= 10) {
        return {
            type: 'Tridoshic',
            primary: null,
            secondary: null,
            description: 'Your constitution shows a balanced presence of all three doshas. This is relatively rare and indicates a naturally balanced nature.'
        };
    }

    // Check for dual dosha (top two within 15%)
    if (Math.abs(first.score - second.score) <= 15) {
        return {
            type: `${first.name}-${second.name}`,
            primary: first.name,
            secondary: second.name,
            description: `You have a dual constitution with ${first.name} and ${second.name} as your predominant doshas. This combination requires balancing practices for both.`
        };
    }

    // Single dominant dosha
    return {
        type: first.name,
        primary: first.name,
        secondary: null,
        description: getDoshaDescription(first.name)
    };
}

/**
 * Get description for a single dosha
 */
function getDoshaDescription(dosha) {
    const descriptions = {
        Vata: 'Vata governs movement and is characterized by qualities of air and space. You likely have a quick mind, creative nature, and variable energy. Balance through warmth, routine, and grounding practices.',
        Pitta: 'Pitta governs transformation and is characterized by fire and water. You likely have a sharp intellect, strong digestion, and leadership qualities. Balance through cooling practices, moderation, and patience.',
        Kapha: 'Kapha governs structure and stability, characterized by earth and water. You likely have endurance, loyalty, and a calm nature. Balance through stimulation, lightness, and regular exercise.'
    };
    return descriptions[dosha] || '';
}

/**
 * Get imbalance analysis based on symptoms
 * @param {Object} scores - Dosha percentages
 * @param {Array} symptoms - User's reported symptoms
 * @returns {Object} Imbalance analysis
 */
export function getImbalanceAnalysis(scores, symptoms) {
    const dominant = getDominantDosha(scores);
    const imbalances = [];

    if (scores.vata > 40) {
        imbalances.push({
            dosha: 'Vata',
            level: scores.vata > 60 ? 'significant' : 'moderate',
            signs: symptoms.filter(s => {
                const match = symptomsData.find(sd => sd.name.toLowerCase().includes(s.toLowerCase()));
                return match && match.vata > 0.5;
            }),
            recommendations: [
                'Follow a regular daily routine',
                'Favor warm, cooked, nourishing foods',
                'Practice calming activities like gentle yoga',
                'Get adequate rest and sleep',
                'Avoid cold, dry environments'
            ]
        });
    }

    if (scores.pitta > 40) {
        imbalances.push({
            dosha: 'Pitta',
            level: scores.pitta > 60 ? 'significant' : 'moderate',
            signs: symptoms.filter(s => {
                const match = symptomsData.find(sd => sd.name.toLowerCase().includes(s.toLowerCase()));
                return match && match.pitta > 0.5;
            }),
            recommendations: [
                'Stay cool and avoid overheating',
                'Favor cooling, sweet, and bitter foods',
                'Practice moderation in all activities',
                'Avoid excessive competition and criticism',
                'Spend time in nature, especially near water'
            ]
        });
    }

    if (scores.kapha > 40) {
        imbalances.push({
            dosha: 'Kapha',
            level: scores.kapha > 60 ? 'significant' : 'moderate',
            signs: symptoms.filter(s => {
                const match = symptomsData.find(sd => sd.name.toLowerCase().includes(s.toLowerCase()));
                return match && match.kapha > 0.5;
            }),
            recommendations: [
                'Engage in regular, vigorous exercise',
                'Favor light, warm, and spicy foods',
                'Wake early and stay active',
                'Seek variety and new experiences',
                'Avoid excessive sleep and sedentary habits'
            ]
        });
    }

    return {
        dominant,
        imbalances,
        overallRecommendation: imbalances.length > 0
            ? `Based on your symptoms, there appears to be ${imbalances.map(i => i.dosha).join(' and ')} imbalance that could benefit from balancing practices.`
            : 'Your dosha expression appears relatively balanced. Maintain this through mindful lifestyle choices.'
    };
}

export default {
    calculateDoshaFromSymptoms,
    calculateDoshaFromQuestionnaire,
    combineDoshaScores,
    getDominantDosha,
    getImbalanceAnalysis
};
