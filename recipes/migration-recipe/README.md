# migration-recipe

Run a sequence of webpack v5 migration codemods.

## Installation

```bash
# Install from registry
npx codemod@latest webpack/v5/migration-recipe

# Or run locally from the recipe directory
codemod run -w workflow.yaml
```

## Steps

- webpack/v5/json-imports-to-default-imports
- webpack/v5/migrate-library-target-to-library-object
- webpack/v5/set-target-to-false-and-update-plugins

## Development

```bash
# Validate the workflow
codemod validate -w workflow.yaml
```

## License

MIT

