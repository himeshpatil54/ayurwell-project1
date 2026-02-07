// Privacy & Disclaimer Page
import Header from '../components/Header';
import Footer from '../components/Footer';

function PrivacyPage() {
    return (
        <div>
            <Header />

            <div className="page-header">
                <h1>Privacy Policy & Disclaimer</h1>
                <p>Understanding how we protect your information</p>
            </div>

            <div className="page-content" style={{ maxWidth: '800px' }}>
                {/* Health Disclaimer */}
                <section className="mb-2xl">
                    <h2 style={{ color: 'var(--color-secondary)' }}>⚠️ Health Disclaimer</h2>
                    <div className="card" style={{ background: 'rgba(198, 107, 61, 0.05)', borderLeft: '4px solid var(--color-secondary)' }}>
                        <p><strong>This platform is for educational purposes only.</strong></p>
                        <p>
                            The Ayurvedic information, assessments, and recommendations provided on this
                            platform are intended solely for educational and informational purposes. They
                            are based on traditional Ayurvedic principles and are not intended to:
                        </p>
                        <ul style={{ marginLeft: '1.5rem', marginTop: '1rem' }}>
                            <li>Diagnose, treat, cure, or prevent any disease or medical condition</li>
                            <li>Replace professional medical advice, diagnosis, or treatment</li>
                            <li>Serve as a substitute for consultation with qualified healthcare providers</li>
                            <li>Provide emergency medical advice</li>
                        </ul>
                        <p style={{ marginTop: '1rem' }}>
                            <strong>Always consult a qualified healthcare provider</strong> before making
                            any changes to your diet, lifestyle, or health regimen. If you have a medical
                            condition or are taking medications, seek professional medical guidance before
                            following any Ayurvedic recommendations.
                        </p>
                        <p style={{ marginTop: '1rem' }}>
                            <strong>In case of emergency,</strong> please contact your local emergency
                            services or visit the nearest emergency room immediately.
                        </p>
                    </div>
                </section>

                {/* Privacy Policy */}
                <section className="mb-2xl">
                    <h2>Privacy Policy</h2>
                    <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
                        Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>

                    <h3>1. Information We Collect</h3>
                    <p>We collect information you provide directly:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Account Information:</strong> Name, email, phone number</li>
                        <li><strong>Health Information:</strong> Symptoms, wellness concerns, and questionnaire responses you share with our chatbot</li>
                        <li><strong>Usage Data:</strong> Chat history, generated reports, and preferences</li>
                    </ul>

                    <h3 className="mt-xl">2. How We Use Your Information</h3>
                    <p>Your information is used to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Provide personalized Ayurvedic wellness guidance</li>
                        <li>Generate and store your Prakriti assessments</li>
                        <li>Improve our services and recommendations</li>
                        <li>Communicate with you about your account</li>
                    </ul>

                    <h3 className="mt-xl">3. Data Storage and Security</h3>
                    <p>
                        We take the security of your data seriously. Your information is encrypted
                        during transmission and storage. We use industry-standard security measures
                        to protect against unauthorized access, alteration, or destruction of data.
                    </p>
                    <p>
                        In demo mode, all data is stored locally in your browser's localStorage
                        and is not transmitted to any server.
                    </p>

                    <h3 className="mt-xl">4. Data Sharing</h3>
                    <p>We do not sell, trade, or share your personal health information with third parties except:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>With your explicit consent</li>
                        <li>To comply with legal obligations</li>
                        <li>To protect our rights and safety</li>
                    </ul>

                    <h3 className="mt-xl">5. Your Rights</h3>
                    <p>You have the right to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li><strong>Access:</strong> View all personal data we hold about you</li>
                        <li><strong>Export:</strong> Download a copy of your data</li>
                        <li><strong>Delete:</strong> Request deletion of your account and all associated data</li>
                        <li><strong>Correct:</strong> Update or correct your personal information</li>
                    </ul>
                    <p style={{ marginTop: '1rem' }}>
                        You can exercise these rights through the Profile page or by contacting us.
                    </p>

                    <h3 className="mt-xl">6. Cookies and Tracking</h3>
                    <p>
                        We use essential cookies for authentication and session management.
                        We do not use third-party tracking or advertising cookies.
                    </p>

                    <h3 className="mt-xl">7. Changes to This Policy</h3>
                    <p>
                        We may update this Privacy Policy from time to time. We will notify you
                        of any significant changes by posting the new policy on this page.
                    </p>
                </section>

                {/* Terms of Use */}
                <section className="mb-2xl">
                    <h2>Terms of Use</h2>

                    <h3>Acceptance of Terms</h3>
                    <p>
                        By using this platform, you agree to these Terms of Use and our Privacy Policy.
                        If you do not agree, please do not use our services.
                    </p>

                    <h3 className="mt-xl">Appropriate Use</h3>
                    <p>You agree to:</p>
                    <ul style={{ marginLeft: '1.5rem' }}>
                        <li>Provide accurate information about yourself</li>
                        <li>Use the platform for personal, non-commercial purposes</li>
                        <li>Not misuse or attempt to manipulate the system</li>
                        <li>Understand that recommendations are educational, not medical advice</li>
                    </ul>

                    <h3 className="mt-xl">Limitation of Liability</h3>
                    <p>
                        This platform is provided "as is" without warranties of any kind. We are not
                        liable for any health outcomes or decisions made based on the information
                        provided through our platform.
                    </p>
                </section>

                {/* Contact */}
                <section className="mb-2xl" style={{
                    padding: '2rem',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    textAlign: 'center'
                }}>
                    <h2>Contact Us</h2>
                    <p style={{ maxWidth: '500px', margin: '1rem auto' }}>
                        If you have questions about this Privacy Policy, your data, or our practices,
                        please reach out to us.
                    </p>
                    <p style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
                        support@ayurveda-wellness.example.com
                    </p>
                </section>
            </div>

            <Footer />
        </div>
    );
}

export default PrivacyPage;
