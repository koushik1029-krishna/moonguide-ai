export const STORAGE_KEYS = {
  chat: "moonguide.chat",
  feedback: "moonguide.feedback",
  role: "moonguide.role",
  managerUnlock: "moonguide.managerUnlocked"
};

export const DEMO_MANAGER_PIN = "1234";

export const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant",
  answer:
    "Hello. I am MoonGuide AI, a customer-assistance prototype for Moon's Food Store. I can share approved sample information about hours, location, products, services, and EBT/SNAP. Assistant responses may be incomplete or incorrect and are not guaranteed facts. I cannot approve age-restricted sales, check identification, set prices, or give legal advice, and I cannot replace a legally required ID check. If you need a person to review your question, please speak with a trained employee. Staff and managers can also review questions that need a human decision.",
  sourceCategory: "Welcome",
  lastUpdated: null,
  needsReview: false,
  restricted: false,
  supported: true,
  createdAt: null
};

export const SUGGESTED_QUESTIONS = [
  "What time does the store close?",
  "Where is Moon's Food Store located?",
  "Does the store have an ATM?",
  "Does the store accept EBT?",
  "Does the store sell frozen food?",
  "Does the store provide delivery?",
  "What services are available?",
  "What products does the store sell?"
];

export const LIMITATIONS = [
  "Assistant responses may be incomplete or incorrect and are not guaranteed facts. Confirm important details with a store employee.",
  "Answers come only from approved sample store information.",
  "Restricted-sale decisions and legally required identification checks must be completed in person by a trained employee. This assistant cannot replace ID verification.",
  "Prices, inventory, eligibility, and legal advice are not invented.",
  "This browser may store your questions locally for this classroom demo. Do not enter names, payment details, or other personal information.",
  "Amazon Bedrock, OpenSearch, Cognito, and other enterprise services are not implemented in this prototype."
];
