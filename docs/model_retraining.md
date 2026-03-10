# Model Retraining Guide

## Overview

The AyurWell prediction system uses a **Random Forest Classifier** implemented in pure JavaScript. The model trains automatically in the browser on the first prediction request using the dataset CSV.

## Dataset Location

```
dataset/ayurvedic_symptom_dataset.csv
public/dataset/ayurvedic_symptom_dataset.csv  (runtime copy)
```

Both files must be identical. The `public/` copy is what the browser loads at runtime.

## Dataset Format

| Column | Description |
|--------|-------------|
| `symptom_1` | Primary symptom (snake_case) |
| `symptom_2` | Secondary symptom |
| `symptom_3` | Tertiary symptom |
| `symptom_4` | Quaternary symptom |
| `disease` | Target disease label |
| `ayurvedic_remedy` | Recommended Ayurvedic treatment |
| `recommended_herbs` | Semicolon-separated herb list |
| `diet_recommendation` | Dietary guidance |

## How to Add New Data

1. Open `dataset/ayurvedic_symptom_dataset.csv`
2. Add new rows following the existing format
3. Use `snake_case` for all symptom values (e.g., `high_temperature`, `joint_pain`)
4. Copy the updated file to `public/dataset/ayurvedic_symptom_dataset.csv`
5. The model will retrain automatically on the next page load

### Adding a New Disease

Add at least **20–30 rows** for the new disease with varied symptom combinations to ensure the model learns the pattern reliably.

### Adding New Symptoms

Simply use the new symptom value in the CSV. The encoder will pick it up automatically during training.

## Model Configuration

The model parameters are in `src/lib/predictionService.js`:

```javascript
model = trainRandomForest(train, {
  nTrees: 50,       // Number of decision trees
  maxDepth: 12,     // Max tree depth
  minSize: 2,       // Min samples per leaf
  featureRatio: 0.8  // Feature subset ratio per tree
});
```

### Tuning Tips

- **Increase `nTrees`** (e.g., 100) for higher accuracy at the cost of slower training
- **Decrease `maxDepth`** to reduce overfitting on small datasets
- **Increase `featureRatio`** when you have few features (we only have 4)

## Model Evaluation

On first load, the model logs evaluation metrics to the browser console:

- **Accuracy**: Overall correct predictions / total predictions
- **Precision**: Average precision across all disease classes
- **Recall**: Average recall across all disease classes

Target: **>80% accuracy** with the current dataset.

## Architecture

```
CSV Dataset → Parse → Label Encode → 80/20 Split → Train Random Forest → Cached Model
                                                                              ↓
User Input → Pad to 4 symptoms → Encode → Predict → Lookup Remedy → Return Result
```

The model stays in memory for the session. Refreshing the page retrains (takes ~1-3 seconds with the current dataset size).
