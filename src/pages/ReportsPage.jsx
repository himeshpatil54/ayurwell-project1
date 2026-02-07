// Reports Page
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import DoshaChart from '../components/DoshaChart';
import { demoStorage } from '../lib/supabase';

function ReportsPage() {
    const [reports, setReports] = useState([]);
    const [selectedReport, setSelectedReport] = useState(null);

    useEffect(() => {
        setReports(demoStorage.getReports());
    }, []);

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this report?')) {
            demoStorage.deleteReport(id);
            setReports(demoStorage.getReports());
            if (selectedReport?.id === id) {
                setSelectedReport(null);
            }
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
            <Header />

            <div className="page-header">
                <h1>Your Reports</h1>
                <p>View your Prakriti analyses and wellness recommendations</p>
            </div>

            <div className="page-content">
                {reports.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon">📋</div>
                        <h3>No Reports Yet</h3>
                        <p>Complete a Prakriti assessment in the chat to generate your first report.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                        {reports.map(report => (
                            <div
                                key={report.id}
                                className="report-card"
                                onClick={() => setSelectedReport(report)}
                            >
                                <div className="report-card-header">
                                    <div>
                                        <h4 style={{ marginBottom: '0.25rem' }}>
                                            {report.type === 'prakriti' ? 'Prakriti Analysis' : 'Symptom Analysis'}
                                        </h4>
                                        <span className="report-date">{formatDate(report.createdAt)}</span>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                                        className="btn btn-ghost btn-sm"
                                        style={{ padding: '0.25rem 0.5rem' }}
                                    >
                                        🗑️
                                    </button>
                                </div>

                                <div className="report-dosha-summary">
                                    <span className="badge badge-vata">V: {report.scores?.vata}%</span>
                                    <span className="badge badge-pitta">P: {report.scores?.pitta}%</span>
                                    <span className="badge badge-kapha">K: {report.scores?.kapha}%</span>
                                </div>

                                {report.symptoms?.length > 0 && (
                                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: '0.75rem' }}>
                                        Symptoms: {report.symptoms.slice(0, 3).join(', ')}
                                        {report.symptoms.length > 3 && ` +${report.symptoms.length - 3} more`}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Detail Modal */}
            {selectedReport && (
                <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '700px' }}>
                        <div className="modal-header">
                            <h2>
                                {selectedReport.type === 'prakriti' ? 'Prakriti Analysis' : 'Symptom Analysis'}
                            </h2>
                            <button className="modal-close" onClick={() => setSelectedReport(null)}>×</button>
                        </div>

                        <div className="modal-body">
                            <p className="text-muted mb-lg">{formatDate(selectedReport.createdAt)}</p>

                            <DoshaChart scores={selectedReport.scores} size="medium" />

                            {selectedReport.report?.prakriti && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h3>Constitution Type: {selectedReport.report.prakriti.type}</h3>
                                    <p>{selectedReport.report.prakriti.description}</p>
                                </div>
                            )}

                            {selectedReport.symptoms?.length > 0 && (
                                <div style={{ marginTop: '1.5rem' }}>
                                    <h4>Analyzed Symptoms</h4>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {selectedReport.symptoms.map((symptom, idx) => (
                                            <span key={idx} className="badge" style={{ background: 'var(--color-bg-secondary)' }}>
                                                {symptom}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="modal-footer">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setSelectedReport(null)}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ReportsPage;
