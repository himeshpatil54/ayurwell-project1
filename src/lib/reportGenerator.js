// Report Generator - Creates formatted Ayurvedic analysis reports
import { getDominantDosha, getImbalanceAnalysis } from './doshaCalculator';
import routinesData from '../data/routines.json';
import dietData from '../data/dietRecommendations.json';
import yogaData from '../data/yogaPractices.json';
import herbsData from '../data/herbs.json';

/**
 * Generate a comprehensive Ayurvedic report
 * @param {Object} doshaScores - { vata, pitta, kapha } percentages
 * @param {Array} symptoms - User's reported symptoms
 * @returns {Object} Complete report object
 */
export function generateReport(doshaScores, symptoms = []) {
    const dominant = getDominantDosha(doshaScores);
    const imbalanceAnalysis = getImbalanceAnalysis(doshaScores, symptoms);
    const primaryDosha = dominant.primary?.toLowerCase() || 'vata';

    return {
        prakriti: {
            type: dominant.type,
            scores: doshaScores,
            description: dominant.description
        },
        vikriti: imbalanceAnalysis,
        diet: getDietRecommendations(primaryDosha),
        routine: getRoutineRecommendations(primaryDosha),
        yoga: getYogaRecommendations(primaryDosha),
        herbs: getHerbRecommendations(primaryDosha, symptoms),
        stressManagement: yogaData.stressManagement,
        disclaimer: 'This analysis is for educational purposes only and is not a substitute for professional medical advice. Please consult a qualified Ayurvedic practitioner or healthcare provider for personalized guidance.',
        createdAt: new Date().toISOString()
    };
}

/**
 * Get diet recommendations for a dosha
 */
function getDietRecommendations(dosha) {
    return dietData[dosha] || dietData.vata;
}

/**
 * Get routine recommendations for a dosha
 */
function getRoutineRecommendations(dosha) {
    return routinesData[dosha] || routinesData.vata;
}

/**
 * Get yoga recommendations for a dosha
 */
function getYogaRecommendations(dosha) {
    return yogaData[dosha] || yogaData.vata;
}

/**
 * Get herb recommendations based on dosha and symptoms
 */
function getHerbRecommendations(dosha, symptoms) {
    const doshaCapitalized = dosha.charAt(0).toUpperCase() + dosha.slice(1);

    // Filter herbs that reduce the dominant dosha
    const recommendedHerbs = herbsData.filter(herb => {
        const effect = herb.doshaEffect[dosha];
        return effect && (effect.includes('Reduces') || effect.includes('Balances'));
    }).slice(0, 4);

    return {
        herbs: recommendedHerbs,
        note: `These herbs are traditionally used to support ${doshaCapitalized} balance. Always consult a qualified practitioner before using any herbs.`
    };
}

/**
 * Format report as readable text for chat
 * @param {Object} report - Generated report object
 * @returns {string} Formatted markdown text
 */
export function formatReportForChat(report) {
    let text = '';

    // Prakriti Section
    text += `## 🌿 Your Prakriti Analysis\n\n`;
    text += `**Constitution Type:** ${report.prakriti.type}\n\n`;
    text += `**Dosha Balance:**\n`;
    text += `- Vata: ${report.prakriti.scores.vata}%\n`;
    text += `- Pitta: ${report.prakriti.scores.pitta}%\n`;
    text += `- Kapha: ${report.prakriti.scores.kapha}%\n\n`;
    text += `${report.prakriti.description}\n\n`;

    // Imbalance Section
    if (report.vikriti.imbalances.length > 0) {
        text += `---\n\n## ⚖️ Current Imbalance\n\n`;
        text += `${report.vikriti.overallRecommendation}\n\n`;

        report.vikriti.imbalances.forEach(imbalance => {
            text += `**${imbalance.dosha} Imbalance** (${imbalance.level})\n`;
            text += `Key recommendations:\n`;
            imbalance.recommendations.slice(0, 3).forEach(rec => {
                text += `- ${rec}\n`;
            });
            text += '\n';
        });
    }

    // Diet Section
    text += `---\n\n## 🍽️ Diet Recommendations (Ahara)\n\n`;
    text += `**Favor:** ${report.diet.favor.slice(0, 4).join(', ')}\n\n`;
    text += `**Avoid:** ${report.diet.avoid.slice(0, 4).join(', ')}\n\n`;

    // Routine Section
    text += `---\n\n## 🌅 Daily Routine (Dinacharya)\n\n`;
    text += `**Morning:**\n`;
    report.routine.morning.practices.slice(0, 3).forEach(practice => {
        text += `- ${practice}\n`;
    });
    text += '\n';

    // Yoga Section
    text += `---\n\n## 🧘 Yoga & Pranayama\n\n`;
    text += `**Recommended Practices:**\n`;
    report.yoga.poses.slice(0, 3).forEach(pose => {
        text += `- ${pose.name}: ${pose.benefit}\n`;
    });
    text += '\n';
    text += `**Breathing:**\n`;
    report.yoga.pranayama.slice(0, 2).forEach(pranayama => {
        text += `- ${pranayama.name}: ${pranayama.benefit}\n`;
    });

    // Disclaimer
    text += `\n---\n\n> ⚠️ *${report.disclaimer}*`;

    return text;
}

/**
 * Generate a quick summary for chat
 */
export function generateQuickSummary(doshaScores) {
    const dominant = getDominantDosha(doshaScores);

    return `Based on our conversation, your constitution appears to be **${dominant.type}** (Vata ${doshaScores.vata}%, Pitta ${doshaScores.pitta}%, Kapha ${doshaScores.kapha}%). ${dominant.description.split('.')[0]}.`;
}

export default {
    generateReport,
    formatReportForChat,
    generateQuickSummary
};
