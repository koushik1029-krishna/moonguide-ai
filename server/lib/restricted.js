const RESTRICTED_PATTERN =
  /\b(alcohol|alcoholic|beer|beers|wine|wines|liquor|tobacco|cigarette|cigarettes|cigar|cigars|vape|vapes|vaping|e-?cig|nicotine|lottery|lotto|scratch[- ]?off|identification|\bid\b|legal age|purchasing age|old enough|underage|over 21|over 18|are you 21)\b/i;

const PRICE_STOCK_PATTERN =
  /\b(price|prices|cost|how much|in stock|inventory|available right now|do you have)\b/i;

export function isRestrictedQuestion(question) {
  return RESTRICTED_PATTERN.test(question);
}

export function isPriceOrStockQuestion(question) {
  return PRICE_STOCK_PATTERN.test(question);
}

export const RESTRICTED_WARNING =
  "This question involves an age-restricted product or service. MoonGuide AI cannot approve a sale, decide whether an ID is valid, or replace a legally required identification check. A trained Moon's Food Store employee must verify identification in person and make the final decision.";

export const PRICE_STOCK_NOTE =
  "Prices and inventory may change. A Moon's Food Store employee must confirm the current price and availability.";

export const UNSUPPORTED_ANSWER =
  "I could not find a verified answer in the approved Moon's Food Store information. Please ask a store employee for assistance.";
