# Aptible UI Development Guide

## Commands
- Build: `yarn build`
- Lint: `yarn lint` (includes type checking & circular deps)
- Format: `yarn fmt`
- Test all: `yarn test`
- Test single file: `yarn vitest src/path/to/file.test.tsx`
- Watch single test: `yarn vitest watch src/path/to/file.test.tsx`
- Dev server: `yarn dev`

## Code Style
- **TypeScript**: Use strict typing with interfaces/types
- **React**: Functional components with explicit Props interfaces
- **Naming**: PascalCase components, camelCase variables/functions, kebab-case files
- **Formatting**: Biome handles formatting and imports organization
- **State Management**: Redux-like pattern with selectors, actions, and thunks (not actually using Redux)
- **Styling**: Tailwind CSS with design token system
- **Errors**: Try/catch blocks and Sentry reporting
- **Testing**: Vitest with component testing for UI elements
- **File Structure**: Feature-based organization with index.ts re-exports. View components are in `src/ui`.

## Imports Order
1. React/libraries
2. Local components
3. Types/interfaces
4. Utils/helpers

Always use absolute imports from src (e.g., `import Button from 'ui/shared/button'`)

## Code Change Workflow
After making any code changes, always follow this sequence:

1. Run `make fmt` to automatically fix formatting issues
2. Run `make lint` to check for any remaining linting errors or circular dependencies
3. Address any issues that `make lint` found
4. Only when both checks pass, consider the changes complete

This ensures all code changes adhere to the project's standards before being committed.

## Adding New Backend (`deploy-api`) API Resources
When implementing a new API resource, follow these steps:

1. Define resource interfaces in `src/types/deploy.ts`:
   - Add to ResourceType enum if needed
   - Create interfaces for both API response (e.g., `DeployCustomResourceResponse`) and domain model (e.g., `DeployCustomResource`)

2. Add factory functions in `src/schema/factory.ts`:
   - Create a `defaultDeploy[ResourceName]` function with all fields initialized

3. Add to schema in `src/schema/schema.ts`:
   - Add a new slice with `slice.table({ empty: factory.defaultDeploy[ResourceName]() })`

4. Create resource module in `src/deploy/[resource-name]/index.ts` with:
   - Deserializer function to convert API responses to domain models
   - Default response creator (optional)
   - Basic selectors for table access
   - Custom selectors for filtering needs using `createSelector`
   - API functions for CRUD operations
   - Entity registration object

5. Register entity in `src/deploy/entities.ts`:
   - Import and add to the entities object

6. Import paths:
   - API/thunks: `import { api, cacheMinTimer, thunks } from "@app/api";` (only import thunks if needed)
   - createSelector: `import { createSelector } from "@app/fx";`
   - schema: `import { schema, type WebState } from "@app/schema";`
   - HAL utilities: `import { defaultEntity, extractIdFromLink } from "@app/hal";`
   - Types: `import type { MyType } from "@app/types";`
