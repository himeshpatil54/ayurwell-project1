// Client-Side Random Forest Classification Engine
// Pure JavaScript implementation for Ayurvedic disease prediction

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
    // Randomly select feature subset for this split
    const featureIndices = [];
    const allIndices = Array.from({ length: featureCount }, (_, i) => i);
    const shuffled = allIndices.sort(() => Math.random() - 0.5);
    for (let i = 0; i < Math.min(nFeatures, featureCount); i++) {
        featureIndices.push(shuffled[i]);
    }

    let bestIndex = 0;
    let bestValue = 0;
    let bestScore = Infinity;
    let bestGroups = [[], []];

    for (const fi of featureIndices) {
        // Get unique values for this feature
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
    // Return the class with the highest count
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

    // Check for empty splits
    if (left.length === 0 || right.length === 0) {
        node.left = node.right = toTerminal([...left, ...right]);
        return;
    }

    // Check depth
    if (depth >= maxDepth) {
        node.left = toTerminal(left);
        node.right = toTerminal(right);
        return;
    }

    // Left child
    if (left.length <= minSize) {
        node.left = toTerminal(left);
    } else {
        node.left = getSplit(left, nFeatures, classes);
        split(node.left, maxDepth, minSize, nFeatures, classes, depth + 1);
    }

    // Right child
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
        nTrees = 50,
        maxDepth = 12,
        minSize = 2,
        sampleRatio = 1.0,
        featureRatio = 0.7
    } = config;

    const featureCount = dataset[0].length - 1;
    const nFeatures = Math.max(1, Math.round(featureCount * featureRatio));
    const classes = [...new Set(dataset.map(row => row[row.length - 1]))];

    console.log(`[ML] Training Random Forest: ${nTrees} trees, maxDepth=${maxDepth}, nFeatures=${nFeatures}, classes=${classes.length}`);

    const trees = [];
    for (let i = 0; i < nTrees; i++) {
        const sample = bootstrapSample(dataset);
        const tree = buildTree(sample, maxDepth, minSize, nFeatures, classes);
        trees.push(tree);
    }

    console.log(`[ML] Training complete. ${trees.length} trees built.`);
    return { trees, classes, featureCount };
}

export function predictRandomForest(forest, row) {
    const votes = {};
    const classCounts = {};

    for (const tree of forest.trees) {
        const result = predictTree(tree, row);
        const cls = result.value;
        votes[cls] = (votes[cls] || 0) + 1;
    }

    // Find winner
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

// ========== MODEL EVALUATION ==========

export function evaluateModel(forest, testData) {
    const classes = forest.classes;
    let correct = 0;
    const confusionMatrix = {};
    const perClass = {};

    // Initialize
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

    // Calculate precision & recall per class
    const metrics = {};
    let totalPrecision = 0;
    let totalRecall = 0;
    let validClasses = 0;

    for (const cls of classes) {
        const { tp, fp, fn } = perClass[cls];
        const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
        const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
        metrics[cls] = { precision, recall, tp, fp, fn };
        if (tp + fp + fn > 0) {
            totalPrecision += precision;
            totalRecall += recall;
            validClasses++;
        }
    }

    const avgPrecision = validClasses > 0 ? totalPrecision / validClasses : 0;
    const avgRecall = validClasses > 0 ? totalRecall / validClasses : 0;

    return {
        accuracy,
        precision: avgPrecision,
        recall: avgRecall,
        confusionMatrix,
        perClassMetrics: metrics,
        totalSamples: testData.length,
        correctPredictions: correct
    };
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
    // Build label encodings for each feature column
    const featureCount = rawData[0].length - 1; // last column is the label
    const encoders = [];

    for (let i = 0; i < featureCount; i++) {
        const uniqueValues = [...new Set(rawData.map(row => row[i]))];
        const mapping = {};
        uniqueValues.forEach((val, idx) => {
            mapping[val] = idx;
        });
        encoders.push(mapping);
    }

    // Encode dataset
    const encoded = rawData.map(row => {
        const encodedRow = [];
        for (let i = 0; i < featureCount; i++) {
            encodedRow.push(encoders[i][row[i]] ?? -1);
        }
        encodedRow.push(row[featureCount]); // keep label as-is
        return encodedRow;
    });

    return { encoded, encoders };
}

export function encodeInput(symptoms, encoders) {
    return symptoms.map((symptom, i) => {
        if (i < encoders.length && encoders[i][symptom] !== undefined) {
            return encoders[i][symptom];
        }
        return -1; // unknown symptom
    });
}
