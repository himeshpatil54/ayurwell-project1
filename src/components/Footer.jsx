// Footer Component
import { Link } from 'react-router-dom';

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h4>AYURWELL</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        Discover your unique constitution and find balance through ancient Ayurvedic wisdom.
                    </p>
                </div>

                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <Link to="/">Home</Link>
                    <Link to="/about">About</Link>
                    <Link to="/login">Get Started</Link>
                </div>

                <div className="footer-section">
                    <h4>Resources</h4>
                    <Link to="/privacy">Privacy Policy</Link>
                    <Link to="/privacy">Terms of Use</Link>
                    <Link to="/privacy">Health Disclaimer</Link>
                </div>

                <div className="footer-section">
                    <h4>Contact</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                        Questions about AYURWELL?<br />
                        Reach out to us for guidance.
                    </p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>© {new Date().getFullYear()} AYURWELL. For educational purposes only.</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    Not a substitute for professional medical advice.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
