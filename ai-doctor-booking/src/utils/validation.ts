/**
 * Validates an email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a phone number (basic validation, can be customized)
 */
export const validatePhone = (phone: string): boolean => {
  // Allow digits, spaces, parentheses, dashes, and plus sign
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates that a field is not empty
 */
export const validateRequired = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validates password strength
 * - At least 8 characters
 */
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};

/**
 * Validates that password and confirmation match
 */
export const validatePasswordsMatch = (password: string, confirmation: string): boolean => {
  return password === confirmation;
}; 