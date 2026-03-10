// Prediction Service — Loads dataset, trains model, provides predictions
// Manages the ML pipeline: CSV parsing → encoding → training → prediction → history

import {
    trainRandomForest,
    predictRandomForest,
    evaluateModel,
    splitDataset,
    encodeFeatures,
    encodeInput
} from './predictionEngine';
import { demoStorage } from './supabase';

// ========== STATE ==========
let model = null;
let encoders = null;
let datasetRows = null;
let symptomList = null;
let diseaseRemedyMap = null;
let evaluationResults = null;
let isTraining = false;
let trainPromise = null;

// ========== CSV PARSER ==========

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        // Simple CSV parse (no quoted commas in our data)
        const values = line.split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx]; });
            rows.push(row);
        }
    }
    return { headers, rows };
}

// ========== INIT & TRAIN ==========

async function loadAndTrain() {
    if (model) return; // Already trained
    if (isTraining) return trainPromise; // Training in progress

    isTraining = true;
    trainPromise = (async () => {
        try {
            console.log('[PredictionService] Loading dataset...');

            // Fetch CSV from the dataset directory
            const response = await fetch('/dataset/ayurvedic_symptom_dataset.csv');
            if (!response.ok) {
                // Try alternate path for dev
                const resp2 = await fetch('./dataset/ayurvedic_symptom_dataset.csv');
                if (!resp2.ok) throw new Error('Failed to load dataset CSV');
                var csvText = await resp2.text();
            } else {
                var csvText = await response.text();
            }

            const { rows } = parseCSV(csvText);
            datasetRows = rows;
            console.log(`[PredictionService] Loaded ${rows.length} rows`);

            // Build symptom list (unique symptoms across all 4 columns)
            const symptomSet = new Set();
            for (const row of rows) {
                symptomSet.add(row.symptom_1);
                symptomSet.add(row.symptom_2);
                symptomSet.add(row.symptom_3);
                symptomSet.add(row.symptom_4);
            }
            symptomList = [...symptomSet].sort();

            // Build remedy lookup: disease → { remedy, herbs, diet }
            diseaseRemedyMap = {};
            for (const row of rows) {
                if (!diseaseRemedyMap[row.disease]) {
                    diseaseRemedyMap[row.disease] = [];
                }
                diseaseRemedyMap[row.disease].push({
                    remedy: row.ayurvedic_remedy,
                    herbs: row.recommended_herbs,
                    diet: row.diet_recommendation
                });
            }

            // Prepare data for ML: [symptom_1, symptom_2, symptom_3, symptom_4, disease]
            const rawData = rows.map(r => [r.symptom_1, r.symptom_2, r.symptom_3, r.symptom_4, r.disease]);

            // Encode features
            const { encoded, encoders: enc } = encodeFeatures(rawData);
            encoders = enc;

            // Split 80/20
            const { train, test } = splitDataset(encoded, 0.8);
            console.log(`[PredictionService] Train: ${train.length}, Test: ${test.length}`);

            // Train Random Forest
            model = trainRandomForest(train, {
                nTrees: 50,
                maxDepth: 12,
                minSize: 2,
                featureRatio: 0.8
            });

            // Evaluate
            evaluationResults = evaluateModel(model, test);
            console.log(`[PredictionService] Model Accuracy: ${(evaluationResults.accuracy * 100).toFixed(1)}%`);
            console.log(`[PredictionService] Precision: ${(evaluationResults.precision * 100).toFixed(1)}%`);
            console.log(`[PredictionService] Recall: ${(evaluationResults.recall * 100).toFixed(1)}%`);
            console.log('[PredictionService] Model ready.');

        } catch (err) {
            console.error('[PredictionService] Training failed:', err);
            throw err;
        } finally {
            isTraining = false;
        }
    })();

    return trainPromise;
}

// ========== PUBLIC API ==========

/**
 * Get the list of all unique symptoms in the dataset.
 * Initializes the model if not already done.
 */
export async function getSymptomList() {
    await loadAndTrain();
    return symptomList || [];
}

/**
 * Predict disease from symptoms.
 * @param {string[]} symptoms - Array of 1-4 symptom strings
 * @returns {{ predicted_disease, confidence_score, remedy, recommended_herbs, diet }}
 */
export async function predictDisease(symptoms) {
    await loadAndTrain();

    if (!model || !encoders) {
        throw new Error('Model not trained');
    }

    // Pad symptoms to 4 (the model expects 4 features)
    const padded = [...symptoms];
    while (padded.length < 4) {
        // Duplicate a random symptom from the input to fill
        padded.push(padded[Math.floor(Math.random() * symptoms.length)]);
    }

    // Encode the input
    const encodedInput = encodeInput(padded.slice(0, 4), encoders);

    // Predict
    const result = predictRandomForest(model, encodedInput);

    // Get remedy info for the predicted disease
    const remedies = diseaseRemedyMap[result.prediction] || [];
    const remedy = remedies.length > 0
        ? remedies[Math.floor(Math.random() * remedies.length)]
        : { remedy: 'Consult an Ayurvedic practitioner', herbs: '', diet: 'Balanced diet' };

    const prediction = {
        predicted_disease: result.prediction,
        confidence_score: Math.round(result.confidence * 100) / 100,
        remedy: remedy.remedy,
        recommended_herbs: remedy.herbs ? remedy.herbs.split(';').map(h => h.trim()) : [],
        diet: remedy.diet,
        symptoms_used: padded.slice(0, 4),
        timestamp: new Date().toISOString()
    };

    // Save to prediction history
    savePrediction(prediction);

    return prediction;
}

/**
 * Get model evaluation metrics.
 */
export async function getModelMetrics() {
    await loadAndTrain();
    return evaluationResults;
}

/**
 * Get all available diseases in the dataset.
 */
export async function getDiseaseList() {
    await loadAndTrain();
    return diseaseRemedyMap ? Object.keys(diseaseRemedyMap).sort() : [];
}

// ========== PREDICTION HISTORY ==========

const PREDICTION_HISTORY_KEY = 'ayurwell_prediction_history';

function savePrediction(prediction) {
    try {
        const history = getPredictionHistory();
        history.unshift({
            id: Date.now(),
            ...prediction
        });
        // Keep last 50 predictions
        const trimmed = history.slice(0, 50);
        localStorage.setItem(PREDICTION_HISTORY_KEY, JSON.stringify(trimmed));
    } catch (e) {
        console.warn('[PredictionService] Failed to save prediction history:', e);
    }
}

export function getPredictionHistory() {
    try {
        const data = localStorage.getItem(PREDICTION_HISTORY_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function clearPredictionHistory() {
    localStorage.removeItem(PREDICTION_HISTORY_KEY);
}
