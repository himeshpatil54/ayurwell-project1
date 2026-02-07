// Supabase client configuration
// In demo mode, uses localStorage instead of actual Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://demo.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'demo-key';
const demoMode = import.meta.env.VITE_DEMO_MODE === 'true' || !import.meta.env.VITE_SUPABASE_URL;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Demo mode flag
export const isDemoMode = demoMode;

// Demo mode storage helpers
const STORAGE_KEYS = {
    USER: 'ayurveda_user',
    CHAT_HISTORY: 'ayurveda_chat_history',
    REPORTS: 'ayurveda_reports',
    PRAKRITI: 'ayurveda_prakriti'
};

export const demoStorage = {
    // User management
    getUser: () => {
        const data = localStorage.getItem(STORAGE_KEYS.USER);
        return data ? JSON.parse(data) : null;
    },

    setUser: (user) => {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    },

    clearUser: () => {
        localStorage.removeItem(STORAGE_KEYS.USER);
    },

    // Chat history
    getChatHistory: () => {
        const data = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
        return data ? JSON.parse(data) : [];
    },

    saveChatHistory: (messages) => {
        localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    },

    clearChatHistory: () => {
        localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
    },

    // Reports
    getReports: () => {
        const data = localStorage.getItem(STORAGE_KEYS.REPORTS);
        return data ? JSON.parse(data) : [];
    },

    saveReport: (report) => {
        const reports = demoStorage.getReports();
        reports.unshift({ ...report, id: Date.now(), createdAt: new Date().toISOString() });
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
        return reports[0];
    },

    deleteReport: (id) => {
        const reports = demoStorage.getReports().filter(r => r.id !== id);
        localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(reports));
    },

    // Prakriti profile
    getPrakriti: () => {
        const data = localStorage.getItem(STORAGE_KEYS.PRAKRITI);
        return data ? JSON.parse(data) : null;
    },

    savePrakriti: (prakriti) => {
        localStorage.setItem(STORAGE_KEYS.PRAKRITI, JSON.stringify(prakriti));
    }
};

export default supabase;
