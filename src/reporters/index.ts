import pc from 'picocolors';
import type { Severity } from '../shared.js';
import { categoryLabels, scoreLevel } from '../shared.js';
import type { ScanResult } from '../core/types.js';
import { getRule } from '../rules/index.js';

function colorSeverity(severity: Severity, text: string): string {
  if (severity === 'critical') return pc.bold(pc.bgRed(text));
  if (severity === 'high') return pc.red(text);
  if (severity === 'medium') return pc.yellow(text);
  if (severity === 'low') return pc.blue(text);
  return pc.gray(text);
}

export function terminalReport(result: ScanResult): string {
  const lines = [
    pc.bold('Production Checker'),
    '─'.repeat(40),
    '',
    `Project: ${result.project.root}`,
    `Detected: ${[...result.project.languages, ...result.project.frameworks].join(', ') || 'Unknown'}`,
    `Files analyzed: ${result.filesAnalyzed}`,
    `Dependencies detected: ${result.dependenciesAnalyzed}`,
    '',
    pc.bold(`Production Score: ${result.score.overall} / 100 — ${scoreLevel(result.score.overall)}`),
    ''
  ];
  for (const [category, score] of Object.entries(result.score.categories)) {
    lines.push(`${(categoryLabels[category as keyof typeof categoryLabels] ?? category).padEnd(22)} ${score}`);
  }
  if (result.config.disabled.length > 0) {
    lines.push(
      '',
      pc.yellow(
        `Note: ${result.config.disabled.length} rule(s) disabled (${result.config.disabled.join(', ')}). Disabled checks reduce score transparency.`
      )
    );
  }
  lines.push('', pc.bold(`Findings (${result.findings.length})`), '');
  if (result.findings.length === 0) lines.push(pc.green('✓ No findings'));
  for (const finding of result.findings) {
    lines.push(
      `${colorSeverity(finding.severity, finding.severity.toUpperCase().padEnd(8))} ${finding.title}`,
      `  ${finding.ruleId} · ${finding.file}:${finding.line} · confidence ${finding.confidence}`,
      `  ${pc.gray(finding.evidence)}`,
      `  Fix: ${finding.recommendation}`,
      ''
    );
  }
  lines.push(`Scan complete in ${(result.durationMs / 1000).toFixed(2)}s`);
  return lines.join('\n');
}

export function jsonReport(result: ScanResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function markdownReport(result: ScanResult): string {
  const lines = [
    '# Production Readiness Report',
    '',
    `**Overall score:** ${result.score.overall}/100 — ${scoreLevel(result.score.overall)}`,
    `**Project:** ${result.project.root}`,
    `**Detected:** ${[...result.project.languages, ...result.project.frameworks].join(', ') || 'Unknown'}`,
    '',
    '## Category Scores',
    '',
    '| Category | Score |',
    '|---|---:|',
    ...Object.entries(result.score.categories).map(([category, score]) => `| ${categoryLabels[category as keyof typeof categoryLabels]} | ${score} |`),
    '',
    `## Findings (${result.findings.length})`,
    ''
  ];
  if (result.findings.length === 0) lines.push('No findings.');
  for (const finding of result.findings) {
    lines.push(
      `### ${finding.severity.toUpperCase()} — ${finding.title}`,
      '',
      `- **Rule:** \`${finding.ruleId}\``,
      `- **Location:** \`${finding.file}:${finding.line}\``,
      `- **Confidence:** ${finding.confidence}`,
      `- **Evidence:** \`${finding.evidence.replace(/\|/g, '\\|')}\``,
      `- **Impact:** ${finding.impact}`,
      `- **Recommendation:** ${finding.recommendation}`,
      ''
    );
  }
  lines.push(`Scan completed in ${(result.durationMs / 1000).toFixed(2)} seconds.`);
  return `${lines.join('\n')}\n`;
}

export function sarifReport(result: ScanResult): string {
  const rules = [...new Map(result.findings.map((finding) => [finding.ruleId, finding])).values()];
  return `${JSON.stringify({
    $schema: 'https://json.schemastore.org/sarif-2.1.0.json',
    version: '2.1.0',
    runs: [{
      tool: { driver: { name: 'Production Checker', informationUri: 'https://github.com/MosetiReagan/VibeCoder-Production-Checker', rules: rules.map((finding) => {
        const rule = getRule(finding.ruleId);
        return {
          id: finding.ruleId,
          name: finding.title,
          shortDescription: { text: finding.description },
          fullDescription: { text: rule?.description ?? finding.description },
          helpUri: rule?.documentationUrl ?? ruleDocumentationUrls[finding.ruleId],
          defaultConfiguration: { level: severityToSarifLevel(finding.severity) },
          properties: {
            'security-severity': severityToSarif(finding.severity).toFixed(1),
            tags: [finding.category, ...(cweTags[finding.ruleId] ?? [])]
          }
        };
      }) } },
      results: result.findings.map((finding) => ({
        ruleId: finding.ruleId,
        level: severityToSarifLevel(finding.severity),
        message: { text: `${finding.title}: ${finding.description} Fix: ${finding.recommendation}` },
        locations: [{ physicalLocation: {
          artifactLocation: { uri: finding.file },
          region: { startLine: Math.max(1, finding.line) }
        } }],
        properties: { confidence: finding.confidence, evidence: finding.evidence }
      }))
    }]
  }, null, 2)}\n`;
}

const repositoryUrl = 'https://github.com/MosetiReagan/VibeCoder-Production-Checker/blob/main/docs/rules';

const ruleDocumentationUrls: Record<string, string> = Object.fromEntries([
  ['SEC-001', 'SEC-001-hardcoded-secrets.md'],
  ['SEC-002', 'SEC-002-env-files-tracked.md'],
  ['SEC-003', 'SEC-003-wildcard-cors.md'],
  ['SEC-004', 'SEC-004-sql-injection.md'],
  ['SEC-005', 'SEC-005-command-injection.md'],
  ['SEC-006', 'SEC-006-ssrf.md'],
  ['SEC-007', 'SEC-007-insecure-cookies.md'],
  ['SEC-008', 'SEC-008-rate-limiting.md'],
  ['SEC-009', 'SEC-009-dangerous-file-uploads.md'],
  ['REL-001', 'REL-001-exposed-stack-traces.md'],
  ['REL-002', 'REL-002-empty-catch-blocks.md'],
  ['CONFIG-001', 'CONFIG-001-debug-mode.md'],
  ['CONFIG-002', 'CONFIG-002-env-validation.md'],
  ['CONFIG-003', 'CONFIG-003-localhost.md'],
  ['CONFIG-004', 'CONFIG-004-production-scripts.md'],
  ['INFRA-001', 'INFRA-001-docker-root-user.md'],
  ['INFRA-002', 'INFRA-002-docker-risky-settings.md'],
  ['INFRA-003', 'INFRA-003-database-exposed.md'],
  ['INFRA-004', 'INFRA-004-missing-health-checks.md'],
  ['INFRA-005', 'INFRA-005-kubernetes-risky-settings.md'],
  ['DEP-001', 'DEP-001-missing-lockfile.md'],
  ['AI-001', 'AI-001-placeholder-implementation.md'],
  ['AI-002', 'AI-002-sensitive-logging.md'],
  ['PERF-001', 'PERF-001-sync-io.md']
].map(([id, document]) => [id, `${repositoryUrl}/${document}`]));

const cweTags: Record<string, string[]> = {
  'SEC-001': ['cwe-798'],
  'SEC-004': ['cwe-89'],
  'SEC-005': ['cwe-78'],
  'SEC-006': ['cwe-918'],
  'SEC-007': ['cwe-614', 'cwe-1004'],
  'INFRA-001': ['cwe-250']
};

function severityToSarif(severity: Severity): number {
  return { critical: 9.5, high: 8, medium: 5.5, low: 3, info: 1 }[severity];
}

function severityToSarifLevel(severity: Severity): 'error' | 'warning' | 'note' {
  if (severity === 'critical' || severity === 'high') return 'error';
  if (severity === 'medium') return 'warning';
  return 'note';
}

export function htmlReport(result: ScanResult): string {
  const findings = result.findings.map((finding, index) => `
    <article id="finding-${index + 1}" class="finding ${finding.severity}" data-severity="${finding.severity}">
      <header><span>${finding.severity.toUpperCase()}</span><strong>${escapeHtml(finding.title)}</strong><button type="button" class="toggle" aria-expanded="true">Hide</button></header>
      <div class="details">
        <p><code>${escapeHtml(finding.file)}:${finding.line}</code> · confidence ${finding.confidence}</p>
        <pre>${escapeHtml(finding.evidence)}</pre>
        <p>${escapeHtml(finding.impact)}</p>
        <p><strong>Fix:</strong> ${escapeHtml(finding.recommendation)}</p>
      </div>
    </article>`).join('');
  const categories = Object.entries(result.score.categories).map(([category, score]) =>
    `<div class="category"><span>${escapeHtml(categoryLabels[category as keyof typeof categoryLabels] ?? category)}</span><strong>${score}</strong></div>`
  ).join('');
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Production Checker Report</title>
<style>
:root{color-scheme:light dark;--bg:#0b1020;--card:#151c31;--text:#e9eefb;--muted:#a9b4cc;--high:#ef4444;--medium:#f59e0b;--low:#38bdf8}*{box-sizing:border-box}body{margin:0;font:15px/1.55 system-ui,sans-serif;background:var(--bg);color:var(--text)}main{max-width:960px;margin:auto;padding:32px}h1{margin:0 0 8px}.score{font-size:48px;font-weight:800}.card{background:var(--card);border:1px solid #28334c;border-radius:12px;padding:24px;margin:16px 0}.categories{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px}.category{background:#101827;border-radius:8px;padding:12px}.category span{display:block;color:var(--muted);font-size:13px}.finding{border-left:4px solid var(--medium);background:var(--card);border-radius:8px;padding:16px;margin:12px 0}.finding.high,.finding.critical{border-color:var(--high)}.finding.low{border-color:var(--low)}.finding.collapsed .details{display:none}.finding:target{outline:2px solid var(--low)}header{display:flex;align-items:center;gap:12px}header strong{flex:1}.controls{display:flex;flex-wrap:wrap;gap:8px;margin:12px 0}button{font:inherit;color:var(--text);background:#101827;border:1px solid #28334c;border-radius:999px;padding:6px 12px;cursor:pointer}button[aria-pressed=true]{border-color:var(--low)}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#0b1020;padding:10px;border-radius:6px}code{font-family:ui-monospace,monospace}.muted{color:var(--muted)}
</style></head><body><main>
<h1>Production Checker</h1><p class="muted">${escapeHtml(result.project.root)}</p>
<section class="card"><div class="score">${result.score.overall}/100</div><p>${escapeHtml(scoreLevel(result.score.overall))}</p><div class="categories">${categories}</div></section>
<section><h2>Findings (${result.findings.length})</h2><div class="controls" role="group" aria-label="Filter findings by severity"><button type="button" data-severity-filter="" aria-pressed="true">All</button><button type="button" data-severity-filter="critical" aria-pressed="false">Critical</button><button type="button" data-severity-filter="high" aria-pressed="false">High</button><button type="button" data-severity-filter="medium" aria-pressed="false">Medium</button><button type="button" data-severity-filter="low" aria-pressed="false">Low</button><button type="button" data-severity-filter="info" aria-pressed="false">Info</button></div>${findings || '<p>No findings.</p>'}</section>
<p class="muted">Files: ${result.filesAnalyzed} · Dependencies: ${result.dependenciesAnalyzed} · Scan time: ${(result.durationMs / 1000).toFixed(2)}s</p>
</main><script>
const filters=document.querySelectorAll('[data-severity-filter]');
filters.forEach((button)=>button.addEventListener('click',()=>{const severity=button.dataset.severityFilter;filters.forEach((item)=>item.setAttribute('aria-pressed',String(item===button)));document.querySelectorAll('.finding').forEach((finding)=>{finding.style.display=!severity||finding.dataset.severity===severity?'':'none';});}));
document.querySelectorAll('.finding .toggle').forEach((button)=>button.addEventListener('click',()=>{const finding=button.closest('.finding');const collapsed=finding.classList.toggle('collapsed');button.textContent=collapsed?'Show':'Hide';button.setAttribute('aria-expanded',String(!collapsed));}));
if(location.hash){const finding=document.querySelector(location.hash);if(finding){finding.classList.add('target');finding.scrollIntoView();}}
</script></body></html>\n`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char] ?? char);
}

export function conciseReport(result: ScanResult): string {
  return result.findings.map((finding) =>
    `${finding.severity.toUpperCase()} ${finding.ruleId} ${finding.file}:${finding.line} ${finding.title}`
  ).join('\n') || 'No findings';
}
