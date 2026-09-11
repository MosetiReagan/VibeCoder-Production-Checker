import { dangerousFileUploads, envFilesTracked, hardcodedSecrets, commandInjection, insecureCookies, missingRateLimiting, sqlInjection, ssrf, wildcardCors } from './security/index.js';
import { exposedStackTraces, emptyCatchBlocks } from './reliability/error-handling.js';
import { debugMode, envValidation, localhostConfiguration, productionScripts } from './configuration/index.js';
import { databaseExposed, dockerRiskySettings, dockerRootUser, kubernetesRiskySettings, missingHealthChecks } from './infrastructure/index.js';
import { missingLockfile } from './dependencies/index.js';
import { placeholderImplementation } from './ai/index.js';
import { sensitiveLogging } from './ai/sensitive-logging.js';
import { syncIoInHandler } from './performance/index.js';
import type { Rule } from '../shared.js';

export const allRules: Rule[] = [
  hardcodedSecrets,
  envFilesTracked,
  wildcardCors,
  sqlInjection,
  commandInjection,
  ssrf,
  insecureCookies,
  missingRateLimiting,
  dangerousFileUploads,
  exposedStackTraces,
  emptyCatchBlocks,
  debugMode,
  envValidation,
  localhostConfiguration,
  productionScripts,
  dockerRootUser,
  dockerRiskySettings,
  databaseExposed,
  missingHealthChecks,
  kubernetesRiskySettings,
  missingLockfile,
  placeholderImplementation,
  sensitiveLogging,
  syncIoInHandler
];

export function getRule(id: string): Rule | undefined {
  return allRules.find((rule) => rule.id === id);
}
