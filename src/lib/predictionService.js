// Prediction Service — Loads dataset, trains model, provides predictions
// ML pipeline: CSV parsing → cleaning → encoding → cross-validation → training → prediction → history

import {
    trainRandomForest,
    predictRandomForest,
    evaluateModel,
    crossValidate,
    cleanDataset,
    splitDataset,
    encodeFeatures,
    encodeInput
} from './predictionEngine';

// ========== STATE ==========
let model = null;
let encoders = null;
let datasetRows = null;
let symptomList = null;
let diseaseRemedyMap = null;
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
        const values = line.split(',').map(v => v.trim());
        if (values.length === headers.length) {
            const row = {};
            headers.forEach((h, idx) => { row[h] = values[idx]; });
            rows.push(row);
        }
    }
    return { headers, rows };
}

// ========== MODEL CONFIG (optimized hyperparameters) ==========
const MODEL_CONFIG = {
    nTrees: 120,
    maxDepth: 15,
    minSize: 1,
    minSamplesSplit: 3,
    featureRatio: 1.0
};

const CV_FOLDS = 5;

// ========== INIT & TRAIN ==========

async function loadAndTrain() {
    if (model) return;
    if (isTraining) return trainPromise;

    isTraining = true;
    trainPromise = (async () => {
        try {
            console.log('[PredictionService] Loading dataset...');

            let csvText;
            const response = await fetch('/dataset/ayurvedic_symptom_dataset.csv');
            if (!response.ok) {
                const resp2 = await fetch('./dataset/ayurvedic_symptom_dataset.csv');
                if (!resp2.ok) throw new Error('Failed to load dataset CSV');
                csvText = await resp2.text();
            } else {
                csvText = await response.text();
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

            // Build remedy lookup: disease → [{ remedy, herbs, diet }]
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

            // Clean dataset (remove duplicates, empty values, normalize)
            const cleanedData = cleanDataset(rawData);

            // Encode features
            const { encoded, encoders: enc } = encodeFeatures(cleanedData);
            encoders = enc;

            // Run k-fold cross-validation (logs metrics to console only — not shown to users)
            crossValidate(encoded, CV_FOLDS, MODEL_CONFIG);

            // Train final model on full dataset with optimized hyperparameters
            model = trainRandomForest(encoded, MODEL_CONFIG);

            // Final evaluation on held-out test split (console only)
            const { train, test } = splitDataset(encoded, 0.8);
            const evalResults = evaluateModel(trainRandomForest(train, MODEL_CONFIG), test);
            console.log(`[PredictionService] Final Holdout — Accuracy: ${(evalResults.accuracy * 100).toFixed(1)}%, Precision: ${(evalResults.precision * 100).toFixed(1)}%, Recall: ${(evalResults.recall * 100).toFixed(1)}%, F1: ${(evalResults.f1Score * 100).toFixed(1)}%`);
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
 * @returns {{ predicted_disease, remedy, recommended_herbs, diet }}
 */
export async function predictDisease(symptoms) {
    await loadAndTrain();

    if (!model || !encoders) {
        throw new Error('Model not trained');
    }

    // Pad symptoms to 4 (the model expects 4 features)
    const padded = [...symptoms];
    while (padded.length < 4) {
        padded.push(padded[Math.floor(Math.random() * symptoms.length)]);
    }

    // Encode the input (lowercase to match cleaned dataset)
    const normalizedInput = padded.slice(0, 4).map(s => s.toLowerCase().trim());
    const encodedInput = encodeInput(normalizedInput, encoders);

    // Predict
    const result = predictRandomForest(model, encodedInput);

    // Get remedy info for the predicted disease
    const remedies = diseaseRemedyMap[result.prediction] || [];
    const remedy = remedies.length > 0
        ? remedies[Math.floor(Math.random() * remedies.length)]
        : { remedy: 'Consult an Ayurvedic practitioner', herbs: '', diet: 'Balanced diet' };

    const prediction = {
        predicted_disease: result.prediction,
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
