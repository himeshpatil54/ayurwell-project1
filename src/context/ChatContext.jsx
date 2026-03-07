// Chat Context - Manages conversation state and Ayurvedic chatbot logic
// ALL symptom/health queries go to Supabase KB first
import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { demoStorage } from '../lib/supabase';
import { searchKnowledgeBase, formatKBResponse, logChatMessage } from '../lib/knowledgeBase';
import { calculateDoshaFromQuestionnaire } from '../lib/doshaCalculator';
import { generateReport, formatReportForChat } from '../lib/reportGenerator';
import routinesData from '../data/routines.json';
import dietData from '../data/dietRecommendations.json';
import yogaData from '../data/yogaPractices.json';
import prakritiQuestions from '../data/prakritiQuestions.json';
import herbsData from '../data/herbs.json';

const ChatContext = createContext(null);
const SESSION_ID = `session_${Date.now()}`;

// ========== SIMPLE INTENT DETECTION (no symptomMapper dependency) ==========

function detectSimpleIntent(text) {
    const t = text.toLowerCase().trim();

    // Greetings
    const greetings = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening', 'howdy', 'hola', 'yo'];
    if (greetings.some(g => t === g || t.startsWith(g + ' ') || t.startsWith(g + '!') || t.startsWith(g + ','))) {
        return 'greeting';
    }

    // Identity
    const identity = ['who are you', 'what are you', 'your name', 'what is ayurwell', 'about ayurwell', 'what can you do', 'introduce yourself', 'are you a bot', 'are you ai'];
    if (identity.some(k => t.includes(k))) return 'identity';

    // Emergency
    const emergency = ['suicide', 'suicidal', 'kill myself', 'want to die', 'heart attack', 'call 911', 'emergency', 'seizure', 'stroke', 'cant breathe', 'severe bleeding'];
    if (emergency.some(k => t.includes(k))) return 'emergency';

    // Thanks (short messages only)
    const thanks = ['thank you', 'thanks', 'thank', 'appreciate', 'that helps', 'helpful', 'great advice'];
    if (t.length < 50 && thanks.some(k => t.includes(k))) return 'thanks';

    // Goodbye
    const bye = ['bye', 'goodbye', 'see you', 'take care', 'good night', 'gotta go', 'quit', 'exit'];
    if (bye.some(k => t === k || t.startsWith(k + ' '))) return 'goodbye';

    // Prakriti
    const prakriti = ['prakriti', 'prakruti', 'constitution', 'body type', 'my dosha', 'what dosha', 'assessment', 'questionnaire'];
    if (prakriti.some(k => t.includes(k))) return 'prakriti';

    // Routine
    const routine = ['routine', 'daily routine', 'dinacharya', 'daily schedule'];
    if (routine.some(k => t.includes(k))) return 'routine';

    // Diet
    const diet = ['diet', 'food', 'what to eat', 'nutrition', 'meal plan', 'ahara'];
    if (diet.some(k => t.includes(k))) return 'diet';

    // Yoga
    const yoga = ['yoga', 'pranayama', 'breathing exercise', 'meditation', 'asana'];
    if (yoga.some(k => t.includes(k))) return 'yoga';

    // Everything else → search KB
    return 'search_kb';
}

function extractDosha(text) {
    const t = text.toLowerCase();
    if (t.includes('vata')) return 'vata';
    if (t.includes('pitta')) return 'pitta';
    if (t.includes('kapha')) return 'kapha';
    return null;
}

// ========== PROVIDER ==========

export function ChatProvider({ children }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [questionnaire, setQuestionnaire] = useState({
        active: false,
        currentQuestion: 0,
        answers: []
    });
    const [lastAnalysis, setLastAnalysis] = useState(null);
    const [feedbackState, setFeedbackState] = useState({});

    // Load chat history (with version check to clear stale cached responses)
    useEffect(() => {
        const CHAT_VERSION = 'v2_supabase_kb'; // Bump this to invalidate old cache
        const savedVersion = localStorage.getItem('ayurveda_chat_version');

        if (savedVersion !== CHAT_VERSION) {
            // Old cache from before the fix — clear it
            console.log('[Chat] Clearing old cached chat history (version mismatch)');
            demoStorage.clearChatHistory();
            localStorage.setItem('ayurveda_chat_version', CHAT_VERSION);
        }

        const saved = demoStorage.getChatHistory();
        if (saved.length > 0) {
            setMessages(saved);
        } else {
            setMessages([{
                id: Date.now(),
                role: 'assistant',
                content: "Namaste 🙏 Welcome to AYURWELL!\n\nI'm your Ayurvedic wellness companion. Tell me any symptom or health concern and I'll look up guidance from our knowledge base.\n\nYou can also:\n- 📋 Say \"Prakriti\" for a constitution assessment\n- 🍽️ Ask about diet for any dosha\n- 🧘 Ask about yoga and pranayama\n- 🌿 Ask about Ayurvedic herbs\n\nHow are you feeling today? 😊",
                timestamp: new Date().toISOString()
            }]);
        }
    }, []);

    useEffect(() => {
        if (messages.length > 0) demoStorage.saveChatHistory(messages);
    }, [messages]);

    const addMessage = useCallback((role, content) => {
        const msg = {
            id: Date.now() + Math.random(),
            role,
            content,
            timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, msg]);
        logChatMessage(SESSION_ID, role, content);
        return msg;
    }, []);

    const simulateTyping = (min = 400, max = 800) =>
        new Promise(r => setTimeout(r, Math.random() * (max - min) + min));

    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // ========== HANDLERS ==========

    const handleGreeting = async () => {
        setIsTyping(true);
        await simulateTyping(300, 600);
        addMessage('assistant', pick([
            "Hello! 😊 I'm AyurWell, your Ayurvedic wellness guide. How can I help you with your health today?",
            "Hi there! 🙏 Welcome to AyurWell. Tell me what's bothering you — or ask me about any health topic!",
            "Hey! 🌿 I'm AyurWell. Feel free to share any symptoms or ask about Ayurvedic remedies. I'm here to help!",
            "Namaste! 😊 I'm AyurWell. You can tell me any symptom like headache, stress, or fatigue — and I'll find Ayurvedic guidance for you!",
            "Hello! Welcome to AyurWell 🌿 Just type any symptom or health concern and I'll look it up for you!"
        ]));
        setIsTyping(false);
    };

    const handleIdentity = async () => {
        setIsTyping(true);
        await simulateTyping(300, 600);
        addMessage('assistant',
            "I'm **AyurWell** 🌿 — your friendly Ayurvedic wellness assistant!\n\n" +
            "I look up Ayurvedic guidance from our knowledge base. Just tell me any symptom (like *headache*, *stress*, *fatigue*) and I'll show you:\n" +
            "- Which dosha is involved\n- Herbal remedies\n- Diet recommendations\n- Yoga practices\n- Lifestyle tips\n\n" +
            "Everything I share comes from our verified Ayurvedic database. How can I help? 😊"
        );
        setIsTyping(false);
    };

    const handleEmergency = async () => {
        setIsTyping(true);
        await simulateTyping(200, 400);
        addMessage('assistant',
            "🚨 **This sounds like a medical emergency.**\n\n" +
            "Please **call your local emergency number immediately** (112 / 911 / 108).\n\n" +
            "I'm an Ayurvedic wellness guide and cannot provide emergency medical help.\n\n" +
            "**Helplines:**\n- **iCall:** 9152987821\n- **Vandrevala Foundation:** 1860-2662-345"
        );
        setIsTyping(false);
    };

    const handleThanks = async () => {
        setIsTyping(true);
        await simulateTyping(200, 500);
        addMessage('assistant', pick([
            "You're welcome! 😊 Feel free to ask me anything else about your wellness!",
            "Happy to help! 🙏 I'm here whenever you need guidance.",
            "Glad I could help! 🌿 Take care of yourself!",
            "You're welcome! 😊 Stay healthy and don't hesitate to come back anytime!"
        ]));
        setIsTyping(false);
    };

    const handleGoodbye = async () => {
        setIsTyping(true);
        await simulateTyping(200, 500);
        addMessage('assistant', pick([
            "Goodbye! 🙏 Take care and stay well. Come back anytime!",
            "Bye! 🌿 Wishing you health and balance. See you next time! 😊",
            "Take care! 🙏 Remember, small daily habits make a big difference. Namaste!"
        ]));
        setIsTyping(false);
    };

    // ========== KB SEARCH — THE MAIN HANDLER ==========
    // This handles ALL symptom/health queries by searching Supabase directly
    const handleKBSearch = async (message) => {
        setIsTyping(true);
        await simulateTyping(500, 900);

        console.log('[Chat] handleKBSearch called — querying Supabase for:', message);
        const kbResult = await searchKnowledgeBase(message);
        console.log('[Chat] Supabase KB returned:', kbResult.results.length, 'results, confidence:', kbResult.confidence, 'source:', kbResult.source);

        if (kbResult.results.length > 0 && kbResult.confidence >= 0.3) {
            // Found data from Supabase!
            console.log('[Chat] Showing Supabase results for:', message);
            const formatted = formatKBResponse(kbResult.results, message);
            const intros = [
                "Great question! Here's what our Ayurvedic knowledge base says:\n\n",
                "I looked that up for you! Here's what I found:\n\n",
                "Here's some Ayurvedic guidance from our knowledge base:\n\n",
                "I found some helpful information for you! 😊\n\n"
            ];
            const intro = intros[Math.floor(Math.random() * intros.length)];
            addMessage('assistant', `${intro}${formatted}`);
        } else {
            // No match in KB — friendly fallback
            console.log('[Chat] No Supabase results for:', message);
            addMessage('assistant',
                "I could not find verified information for that symptom in the AyurWell knowledge base. 😊\n\n" +
                "Try describing your concern with common symptom names like:\n" +
                "- **headache**, **anxiety**, **stress**, **fatigue**\n" +
                "- **insomnia**, **acidity**, **bloating**, **constipation**\n" +
                "- **skin problems**, **hair loss**, **joint pain**, **back pain**\n" +
                "- **depression**, **weight gain**, **congestion**, **nausea**\n\n" +
                "Or ask about **diet**, **yoga**, **daily routine**, or **Prakriti assessment**!"
            );
        }

        setIsTyping(false);
    };

    // ========== PRAKRITI QUESTIONNAIRE ==========
    const startQuestionnaire = async () => {
        setQuestionnaire({ active: true, currentQuestion: 0, answers: [] });
        setIsTyping(true);
        await simulateTyping(300, 600);

        const q = prakritiQuestions[0];
        let response = `Great! Let's discover your Prakriti 🌿\n\n**Question 1 of 15:**\n${q.question}\n\n`;
        q.options.forEach((opt, i) => { response += `${i + 1}. ${opt.text}\n`; });
        response += `\nReply with **1**, **2**, or **3**.`;
        addMessage('assistant', response);
        setIsTyping(false);
    };

    const handleQuestionnaireAnswer = async (answerIndex) => {
        const { currentQuestion, answers } = questionnaire;
        const newAnswers = [...answers, {
            questionId: prakritiQuestions[currentQuestion].id,
            optionIndex: answerIndex
        }];

        if (currentQuestion + 1 >= prakritiQuestions.length) {
            setQuestionnaire({ active: false, currentQuestion: 0, answers: [] });
            setIsTyping(true);
            await simulateTyping(700, 1100);

            const scores = calculateDoshaFromQuestionnaire(newAnswers, prakritiQuestions);
            const report = generateReport(scores, []);
            setLastAnalysis(report);
            demoStorage.saveReport({ type: 'prakriti', scores, report });
            demoStorage.savePrakriti(scores);
            addMessage('assistant', formatReportForChat(report));
            setIsTyping(false);
        } else {
            const nextQ = currentQuestion + 1;
            setQuestionnaire({ active: true, currentQuestion: nextQ, answers: newAnswers });
            setIsTyping(true);
            await simulateTyping(200, 400);

            const q = prakritiQuestions[nextQ];
            let response = `**Question ${nextQ + 1} of 15:**\n${q.question}\n\n`;
            q.options.forEach((opt, i) => { response += `${i + 1}. ${opt.text}\n`; });
            addMessage('assistant', response);
            setIsTyping(false);
        }
    };

    // ========== ROUTINE / DIET / YOGA ==========
    const handleRoutine = async (text) => {
        setIsTyping(true);
        await simulateTyping();
        const dosha = extractDosha(text) || 'vata';
        const routine = routinesData[dosha];
        const label = dosha.charAt(0).toUpperCase() + dosha.slice(1);

        let r = `Here's a daily routine for **${label}** balance 🌅\n\n`;
        r += `**Morning** *(${routine.morning.wakeUp})*\n`;
        routine.morning.practices.slice(0, 4).forEach(p => { r += `- ${p}\n`; });
        r += `\n**Afternoon**\n`;
        routine.afternoon.practices.slice(0, 3).forEach(p => { r += `- ${p}\n`; });
        r += `\n**Evening**\n`;
        routine.evening.practices.slice(0, 3).forEach(p => { r += `- ${p}\n`; });
        r += `\nWant **diet** or **yoga** recommendations too? 😊`;
        addMessage('assistant', r);
        setIsTyping(false);
    };

    const handleDiet = async (text) => {
        setIsTyping(true);
        await simulateTyping();
        const dosha = extractDosha(text) || 'vata';
        const diet = dietData[dosha];
        const label = dosha.charAt(0).toUpperCase() + dosha.slice(1);

        let r = `Here's the **${label}** diet guide 🍽️\n\n`;
        r += `**Qualities to favor:** ${diet.qualities}\n\n`;
        r += `**Eat more:**\n`;
        diet.favor.slice(0, 5).forEach(f => { r += `- ${f}\n`; });
        r += `\n**Eat less:**\n`;
        diet.avoid.slice(0, 4).forEach(f => { r += `- ${f}\n`; });
        r += `\n**Meal timing:**\n- 🌅 ${diet.mealTiming.breakfast}\n- ☀️ ${diet.mealTiming.lunch}\n- 🌙 ${diet.mealTiming.dinner}\n`;
        r += `\nNeed **yoga** or **routine** tips too? 😊`;
        addMessage('assistant', r);
        setIsTyping(false);
    };

    const handleYoga = async (text) => {
        setIsTyping(true);
        await simulateTyping();
        const dosha = extractDosha(text) || 'vata';
        const yoga = yogaData[dosha];
        const label = dosha.charAt(0).toUpperCase() + dosha.slice(1);

        let r = `Here's yoga for **${label}** balance 🧘\n\n`;
        r += `**Focus:** ${yoga.focus}\n\n**Poses:**\n`;
        yoga.poses.slice(0, 4).forEach(p => { r += `- **${p.name}** — ${p.benefit}\n`; });
        r += `\n**Pranayama:**\n`;
        yoga.pranayama.forEach(p => { r += `- **${p.name}** — ${p.benefit}\n`; });
        r += `\n*Listen to your body and practice mindfully* 🙏`;
        addMessage('assistant', r);
        setIsTyping(false);
    };

    // ========== FEEDBACK ==========
    const submitFeedback = useCallback((messageId, rating) => {
        setFeedbackState(prev => ({ ...prev, [messageId]: rating }));
        try {
            const existing = JSON.parse(localStorage.getItem('ayurveda_feedback') || '[]');
            existing.push({ messageId, rating, timestamp: new Date().toISOString() });
            localStorage.setItem('ayurveda_feedback', JSON.stringify(existing));
        } catch (e) { /* ignore */ }
    }, []);

    // ========== MAIN MESSAGE HANDLER ==========
    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;
        addMessage('user', text);

        // Questionnaire mode
        if (questionnaire.active) {
            const num = parseInt(text.trim());
            if (num >= 1 && num <= 3) {
                await handleQuestionnaireAnswer(num - 1);
            } else {
                setIsTyping(true);
                await simulateTyping(200, 400);
                addMessage('assistant', "Please reply with **1**, **2**, or **3**. 😊");
                setIsTyping(false);
            }
            return;
        }

        // Simple intent detection
        const intent = detectSimpleIntent(text);
        console.log('[Chat] Intent:', intent, 'for:', text);

        switch (intent) {
            case 'greeting': await handleGreeting(); break;
            case 'identity': await handleIdentity(); break;
            case 'emergency': await handleEmergency(); break;
            case 'thanks': await handleThanks(); break;
            case 'goodbye': await handleGoodbye(); break;
            case 'prakriti': await startQuestionnaire(); break;
            case 'routine': await handleRoutine(text); break;
            case 'diet': await handleDiet(text); break;
            case 'yoga': await handleYoga(text); break;
            case 'search_kb':
            default:
                // THIS IS THE KEY: all symptom/health/general queries go to KB
                await handleKBSearch(text);
                break;
        }
    }, [questionnaire]);

    // Clear chat
    const clearChat = useCallback(() => {
        setMessages([{
            id: Date.now(),
            role: 'assistant',
            content: "Chat cleared! 🌿 How can I help you today?",
            timestamp: new Date().toISOString()
        }]);
        setQuestionnaire({ active: false, currentQuestion: 0, answers: [] });
        demoStorage.clearChatHistory();
    }, []);

    return (
        <ChatContext.Provider value={{
            messages, isTyping, sendMessage, clearChat,
            questionnaire, startQuestionnaire, lastAnalysis,
            feedbackState, submitFeedback
        }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useChat() {
    const context = useContext(ChatContext);
    if (!context) throw new Error('useChat must be used within a ChatProvider');
    return context;
}

export default ChatContext;
