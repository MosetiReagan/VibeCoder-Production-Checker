import { createFinding, createRule } from '../helpers.js';
import { isDocumentation } from '../helpers.js';
import type { Finding } from '../../shared.js';

export const kubernetesRiskySettings = createRule({
  id: 'INFRA-005',
  title: 'Risky Kubernetes workload setting detected',
  description: 'Finds privileged containers, host networking, hostPath volumes, and missing resource limits in Kubernetes manifests.',
  category: 'infrastructure',
  severity: 'high',
  confidence: 'high',
  async run(context) {
    const findings: Finding[] = [];
    for (const file of context.files) {
      if (!/\.ya?ml$/.test(file.extension)) continue;
      if (isDocumentation(file.relativePath)) continue;
      if (!/kind\s*:\s*(?:Pod|Deployment|StatefulSet|DaemonSet|Job|CronJob)/.test(file.content)) continue;
      file.lines.forEach((line, index) => {
        if (/privileged\s*:\s*true/i.test(line) || /hostNetwork\s*:\s*true/i.test(line)) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: 'A Kubernetes workload enables privileged execution or host networking.',
            impact: 'The workload can bypass normal container isolation and affect the host network or kernel.',
            recommendation: 'Remove privileged mode and hostNetwork unless a documented runtime requirement exists. Apply least-privilege security contexts and network policies.'
          }));
        }
        if (/type\s*:\s*HostPath/i.test(line)) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: 'A HostPath volume mounts a path from the Kubernetes node.',
            impact: 'Workload compromise can read or modify sensitive host files.',
            recommendation: 'Use PersistentVolumeClaims, ConfigMaps, Secrets, or object storage instead of HostPath.'
          }));
        }
      });
      if (!/resources\s*:/.test(file.content) || !/limits\s*:/.test(file.content)) {
        findings.push(createFinding({
          ruleId: this.id,
          title: this.title,
          severity: 'medium',
          confidence: 'medium',
          category: this.category,
          file: file.relativePath,
          line: 1,
          evidence: 'No resource limits found in workload manifest',
          description: 'A workload manifest does not visibly define resource limits.',
          impact: 'Runaway workloads can exhaust node CPU or memory and destabilize other services.',
          recommendation: 'Set CPU and memory requests and limits based on measured workload usage.'
        }));
      }
    }
    return findings;
  }
});
