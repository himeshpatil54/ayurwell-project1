// Disclaimer Banner Component
function DisclaimerBanner({ compact = false }) {
    if (compact) {
        return (
            <div className="disclaimer-banner" style={{ padding: '0.75rem 1rem' }}>
                <span className="icon">⚠️</span>
                <p>
                    <strong>Educational purposes only.</strong> Not a substitute for medical advice.
                </p>
            </div>
        );
    }

    return (
        <div className="disclaimer-banner">
            <span className="icon">⚠️</span>
            <div>
                <p>
                    <strong>Health Disclaimer:</strong> This platform provides educational content based on
                    traditional Ayurvedic principles. It is not intended to diagnose, treat, cure, or prevent
                    any disease. The information provided should not replace professional medical advice,
                    diagnosis, or treatment. Always consult a qualified healthcare provider for medical concerns.
                </p>
            </div>
        </div>
    );
}

export default DisclaimerBanner;
