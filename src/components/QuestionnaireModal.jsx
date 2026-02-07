// Questionnaire Modal Component
import { useState } from 'react';
import prakritiQuestions from '../data/prakritiQuestions.json';

function QuestionnaireModal({ isOpen, onClose, onComplete }) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState([]);

    if (!isOpen) return null;

    const question = prakritiQuestions[currentQuestion];
    const progress = ((currentQuestion + 1) / prakritiQuestions.length) * 100;

    const handleAnswer = (optionIndex) => {
        const newAnswers = [...answers, {
            questionId: question.id,
            optionIndex
        }];
        setAnswers(newAnswers);

        if (currentQuestion + 1 >= prakritiQuestions.length) {
            // Complete
            onComplete(newAnswers);
            onClose();
            setCurrentQuestion(0);
            setAnswers([]);
        } else {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1);
            setAnswers(answers.slice(0, -1));
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Prakriti Assessment</h2>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="questionnaire-progress">
                        <p style={{ marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            Question {currentQuestion + 1} of {prakritiQuestions.length}
                        </p>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>

                    <p className="questionnaire-question">{question.question}</p>

                    <div className="questionnaire-options">
                        {question.options.map((option, idx) => (
                            <button
                                key={idx}
                                className="questionnaire-option"
                                onClick={() => handleAnswer(idx)}
                            >
                                {option.text}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="modal-footer">
                    {currentQuestion > 0 && (
                        <button className="btn btn-ghost" onClick={handleBack}>
                            ← Back
                        </button>
                    )}
                    <button className="btn btn-ghost" onClick={onClose}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}

export default QuestionnaireModal;
