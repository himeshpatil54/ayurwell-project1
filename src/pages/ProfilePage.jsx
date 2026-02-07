// Profile Page
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import DoshaChart from '../components/DoshaChart';
import { useAuth } from '../context/AuthContext';
import { demoStorage } from '../lib/supabase';

function ProfilePage() {
    const { user, updateProfile, signOut } = useAuth();
    const [prakriti, setPrakriti] = useState(null);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        age: user?.age || '',
        gender: user?.gender || '',
        lifestyle: user?.lifestyle || ''
    });
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        setPrakriti(demoStorage.getPrakriti());
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);

        const result = await updateProfile(formData);

        setSaving(false);
        if (result.success) {
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } else {
            setMessage('Failed to update profile');
        }
    };

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to delete all your data? This cannot be undone.')) {
            demoStorage.clearChatHistory();
            localStorage.removeItem('ayurveda_reports');
            localStorage.removeItem('ayurveda_prakriti');
            setPrakriti(null);
            setMessage('All data cleared');
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <Header />

            <div className="page-header">
                <h1>Your Profile</h1>
                <p>Manage your personal information and preferences</p>
            </div>

            <div className="page-content">
                {message && (
                    <div style={{
                        padding: '1rem',
                        background: 'rgba(93, 110, 78, 0.1)',
                        borderRadius: 'var(--radius-md)',
                        marginBottom: '1.5rem',
                        textAlign: 'center'
                    }}>
                        {message}
                    </div>
                )}

                <div className="profile-grid">
                    {/* Personal Information */}
                    <div className="profile-section">
                        <h3>Personal Information</h3>
                        <form onSubmit={handleSave}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    className="form-input"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={user?.email || ''}
                                    disabled
                                    style={{ opacity: 0.7 }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        className="form-input"
                                        value={formData.age}
                                        onChange={handleChange}
                                        placeholder="e.g. 30"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Gender</label>
                                    <select
                                        name="gender"
                                        className="form-input"
                                        value={formData.gender}
                                        onChange={handleChange}
                                    >
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Lifestyle</label>
                                <select
                                    name="lifestyle"
                                    className="form-input"
                                    value={formData.lifestyle}
                                    onChange={handleChange}
                                >
                                    <option value="">Select...</option>
                                    <option value="sedentary">Sedentary</option>
                                    <option value="moderate">Moderately Active</option>
                                    <option value="active">Very Active</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={saving}
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>

                    {/* Prakriti Summary */}
                    <div className="profile-section">
                        <h3>Your Prakriti</h3>
                        {prakriti ? (
                            <>
                                <DoshaChart scores={prakriti} size="small" />
                                <p style={{ textAlign: 'center', marginTop: '1rem', color: 'var(--color-text-muted)' }}>
                                    Your most recent constitution analysis
                                </p>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                                <p>No Prakriti analysis yet.</p>
                                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                                    Complete the assessment in the chat to see your results here.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Data Management */}
                    <div className="profile-section">
                        <h3>Data Management</h3>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                            Manage your personal data and account settings.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    const data = {
                                        profile: user,
                                        prakriti: demoStorage.getPrakriti(),
                                        reports: demoStorage.getReports(),
                                        chatHistory: demoStorage.getChatHistory()
                                    };
                                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                                    const url = URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = 'ayurveda-wellness-data.json';
                                    a.click();
                                }}
                            >
                                📥 Export My Data
                            </button>

                            <button
                                className="btn btn-ghost"
                                onClick={handleClearData}
                                style={{ color: 'var(--color-secondary)' }}
                            >
                                🗑️ Delete All My Data
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;
