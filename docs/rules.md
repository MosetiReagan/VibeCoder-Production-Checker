# Rule catalog

| ID                                                        | Title                                                    | Category           |
| --------------------------------------------------------- | -------------------------------------------------------- | ------------------ |
| [SEC-001](rules/SEC-001-hardcoded-secrets.md)             | Hardcoded secret detected                                | Security           |
| [SEC-002](rules/SEC-002-env-files-tracked.md)             | Environment file may be tracked                          | Security           |
| [SEC-003](rules/SEC-003-wildcard-cors.md)                 | Permissive CORS configuration                            | Security           |
| [SEC-004](rules/SEC-004-sql-injection.md)                 | Potentially unsafe SQL construction                      | Security           |
| [SEC-005](rules/SEC-005-command-injection.md)             | Dynamic shell command detected                           | Security           |
| [SEC-006](rules/SEC-006-ssrf.md)                          | Potential server-side request forgery                    | Security           |
| [SEC-007](rules/SEC-007-insecure-cookies.md)              | Insecure session cookie configuration                    | Security           |
| [SEC-008](rules/SEC-008-rate-limiting.md)                 | No obvious rate limiting on authentication endpoints     | Security           |
| [SEC-009](rules/SEC-009-dangerous-file-uploads.md)        | Potentially dangerous file upload configuration          | Security           |
| [SEC-009](rules/SEC-009-dangerous-file-uploads.md)        | Potentially dangerous file upload configuration          | Security           |
| [REL-001](rules/REL-001-exposed-stack-traces.md)          | Stack trace may be returned to clients                   | Reliability        |
| [REL-002](rules/REL-002-empty-catch-blocks.md)            | Catch block may ignore failures                          | Reliability        |
| [CONFIG-001](rules/CONFIG-001-debug-mode.md)              | Development or debug setting in production configuration | Configuration      |
| [CONFIG-002](rules/CONFIG-002-env-validation.md)          | Required environment variables lack visible validation   | Configuration      |
| [CONFIG-003](rules/CONFIG-003-localhost.md)               | Localhost URL in production configuration                | Configuration      |
| [CONFIG-004](rules/CONFIG-004-production-scripts.md)      | Production package scripts are incomplete                | Configuration      |
| [CONFIG-003](rules/CONFIG-003-localhost.md)               | Localhost URL in production configuration                | Configuration      |
| [CONFIG-004](rules/CONFIG-004-production-scripts.md)      | Production package scripts are incomplete                | Configuration      |
| [INFRA-001](rules/INFRA-001-docker-root-user.md)          | Container may run as root                                | Infrastructure     |
| [INFRA-002](rules/INFRA-002-docker-risky-settings.md)     | Risky Docker configuration detected                      | Infrastructure     |
| [INFRA-003](rules/INFRA-003-database-exposed.md)          | Database or cache port exposed to host                   | Infrastructure     |
| [INFRA-004](rules/INFRA-004-missing-health-checks.md)     | No obvious health check detected                         | Infrastructure     |
| [INFRA-005](rules/INFRA-005-kubernetes-risky-settings.md) | Risky Kubernetes workload setting detected               | Infrastructure     |
| [INFRA-005](rules/INFRA-005-kubernetes-risky-settings.md) | Risky Kubernetes workload setting detected               | Infrastructure     |
| [DEP-001](rules/DEP-001-missing-lockfile.md)              | Dependency lockfile missing                              | Dependencies       |
| [AI-001](rules/AI-001-placeholder-implementation.md)      | Potential placeholder implementation                     | Production hygiene |
| [AI-002](rules/AI-002-sensitive-logging.md)               | Potentially sensitive object logged                      | Privacy            |
| [PERF-001](rules/PERF-001-sync-io.md)                     | Synchronous I/O may block request handling               | Performance        |
