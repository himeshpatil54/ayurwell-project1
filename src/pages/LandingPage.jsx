// Landing Page
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import DisclaimerBanner from '../components/DisclaimerBanner';

function LandingPage() {
    return (
        <div>
            <Header />

            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-fade-in-up">
                        <h1 className="hero-title">Discover Your Natural Balance</h1>
                        <p className="hero-subtitle">
                            Experience personalized wellness guidance based on ancient Ayurvedic wisdom.
                            Understand your unique constitution, identify imbalances, and receive tailored
                            recommendations for diet, lifestyle, and holistic well-being.
                        </p>
                        <div className="hero-cta">
                            <Link to="/login" className="btn btn-primary btn-lg">
                                Begin Your Journey
                            </Link>
                            <Link to="/about" className="btn btn-secondary btn-lg">
                                Learn More
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container text-center mb-2xl">
                    <h2>How We Support Your Wellness</h2>
                    <p className="text-muted" style={{ maxWidth: '600px', margin: '1rem auto 0' }}>
                        Our platform combines traditional Ayurvedic knowledge with a friendly,
                        conversational approach to wellness guidance.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="card feature-card">
                        <div className="feature-icon">🔍</div>
                        <h3>Prakriti Analysis</h3>
                        <p>Discover your unique mind-body constitution through our comprehensive assessment,
                            revealing your dominant doshas (Vata, Pitta, Kapha).</p>
                    </div>

                    <div className="card feature-card">
                        <div className="feature-icon">💬</div>
                        <h3>Natural Conversation</h3>
                        <p>Share your symptoms and concerns naturally. Our AI guide understands context
                            and responds with empathy and relevant Ayurvedic insights.</p>
                    </div>

                    <div className="card feature-card">
                        <div className="feature-icon">🍽️</div>
                        <h3>Personalized Diet</h3>
                        <p>Receive food recommendations tailored to your constitution, including
                            what to favor, what to minimize, and optimal meal timing.</p>
                    </div>

                    <div className="card feature-card">
                        <div className="feature-icon">🌅</div>
                        <h3>Daily Routines</h3>
                        <p>Get customized Dinacharya (daily routine) guidance for morning,
                            afternoon, and evening practices suited to your dosha.</p>
                    </div>

                    <div className="card feature-card">
                        <div className="feature-icon">🧘</div>
                        <h3>Yoga & Pranayama</h3>
                        <p>Discover yoga poses and breathing techniques specifically selected
                            to balance your constitution and address imbalances.</p>
                    </div>

                    <div className="card feature-card">
                        <div className="feature-icon">🧠</div>
                        <h3>Mind & Stress Care</h3>
                        <p>Learn meditation techniques and lifestyle adjustments to manage
                            stress and support mental well-being according to Ayurveda.</p>
                    </div>
                </div>
            </section>

            {/* Dosha Section */}
            <section className="dosha-section">
                <div className="container text-center mb-2xl">
                    <h2>The Three Doshas</h2>
                    <p className="text-muted" style={{ maxWidth: '600px', margin: '1rem auto 0' }}>
                        In Ayurveda, everyone has a unique combination of three fundamental energies
                        that govern physical and mental processes.
                    </p>
                </div>

                <div className="dosha-grid">
                    <div className="dosha-card vata">
                        <div className="dosha-icon">🌬️</div>
                        <h3>Vata</h3>
                        <p className="text-muted mb-md">Air + Space</p>
                        <p>Governs movement, creativity, and communication. Vata types are quick-thinking,
                            energetic, and adaptable but may experience anxiety and dryness when imbalanced.</p>
                    </div>

                    <div className="dosha-card pitta">
                        <div className="dosha-icon">🔥</div>
                        <h3>Pitta</h3>
                        <p className="text-muted mb-md">Fire + Water</p>
                        <p>Governs metabolism, digestion, and transformation. Pitta types are focused,
                            ambitious, and sharp but may experience irritability and inflammation when imbalanced.</p>
                    </div>

                    <div className="dosha-card kapha">
                        <div className="dosha-icon">🌍</div>
                        <h3>Kapha</h3>
                        <p className="text-muted mb-md">Earth + Water</p>
                        <p>Governs structure, stability, and lubrication. Kapha types are calm, loyal,
                            and strong but may experience lethargy and congestion when imbalanced.</p>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="py-2xl">
                <div className="container">
                    <DisclaimerBanner />
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-3xl" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
                <div className="container text-center">
                    <h2 style={{ color: 'white', marginBottom: '1rem' }}>Ready to Discover Your Constitution?</h2>
                    <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: '500px', margin: '0 auto 2rem' }}>
                        Start your personalized Ayurvedic wellness journey today. It only takes a few minutes.
                    </p>
                    <Link to="/login" className="btn btn-accent btn-lg">
                        Get Started Free
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}

export default LandingPage;
