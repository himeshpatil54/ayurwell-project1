// Medical Report & Symptom Analyzer Page
import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { analyzeReport } from '../lib/reportAnalyzerService';

function MedicalAnalyzerPage() {
    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [progressMsg, setProgressMsg] = useState('');
    const [results, setResults] = useState(null);
    const [error, setError] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef(null);

    const acceptedTypes = '.pdf,.png,.jpg,.jpeg,.txt,.csv';

    const handleFileSelect = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setResults(null);
        setError('');
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const droppedFile = e.dataTransfer.files[0];
        handleFileSelect(droppedFile);
    };

    const handleAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setError('');
        setResults(null);
        setProgressMsg('Starting analysis...');

        try {
            const analysis = await analyzeReport(file, (msg) => setProgressMsg(msg));
            setResults(analysis);
        } catch (err) {
            setError('Analysis failed: ' + (err.message || 'Unknown error'));
        }

        setAnalyzing(false);
        setProgressMsg('');
    };

    const getStatusColor = (status) => {
        if (status === 'low' || status === 'high') return '#E8825D';
        return '#5D6E4E';
    };

    const getStatusLabel = (status) => {
        if (status === 'low') return '↓ Low';
        if (status === 'high') return '↑ High';
        return '✓ Normal';
    };

    return (
        <div className="page-container">
            <Header />

            <main className="analyzer-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header animate-fade-in-up">
                        <Link to="/" className="back-link">← Back to Home</Link>
                        <h1>📋 Medical Report Analyzer</h1>
                        <p className="page-description">
                            Upload your medical reports for Ayurvedic health analysis. We detect key indicators
                            and provide personalized herbal and lifestyle recommendations.
                        </p>
                    </div>

                    {/* Upload Section */}
                    <div className="analyzer-upload-section animate-fade-in-up">
                        <div
                            className={`upload-zone ${dragOver ? 'drag-over' : ''} ${file ? 'has-file' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={acceptedTypes}
                                onChange={(e) => handleFileSelect(e.target.files[0])}
                                style={{ display: 'none' }}
                                id="file-upload"
                            />

                            {file ? (
                                <div className="upload-file-info">
                                    <div className="file-icon">📄</div>
                                    <div>
                                        <p className="file-name">{file.name}</p>
                                        <p className="file-size">{(file.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                    <button
                                        className="file-remove-btn"
                                        onClick={(e) => { e.stopPropagation(); setFile(null); setResults(null); }}
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <div className="upload-prompt">
                                    <div className="upload-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.5">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="17 8 12 3 7 8" />
                                            <line x1="12" y1="3" x2="12" y2="15" />
                                        </svg>
                                    </div>
                                    <p className="upload-title">Upload Medical Report</p>
                                    <p className="upload-subtitle">Drop your report here or click to browse</p>
                                    <p className="upload-formats">Supported formats: PDF, JPG, PNG</p>
                                </div>
                            )}
                        </div>

                        {file && !analyzing && (
                            <button
                                className="btn btn-primary btn-lg analyze-btn"
                                onClick={handleAnalyze}
                                id="analyze-btn"
                            >
                                🔬 Analyze Report
                            </button>
                        )}

                        {analyzing && (
                            <div className="analyzing-status">
                                <div className="loading-spinner"></div>
                                <p>{progressMsg}</p>
                                {/* Pipeline Steps */}
                                <div className="pipeline-steps">
                                    {['Uploading report', 'Extracting text', 'Detecting indicators', 'Generating suggestions', 'Saving results'].map((step, i) => {
                                        const currentIdx = ['Uploading', 'Extracting', 'Detecting', 'Generating', 'Saving']
                                            .findIndex(s => progressMsg.includes(s));
                                        const stepStatus = i < currentIdx ? 'done' : i === currentIdx ? 'active' : 'pending';
                                        return (
                                            <div key={i} className={`pipeline-step ${stepStatus}`}>
                                                <span className="step-dot">
                                                    {stepStatus === 'done' ? '✓' : stepStatus === 'active' ? '●' : '○'}
                                                </span>
                                                <span className="step-label">{step}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="analyzer-error">
                                <p>⚠️ {error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {results && (
                        <div className="analyzer-results animate-fade-in-up">
                            <h2>Medical Report Analysis</h2>

                            {/* Status badges */}
                            <div className="result-badges">
                                {results.uploadedToCloud && (
                                    <div className="result-badge success">☁️ Uploaded to cloud</div>
                                )}
                                {results.storedInDb && (
                                    <div className="result-badge success">💾 Analysis saved</div>
                                )}
                            </div>

                            {/* Detected Indicators */}
                            {results.indicators.length > 0 ? (
                                <div className="result-section">
                                    <h3>📊 Detected Indicators</h3>
                                    <div className="indicators-grid">
                                        {results.indicators.map((ind, i) => (
                                            <div key={i} className={`indicator-card status-${ind.status}`}>
                                                <div className="indicator-header">
                                                    <span className="indicator-name">{ind.name}</span>
                                                    <span
                                                        className="indicator-status"
                                                        style={{ color: getStatusColor(ind.status) }}
                                                    >
                                                        {getStatusLabel(ind.status)}
                                                    </span>
                                                </div>
                                                <div className="indicator-value">
                                                    <span className="value-number">{ind.value}</span>
                                                    <span className="value-unit">{ind.unit}</span>
                                                </div>
                                                <div className="indicator-range">
                                                    Normal: {ind.normalRange}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="result-section">
                                    <h3>📊 Detected Indicators</h3>
                                    <p className="no-indicators">
                                        No specific health indicators detected in the extracted text.
                                        Try uploading a text-based PDF report with lab values for best results.
                                    </p>
                                </div>
                            )}

                            {/* Detected Conditions */}
                            {results.detectedConditions.length > 0 && (
                                <div className="result-section">
                                    <h3>⚠️ Detected Conditions</h3>
                                    <ul className="concerns-list">
                                        {results.detectedConditions.map((c, i) => (
                                            <li key={i}>{c}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Ayurvedic Suggestions */}
                            {results.suggestions.length > 0 && (
                                <div className="result-section">
                                    <h3>🌿 Ayurvedic Suggestions</h3>
                                    {results.suggestions.map((s, i) => (
                                        <div key={i} className="suggestion-card">
                                            <h4>For {s.condition}</h4>
                                            <div className="suggestion-detail">
                                                <span className="suggestion-label">🌱 Recommended Herbs</span>
                                                <p>{s.herbs.join(', ')}</p>
                                            </div>
                                            <div className="suggestion-detail">
                                                <span className="suggestion-label">🍽️ Dietary Guidance</span>
                                                <p>{s.diet}</p>
                                            </div>
                                            <div className="suggestion-detail">
                                                <span className="suggestion-label">🧘 Lifestyle</span>
                                                <p>{s.lifestyle}</p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* All recommended herbs summary */}
                                    {results.recommendedHerbs.length > 0 && (
                                        <div className="herbs-summary">
                                            <strong>All Recommended Herbs:</strong>
                                            <div className="herbs-tags">
                                                {results.recommendedHerbs.map((herb, i) => (
                                                    <span key={i} className="herb-tag">{herb}</span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Extracted Text Preview */}
                            <div className="result-section">
                                <h3>📝 Extracted Text Preview</h3>
                                <div className="extracted-text">
                                    {results.extractedText?.substring(0, 1500) || 'No text extracted.'}
                                    {results.extractedText?.length > 1500 && '...'}
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="analyzer-disclaimer">
                                <p>
                                    🙏 <strong>Disclaimer:</strong> This analysis is for informational and educational purposes only.
                                    It is not a substitute for professional medical advice, diagnosis, or treatment.
                                    Always consult qualified healthcare professionals for medical decisions.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default MedicalAnalyzerPage;
