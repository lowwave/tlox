export const isDigit = (c: string): boolean => /[0-9]/.test(c);

export const isAlpha = (c: string): boolean => /[a-zA-Z_]/.test(c);

export const isAlphaNumeric = (c: string): boolean => isDigit(c) || isAlpha(c);