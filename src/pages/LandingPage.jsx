// Landing Page — Minimalistic Ayurvedic Health Platform Hub
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LandingPage() {
    const { user } = useAuth();

    const modules = [
        {
            title: 'Health Prediction',
            icon: '🔮',
            description: 'Enter your symptoms and our AI model predicts potential conditions with personalized Ayurvedic remedies, herbs, and diet suggestions.',
            path: user ? '/predict' : '/login',
            color: 'var(--color-secondary)',
            primary: true
        },
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
            color: 'var(--color-accent)'
        },
        {
            title: 'User Dashboard',
            icon: '📊',
            description: 'Track your prediction history, view health statistics, and review past chatbot conversations in one place.',
            path: user ? '/user-dashboard' : '/login',
            color: 'var(--color-primary-light)'
        },
        {
            title: 'Report Analyzer',
            icon: '📋',
            description: 'Upload your medical reports for AI-powered Ayurvedic analysis — detect key indicators and get herbal recommendations.',
            path: user ? '/medical-analyzer' : '/login',
            color: 'var(--color-secondary)'
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
                        <Link to="/predict" className="btn btn-primary btn-sm">Get Started</Link>
                    ) : (
                        <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
                    )}
                </nav>
            </header>

            {/* Hero Section */}
            <section className="landing-hero">
                <div className="landing-hero-content animate-fade-in-up">
                    <div className="landing-badge">🧬 AI-Powered Ayurvedic Health Prediction</div>
                    <h1 className="landing-title">Predict & Heal<br />With Ayurveda</h1>
                    <p className="landing-subtitle">
                        Enter your symptoms and let our AI predict potential health conditions —
                        then receive personalized Ayurvedic remedies, herbal treatments,
                        and dietary guidance — all in one place.
                    </p>
                    <div className="landing-hero-cta">
                        <Link to={user ? '/predict' : '/login'} className="btn btn-primary btn-lg">
                            Start Health Prediction
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
                        <h2>Intelligent Health Modules</h2>
                        <p>AI-powered Ayurvedic wellness tools designed for modern health needs.</p>
                    </div>

                    <div className="module-cards-grid">
                        {modules.map((mod, idx) => (
                            <Link
                                key={idx}
                                to={mod.path}
                                className={`module-card animate-fade-in-up${mod.primary ? ' module-card-primary' : ''}`}
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
                    <p>Free, private, and powered by AI + traditional Ayurvedic wisdom.</p>
                    <Link to={user ? '/predict' : '/login'} className="btn btn-primary btn-lg">
                        Begin Health Prediction →
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

