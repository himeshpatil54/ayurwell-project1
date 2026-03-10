// User Dashboard — Prediction History, Statistics, Activity
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { getPredictionHistory, clearPredictionHistory } from '../lib/predictionService';
import { demoStorage } from '../lib/supabase';

function UserDashboardPage() {
    const { user } = useAuth();
    const [predictions, setPredictions] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [activeTab, setActiveTab] = useState('predictions');

    useEffect(() => {
        setPredictions(getPredictionHistory());
        const chats = demoStorage.getChatHistory();
        setChatHistory(chats.filter(m => m.role === 'user').slice(0, 20));
    }, []);

    // Statistics
    const totalPredictions = predictions.length;
    const totalChatQueries = chatHistory.length;

    const symptomCounts = {};
    for (const p of predictions) {
        for (const s of (p.symptoms_used || [])) {
            symptomCounts[s] = (symptomCounts[s] || 0) + 1;
        }
    }
    const topSymptom = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1])[0];

    const diseaseCounts = {};
    for (const p of predictions) {
        if (p.predicted_disease) {
            diseaseCounts[p.predicted_disease] = (diseaseCounts[p.predicted_disease] || 0) + 1;
        }
    }
    const topDisease = Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1])[0];

    const formatSymptom = (s) => (s || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    const formatDate = (ts) => {
        if (!ts) return '—';
        const d = new Date(ts);
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (ts) => {
        if (!ts) return '';
        const d = new Date(ts);
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleClearHistory = () => {
        if (window.confirm('Are you sure you want to clear all prediction history?')) {
            clearPredictionHistory();
            setPredictions([]);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <main className="dashboard-page">
                <div className="container">
                    {/* Dashboard Header */}
                    <div className="dashboard-header animate-fade-in-up">
                        <div>
                            <h1 className="dashboard-title">Your Dashboard</h1>
                            <p className="dashboard-subtitle">
                                Welcome back, {user?.email?.split('@')[0] || user?.fullName || 'User'} 👋
                            </p>
                        </div>
                        <Link to="/predict" className="btn btn-primary">
                            🔮 New Prediction
                        </Link>
                    </div>

                    {/* Stats Cards */}
                    <div className="dashboard-stats animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <div className="dash-stat-card">
                            <div className="dash-stat-icon">🔮</div>
                            <div className="dash-stat-info">
                                <span className="dash-stat-number">{totalPredictions}</span>
                                <span className="dash-stat-label">Total Predictions</span>
                            </div>
                        </div>
                        <div className="dash-stat-card">
                            <div className="dash-stat-icon">💬</div>
                            <div className="dash-stat-info">
                                <span className="dash-stat-number">{totalChatQueries}</span>
                                <span className="dash-stat-label">Chat Queries</span>
                            </div>
                        </div>
                        <div className="dash-stat-card">
                            <div className="dash-stat-icon">🩺</div>
                            <div className="dash-stat-info">
                                <span className="dash-stat-number">
                                    {topSymptom ? formatSymptom(topSymptom[0]) : '—'}
                                </span>
                                <span className="dash-stat-label">Top Symptom</span>
                            </div>
                        </div>
                        <div className="dash-stat-card">
                            <div className="dash-stat-icon">📊</div>
                            <div className="dash-stat-info">
                                <span className="dash-stat-number">
                                    {topDisease ? topDisease[0] : '—'}
                                </span>
                                <span className="dash-stat-label">Most Predicted</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="dashboard-tabs animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                        <button
                            className={`dashboard-tab ${activeTab === 'predictions' ? 'active' : ''}`}
                            onClick={() => setActiveTab('predictions')}
                        >
                            🔮 Prediction History
                        </button>
                        <button
                            className={`dashboard-tab ${activeTab === 'chat' ? 'active' : ''}`}
                            onClick={() => setActiveTab('chat')}
                        >
                            💬 Chat History
                        </button>
                    </div>

                    {/* Prediction History Table */}
                    {activeTab === 'predictions' && (
                        <div className="dashboard-table-section animate-fade-in">
                            {predictions.length === 0 ? (
                                <div className="dashboard-empty">
                                    <span className="dashboard-empty-icon">🔮</span>
                                    <h3>No predictions yet</h3>
                                    <p>Start by making your first health prediction!</p>
                                    <Link to="/predict" className="btn btn-primary">Make a Prediction</Link>
                                </div>
                            ) : (
                                <>
                                    <div className="dashboard-table-header">
                                        <h3>Recent Predictions</h3>
                                        <button className="btn btn-ghost btn-sm" onClick={handleClearHistory}>
                                            🗑️ Clear
                                        </button>
                                    </div>
                                    <div className="dashboard-table-wrapper">
                                        <table className="dashboard-table">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Symptoms</th>
                                                    <th>Predicted Disease</th>
                                                    <th>Remedies</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {predictions.map((p, i) => (
                                                    <tr key={p.id || i}>
                                                        <td>
                                                            <div className="dash-date">
                                                                <span>{formatDate(p.timestamp)}</span>
                                                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>{formatTime(p.timestamp)}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="dash-symptoms">
                                                                {(p.symptoms_used || []).map((s, j) => (
                                                                    <span key={j} className="dash-symptom-tag">{formatSymptom(s)}</span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <strong style={{ color: 'var(--color-primary)' }}>{p.predicted_disease}</strong>
                                                        </td>
                                                        <td>
                                                            <span className="dash-remedy-text">{p.remedy || '—'}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Chat History */}
                    {activeTab === 'chat' && (
                        <div className="dashboard-table-section animate-fade-in">
                            {chatHistory.length === 0 ? (
                                <div className="dashboard-empty">
                                    <span className="dashboard-empty-icon">💬</span>
                                    <h3>No chat history yet</h3>
                                    <p>Start a conversation with the AyurWell chatbot!</p>
                                    <Link to="/chatbot" className="btn btn-primary">Open Chatbot</Link>
                                </div>
                            ) : (
                                <div className="dashboard-chat-list">
                                    <h3 style={{ marginBottom: 'var(--space-lg)' }}>Recent Chat Queries</h3>
                                    {chatHistory.map((msg, i) => (
                                        <div key={msg.id || i} className="dashboard-chat-item">
                                            <span className="dashboard-chat-time">{formatDate(msg.timestamp)} {formatTime(msg.timestamp)}</span>
                                            <p className="dashboard-chat-text">{msg.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default UserDashboardPage;
