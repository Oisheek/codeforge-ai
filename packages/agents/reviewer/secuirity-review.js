/**
 * Security review checklist and patterns.
 */

const SECURITY_PATTERNS = [
  { pattern: /eval\s*\(/, severity: 'HIGH', message: 'Use of eval() detected - potential code injection' },
  { pattern: /innerHTML\s*=/, severity: 'MEDIUM', message: 'Direct innerHTML assignment - potential XSS' },
  { pattern: /dangerouslySetInnerHTML/, severity: 'MEDIUM', message: 'React dangerouslySetInnerHTML - potential XSS' },
  { pattern: /password|secret|api_key|apiKey/i, severity: 'HIGH', message: 'Hardcoded secret detected' },
  { pattern: /SELECT.*FROM.*WHERE.*\+|`\$\{.*\}`/i, severity: 'HIGH', message: 'Potential SQL injection' },
  { pattern: /exec\s*\(|spawn\s*\(/, severity: 'MEDIUM', message: 'Command execution - ensure input is sanitized' },
  { pattern: /cors.*\*|Access-Control-Allow-Origin.*\*/, severity: 'MEDIUM', message: 'Wildcard CORS configuration' },
];

function scanForSecurityIssues(code, filePath) {
  const issues = [];
  for (const { pattern, severity, message } of SECURITY_PATTERNS) {
    if (pattern.test(code)) {
      issues.push({ severity, message, file: filePath });
    }
  }
  return issues;
}

module.exports = { scanForSecurityIssues, SECURITY_PATTERNS };