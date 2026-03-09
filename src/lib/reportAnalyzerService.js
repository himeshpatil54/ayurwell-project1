// Report Analyzer Service — Upload, Extract, Analyze, Suggest, Store
import { supabase } from './supabase';

// =============================================
// 1. uploadReport() — Store file in Supabase Storage
// =============================================
export async function uploadReport(file) {
    try {
        const fileName = `reports/${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('medical-reports')
            .upload(fileName, file);

        if (error) {
            console.warn('[Analyzer] Upload error:', error.message);
            return { success: false, error: error.message };
        }

        console.log('[Analyzer] File uploaded:', data?.path || fileName);
        return { success: true, path: data?.path || fileName };
    } catch (err) {
        console.warn('[Analyzer] Upload failed:', err.message);
        return { success: false, error: err.message };
    }
}

// =============================================
// 2. extractText() — Extract text from PDF or Image
// =============================================
export async function extractText(file) {
    const type = file.type;
    const name = file.name.toLowerCase();

    // Plain text / CSV files
    if (type.startsWith('text/') || name.endsWith('.txt') || name.endsWith('.csv')) {
        return await file.text();
    }

    // PDF files — use pdfjs-dist
    if (type === 'application/pdf' || name.endsWith('.pdf')) {
        return await extractPdfText(file);
    }

    // Image files — use Tesseract.js OCR
    if (type.startsWith('image/') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg')) {
        return await extractImageText(file);
    }

    return `[Unsupported format: ${file.name}] — Please upload PDF, PNG, JPG, or text files.`;
}

/**
 * Extract text from PDF using pdfjs-dist
 */
async function extractPdfText(file) {
    try {
        const pdfjsLib = await import('pdfjs-dist');
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return fullText.trim() || '[PDF contained no extractable text — it may be a scanned image.]';
    } catch (err) {
        console.warn('[Analyzer] PDF extraction failed:', err.message);
        return `[PDF extraction failed: ${err.message}]`;
    }
}

/**
 * Extract text from Image using Tesseract.js OCR
 */
async function extractImageText(file) {
    try {
        const Tesseract = await import('tesseract.js');
        const imageUrl = URL.createObjectURL(file);

        console.log('[Analyzer] Running OCR on image:', file.name);
        const result = await Tesseract.recognize(imageUrl, 'eng', {
            logger: (m) => {
                if (m.status === 'recognizing text') {
                    console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                }
            }
        });

        URL.revokeObjectURL(imageUrl);

        const text = result.data.text?.trim();
        if (!text) {
            return '[No text detected in the image. The image may be unclear or not contain readable text.]';
        }

        console.log('[Analyzer] OCR extracted', text.length, 'characters');
        return text;
    } catch (err) {
        console.warn('[Analyzer] OCR failed:', err.message);
        return `[OCR extraction failed: ${err.message}]`;
    }
}

// =============================================
// 3. analyzeMedicalIndicators() — Detect health markers
// =============================================

const INDICATOR_PATTERNS = [
    {
        name: 'Hemoglobin',
        patterns: [/hemoglobin[\s:]+(\d+\.?\d*)/i, /hb[\s:]+(\d+\.?\d*)/i, /hgb[\s:]+(\d+\.?\d*)/i],
        unit: 'g/dL',
        normalRange: { min: 12, max: 17.5 },
        lowCondition: 'Possible anemia risk',
        highCondition: 'Polycythemia risk — Elevated hemoglobin'
    },
    {
        name: 'Blood Sugar (Fasting)',
        patterns: [/(?:fasting\s+)?(?:blood\s+)?(?:glucose|sugar)[\s:]+(\d+\.?\d*)/i, /fbs[\s:]+(\d+\.?\d*)/i, /fasting[\s:]+(\d+\.?\d*)/i],
        unit: 'mg/dL',
        normalRange: { min: 70, max: 100 },
        lowCondition: 'Possible blood sugar imbalance (low)',
        highCondition: 'Possible blood sugar imbalance (high)'
    },
    {
        name: 'Cholesterol (Total)',
        patterns: [/(?:total\s+)?cholesterol[\s:]+(\d+\.?\d*)/i, /tc[\s:]+(\d+\.?\d*)/i],
        unit: 'mg/dL',
        normalRange: { min: 125, max: 200 },
        lowCondition: 'Low cholesterol — May indicate nutritional deficiency',
        highCondition: 'Possible cholesterol imbalance'
    },
    {
        name: 'Triglycerides',
        patterns: [/triglycerides?[\s:]+(\d+\.?\d*)/i, /tg[\s:]+(\d+\.?\d*)/i],
        unit: 'mg/dL',
        normalRange: { min: 50, max: 150 },
        lowCondition: 'Low triglycerides',
        highCondition: 'High triglycerides — Cardiovascular risk'
    },
    {
        name: 'Blood Pressure (Systolic)',
        patterns: [/(?:blood\s+)?pressure[\s:]+(\d+)\/\d+/i, /bp[\s:]+(\d+)\/\d+/i, /systolic[\s:]+(\d+)/i],
        unit: 'mmHg',
        normalRange: { min: 90, max: 120 },
        lowCondition: 'Hypotension — Low blood pressure',
        highCondition: 'Hypertension — High blood pressure'
    },
    {
        name: 'Vitamin D',
        patterns: [/vitamin\s*d[\s:]+(\d+\.?\d*)/i, /vit\s*d[\s:]+(\d+\.?\d*)/i, /25.*hydroxy[\s:]+(\d+\.?\d*)/i],
        unit: 'ng/mL',
        normalRange: { min: 30, max: 100 },
        lowCondition: 'Vitamin D deficiency — Bone and immunity risk',
        highCondition: 'Vitamin D excess — Toxicity risk'
    },
    {
        name: 'Vitamin B12',
        patterns: [/(?:vitamin\s*)?b[\s-]*12[\s:]+(\d+\.?\d*)/i, /cobalamin[\s:]+(\d+\.?\d*)/i],
        unit: 'pg/mL',
        normalRange: { min: 200, max: 900 },
        lowCondition: 'Vitamin B12 deficiency — Neurological and energy concerns',
        highCondition: 'Elevated B12 — May indicate liver or kidney issues'
    },
    {
        name: 'TSH (Thyroid)',
        patterns: [/tsh[\s:]+(\d+\.?\d*)/i, /thyroid[\s:]+(\d+\.?\d*)/i],
        unit: 'mIU/L',
        normalRange: { min: 0.4, max: 4.0 },
        lowCondition: 'Hyperthyroidism risk — Overactive thyroid',
        highCondition: 'Hypothyroidism risk — Underactive thyroid'
    },
    {
        name: 'CRP (Inflammation)',
        patterns: [/c[\s-]*reactive[\s-]*protein[\s:]+(\d+\.?\d*)/i, /crp[\s:]+(\d+\.?\d*)/i, /hs[\s-]*crp[\s:]+(\d+\.?\d*)/i],
        unit: 'mg/L',
        normalRange: { min: 0, max: 3 },
        lowCondition: null,
        highCondition: 'Elevated inflammation markers'
    },
    {
        name: 'ESR (Inflammation)',
        patterns: [/esr[\s:]+(\d+\.?\d*)/i, /erythrocyte\s+sedimentation[\s:]+(\d+\.?\d*)/i],
        unit: 'mm/hr',
        normalRange: { min: 0, max: 20 },
        lowCondition: null,
        highCondition: 'Elevated ESR — Inflammation or infection risk'
    }
];

export function analyzeMedicalIndicators(extractedText) {
    if (!extractedText || extractedText.startsWith('[')) {
        return { indicators: [], detectedConditions: [] };
    }

    const indicators = [];
    const detectedConditions = [];

    for (const indicator of INDICATOR_PATTERNS) {
        for (const pattern of indicator.patterns) {
            const match = extractedText.match(pattern);
            if (match) {
                const value = parseFloat(match[1]);
                const status = value < indicator.normalRange.min ? 'low'
                    : value > indicator.normalRange.max ? 'high'
                        : 'normal';

                indicators.push({
                    name: indicator.name,
                    value,
                    unit: indicator.unit,
                    status,
                    normalRange: `${indicator.normalRange.min}–${indicator.normalRange.max} ${indicator.unit}`
                });

                if (status === 'low' && indicator.lowCondition) {
                    detectedConditions.push(indicator.lowCondition);
                } else if (status === 'high' && indicator.highCondition) {
                    detectedConditions.push(indicator.highCondition);
                }

                break;
            }
        }
    }

    return { indicators, detectedConditions };
}

// =============================================
// 4. generateAyurvedicSuggestions() — Map conditions to remedies
// =============================================

const SUGGESTION_MAP = {
    'Possible anemia risk': {
        herbs: ['Ashwagandha', 'Punarnava', 'Guduchi', 'Amla'],
        diet: 'Increase iron-rich foods: spinach, pomegranate, dates, jaggery, beetroot. Consume with Vitamin C for better absorption.',
        lifestyle: 'Practice Pranayama (Anulom Vilom) for improved oxygen circulation. Avoid excessive tea/coffee with meals.'
    },
    'Polycythemia risk — Elevated hemoglobin': {
        herbs: ['Guduchi', 'Sariva', 'Manjistha'],
        diet: 'Stay well hydrated. Avoid iron supplements. Include cooling foods like cucumber and coriander.',
        lifestyle: 'Gentle exercise. Avoid dehydration. Practice cooling pranayama (Sheetali).'
    },
    'Possible blood sugar imbalance (high)': {
        herbs: ['Gudmar (Gymnema)', 'Karela (Bitter Gourd)', 'Turmeric', 'Methi (Fenugreek)'],
        diet: 'Reduce refined sugars and carbs. Favor bitter vegetables, whole grains, and fiber-rich foods. Eat small, frequent meals.',
        lifestyle: 'Regular walking after meals. Practice stress management through yoga and meditation.'
    },
    'Possible blood sugar imbalance (low)': {
        herbs: ['Ashwagandha', 'Shatavari', 'Licorice (Mulethi)'],
        diet: 'Eat regular meals. Include natural sugars from fruits, dates, and honey. Avoid fasting.',
        lifestyle: 'Avoid skipping meals. Manage stress levels. Get adequate sleep.'
    },
    'Possible cholesterol imbalance': {
        herbs: ['Arjuna', 'Guggulu', 'Garlic (Lahsun)', 'Triphala'],
        diet: 'Reduce saturated fats and fried foods. Increase fiber, omega-3 (flaxseed, walnuts). Use mustard or sesame oil.',
        lifestyle: 'Regular cardiovascular exercise (brisk walking 30 min/day). Practice Surya Namaskar.'
    },
    'High triglycerides — Cardiovascular risk': {
        herbs: ['Guggulu', 'Arjuna', 'Triphala', 'Garlic (Lahsun)'],
        diet: 'Limit sugar and refined carbohydrates. Increase omega-3 fatty acids. Avoid alcohol.',
        lifestyle: 'Daily 30-minute brisk walk. Weight management. Avoid sedentary lifestyle.'
    },
    'Hypertension — High blood pressure': {
        herbs: ['Arjuna', 'Sarpagandha', 'Ashwagandha', 'Brahmi'],
        diet: 'Reduce salt intake. Increase potassium-rich foods (bananas, coconut water). Avoid caffeine and alcohol.',
        lifestyle: 'Practice Shavasana and deep breathing. Regular moderate exercise. Maintain healthy weight.'
    },
    'Hypotension — Low blood pressure': {
        herbs: ['Ashwagandha', 'Licorice (Mulethi)', 'Tulsi'],
        diet: 'Increase salt slightly. Stay hydrated. Drink tulsi tea.',
        lifestyle: 'Avoid sudden position changes. Eat small, frequent meals.'
    },
    'Vitamin D deficiency — Bone and immunity risk': {
        herbs: ['Ashwagandha', 'Shatavari', 'Bala'],
        diet: 'Include fortified foods, mushrooms, egg yolks. Get 15-20 minutes of morning sunlight daily.',
        lifestyle: 'Morning sun exposure (before 10 AM). Weight-bearing exercises for bone health.'
    },
    'Vitamin B12 deficiency — Neurological and energy concerns': {
        herbs: ['Ashwagandha', 'Shankhpushpi', 'Brahmi'],
        diet: 'Include dairy, fortified cereals, and nutritional yeast. Consider B12 supplementation if vegetarian/vegan.',
        lifestyle: 'Regular sleep schedule. Stress management through meditation.'
    },
    'Hypothyroidism risk — Underactive thyroid': {
        herbs: ['Kanchanar', 'Guggulu', 'Ashwagandha', 'Shilajit'],
        diet: 'Avoid raw cruciferous vegetables. Increase selenium (Brazil nuts). Include iodine-rich foods.',
        lifestyle: 'Sarvangasana (shoulder stand) for thyroid stimulation. Regular sleep and stress management.'
    },
    'Hyperthyroidism risk — Overactive thyroid': {
        herbs: ['Brahmi', 'Jatamansi', 'Shatavari'],
        diet: 'Calming foods. Avoid excessive iodine. Include coconut oil and cruciferous vegetables.',
        lifestyle: 'Cooling practices. Avoid excessive exercise. Practice meditation.'
    },
    'Elevated inflammation markers': {
        herbs: ['Turmeric (Haridra)', 'Boswellia (Shallaki)', 'Ginger (Shunti)', 'Guggulu'],
        diet: 'Anti-inflammatory diet: turmeric milk, ginger tea, omega-3 rich foods. Avoid processed foods and refined sugars.',
        lifestyle: 'Regular exercise. Adequate sleep. Practice yoga for stress reduction.'
    },
    'Elevated ESR — Inflammation or infection risk': {
        herbs: ['Turmeric', 'Guduchi (Giloy)', 'Neem', 'Manjistha'],
        diet: 'Anti-inflammatory foods. Increase fresh fruits and vegetables. Avoid fried and processed foods.',
        lifestyle: 'Rest if feeling unwell. Gentle yoga and breathing exercises.'
    }
};

export function generateAyurvedicSuggestions(detectedConditions) {
    const suggestions = [];
    const allHerbs = new Set();

    for (const condition of detectedConditions) {
        const mapping = SUGGESTION_MAP[condition];
        if (mapping) {
            suggestions.push({
                condition,
                herbs: mapping.herbs,
                diet: mapping.diet,
                lifestyle: mapping.lifestyle
            });
            mapping.herbs.forEach(h => allHerbs.add(h));
        }
    }

    return { suggestions, recommendedHerbs: [...allHerbs] };
}

// =============================================
// 5. storeAnalysisResult() — Save to Supabase
// =============================================
export async function storeAnalysisResult({ fileName, extractedText, detectedConditions, suggestions }) {
    try {
        const { data, error } = await supabase
            .from('medical_report_analysis')
            .insert({
                file_name: fileName,
                extracted_text: extractedText?.substring(0, 10000) || '',
                detected_conditions: detectedConditions.join(', '),
                ayurvedic_suggestions: suggestions.map(s => `${s.condition}: ${s.herbs.join(', ')}`).join('; ')
            })
            .select('id');

        if (error) {
            console.warn('[Analyzer] Could not store result:', error.message);
            return { stored: false, error: error.message };
        }

        console.log('[Analyzer] Analysis stored with ID:', data?.[0]?.id);
        return { stored: true, id: data?.[0]?.id };
    } catch (err) {
        console.warn('[Analyzer] Store failed:', err.message);
        return { stored: false, error: err.message };
    }
}

// =============================================
// 6. analyzeReport() — Full pipeline
// =============================================
export async function analyzeReport(file, onProgress) {
    const result = {
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        uploadedToCloud: false,
        extractedText: '',
        indicators: [],
        detectedConditions: [],
        suggestions: [],
        recommendedHerbs: [],
        storedInDb: false
    };

    // Step 1: Upload to Supabase Storage
    onProgress?.('Uploading report to secure storage...');
    const uploadResult = await uploadReport(file);
    result.uploadedToCloud = uploadResult.success;

    // Step 2: Extract text
    onProgress?.('Extracting text from document...');
    result.extractedText = await extractText(file);

    // Step 3: Analyze medical indicators
    onProgress?.('Detecting medical indicators...');
    const { indicators, detectedConditions } = analyzeMedicalIndicators(result.extractedText);
    result.indicators = indicators;
    result.detectedConditions = detectedConditions;

    // Step 4: Generate Ayurvedic suggestions
    onProgress?.('Generating Ayurvedic suggestions...');
    const { suggestions, recommendedHerbs } = generateAyurvedicSuggestions(detectedConditions);
    result.suggestions = suggestions;
    result.recommendedHerbs = recommendedHerbs;

    // Step 5: Store in Supabase
    onProgress?.('Saving analysis results...');
    const storeResult = await storeAnalysisResult({
        fileName: file.name,
        extractedText: result.extractedText,
        detectedConditions,
        suggestions
    });
    result.storedInDb = storeResult.stored;

    return result;
}
