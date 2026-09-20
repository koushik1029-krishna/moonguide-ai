export const QUESTION_MAX_LENGTH = 500;
export const QUESTION_MIN_LENGTH = 2;
export const PIN_LENGTH = 4;

export function validateQuestion(rawQuestion) {
  if (rawQuestion == null || typeof rawQuestion !== "string") {
    return {
      valid: false,
      value: "",
      message: "Please type a question using letters or numbers."
    };
  }

  if (rawQuestion.length > QUESTION_MAX_LENGTH * 4) {
    return {
      valid: false,
      value: rawQuestion.replace(/\s+/g, " ").trim().slice(0, QUESTION_MAX_LENGTH),
      message: `Please keep your question under ${QUESTION_MAX_LENGTH} characters.`
    };
  }

  const value = rawQuestion.replace(/\s+/g, " ").trim();

  if (!value) {
    return {
      valid: false,
      value: "",
      message: "Please enter a question before sending. You can also choose a suggested question."
    };
  }

  if (value.length < QUESTION_MIN_LENGTH) {
    return {
      valid: false,
      value,
      message: "Please enter at least 2 characters so MoonGuide AI can look up an answer."
    };
  }

  if (value.length > QUESTION_MAX_LENGTH) {
    return {
      valid: false,
      value: value.slice(0, QUESTION_MAX_LENGTH),
      message: `Please keep your question under ${QUESTION_MAX_LENGTH} characters.`
    };
  }

  if (!/[a-z0-9]/i.test(value)) {
    return {
      valid: false,
      value,
      message: "Please include letters or numbers in your question."
    };
  }

  return { valid: true, value, message: "" };
}

export function validateManagerPin(rawPin) {
  if (rawPin == null || typeof rawPin !== "string") {
    return {
      valid: false,
      value: "",
      message: "Enter the 4-digit demonstration manager PIN."
    };
  }

  const value = rawPin.replace(/\D/g, "").slice(0, PIN_LENGTH);

  if (!value) {
    return {
      valid: false,
      value: "",
      message: "Enter the demonstration manager PIN."
    };
  }

  if (value.length < PIN_LENGTH) {
    return {
      valid: false,
      value,
      message: `Enter the ${PIN_LENGTH}-digit demonstration PIN.`
    };
  }

  return { valid: true, value, message: "" };
}

export function isAllowedRole(role) {
  return role === "guest" || role === "staff" || role === "manager";
}
