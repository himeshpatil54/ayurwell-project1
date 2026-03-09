// Herbal Remedies Page — Search and browse Ayurvedic herbs
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { searchHerbalRemedies, getAllRemedies } from '../lib/herbalRemediesService';

function HerbalRemediesPage() {
    const [query, setQuery] = useState('');
    const [remedies, setRemedies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    // Load all remedies on mount
    useEffect(() => {
        (async () => {
            setLoading(true);
            const data = await getAllRemedies();
            setRemedies(data);
            setLoading(false);
        })();
    }, []);

    // Search handler
    const handleSearch = async (e) => {
        e?.preventDefault();
        setLoading(true);
        if (query.trim()) {
            const results = await searchHerbalRemedies(query);
            setRemedies(results);
        } else {
            const data = await getAllRemedies();
            setRemedies(data);
        }
        setLoading(false);
    };

    // Debounced search on input change
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(timer);
    }, [query]);

    return (
        <div className="page-container">
            <Header />

            <main className="herbal-page">
                <div className="container">
                    {/* Page Header */}
                    <div className="page-header animate-fade-in-up">
                        <Link to="/" className="back-link">← Back to Home</Link>
                        <h1>🌿 Herbal Remedies</h1>
                        <p className="page-description">
                            Explore Ayurvedic herbs and natural treatments. Search by symptom or browse our curated knowledge base.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="herbal-search-container animate-fade-in-up">
                        <form onSubmit={handleSearch} className="herbal-search-form">
                            <div className="herbal-search-wrapper">
                                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    className="herbal-search-input"
                                    placeholder="Search by symptom, herb name, or condition..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    id="herbal-search"
                                />
                                {query && (
                                    <button
                                        type="button"
                                        className="search-clear-btn"
                                        onClick={() => setQuery('')}
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>
                        </form>
                        <div className="herbal-search-tags">
                            {['Headache', 'Stress', 'Digestion', 'Sleep', 'Joint Pain', 'Skin'].map(tag => (
                                <button
                                    key={tag}
                                    className="search-tag"
                                    onClick={() => setQuery(tag.toLowerCase())}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Results */}
                    {loading ? (
                        <div className="herbal-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading remedies...</p>
                        </div>
                    ) : remedies.length === 0 ? (
                        <div className="herbal-empty animate-fade-in">
                            <p>No herbs found for "{query}". Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="herbal-grid">
                            {remedies.map((herb, idx) => (
                                <div
                                    key={herb.id || idx}
                                    className={`herbal-card animate-fade-in-up ${expandedId === (herb.id || idx) ? 'expanded' : ''}`}
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                    onClick={() => setExpandedId(expandedId === (herb.id || idx) ? null : (herb.id || idx))}
                                >
                                    <div className="herbal-card-header">
                                        <h3 className="herbal-name">🌱 {herb.herb_name}</h3>
                                        {herb.dosha && (
                                            <span className={`badge badge-${herb.dosha.toLowerCase()}`}>
                                                {herb.dosha.charAt(0).toUpperCase() + herb.dosha.slice(1)}
                                            </span>
                                        )}
                                    </div>

                                    <div className="herbal-benefits">
                                        <strong>Benefits:</strong> {
                                            typeof herb.benefits === 'string'
                                                ? herb.benefits
                                                : Array.isArray(herb.benefits)
                                                    ? herb.benefits.join(', ')
                                                    : 'See details'
                                        }
                                    </div>

                                    {expandedId === (herb.id || idx) && (
                                        <div className="herbal-details animate-fade-in">
                                            <div className="herbal-detail-row">
                                                <span className="detail-label">📋 Preparation</span>
                                                <p>{herb.preparation_method}</p>
                                            </div>
                                            <div className="herbal-detail-row">
                                                <span className="detail-label">💊 Dosage</span>
                                                <p>{herb.dosage}</p>
                                            </div>
                                            <div className="herbal-detail-row">
                                                <span className="detail-label">⚠️ Precautions</span>
                                                <p>{herb.precautions}</p>
                                            </div>
                                            {herb.related_symptoms && (
                                                <div className="herbal-detail-row">
                                                    <span className="detail-label">🔗 Related Symptoms</span>
                                                    <p>{Array.isArray(herb.related_symptoms) ? herb.related_symptoms.join(', ') : herb.related_symptoms}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="herbal-card-footer">
                                        <span className="expand-hint">
                                            {expandedId === (herb.id || idx) ? 'Click to collapse ▲' : 'Click for details ▼'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Results count */}
                    {!loading && remedies.length > 0 && (
                        <p className="results-count">
                            Showing {remedies.length} {remedies.length === 1 ? 'remedy' : 'remedies'}
                            {query ? ` for "${query}"` : ''}
                        </p>
                    )}
                </div>
            </main>
        </div>
    );
}

export default HerbalRemediesPage;
