// Prediction Page — AI Symptom-Based Disease Prediction Interface
// Users select symptoms from searchable dropdown, get disease + remedy results
// NO model metrics, accuracy, precision, recall, or confidence shown to users
import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getSymptomList, predictDisease } from '../lib/predictionService';

function PredictionPage() {
    const [allSymptoms, setAllSymptoms] = useState([]);
    const [selectedSymptoms, setSelectedSymptoms] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitializing, setIsInitializing] = useState(true);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const dropdownRef = useRef(null);
    const inputRef = useRef(null);
    const navigate = useNavigate();

    // Load symptoms on mount (model trains in background)
    useEffect(() => {
        (async () => {
            try {
                const symptoms = await getSymptomList();
                setAllSymptoms(symptoms);
            } catch (err) {
                setError('Failed to initialize prediction model. Please refresh.');
                console.error(err);
            } finally {
                setIsInitializing(false);
            }
        })();
    }, []);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredSymptoms = allSymptoms.filter(s =>
        s.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !selectedSymptoms.includes(s)
    );

    const formatSymptom = (s) => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const addSymptom = (symptom) => {
        if (selectedSymptoms.length < 4 && !selectedSymptoms.includes(symptom)) {
            setSelectedSymptoms([...selectedSymptoms, symptom]);
        }
        setSearchTerm('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const removeSymptom = (symptom) => {
        setSelectedSymptoms(selectedSymptoms.filter(s => s !== symptom));
    };

    const handlePredict = async () => {
        if (selectedSymptoms.length === 0) return;
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const prediction = await predictDisease(selectedSymptoms);
            setResult(prediction);
        } catch (err) {
            setError('Prediction failed. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChatbotRedirect = () => {
        if (result) {
            localStorage.setItem('ayurwell_prediction_context', JSON.stringify({
                disease: result.predicted_disease,
                symptoms: result.symptoms_used,
                remedy: result.remedy
            }));
        }
        navigate('/chatbot');
    };

    // Prevent form submission / Enter key from adding free text
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // If exactly one match in dropdown, select it
            if (filteredSymptoms.length === 1 && selectedSymptoms.length < 4) {
                addSymptom(filteredSymptoms[0]);
            }
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="predict-page">
                <div className="container">
                    {/* Hero Section */}
                    <div className="predict-hero animate-fade-in-up">
                        <div className="predict-badge">🧬 AI-Powered Health Prediction</div>
                        <h1 className="predict-title">Symptom Analysis</h1>
                        <p className="predict-subtitle">
                            Enter your symptoms and our AI model will predict potential conditions
                            with personalized Ayurvedic remedies.
                        </p>
                    </div>

                    {/* Initialization Loader */}
                    {isInitializing && (
                        <div className="predict-init-loader animate-fade-in">
                            <div className="predict-spinner"></div>
                            <p>Training AI model with Ayurvedic dataset...</p>
                            <span className="text-muted">This may take a few seconds on first load</span>
                        </div>
                    )}

                    {/* Symptom Input Section */}
                    {!isInitializing && (
                        <div className="predict-input-section animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            <div className="predict-card">
                                <h3 className="predict-card-title">
                                    <span className="predict-card-icon">🩺</span>
                                    Select Your Symptoms
                                </h3>
                                <p className="text-muted" style={{ marginBottom: 'var(--space-lg)' }}>
                                    Choose up to 4 symptoms you're experiencing from the dropdown
                                </p>

                                {/* Selected symptom chips */}
                                {selectedSymptoms.length > 0 && (
                                    <div className="symptom-chips">
                                        {selectedSymptoms.map(s => (
                                            <span key={s} className="symptom-chip">
                                                {formatSymptom(s)}
                                                <button
                                                    className="symptom-chip-remove"
                                                    onClick={() => removeSymptom(s)}
                                                    aria-label={`Remove ${s}`}
                                                >×</button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Searchable dropdown */}
                                <div className="symptom-search-wrapper" ref={dropdownRef}>
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="form-input symptom-search-input"
                                        placeholder={selectedSymptoms.length >= 4
                                            ? 'Maximum 4 symptoms selected'
                                            : 'Search symptoms (e.g., headache, fever, nausea)...'
                                        }
                                        value={searchTerm}
                                        onChange={(e) => {
                                            setSearchTerm(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        onKeyDown={handleKeyDown}
                                        disabled={selectedSymptoms.length >= 4}
                                        autoComplete="off"
                                        id="symptom-search"
                                    />
                                    <span className="symptom-search-icon">🔍</span>

                                    {showDropdown && selectedSymptoms.length < 4 && (
                                        <div className="symptom-dropdown">
                                            {filteredSymptoms.length > 0 ? (
                                                <>
                                                    {filteredSymptoms.slice(0, 10).map(s => (
                                                        <button
                                                            key={s}
                                                            className="symptom-dropdown-item"
                                                            onClick={() => addSymptom(s)}
                                                        >
                                                            {formatSymptom(s)}
                                                        </button>
                                                    ))}
                                                    {filteredSymptoms.length > 10 && (
                                                        <div className="symptom-dropdown-more">
                                                            +{filteredSymptoms.length - 10} more — type to filter
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="symptom-dropdown-empty">
                                                    No matching symptoms found
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Predict Button */}
                                <button
                                    className="btn btn-primary btn-lg predict-btn"
                                    onClick={handlePredict}
                                    disabled={selectedSymptoms.length === 0 || isLoading}
                                    id="predict-button"
                                >
                                    {isLoading ? (
                                        <>
                                            <span className="predict-btn-spinner"></span>
                                            Analyzing Symptoms...
                                        </>
                                    ) : (
                                        <>🔮 Predict Disease</>
                                    )}
                                </button>

                                {selectedSymptoms.length > 0 && selectedSymptoms.length < 2 && (
                                    <p className="predict-hint">
                                        💡 Add at least 2 symptoms for better prediction accuracy
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="predict-error animate-fade-in">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {/* Loading Animation */}
                    {isLoading && (
                        <div className="predict-loading animate-fade-in">
                            <div className="predict-loading-visual">
                                <div className="predict-pulse-ring"></div>
                                <div className="predict-pulse-ring" style={{ animationDelay: '0.3s' }}></div>
                                <div className="predict-pulse-ring" style={{ animationDelay: '0.6s' }}></div>
                                <span className="predict-loading-icon">🧬</span>
                            </div>
                            <p className="predict-loading-text">Analyzing symptom patterns...</p>
                        </div>
                    )}

                    {/* Result Card */}
                    {result && !isLoading && (
                        <div className="predict-result animate-fade-in-up" id="prediction-result">
                            <div className="predict-result-card">
                                {/* Disease Header */}
                                <div className="predict-result-header">
                                    <div className="predict-result-disease-badge">
                                        <span className="predict-result-emoji">🏥</span>
                                        Predicted Condition
                                    </div>
                                    <h2 className="predict-result-disease">{result.predicted_disease}</h2>
                                </div>

                                {/* Remedy Details Grid */}
                                <div className="predict-details-grid">
                                    <div className="predict-detail-card">
                                        <div className="predict-detail-icon">🌿</div>
                                        <h4>Ayurvedic Remedy</h4>
                                        <p>{result.remedy}</p>
                                    </div>

                                    <div className="predict-detail-card">
                                        <div className="predict-detail-icon">🌱</div>
                                        <h4>Recommended Herbs</h4>
                                        <div className="predict-herbs-chips">
                                            {result.recommended_herbs.map((herb, i) => (
                                                <span key={i} className="predict-herb-chip">{herb}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="predict-detail-card">
                                        <div className="predict-detail-icon">🍽️</div>
                                        <h4>Diet Suggestion</h4>
                                        <p>{result.diet}</p>
                                    </div>
                                </div>

                                {/* Symptoms Used */}
                                <div className="predict-symptoms-used">
                                    <span className="text-muted">Symptoms analyzed:</span>
                                    {result.symptoms_used.map((s, i) => (
                                        <span key={i} className="predict-symptom-tag">{formatSymptom(s)}</span>
                                    ))}
                                </div>

                                {/* CTA: Ask Chatbot */}
                                <div className="predict-cta-section">
                                    <button
                                        className="btn btn-accent btn-lg predict-chatbot-btn"
                                        onClick={handleChatbotRedirect}
                                        id="ask-chatbot-btn"
                                    >
                                        💬 Ask Chatbot for More Guidance
                                    </button>
                                    <p className="predict-cta-hint">
                                        Get detailed explanations about {result.predicted_disease}, causes,
                                        Ayurvedic treatments, and lifestyle advice
                                    </p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="predict-disclaimer">
                                <p>⚕️ <strong>Disclaimer:</strong> This prediction is AI-generated for educational purposes only.
                                    It is not a substitute for professional medical diagnosis. Please consult a qualified
                                    healthcare practitioner for proper diagnosis and treatment.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default PredictionPage;
