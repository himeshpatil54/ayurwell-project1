// Landing Page — Minimalistic Ayurvedic Health Platform Hub
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
    const { user } = useAuth();
    const linkBase = user ? '' : '/login';

    const modules = [
        {
            title: 'Symptom Chatbot',
            icon: '💬',
            description: 'Describe your symptoms and receive Ayurvedic guidance with dosha imbalance detection and severity analysis.',
            path: user ? '/chatbot' : '/login',
            color: 'var(--color-primary)'
        },
        {
            title: 'Herbal Remedies',
            icon: '🌿',
            description: 'Explore a curated knowledge base of Ayurvedic herbs, their benefits, preparation methods, and dosage.',
            path: user ? '/herbal-remedies' : '/login',
            color: 'var(--color-secondary)'
        },
        {
            title: 'Medical Report Analyzer',
            icon: '📋',
            description: 'Upload medical reports for AI-powered analysis. Detect health indicators and get personalized Ayurvedic suggestions.',
            path: user ? '/medical-analyzer' : '/login',
            color: 'var(--color-accent)'
        }
    ];

    return (
        <div className="landing-page">
            {/* Minimal Header */}
            <header className="landing-header">
                <Link to="/" className="landing-logo">
                    <svg viewBox="0 0 40 40" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="20" cy="20" r="18" fill="#FAF7F2" stroke="#5D6E4E" strokeWidth="2" />
                        <circle cx="20" cy="20" r="4" fill="#D4A574" />
                        <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" />
                        <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(60 20 20)" />
                        <ellipse cx="20" cy="12" rx="3" ry="6" fill="#5D6E4E" transform="rotate(120 20 20)" />
                    </svg>
                    <span>AYURWELL</span>
                </Link>
                <nav className="landing-nav">
                    <Link to="/about">About</Link>
                    {user ? (
                        <Link to="/chatbot" className="btn btn-primary btn-sm">Dashboard</Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content animate-fade-in-up">
                    <div className="landing-badge">🌿 Ayurvedic AI Health Assistant</div>
                    <h1 className="landing-title">Your Path to<br />Natural Balance</h1>
                    <p className="landing-subtitle">
                        Harness the wisdom of Ayurveda with intelligent symptom analysis,
                        herbal remedy guidance, and medical report insights — all in one place.
                    </p>
                    <div className="landing-hero-cta">
                        <Link to={user ? '/chatbot' : '/login'} className="btn btn-primary btn-lg">
                            Get Started
                        </Link>
                        <Link to="/about" className="btn btn-secondary btn-lg">
                            Learn More
                        </Link>
                    </div>
                </div>
            </section>

            {/* Module Cards Section */}
            <section className="landing-modules" id="modules">
                <div className="container">
                    <div className="landing-section-header">
                        <h2>Three Intelligent Modules</h2>
                        <p>Comprehensive Ayurvedic wellness tools designed for modern health needs.</p>
                    </div>

                    <div className="module-cards-grid">
                        {modules.map((mod, idx) => (
                            <Link
                                key={idx}
                                to={mod.path}
                                className="module-card animate-fade-in-up"
                                style={{ animationDelay: `${idx * 100 + 100}ms` }}
                                id={`module-card-${idx}`}
                            >
                                <div className="module-icon" style={{ color: mod.color }}>
                                    {mod.icon}
                                </div>
                                <h3 className="module-title">{mod.title}</h3>
                                <p className="module-desc">{mod.description}</p>
                                <div className="module-arrow">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Dosha Overview */}
            <section className="landing-doshas">
                <div className="container">
                    <div className="landing-section-header">
                        <h2>Understanding Doshas</h2>
                        <p>Every individual has a unique combination of three fundamental energies.</p>
                    </div>

                    <div className="dosha-pills">
                        <div className="dosha-pill vata">
                            <span className="dosha-emoji">🌬️</span>
                            <div>
                                <strong>Vata</strong>
                                <span>Air + Space</span>
                            </div>
                        </div>
                        <div className="dosha-pill pitta">
                            <span className="dosha-emoji">🔥</span>
                            <div>
                                <strong>Pitta</strong>
                                <span>Fire + Water</span>
                            </div>
                        </div>
                        <div className="dosha-pill kapha">
                            <span className="dosha-emoji">🌍</span>
                            <div>
                                <strong>Kapha</strong>
                                <span>Earth + Water</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="landing-cta">
                <div className="container text-center">
                    <h2>Start Your Wellness Journey Today</h2>
                    <p>Free, private, and powered by traditional Ayurvedic wisdom.</p>
                    <Link to={user ? '/chatbot' : '/login'} className="btn btn-primary btn-lg">
                        Begin Now →
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="landing-footer-content">
                        <p>© 2026 AYURWELL — For educational purposes only. Not medical advice.</p>
                        <div className="landing-footer-links">
                            <Link to="/about">About</Link>
                            <Link to="/privacy">Privacy</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
