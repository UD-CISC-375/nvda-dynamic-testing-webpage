// WCAG 2.2 success criteria referenced by scenarios, keyed by number, with the
// anchor id each one has on the W3C recommendation page.

export const WCAG_URL = 'https://www.w3.org/TR/WCAG22/';

export const WCAG_CRITERIA: Record<string, { name: string; anchor: string }> = {
  '1.3.1': { name: 'Info and Relationships', anchor: 'info-and-relationships' },
  '1.4.1': { name: 'Use of Color', anchor: 'use-of-color' },
  '2.1.1': { name: 'Keyboard', anchor: 'keyboard' },
  '2.4.3': { name: 'Focus Order', anchor: 'focus-order' },
  '2.4.6': { name: 'Headings and Labels', anchor: 'headings-and-labels' },
  '2.4.7': { name: 'Focus Visible', anchor: 'focus-visible' },
  '3.2.2': { name: 'On Input', anchor: 'on-input' },
  '3.3.1': { name: 'Error Identification', anchor: 'error-identification' },
  '3.3.2': { name: 'Labels or Instructions', anchor: 'labels-or-instructions' },
  '3.3.3': { name: 'Error Suggestion', anchor: 'error-suggestion' },
  '4.1.2': { name: 'Name, Role, Value', anchor: 'name-role-value' },
  '4.1.3': { name: 'Status Messages', anchor: 'status-messages' },
};
