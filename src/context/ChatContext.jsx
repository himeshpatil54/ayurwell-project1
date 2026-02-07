// Chat Context - Manages conversation state and Ayurvedic chatbot logic
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { demoStorage } from '../lib/supabase';
import { detectIntent, extractSymptoms } from '../lib/symptomMapper';
import { calculateDoshaFromSymptoms, calculateDoshaFromQuestionnaire, getDominantDosha } from '../lib/doshaCalculator';
import { generateReport, formatReportForChat } from '../lib/reportGenerator';
import routinesData from '../data/routines.json';
import dietData from '../data/dietRecommendations.json';
import yogaData from '../data/yogaPractices.json';
import prakritiQuestions from '../data/prakritiQuestions.json';

const ChatContext = createContext(null);

// Greeting responses
const GREETING_RESPONSES = [
    "Hi 😊 How can I help you today?",
    "Hello! Welcome to your Ayurvedic wellness journey. How are you feeling today?",
    "Namaste 🙏 I'm here to support your wellness. What brings you here?",
    "Hi there! How can I support your wellness today?",
    "Hello! I'm your AYURWELL wellness guide. Feel free to share how you're feeling, or ask me anything about Ayurveda."
];

// Empathetic lead-ins
const EMPATHY_RESPONSES = [
    "Thank you for sharing that with me. I understand how challenging that can be. ",
    "I appreciate you opening up about this. Let's explore what might help. ",
    "I hear you, and I want to help. ",
    "That sounds difficult. Let's see how Ayurveda can support you. "
];

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [collectedSymptoms, setCollectedSymptoms] = useState([]);
    const [questionnaire, setQuestionnaire] = useState({
        active: false,
        currentQuestion: 0,
        answers: []
    });
    const [lastAnalysis, setLastAnalysis] = useState(null);

    // Load chat history on mount
    useEffect(() => {
        const savedMessages = demoStorage.getChatHistory();
        if (savedMessages.length > 0) {
            setMessages(savedMessages);
        } else {
            // Add welcome message
            setMessages([{
                id: Date.now(),
                role: 'assistant',
                content: "Namaste 🙏 Welcome to AYURWELL!\n\nI'm here to help you understand your unique constitution (Prakriti), explore any imbalances, and provide personalized wellness guidance based on classical Ayurveda principles.\n\nYou can:\n- Share how you're feeling or any symptoms\n- Ask for a Prakriti (constitution) analysis\n- Get diet, routine, or yoga recommendations\n\nHow may I support your wellness journey today?",
                timestamp: new Date().toISOString()
            }]);
        }
    }, []);

    // Save messages when they change
    useEffect(() => {
        if (messages.length > 0) {
            demoStorage.saveChatHistory(messages);
        }
    }, [messages]);

    // Add a message to the chat
    const addMessage = useCallback((role, content) => {
        const message = {
            id: Date.now(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, message]);
        return message;
    }, []);

    // Simulate typing delay for natural feel
    const simulateTyping = (minMs = 800, maxMs = 1500) => {
        return new Promise(resolve => {
            const delay = Math.random() * (maxMs - minMs) + minMs;
            setTimeout(resolve, delay);
        });
    };

    // Get random response from array
    const getRandomResponse = (responses) => {
        return responses[Math.floor(Math.random() * responses.length)];
    };

    // Handle greeting
    const handleGreeting = async () => {
        setIsTyping(true);
        await simulateTyping(500, 1000);
        addMessage('assistant', getRandomResponse(GREETING_RESPONSES));
        setIsTyping(false);
    };

    // Handle symptom collection
    const handleSymptoms = async (symptoms, hasDistress) => {
        setIsTyping(true);
        await simulateTyping();

        // Add new symptoms to collection
        const newSymptoms = [...collectedSymptoms];
        symptoms.forEach(s => {
            if (!newSymptoms.find(cs => cs.id === s.id)) {
                newSymptoms.push(s);
            }
        });
        setCollectedSymptoms(newSymptoms);

        let response = '';
        if (hasDistress) {
            response = getRandomResponse(EMPATHY_RESPONSES);
        }

        // Acknowledge the symptoms and ask follow-up
        const symptomNames = symptoms.map(s => s.name.toLowerCase()).join(', ');
        response += `I notice you mentioned ${symptomNames}. `;

        if (newSymptoms.length < 3) {
            response += `To give you a more complete picture, could you share if you're experiencing any other symptoms? For example:\n\n`;
            response += `- Sleep quality (difficulty sleeping, oversleeping)\n`;
            response += `- Digestion (bloating, acidity, irregular appetite)\n`;
            response += `- Energy levels (fatigue, restlessness)\n`;
            response += `- Skin or hair concerns\n\n`;
            response += `Or if you'd like, I can analyze what we have so far and suggest a Prakriti questionnaire for a more comprehensive assessment.`;
        } else {
            // We have enough symptoms, offer analysis
            const scores = calculateDoshaFromSymptoms(newSymptoms);
            const dominant = getDominantDosha(scores);

            response += `Based on the symptoms you've shared, there seems to be a ${dominant.primary || dominant.type} tendency.\n\n`;
            response += `Would you like me to:\n`;
            response += `1. **Provide immediate recommendations** based on these symptoms\n`;
            response += `2. **Take the Prakriti questionnaire** for a comprehensive constitution analysis\n\n`;
            response += `Just let me know, or type "analyze" for immediate guidance.`;
        }

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Handle Prakriti questionnaire request
    const startQuestionnaire = async () => {
        setQuestionnaire({
            active: true,
            currentQuestion: 0,
            answers: []
        });

        setIsTyping(true);
        await simulateTyping(500, 800);

        const question = prakritiQuestions[0];
        let response = `Great! Let's discover your Prakriti (constitution). I'll ask you 15 questions about your natural tendencies.\n\n`;
        response += `**Question 1 of 15:**\n${question.question}\n\n`;
        question.options.forEach((opt, idx) => {
            response += `${idx + 1}. ${opt.text}\n`;
        });
        response += `\nReply with the number of your choice (1, 2, or 3).`;

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Handle questionnaire answer
    const handleQuestionnaireAnswer = async (answerIndex) => {
        const { currentQuestion, answers } = questionnaire;
        const newAnswers = [...answers, {
            questionId: prakritiQuestions[currentQuestion].id,
            optionIndex: answerIndex
        }];

        if (currentQuestion + 1 >= prakritiQuestions.length) {
            // Questionnaire complete
            setQuestionnaire({ active: false, currentQuestion: 0, answers: [] });

            setIsTyping(true);
            await simulateTyping(1000, 1500);

            const questionnaireScores = calculateDoshaFromQuestionnaire(newAnswers, prakritiQuestions);
            let finalScores = questionnaireScores;

            // Combine with symptom scores if available
            if (collectedSymptoms.length > 0) {
                const symptomScores = calculateDoshaFromSymptoms(collectedSymptoms);
                finalScores = {
                    vata: Math.round((symptomScores.vata * 0.4 + questionnaireScores.vata * 0.6) * 10) / 10,
                    pitta: Math.round((symptomScores.pitta * 0.4 + questionnaireScores.pitta * 0.6) * 10) / 10,
                    kapha: Math.round((symptomScores.kapha * 0.4 + questionnaireScores.kapha * 0.6) * 10) / 10
                };
            }

            const report = generateReport(finalScores, collectedSymptoms.map(s => s.name));
            setLastAnalysis(report);

            // Save report
            demoStorage.saveReport({
                type: 'prakriti',
                scores: finalScores,
                symptoms: collectedSymptoms.map(s => s.name),
                report
            });
            demoStorage.savePrakriti(finalScores);

            const formattedReport = formatReportForChat(report);
            addMessage('assistant', formattedReport);
            setIsTyping(false);
        } else {
            // Next question
            const nextQ = currentQuestion + 1;
            setQuestionnaire({
                active: true,
                currentQuestion: nextQ,
                answers: newAnswers
            });

            setIsTyping(true);
            await simulateTyping(300, 600);

            const question = prakritiQuestions[nextQ];
            let response = `**Question ${nextQ + 1} of 15:**\n${question.question}\n\n`;
            question.options.forEach((opt, idx) => {
                response += `${idx + 1}. ${opt.text}\n`;
            });

            addMessage('assistant', response);
            setIsTyping(false);
        }
    };

    // Handle routine request
    const handleRoutineRequest = async (dosha) => {
        setIsTyping(true);
        await simulateTyping();

        const targetDosha = dosha || lastAnalysis?.prakriti?.type?.toLowerCase().split('-')[0] || 'vata';
        const routine = routinesData[targetDosha];

        let response = `## 🌅 ${routine.name}\n\n`;
        response += `**Morning Routine:**\n`;
        response += `*Wake up: ${routine.morning.wakeUp}*\n\n`;
        routine.morning.practices.forEach(p => {
            response += `- ${p}\n`;
        });
        response += `\n**Afternoon:**\n`;
        routine.afternoon.practices.forEach(p => {
            response += `- ${p}\n`;
        });
        response += `\n**Evening:**\n`;
        routine.evening.practices.forEach(p => {
            response += `- ${p}\n`;
        });
        response += `\n---\n*Would you like diet recommendations or yoga practices for ${targetDosha.charAt(0).toUpperCase() + targetDosha.slice(1)} balance?*`;

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Handle diet request
    const handleDietRequest = async (dosha) => {
        setIsTyping(true);
        await simulateTyping();

        const targetDosha = dosha || lastAnalysis?.prakriti?.type?.toLowerCase().split('-')[0] || 'vata';
        const diet = dietData[targetDosha];

        let response = `## 🍽️ ${diet.name}\n\n`;
        response += `**Qualities to favor:** ${diet.qualities}\n\n`;
        response += `**Foods to Include:**\n`;
        diet.favor.slice(0, 6).forEach(f => {
            response += `- ${f}\n`;
        });
        response += `\n**Foods to Limit:**\n`;
        diet.avoid.slice(0, 5).forEach(f => {
            response += `- ${f}\n`;
        });
        response += `\n**Meal Timing:**\n`;
        response += `- Breakfast: ${diet.mealTiming.breakfast}\n`;
        response += `- Lunch: ${diet.mealTiming.lunch}\n`;
        response += `- Dinner: ${diet.mealTiming.dinner}\n`;
        response += `\n---\n*Would you like routine or yoga recommendations for ${targetDosha.charAt(0).toUpperCase() + targetDosha.slice(1)} balance?*`;

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Handle yoga request
    const handleYogaRequest = async (dosha) => {
        setIsTyping(true);
        await simulateTyping();

        const targetDosha = dosha || lastAnalysis?.prakriti?.type?.toLowerCase().split('-')[0] || 'vata';
        const yoga = yogaData[targetDosha];

        let response = `## 🧘 ${yoga.name}\n\n`;
        response += `**Focus:** ${yoga.focus}\n\n`;
        response += `**Recommended Poses:**\n`;
        yoga.poses.slice(0, 5).forEach(pose => {
            response += `- **${pose.name}**: ${pose.benefit}\n`;
        });
        response += `\n**Pranayama (Breathing):**\n`;
        yoga.pranayama.forEach(p => {
            response += `- **${p.name}**: ${p.benefit}\n`;
        });
        response += `\n**Practice Guidelines:**\n`;
        yoga.guidelines.slice(0, 3).forEach(g => {
            response += `- ${g}\n`;
        });
        response += `\n---\n*Remember to practice mindfully and listen to your body.*`;

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Handle general/unknown input
    const handleGeneral = async (message) => {
        setIsTyping(true);
        await simulateTyping();

        // Check for "analyze" keyword
        if (message.toLowerCase().includes('analyze') && collectedSymptoms.length > 0) {
            const scores = calculateDoshaFromSymptoms(collectedSymptoms);
            const report = generateReport(scores, collectedSymptoms.map(s => s.name));
            setLastAnalysis(report);

            demoStorage.saveReport({
                type: 'symptom-analysis',
                scores,
                symptoms: collectedSymptoms.map(s => s.name),
                report
            });

            addMessage('assistant', formatReportForChat(report));
            setIsTyping(false);
            return;
        }

        // Generic helpful response
        let response = "I'd love to help you with your Ayurvedic wellness journey! Here are some ways I can assist:\n\n";
        response += "🔍 **Prakriti Analysis** - Say \"Analyze my Prakriti\" to discover your constitution\n\n";
        response += "💭 **Share Symptoms** - Tell me how you're feeling (e.g., \"I feel tired and anxious\")\n\n";
        response += "🌅 **Daily Routine** - Ask for a routine for any dosha (e.g., \"Vata daily routine\")\n\n";
        response += "🍽️ **Diet Guidance** - Ask about diet (e.g., \"Diet for Pitta balance\")\n\n";
        response += "🧘 **Yoga & Pranayama** - Get yoga recommendations (e.g., \"Yoga for Kapha\")\n\n";
        response += "What would you like to explore?";

        addMessage('assistant', response);
        setIsTyping(false);
    };

    // Main message handler
    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;

        // Add user message
        addMessage('user', text);

        // Check if in questionnaire mode
        if (questionnaire.active) {
            const num = parseInt(text.trim());
            if (num >= 1 && num <= 3) {
                await handleQuestionnaireAnswer(num - 1);
                return;
            } else {
                setIsTyping(true);
                await simulateTyping(300, 500);
                addMessage('assistant', "Please reply with 1, 2, or 3 to choose your answer.");
                setIsTyping(false);
                return;
            }
        }

        // Detect intent
        const { intent, data } = detectIntent(text);

        switch (intent) {
            case 'greeting':
                await handleGreeting();
                break;
            case 'prakriti':
                await startQuestionnaire();
                break;
            case 'symptoms':
                await handleSymptoms(data.symptoms, data.hasDistress);
                break;
            case 'routine':
                await handleRoutineRequest(data?.dosha);
                break;
            case 'diet':
                await handleDietRequest(data?.dosha);
                break;
            case 'yoga':
                await handleYogaRequest(data?.dosha);
                break;
            default:
                await handleGeneral(text);
        }
    }, [questionnaire, collectedSymptoms, lastAnalysis]);

    // Clear chat history
    const clearChat = useCallback(() => {
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: "Chat cleared. How can I help you with your Ayurvedic wellness today?",
            timestamp: new Date().toISOString()
        }]);
        setCollectedSymptoms([]);
        setQuestionnaire({ active: false, currentQuestion: 0, answers: [] });
        demoStorage.clearChatHistory();
    }, []);

    const value = {
        messages,
        isTyping,
        sendMessage,
        clearChat,
        questionnaire,
        startQuestionnaire,
        lastAnalysis
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
}

export default ChatContext;
