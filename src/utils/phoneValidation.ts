/**
 * Validates Indian phone numbers
 * Supports formats:
 * - 10 digits: 9876543210
 * - With country code: +91 9876543210, 91 9876543210
 * - With spaces/dashes: +91 98765 43210, 98765-43210
 */
export const validateIndianPhoneNumber = (phone: string): { isValid: boolean; error?: string; cleaned?: string } => {
  // Remove all spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading + if present
  const withoutPlus = cleaned.startsWith('+') ? cleaned.slice(1) : cleaned;
  
  // Check if it starts with 91 (India country code)
  let digits = withoutPlus;
  if (withoutPlus.startsWith('91') && withoutPlus.length === 12) {
    digits = withoutPlus.slice(2); // Remove country code
  } else if (withoutPlus.startsWith('0') && withoutPlus.length === 11) {
    digits = withoutPlus.slice(1); // Remove leading 0
  }
  
  // Validate: should be exactly 10 digits and all numeric
  if (!/^\d{10}$/.test(digits)) {
    if (digits.length < 10) {
      return {
        isValid: false,
        error: 'Phone number must be 10 digits',
      };
    }
    if (digits.length > 10) {
      return {
        isValid: false,
        error: 'Phone number must be exactly 10 digits',
      };
    }
    return {
      isValid: false,
      error: 'Phone number must contain only digits',
    };
  }
  
  // Check if it's a valid Indian mobile number (starts with 6-9)
  if (!/^[6-9]/.test(digits)) {
    return {
      isValid: false,
      error: 'Invalid Indian mobile number (must start with 6, 7, 8, or 9)',
    };
  }
  
  return {
    isValid: true,
    cleaned: digits,
  };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
