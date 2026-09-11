# Supported frameworks and languages

## Strong support

- TypeScript and JavaScript
- Express
- Fastify
- NestJS
- React
- Vite
- Next.js
- Docker and Compose configuration

Security, reliability, configuration, infrastructure, dependency, performance, and hygiene rules apply where their patterns match.

## Partial support

- Python: project and language detection plus cross-runtime rules for debug settings, placeholder success responses, and sensitive logging
- PHP: project and language detection plus common production patterns

## Detection-only

- Django, Laravel, Rails, and Spring are detected from project markers. Framework-specific deep rules are on the roadmap and are not claimed as current support.

## Package managers

The scanner detects npm, pnpm, and Yarn lockfiles and analyzes `package.json` metadata.
