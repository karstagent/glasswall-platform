# Contributing to GlassWall

Thank you for considering contributing to GlassWall! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Feature Requests](#feature-requests)

## Code of Conduct

Our Code of Conduct is simple: be respectful, inclusive, and collaborative. We strive to create a welcoming environment for all contributors, regardless of background or identity.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** to your local machine.
3. **Set up the development environment** by following the instructions in the [README.md](./README.md).
4. **Create a new branch** for your contribution.

```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

1. **Make your changes**
2. **Write tests** for your changes (if applicable)
3. **Run existing tests** to ensure you haven't broken anything

```bash
npm test
```

4. **Run linting** to ensure code quality

```bash
npm run lint
```

5. **Run type checking** to ensure type correctness

```bash
npm run typecheck
```

6. **Commit your changes** with a clear and descriptive commit message

```bash
git commit -m "Add feature: brief description of your changes"
```

7. **Push your branch** to your fork on GitHub

```bash
git push origin feature/your-feature-name
```

8. **Open a Pull Request** from your fork to the main repository

## Pull Request Process

1. **Use the PR template** provided in the repository.
2. **Link any related issues** in the PR description.
3. **Ensure all checks pass** (CI/CD, tests, linting).
4. **Request a review** from a maintainer.
5. **Address any feedback** provided during the review process.
6. **Once approved**, a maintainer will merge your PR.

## Coding Standards

We use ESLint and Prettier to enforce coding standards. Please ensure your code follows these standards by running:

```bash
npm run lint
npm run format
```

### TypeScript

- Use TypeScript for all new code
- Define explicit types for functions, variables, and components
- Avoid using `any` type whenever possible
- Use interfaces for defining data structures

### React

- Use functional components with hooks instead of class components
- Keep components small and focused on a single responsibility
- Use appropriate component structure:
  - Props interface at the top
  - Hooks and state initialization
  - Helper functions
  - Return statement with JSX

### API Routes

- Follow REST principles for API design
- Include proper error handling and validation
- Return consistent response formats
- Document API endpoints with JSDoc comments

## Testing

We use Jest and React Testing Library for testing. Please follow these guidelines:

- Write tests for all new features and bug fixes
- Maintain or improve code coverage
- Test both success and failure scenarios
- Mock external dependencies when appropriate

Run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Documentation

Good documentation is crucial for maintainability and onboarding new contributors:

- Update the README.md if your changes affect how users interact with the application
- Document new features in the appropriate documentation files
- Include JSDoc comments for functions, components, and complex logic
- Update API documentation for any changes to the API

## Issue Reporting

When reporting issues, please use the issue template provided in the repository and include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior
4. Actual behavior
5. Screenshots or error messages (if applicable)
6. Environment information (browser, OS, etc.)

## Feature Requests

We welcome feature requests! When suggesting new features:

1. Check if the feature has already been suggested or implemented
2. Use the feature request template provided in the repository
3. Clearly describe the problem the feature would solve
4. Suggest a solution if possible
5. Provide examples of how the feature would be used

## Branching Strategy

We follow a simplified version of Git Flow:

- `main`: Production-ready code
- `develop`: Latest development changes
- `feature/*`: New features or enhancements
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent fixes for production

## Communication

For questions or discussions about the project, you can:

- Open a GitHub Discussion
- Contact us at contributors@glasswall.app
- Join our Discord server at https://discord.gg/glasswall

## License

By contributing to GlassWall, you agree that your contributions will be licensed under the project's MIT License.