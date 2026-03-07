import { Message, WellnessSection } from "./ChatBubble";

// Mock response generator for demo purposes
// This will be replaced with actual AI integration later
export const generateMockResponse = (userMessage: string): Promise<Message> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      const sections = generateWellnessSections(userMessage);
      
      resolve({
        id: Date.now().toString(),
        role: "assistant",
        content: getGreeting(userMessage),
        timestamp: new Date(),
        sections,
      });
    }, 1500 + Math.random() * 1000);
  });
};

const getGreeting = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("stress") || lowerMessage.includes("anxiety")) {
    return "I understand you're experiencing stress. Let me share some Ayurvedic wisdom to help restore your inner balance. 🌿";
  }
  
  if (lowerMessage.includes("sleep") || lowerMessage.includes("insomnia")) {
    return "Rest is essential for wellness. Here are some Ayurvedic insights to help improve your sleep quality. 🌙";
  }
  
  if (lowerMessage.includes("digest") || lowerMessage.includes("stomach") || lowerMessage.includes("bloat")) {
    return "Digestive health is the cornerstone of Ayurveda. Let me guide you with some traditional wisdom. 🍵";
  }
  
  return "Thank you for sharing. Based on Ayurvedic principles, here are some personalized wellness insights for you. 🌿";
};

const generateWellnessSections = (message: string): WellnessSection[] => {
  const lowerMessage = message.toLowerCase();
  const sections: WellnessSection[] = [];
  
  // Always include a Dosha insight
  sections.push({
    type: "dosha",
    title: "Dosha Insight",
    content: getDoshaInsight(lowerMessage),
  });
  
  // Lifestyle & Daily Routine
  sections.push({
    type: "dinacharya",
    title: "Daily Routine (Dinacharya)",
    content: getDinacharyaAdvice(lowerMessage),
  });
  
  // Diet Guidance
  sections.push({
    type: "diet",
    title: "Diet Guidance",
    content: getDietAdvice(lowerMessage),
  });
  
  // Conditionally add herbal info
  if (lowerMessage.includes("herb") || lowerMessage.includes("natural") || Math.random() > 0.5) {
    sections.push({
      type: "herbal",
      title: "Herbal Information",
      content: getHerbalInfo(lowerMessage),
    });
  }
  
  // Mind & Stress Management
  if (lowerMessage.includes("stress") || lowerMessage.includes("anxi") || lowerMessage.includes("mind") || lowerMessage.includes("peace") || Math.random() > 0.4) {
    sections.push({
      type: "mind",
      title: "Mind & Stress Management",
      content: getMindAdvice(lowerMessage),
    });
  }
  
  return sections;
};

const getDoshaInsight = (message: string): string => {
  if (message.includes("hot") || message.includes("anger") || message.includes("acid")) {
    return "Your symptoms suggest a Pitta imbalance. Pitta governs transformation and metabolism. When elevated, it can cause heat, irritation, and inflammation. Focus on cooling and calming practices.";
  }
  if (message.includes("cold") || message.includes("dry") || message.includes("anxious") || message.includes("restless")) {
    return "Your description indicates possible Vata imbalance. Vata governs movement and creativity. When disturbed, it can cause anxiety, dryness, and restlessness. Grounding and warming practices will help.";
  }
  return "Based on your description, there may be a Kapha imbalance. Kapha provides structure and stability. When excessive, it can lead to heaviness and sluggishness. Invigorating and lightening practices are recommended.";
};

const getDinacharyaAdvice = (message: string): string => {
  if (message.includes("sleep")) {
    return "Try to sleep before 10 PM when Kapha energy supports deep rest. Wake with the sun (around 6 AM). Practice abhyanga (self-massage) with warm sesame oil before bathing to calm the nervous system.";
  }
  if (message.includes("morning") || message.includes("routine")) {
    return "Start your day with warm water and lemon. Practice tongue scraping (jihwa prakshalana) to remove ama (toxins). Dedicate 15-20 minutes to gentle yoga or pranayama before breakfast.";
  }
  return "Establish regular meal times: breakfast by 8 AM, lunch (largest meal) between 12-1 PM, and light dinner by 7 PM. Take a short walk after meals to aid digestion. Wind down by 9 PM.";
};

const getDietAdvice = (message: string): string => {
  if (message.includes("digest") || message.includes("bloat")) {
    return "Favor warm, cooked foods over raw. Include digestive spices like ginger, cumin, and fennel in your meals. Sip warm water or CCF tea (cumin, coriander, fennel) throughout the day. Avoid cold drinks with meals.";
  }
  if (message.includes("energy") || message.includes("tired")) {
    return "Include iron-rich foods like dates, raisins, and green leafy vegetables. Prepare warm, nourishing meals with ghee. Avoid heavy, fried foods. Consider golden milk (turmeric milk) before bed.";
  }
  return "Eat fresh, seasonal, and locally grown foods when possible. Include all six tastes (sweet, sour, salty, bitter, pungent, astringent) in your meals for balance. Eat mindfully, without distractions.";
};

const getHerbalInfo = (message: string): string => {
  if (message.includes("stress") || message.includes("anxi")) {
    return "Ashwagandha is traditionally used as an adaptogen to support stress resilience. Brahmi may support mental clarity. These herbs are for educational purposes only—consult an Ayurvedic practitioner before use.";
  }
  if (message.includes("sleep")) {
    return "Jatamansi and Tagara are traditionally used to promote restful sleep. Warm milk with nutmeg and cardamom before bed is a gentle sleep support. Always consult a practitioner before using herbs.";
  }
  return "Triphala is a classic Ayurvedic formulation that supports digestive health and gentle detoxification. Tulsi (Holy Basil) tea is widely used for its calming and immune-supporting properties. Consult a practitioner for personalized recommendations.";
};

const getMindAdvice = (message: string): string => {
  if (message.includes("stress") || message.includes("anxi")) {
    return "Practice Nadi Shodhana (alternate nostril breathing) for 5-10 minutes daily to balance the nervous system. Consider Yoga Nidra for deep relaxation. Limit screen time, especially before bed. Spend time in nature.";
  }
  return "Begin each day with 10 minutes of meditation or pranayama. Practice gratitude before sleep. Engage in activities that bring joy (Ananda). Consider journaling to process emotions. Connect with loved ones regularly.";
};
