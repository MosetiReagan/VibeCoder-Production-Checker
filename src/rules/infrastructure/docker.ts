import YAML from 'yaml';
import { createFinding, createRule } from '../helpers.js';
import type { Finding } from '../../shared.js';

export const dockerRootUser = createRule({
  id: 'INFRA-001',
  title: 'Container may run as root',
  description: 'Detects Dockerfiles without a non-root USER directive.',
  category: 'infrastructure',
  severity: 'high',
  confidence: 'medium',
  async run(context) {
    const findings: Finding[] = [];
    for (const file of context.files.filter((item) => item.relativePath === 'Dockerfile')) {
      const userDirectives = file.lines
        .map((line, index) => ({ line, index, match: line.match(/^\s*USER\s+(\S+)/) }))
        .filter((directive) => directive.match);
      const lastUser = userDirectives.at(-1);
      const resolvesToRoot = lastUser?.match?.[1]?.toLowerCase().match(/(?:^|[^a-z0-9])(?:root|0(?::0)?)(?:$|[^a-z0-9])/);
      if (!lastUser || resolvesToRoot) findings.push(createFinding({
        ruleId: this.id,
        title: this.title,
        severity: this.severity,
        confidence: this.confidence,
        category: this.category,
        file: file.relativePath,
        line: lastUser ? lastUser.index + 1 : file.lines.length,
        evidence: lastUser ? lastUser.line.trim() : 'No USER directive found',
        description: lastUser
          ? 'The final USER directive selects a root user.'
          : 'The Dockerfile does not select a non-root runtime user.',
        impact: 'A compromised application process has unnecessary root privileges inside the container.',
        recommendation: 'Create an application user, set ownership only where needed, and end the runtime stage with USER appuser.'
      }));
    }
    return findings;
  }
});

export const dockerRiskySettings = createRule({
  id: 'INFRA-002',
  title: 'Risky Docker configuration detected',
  description: 'Detects privileged mode, host networking, Docker socket mounts, and latest tags.',
  category: 'infrastructure',
  severity: 'high',
  confidence: 'high',
  async run(context) {
    const findings: Finding[] = [];
    for (const file of context.files) {
      const isCompose = /^(?:docker-compose|compose)\.ya?ml$/.test(file.relativePath);
      const isDockerfile = file.relativePath === 'Dockerfile';
      file.lines.forEach((line, index) => {
        if (isCompose && (/privileged\s*:\s*true/i.test(line) || /\/var\/run\/docker\.sock/.test(line))) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: 'critical',
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: 'A privileged container or Docker socket mount was detected.',
            impact: 'The container can effectively control the host Docker daemon and compromise the host.',
            recommendation: 'Remove privileged mode and Docker socket mounts. Use a constrained CI service or rootless Docker when needed.'
          }));
        }
        if (isCompose && /network_mode\s*:\s*['"]?host/i.test(line)) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: 'medium',
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: 'A service uses host networking.',
            impact: 'Container network isolation is weakened and services can reach every interface on the host.',
            recommendation: 'Use bridge networking and publish only required ports to loopback or an internal network.'
          }));
        }
        if (isDockerfile && /FROM\s+\S+:latest/i.test(line)) {
          findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: 'low',
            confidence: 'high',
            category: this.category,
            file: file.relativePath,
            line: index + 1,
            evidence: line.trim().slice(0, 180),
            description: 'An image is pinned to the mutable latest tag.',
            impact: 'Builds are not reproducible and can change without review.',
            recommendation: 'Pin images to an immutable version and digest.'
          }));
        }
      });
    }
    return findings;
  }
});

export const databaseExposed = createRule({
  id: 'INFRA-003',
  title: 'Database or cache port exposed to host',
  description: 'Detects database and cache ports published in Compose files.',
  category: 'infrastructure',
  severity: 'high',
  confidence: 'high',
  async run(context) {
    const findings = [];
    const databasePorts = new Set([5432, 3306, 6379, 27017]);
    for (const file of context.files.filter((item) => /^docker-compose\.ya?ml$|^compose\.ya?ml$/.test(item.relativePath))) {
      let document: unknown;
      try {
        document = YAML.parse(file.content);
      } catch {
        continue;
      }
      const services = (document as { services?: Record<string, { ports?: string[] }> })?.services ?? {};
      for (const [serviceName, service] of Object.entries(services)) {
        for (const port of service.ports ?? []) {
          const [host] = String(port).split(':');
          const hostPort = Number(host);
          if (databasePorts.has(hostPort)) findings.push(createFinding({
            ruleId: this.id,
            title: this.title,
            severity: this.severity,
            confidence: this.confidence,
            category: this.category,
            file: file.relativePath,
            line: findPortLine(file.lines, String(port)),
            evidence: `${serviceName}: ${port}`,
            description: `Service ${serviceName} publishes database/cache port ${port}.`,
            impact: 'The database can be reachable from host interfaces and potentially the public network.',
            recommendation: 'Remove the host port mapping and use an internal Compose network. For local access, bind to 127.0.0.1 and never expose production databases.'
          }));
        }
      }
    }
    return findings;
  }
});

function findPortLine(lines: string[], port: string): number {
  const index = lines.findIndex((line) => line.includes(port));
  return index === -1 ? 1 : index + 1;
}
