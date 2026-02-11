# Contributing to GlassWall Platform

Thank you for your interest in contributing to the GlassWall Platform! This document provides guidelines and instructions for contributing to this project.

## Development Setup

1. **Fork the repository**

2. **Clone your fork:**
   ```bash
   git clone https://github.com/yourusername/glasswall-platform.git
   cd glasswall-platform
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Branching Strategy

- `main` - Production-ready code
- `develop` - Active development branch
- Feature branches - Named as `feature/your-feature-name`
- Bug fix branches - Named as `fix/issue-description`

## Pull Request Process

1. Create a new branch from `develop` for your changes
2. Make your changes and commit with clear, descriptive messages
3. Push your branch and create a pull request against the `develop` branch
4. Ensure your PR includes:
   - A clear description of the changes
   - Any relevant issue numbers
   - Screenshots for UI changes
5. Wait for code review and address any feedback

## Coding Standards

### General Guidelines

- Follow the existing code style
- Keep functions small and focused
- Comment complex logic
- Write descriptive variable and function names

### React/Next.js

- Use functional components with hooks
- Split complex components into smaller, reusable ones
- Use TypeScript for type safety
- Follow React best practices

### CSS/Styling

- Use Tailwind CSS classes when possible
- Create custom CSS only when necessary
- Keep styling consistent with the existing design system
- Ensure responsive design works on all screen sizes

## Testing

- Write tests for new functionality
- Ensure existing tests pass before submitting a PR
- Test across different browsers and device sizes

## Documentation

- Update README.md if you change functionality
- Document props for components
- Add inline comments for complex logic
- Update any relevant documentation

## Commit Message Guidelines

Follow the conventional commits specification:

- `feat:` - A new feature
- `fix:` - A bug fix
- `docs:` - Documentation changes
- `style:` - Changes that do not affect the meaning of the code
- `refactor:` - Code change that neither fixes a bug nor adds a feature
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Changes to the build process or auxiliary tools

## Project Structure

```
src/
├── app/             # Next.js App Router
│   ├── api/         # API routes
│   ├── components/  # React components
│   └── [routes]/    # App routes
├── lib/             # Utilities and helper functions
├── styles/          # Global styles
└── types/           # TypeScript type definitions
```

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## Getting Help

If you need help with contributing, please reach out by:
- Opening an issue
- Asking questions in pull requests
- Contacting the maintainers

Thank you for contributing to GlassWall Platform!