// About Ayurveda Page
import Header from '../components/Header';
import Footer from '../components/Footer';

function AboutPage() {
    return (
        <div>
            <Header />

            <div className="page-header">
                <h1>About Ayurveda</h1>
                <p>Discover the ancient science of life and natural healing</p>
            </div>

            <div className="page-content">
                <section className="mb-2xl">
                    <h2>What is Ayurveda?</h2>
                    <p>
                        Ayurveda, often called the "Science of Life," is one of the world's oldest holistic
                        healing systems. Developed more than 5,000 years ago in India, it is based on the
                        belief that health and wellness depend on a delicate balance between mind, body, and spirit.
                    </p>
                    <p>
                        The primary focus of Ayurveda is to promote good health rather than fight disease.
                        However, treatments may be tailored to specific health problems. In Ayurveda, every
                        person is made of a combination of five basic elements found in the universe: space,
                        air, fire, water, and earth.
                    </p>
                </section>

                <section className="mb-2xl">
                    <h2>The Three Doshas</h2>
                    <p>
                        These elements combine in the human body to form three life forces or energies,
                        called doshas. They control how your body works:
                    </p>

                    <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className="card" style={{ borderLeft: '4px solid var(--color-vata)' }}>
                            <h3 style={{ color: 'var(--color-vata)' }}>🌬️ Vata (Space + Air)</h3>
                            <p>
                                Vata controls movement, breathing, circulation, and the nervous system.
                                People with Vata as their main dosha are thought to be quick-thinking,
                                thin, and fast-moving. When out of balance, Vata types may experience
                                anxiety, dry skin, constipation, and difficulty focusing.
                            </p>
                        </div>

                        <div className="card" style={{ borderLeft: '4px solid var(--color-pitta)' }}>
                            <h3 style={{ color: '#C66B3D' }}>🔥 Pitta (Fire + Water)</h3>
                            <p>
                                Pitta controls digestion, metabolism, and energy production. People with
                                Pitta as their main dosha are thought to be fiery, intelligent, and fast-paced.
                                When out of balance, Pitta types may experience inflammation, heartburn,
                                irritability, and skin rashes.
                            </p>
                        </div>

                        <div className="card" style={{ borderLeft: '4px solid var(--color-kapha)' }}>
                            <h3 style={{ color: 'var(--color-kapha)' }}>🌍 Kapha (Earth + Water)</h3>
                            <p>
                                Kapha controls growth, immunity, and body structure. People with Kapha as
                                their main dosha are thought to be calm, grounded, and loving. When out of
                                balance, Kapha types may experience weight gain, congestion, lethargy,
                                and attachment.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="mb-2xl">
                    <h2>Prakriti and Vikriti</h2>
                    <p>
                        <strong>Prakriti</strong> is your inherent constitution — the unique combination
                        of doshas you were born with. It remains constant throughout your life and represents
                        your natural state of balance.
                    </p>
                    <p>
                        <strong>Vikriti</strong> is your current state of imbalance. Various factors like
                        diet, lifestyle, stress, seasons, and life experiences can cause doshas to increase
                        or decrease from their natural proportions.
                    </p>
                    <p>
                        The goal of Ayurveda is to bring Vikriti back in line with Prakriti through
                        appropriate diet, lifestyle, herbs, yoga, and other practices.
                    </p>
                </section>

                <section className="mb-2xl">
                    <h2>Key Ayurvedic Concepts</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                        <div className="card card-flat">
                            <h4>🍽️ Ahara (Diet)</h4>
                            <p className="text-muted">Food is medicine. Eating according to your constitution and current imbalances is fundamental to health.</p>
                        </div>

                        <div className="card card-flat">
                            <h4>🌅 Dinacharya (Daily Routine)</h4>
                            <p className="text-muted">Aligning daily activities with natural rhythms supports balance and prevents disease.</p>
                        </div>

                        <div className="card card-flat">
                            <h4>🍂 Ritucharya (Seasonal Routine)</h4>
                            <p className="text-muted">Adjusting diet and lifestyle with the seasons helps maintain year-round balance.</p>
                        </div>

                        <div className="card card-flat">
                            <h4>🔥 Agni (Digestive Fire)</h4>
                            <p className="text-muted">Strong digestion is the foundation of health. Weak Agni leads to toxin accumulation.</p>
                        </div>

                        <div className="card card-flat">
                            <h4>🧘 Yoga & Pranayama</h4>
                            <p className="text-muted">Physical postures and breathing exercises support both body and mind.</p>
                        </div>

                        <div className="card card-flat">
                            <h4>🧠 Meditation</h4>
                            <p className="text-muted">Mental practices calm the mind and support overall well-being.</p>
                        </div>
                    </div>
                </section>

                <section className="mb-2xl" style={{
                    padding: '2rem',
                    background: 'var(--color-bg-secondary)',
                    borderRadius: 'var(--radius-xl)',
                    textAlign: 'center'
                }}>
                    <h2>Important Note</h2>
                    <p style={{ maxWidth: '600px', margin: '1rem auto' }}>
                        Ayurveda is a complementary approach to health and wellness. The information
                        provided on this platform is for educational purposes only and should not replace
                        professional medical advice, diagnosis, or treatment. Always consult qualified
                        healthcare providers for health concerns.
                    </p>
                </section>
            </div>

            <Footer />
        </div>
    );
}

export default AboutPage;
