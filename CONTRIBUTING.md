# Contributing

Thank you for helping improve webpack-codemods. This project provides automated migrations (codemods) to help the community adopt new Webpack features and upgrade across breaking changes.

## How we work

- Propose: Open an issue for discussion before large changes.
- Safety: Codemods must be safe, predictable, and idempotent.
- Tests: Every codemod requires tests with multiple fixtures (positive, negative, idempotency).
- Style: Keep original formatting/indentation whenever reasonable.
- Documentation: Update per-recipe README and root docs when adding/altering a codemod.

For workflow structure and orchestration details, see Codemod Workflows:

- Codemod Workflows (reference): https://docs.codemod.com/cli/workflows

## Prerequisites

- Node.js LTS (>=18 recommended)
- npm

## Repository layout (high-level)

- `recipes/<codemod-name>/` — Each codemod or recipe bundle (manifest, workflow, source, tests, docs)
- `recipes/<codemod-name>/codemod.yaml` — Codemod manifest (name, version, metadata)
- `recipes/<codemod-name>/workflow.yaml` — Codemod Workflow definition (steps/orchestration)
- `recipes/<codemod-name>/src/workflow.ts` — JS AST-Grep transform entry (if applicable)
- `recipes/<codemod-name>/tests/{input,expected}` — Test fixtures
- `.github/workflows/ci.yml` — CI for lint, typecheck, validate, test

For workflow structure and capabilities (nodes, steps, templates, state), see: https://docs.codemod.com/cli/workflows

## Getting started

```bash
# Install dev deps and set up git hooks (husky)
npm install

# Lint and format
npm run lint
npm run format

# Validate all workflows
npm run validate

# Typecheck (TypeScript)
npm run typecheck

# Run tests across all recipes
npm run test
```

## Scaffolding a new codemod

Use Codemod CLI interactively to scaffold under `recipes/`:

```bash
npx codemod@latest init recipes/my-codemod
```

During prompts, select:
- Project type: JavaScript ast-grep codemod, YAML ast-grep codemod, Shell command workflow codemod
- Language
- Package manager of your preference
- Package name
- Description
- Author
- License
- Package visibility

You can also run a recipe’s own test script: `npm --prefix recipes/my-codemod run test`.

Optional next steps:
- Add a brief `README.md` in the recipe with Before/After examples and links to relevant Webpack docs.
- Add more fixtures under the generated tests directory.

## Developing a new codemod (checklist)

1. Scaffold with `codemod init` (see above).
2. Adapt files to repo conventions (paths, workflow step, tests layout, metadata).
3. Add comprehensive fixtures (positive, negative, idempotent cases).
4. Document behavior and edge cases in the recipe `README.md`.
5. Run repo checks: `npm run lint && npm run typecheck && npm run validate && npm run test`.

Notes:
- Author transforms to preserve original indentation style (tabs vs spaces) and trailing commas where practical.
- Make transforms idempotent: running twice should yield the same result.
- Keep scopes tight (only touch files/matches needed). Exclude build/coverage directories in workflow inputs.

## Making changes to existing codemods

- Add/adjust fixtures first; then change the transform.
- Ensure no semantic regressions. Only formatting should change when necessary.
- Keep naming/version metadata consistent in `codemod.yaml`.

## Versioning and naming

- Use namespaced identifiers that reflect Webpack major: e.g., `webpack/v5/<codemod>`.
- Bump recipe `version` when behavior changes.

## Commit messages

Use Conventional Commits:

- `feat(scope):` add a new codemod or capability
- `fix(scope):` bugfixes in a transform or tests
- `docs(scope):` docs only changes (README, contributing)
- `refactor(scope):` code changes that neither fix a bug nor add a feature
- `test(scope):` add or adjust fixtures/tests
- `chore(scope):` tooling, CI, formatting, or repo hygiene

Examples:

- `feat(json-imports-to-default-imports): support alias imports`
- `fix(set-target-to-false): preserve indentation in plugins block`
- `docs(contributing): add interactive scaffold instructions`

## Pre-commit hooks

Husky runs basic checks locally (lint, format, validate, typecheck). You can run them manually:

```bash
npm run lint
npm run format
npm run validate
npm run typecheck
npm run test
```

## Opening a Pull Request

- Link to the discussion/issue.
- Include a summary of changes and why.
- Include before/after examples in the PR where applicable.
- Ensure CI is green (lint, typecheck, validate, test).

## Security

If you discover a security issue, please follow SECURITY.md and report privately.

## License

By contributing, you agree that your contributions are licensed under the MIT License.

