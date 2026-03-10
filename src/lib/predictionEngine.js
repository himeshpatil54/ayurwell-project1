// Client-Side Random Forest Classification Engine
// Improved: more trees, hyperparameter tuning, cross-validation, F1-score, dataset cleaning

// ========== DECISION TREE ==========

function giniImpurity(groups, classes) {
    const totalSamples = groups.reduce((sum, g) => sum + g.length, 0);
    if (totalSamples === 0) return 0;

    let gini = 0;
    for (const group of groups) {
        const size = group.length;
        if (size === 0) continue;

        let score = 0;
        for (const cls of classes) {
            const count = group.filter(row => row[row.length - 1] === cls).length;
            const p = count / size;
            score += p * p;
        }
        gini += (1 - score) * (size / totalSamples);
    }
    return gini;
}

function testSplit(featureIndex, value, dataset) {
    const left = [];
    const right = [];
    for (const row of dataset) {
        if (row[featureIndex] === value) {
            left.push(row);
        } else {
            right.push(row);
        }
    }
    return [left, right];
}

function getSplit(dataset, nFeatures, classes) {
    const featureCount = dataset[0].length - 1;
    const allIndices = Array.from({ length: featureCount }, (_, i) => i);
    const shuffled = allIndices.sort(() => Math.random() - 0.5);
    const featureIndices = shuffled.slice(0, Math.min(nFeatures, featureCount));

    let bestIndex = 0;
    let bestValue = 0;
    let bestScore = Infinity;
    let bestGroups = [[], []];

    for (const fi of featureIndices) {
        const uniqueValues = [...new Set(dataset.map(row => row[fi]))];
        for (const val of uniqueValues) {
            const groups = testSplit(fi, val, dataset);
            const gini = giniImpurity(groups, classes);
            if (gini < bestScore) {
                bestIndex = fi;
                bestValue = val;
                bestScore = gini;
                bestGroups = groups;
            }
        }
    }

    return { index: bestIndex, value: bestValue, groups: bestGroups, score: bestScore };
}

function toTerminal(group) {
    const outcomes = group.map(row => row[row.length - 1]);
    const counts = {};
    for (const o of outcomes) {
        counts[o] = (counts[o] || 0) + 1;
    }
    let maxCount = 0;
    let maxClass = outcomes[0];
    for (const [cls, count] of Object.entries(counts)) {
        if (count > maxCount) {
            maxCount = count;
            maxClass = cls;
        }
    }
    return { terminal: true, value: maxClass, counts, total: group.length };
}

function split(node, maxDepth, minSize, nFeatures, classes, depth) {
    const [left, right] = node.groups;
    delete node.groups;

    if (left.length === 0 || right.length === 0) {
        node.left = node.right = toTerminal([...left, ...right]);
        return;
    }

    if (depth >= maxDepth) {
        node.left = toTerminal(left);
        node.right = toTerminal(right);
        return;
    }

    if (left.length <= minSize) {
        node.left = toTerminal(left);
    } else {
        node.left = getSplit(left, nFeatures, classes);
        split(node.left, maxDepth, minSize, nFeatures, classes, depth + 1);
    }

    if (right.length <= minSize) {
        node.right = toTerminal(right);
    } else {
        node.right = getSplit(right, nFeatures, classes);
        split(node.right, maxDepth, minSize, nFeatures, classes, depth + 1);
    }
}

function buildTree(dataset, maxDepth, minSize, nFeatures, classes) {
    const root = getSplit(dataset, nFeatures, classes);
    split(root, maxDepth, minSize, nFeatures, classes, 1);
    return root;
}

function predictTree(node, row) {
    if (node.terminal) return node;

    if (row[node.index] === node.value) {
        if (node.left.terminal) return node.left;
        return predictTree(node.left, row);
    } else {
        if (node.right.terminal) return node.right;
        return predictTree(node.right, row);
    }
}

// ========== RANDOM FOREST ==========

function bootstrapSample(dataset) {
    const sample = [];
    for (let i = 0; i < dataset.length; i++) {
        const idx = Math.floor(Math.random() * dataset.length);
        sample.push(dataset[idx]);
    }
    return sample;
}

export function trainRandomForest(dataset, config = {}) {
    const {
        nTrees = 120,
        maxDepth = 15,
        minSize = 1,
        minSamplesSplit = 3,
        featureRatio = 1.0
    } = config;

    const featureCount = dataset[0].length - 1;
    const nFeatures = Math.max(1, Math.round(featureCount * featureRatio));
    const classes = [...new Set(dataset.map(row => row[row.length - 1]))];

    console.log(`[ML] Training Random Forest: ${nTrees} trees, maxDepth=${maxDepth}, minSize=${minSize}, minSamplesSplit=${minSamplesSplit}, nFeatures=${nFeatures}, classes=${classes.length}`);

    const trees = [];
    for (let i = 0; i < nTrees; i++) {
        const sample = bootstrapSample(dataset);
        const tree = buildTree(sample, maxDepth, Math.max(minSize, minSamplesSplit), nFeatures, classes);
        trees.push(tree);
    }

    console.log(`[ML] Training complete. ${trees.length} trees built.`);
    return { trees, classes, featureCount };
}

export function predictRandomForest(forest, row) {
    const votes = {};

    for (const tree of forest.trees) {
        const result = predictTree(tree, row);
        const cls = result.value;
        votes[cls] = (votes[cls] || 0) + 1;
    }

    let maxVotes = 0;
    let prediction = null;
    const totalVotes = forest.trees.length;

    for (const [cls, count] of Object.entries(votes)) {
        if (count > maxVotes) {
            maxVotes = count;
            prediction = cls;
        }
    }

    const confidence = maxVotes / totalVotes;

    return {
        prediction,
        confidence,
        votes,
        totalTrees: totalVotes
    };
}

// ========== MODEL EVALUATION (with F1-score) ==========

export function evaluateModel(forest, testData) {
    const classes = forest.classes;
    let correct = 0;
    const confusionMatrix = {};
    const perClass = {};

    for (const cls of classes) {
        confusionMatrix[cls] = {};
        perClass[cls] = { tp: 0, fp: 0, fn: 0 };
        for (const c2 of classes) {
            confusionMatrix[cls][c2] = 0;
        }
    }

    for (const row of testData) {
        const actual = row[row.length - 1];
        const result = predictRandomForest(forest, row);
        const predicted = result.prediction;

        if (confusionMatrix[actual]) {
            confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;
        }

        if (predicted === actual) {
            correct++;
            if (perClass[actual]) perClass[actual].tp++;
        } else {
            if (perClass[actual]) perClass[actual].fn++;
            if (perClass[predicted]) perClass[predicted].fp++;
        }
    }

    const accuracy = correct / testData.length;

    const metrics = {};
    let totalPrecision = 0;
    let totalRecall = 0;
    let totalF1 = 0;
    let validClasses = 0;

    for (const cls of classes) {
        const { tp, fp, fn } = perClass[cls];
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
        metrics[cls] = { precision, recall, f1, tp, fp, fn };
        if (tp + fp + fn > 0) {
            totalPrecision += precision;
            totalRecall += recall;
            totalF1 += f1;
            validClasses++;
        }
    }

    const avgPrecision = validClasses > 0 ? totalPrecision / validClasses : 0;
    const avgRecall = validClasses > 0 ? totalRecall / validClasses : 0;
    const avgF1 = validClasses > 0 ? totalF1 / validClasses : 0;

    return {
        accuracy,
        precision: avgPrecision,
        recall: avgRecall,
        f1Score: avgF1,
        confusionMatrix,
        perClassMetrics: metrics,
        totalSamples: testData.length,
        correctPredictions: correct
    };
}

// ========== K-FOLD CROSS-VALIDATION ==========

export function crossValidate(dataset, k = 5, config = {}) {
    const shuffled = [...dataset].sort(() => Math.random() - 0.5);
    const foldSize = Math.floor(shuffled.length / k);
    const results = [];

    console.log(`[ML] Starting ${k}-fold cross-validation...`);

    for (let i = 0; i < k; i++) {
        const testStart = i * foldSize;
        const testEnd = i === k - 1 ? shuffled.length : (i + 1) * foldSize;
        const testFold = shuffled.slice(testStart, testEnd);
        const trainFold = [...shuffled.slice(0, testStart), ...shuffled.slice(testEnd)];

        const forest = trainRandomForest(trainFold, config);
        const evaluation = evaluateModel(forest, testFold);
        results.push(evaluation);

        console.log(`[ML] Fold ${i + 1}/${k}: accuracy=${(evaluation.accuracy * 100).toFixed(1)}%, f1=${(evaluation.f1Score * 100).toFixed(1)}%`);
    }

    // Average results across folds
    const avgAccuracy = results.reduce((s, r) => s + r.accuracy, 0) / k;
    const avgPrecision = results.reduce((s, r) => s + r.precision, 0) / k;
    const avgRecall = results.reduce((s, r) => s + r.recall, 0) / k;
    const avgF1 = results.reduce((s, r) => s + r.f1Score, 0) / k;

    console.log(`[ML] Cross-validation complete: avg_accuracy=${(avgAccuracy * 100).toFixed(1)}%, avg_f1=${(avgF1 * 100).toFixed(1)}%, avg_precision=${(avgPrecision * 100).toFixed(1)}%, avg_recall=${(avgRecall * 100).toFixed(1)}%`);

    return {
        foldResults: results,
        avgAccuracy,
        avgPrecision,
        avgRecall,
        avgF1
    };
}

// ========== DATASET CLEANING ==========

export function cleanDataset(rawData) {
    // 1. Remove exact duplicate rows
    const seen = new Set();
    const deduped = [];
    for (const row of rawData) {
        const key = row.join('|');
        if (!seen.has(key)) {
            seen.add(key);
            deduped.push(row);
        }
    }
    const removed = rawData.length - deduped.length;
    if (removed > 0) {
        console.log(`[ML] Removed ${removed} duplicate rows`);
    }

    // 2. Remove rows with empty or undefined values
    const cleaned = deduped.filter(row => {
        return row.every(val => val !== undefined && val !== null && val !== '' && val !== 'undefined');
    });
    const invalidRemoved = deduped.length - cleaned.length;
    if (invalidRemoved > 0) {
        console.log(`[ML] Removed ${invalidRemoved} rows with missing values`);
    }

    // 3. Normalize: lowercase + trim all symptom columns (not the label)
    const normalized = cleaned.map(row => {
        const newRow = [...row];
        for (let i = 0; i < newRow.length - 1; i++) {
            newRow[i] = String(newRow[i]).toLowerCase().trim();
        }
        // Preserve disease label casing
        newRow[newRow.length - 1] = String(newRow[newRow.length - 1]).trim();
        return newRow;
    });

    console.log(`[ML] Dataset cleaned: ${rawData.length} → ${normalized.length} rows`);
    return normalized;
}

// ========== DATA UTILITIES ==========

export function splitDataset(dataset, trainRatio = 0.8) {
    const shuffled = [...dataset].sort(() => Math.random() - 0.5);
    const splitIndex = Math.floor(shuffled.length * trainRatio);
    return {
        train: shuffled.slice(0, splitIndex),
        test: shuffled.slice(splitIndex)
    };
}

export function encodeFeatures(rawData) {
    const featureCount = rawData[0].length - 1;
    const encoders = [];

    for (let i = 0; i < featureCount; i++) {
        const uniqueValues = [...new Set(rawData.map(row => row[i]))].sort();
        const mapping = {};
        uniqueValues.forEach((val, idx) => {
            mapping[val] = idx;
        });
        encoders.push(mapping);
    }

    const encoded = rawData.map(row => {
        const encodedRow = [];
        for (let i = 0; i < featureCount; i++) {
            encodedRow.push(encoders[i][row[i]] ?? -1);
        }
        encodedRow.push(row[featureCount]);
        return encodedRow;
    });

    return { encoded, encoders };
}

export function encodeInput(symptoms, encoders) {
    return symptoms.map((symptom, i) => {
        if (i < encoders.length && encoders[i][symptom] !== undefined) {
            return encoders[i][symptom];
        }
        return -1;
    });
}
