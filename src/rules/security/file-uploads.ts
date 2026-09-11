import { createFinding, createRule, scanLines, trimEvidence } from '../helpers.js';

export const dangerousFileUploads = createRule({
  id: 'SEC-009',
  title: 'Potentially dangerous file upload configuration',
  description: 'Finds upload handlers without visible type or size restrictions.',
  category: 'security',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    return scanLines(
      context,
      [/(?:upload(?:\.\w+)?|multer|formData|multipart)\s*\(/i],
      (file, line, text) => {
        const nearby =
          context.files
            .find((item) => item.relativePath === file)
            ?.lines.slice(Math.max(0, line - 5), line + 5)
            .join('\n') ?? text;
        const restricted = /fileFilter|limits\s*:|fileSize|mimetype|allowedTypes|accept\s*:/i.test(
          nearby
        );
        if (restricted) return null;
        return createFinding({
          ruleId: this.id,
          title: this.title,
          severity: this.severity,
          confidence: this.confidence,
          category: this.category,
          file,
          line,
          evidence: trimEvidence(text),
          description:
            'A file upload path was found without an obvious size or type restriction nearby.',
          impact:
            'Attackers may upload oversized files, executable content, or malware that is later served to users.',
          recommendation:
            'Enforce an allow-list of MIME types and extensions, maximum sizes, random storage names, and non-executable storage. Scan content and serve downloads with safe Content-Disposition headers.'
        });
      }
    );
  }
});
