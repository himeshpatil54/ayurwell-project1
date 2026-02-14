

# Ayurvedic AI Wellness Chat

A calming, mobile-first wellness chat application with an earthy Ayurvedic aesthetic, designed for Indian users seeking holistic lifestyle guidance.

---

## 🎨 Design System

**Color Palette:**
- Primary Green: Sage/Ayurveda green (#5B7B5A)
- Warm Beige: Soft background (#F5F0E8)
- Earth Brown: Text and accents (#8B7355)
- Cream White: Chat bubbles (#FDF9F3)
- Soft Gold: Highlights (#C9A86C)

**Visual Style:**
- Rounded chat bubbles with soft shadows
- Leaf icon (🌿) for AI avatar
- Subtle gradient backgrounds
- Clean, readable fonts
- Smooth animations for typing indicators

---

## 📄 Page 1: Landing Page

**Header Section:**
- App logo with lotus/leaf icon
- Heading: "AI-Assisted Ayurvedic Wellness Chat"
- Subheading explaining the wellness guidance concept

**Hero Section:**
- Calming illustration area (subtle pattern background)
- Three feature highlights with icons:
  - 🌿 Personalized Dosha Insights
  - 🍵 Diet & Lifestyle Guidance  
  - 🧘 Mind & Stress Management

**Call to Action:**
- Prominent "Start Your Wellness Journey" button
- Leads to chat interface

**Footer:**
- Disclaimer text about educational nature of content

---

## 💬 Page 2: Chat Interface

**Chat Container:**
- Full-screen chat experience
- Smooth auto-scrolling to latest messages
- Message history loaded from localStorage

**Message Bubbles:**
- User messages: Right-aligned, earth-toned
- AI messages: Left-aligned with leaf icon avatar
- Structured AI responses with expandable sections:
  - Dosha Insight card
  - Dinacharya (Daily Routine) section
  - Diet Guidance section
  - Herbal Information section
  - Stress & Mind Management section

**Input Area:**
- Fixed at bottom (mobile-friendly)
- Large text input with placeholder: "Describe your symptoms, digestion, sleep, stress, and daily routine..."
- Send button with leaf icon
- Typing indicator animation when AI is "thinking"

**Persistent Disclaimer:**
- Small, always-visible text below input
- Educational wellness disclaimer

---

## 🛠 Components to Build

1. **AyurvedicTheme** - Custom Tailwind colors and styles
2. **ChatBubble** - Reusable message component
3. **WellnessCard** - Structured response sections (Dosha, Diet, etc.)
4. **TypingIndicator** - Animated dots during AI response
5. **ChatInput** - Input field with send button
6. **ChatContainer** - Main chat logic and localStorage persistence
7. **LandingPage** - Welcome screen with CTA
8. **ChatPage** - Full chat experience

---

## 📱 Mobile-First Features

- Touch-friendly large buttons and inputs
- Smooth keyboard handling
- Responsive layout that works on all screen sizes
- Optimized scrolling performance

---

## 🔌 AI Integration Ready

The chat will be structured with:
- Message history management
- API call placeholder (ready for Lovable AI)
- Mock responses demonstrating the structured wellness format
- Easy integration path when you're ready to connect real AI

