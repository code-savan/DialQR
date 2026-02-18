
export interface PhoneAnalysis {
  isValid: boolean;
  formatted: string;
  countrySuggestion?: string;
  securityNote?: string;
}
