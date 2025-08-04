//chatbot.ts
interface KeywordResponse {
  keywords: string[];
  response: string;
}

const responses: KeywordResponse[] = [
  {
    keywords: ['fever', 'temperature', 'hot', 'chills'],
    response: 'For fever, rest and stay hydrated. Take acetaminophen or ibuprofen as directed. If fever exceeds 102°F (38.9°C) or persists for more than 3 days, please consult a doctor immediately.'
  },
  {
    keywords: ['cough', 'coughing', 'throat'],
    response: 'For persistent cough, try warm liquids and honey. Avoid irritants like smoke. If cough produces blood, worsens, or lasts more than 2 weeks, please schedule an appointment with a doctor.'
  },
  {
    keywords: ['headache', 'head pain', 'migraine'],
    response: 'For headaches, ensure adequate hydration and rest in a quiet, dark room. Gentle neck stretches may help. If headaches are severe, frequent, or accompanied by vision changes, please seek medical attention.'
  },
  {
    keywords: ['stomach', 'nausea', 'vomiting', 'digestive'],
    response: 'For stomach issues, try the BRAT diet (bananas, rice, applesauce, toast) and stay hydrated with clear fluids. If symptoms persist for more than 24 hours or you have severe pain, consult a healthcare provider.'
  },
  {
    keywords: ['pain', 'ache', 'hurt', 'sore'],
    response: 'For general pain, rest the affected area and apply ice for acute injuries or heat for muscle tension. Over-the-counter pain relievers can help. If pain is severe or doesn\'t improve, please book an appointment.'
  },
  {
    keywords: ['cold', 'flu', 'runny nose', 'congestion'],
    response: 'For cold symptoms, get plenty of rest, drink fluids, and use a humidifier. Saline nasal rinses can help with congestion. If symptoms worsen or last more than 10 days, consider seeing a doctor.'
  },
  {
    keywords: ['allergies', 'allergy', 'sneezing', 'itchy'],
    response: 'For allergies, identify and avoid triggers when possible. Antihistamines can provide relief. If you experience difficulty breathing or severe reactions, seek immediate medical care.'
  },
  {
    keywords: ['appointment', 'book', 'schedule', 'doctor'],
    response: 'I can help you understand symptoms, but for proper diagnosis and treatment, please book an appointment with one of our qualified doctors using the appointment booking feature.'
  },
  {
    keywords: ['emergency', 'urgent', 'serious', 'severe'],
    response: 'If this is a medical emergency, please call 911 immediately or go to your nearest emergency room. For urgent but non-emergency care, consider visiting an urgent care center.'
  }
];

export const getChatbotResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  for (const responseObj of responses) {
    if (responseObj.keywords.some(keyword => lowerMessage.includes(keyword))) {
      return responseObj.response;
    }
  }
  
  return "I understand you're looking for medical guidance. While I can provide general health information, I recommend booking an appointment with one of our doctors for personalized medical advice. Is there a specific symptom I can help you understand better?";
};