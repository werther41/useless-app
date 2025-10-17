# Contributing to Useless Facts App

Thank you for your interest in contributing to the Useless Facts App! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 22.x or later
- npm or yarn
- Git
- A GitHub account

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/useless-app.git
   cd useless-app
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Set up environment variables** (see [Environment Setup](#environment-setup))
5. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Environment Setup

Create a `.env.local` file with the following variables:

```env
# Database (required for full functionality)
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-turso-token

# AI Services (required for AI features)
GOOGLE_API_KEY=your-gemini-api-key

# Security (required for admin features)
ADMIN_SECRET=your-secure-admin-secret
CRON_SECRET=your-cron-secret
```

**Note**: For development, you can use dummy values for most features, but AI features and database operations will require real credentials.

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Your Changes

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all checks pass

### 3. Test Your Changes

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run build
npm run build

# Run tests (if available)
npm test
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add your feature description"
```

### 5. Push and Create PR

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## 🎯 Contribution Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing patterns and conventions
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Keep functions small and focused

### Commit Messages

Use conventional commit format:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

### Pull Request Guidelines

- **Clear title** describing the change
- **Detailed description** of what was changed and why
- **Testing instructions** for reviewers
- **Screenshots** for UI changes
- **Link to related issues** if applicable

### What We're Looking For

- **Bug fixes** and improvements
- **New features** that align with the project vision
- **Documentation** improvements
- **Performance** optimizations
- **Security** enhancements
- **Accessibility** improvements

## 🚫 What NOT to Do

### Security

- ❌ **Never commit secrets** or API keys
- ❌ **Never hardcode** sensitive data
- ❌ **Never bypass** authentication or authorization
- ❌ **Never expose** internal implementation details

### Code Quality

- ❌ **Don't submit** untested code
- ❌ **Don't ignore** linting errors
- ❌ **Don't break** existing functionality
- ❌ **Don't submit** incomplete features

### Process

- ❌ **Don't push** directly to main branch
- ❌ **Don't merge** your own PRs
- ❌ **Don't ignore** review feedback
- ❌ **Don't submit** PRs without descriptions

## 🧪 Testing

### Manual Testing

1. **Test the feature** thoroughly in your local environment
2. **Verify** it works with different configurations
3. **Check** for edge cases and error conditions
4. **Ensure** it doesn't break existing functionality

### Automated Testing

- All PRs must pass automated checks
- Type checking must pass
- Linting must pass
- Build must succeed
- No security vulnerabilities

## 📚 Documentation

### Code Documentation

- Add JSDoc comments for public APIs
- Document complex algorithms or business logic
- Include examples for utility functions
- Update README if adding new features

### API Documentation

- Update API docs for new endpoints
- Include request/response examples
- Document error conditions
- Add authentication requirements

## 🔍 Review Process

### What Reviewers Look For

- **Code quality** and maintainability
- **Security** implications
- **Performance** impact
- **User experience** considerations
- **Documentation** completeness
- **Test coverage** adequacy

### Review Timeline

- **Initial review**: Within 2-3 business days
- **Follow-up reviews**: Within 1-2 business days
- **Final approval**: After all feedback addressed

## 🚨 Security Considerations

### Before Submitting

- [ ] No hardcoded secrets or API keys
- [ ] No sensitive data in code or comments
- [ ] Proper input validation and sanitization
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] Proper error handling without information disclosure

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **Do NOT** create a public issue
2. **Email** the maintainers directly
3. **Include** detailed reproduction steps
4. **Wait** for confirmation before public disclosure

## 🎉 Recognition

Contributors will be recognized in:

- **README.md** contributors section
- **Release notes** for significant contributions
- **GitHub** contributor statistics
- **Project documentation** for major features

## 📞 Getting Help

### Questions and Support

- **GitHub Discussions**: For general questions
- **Issues**: For bug reports and feature requests
- **Discord**: For real-time community chat
- **Email**: For security issues

### Resources

- [Project Documentation](docs/)
- [API Documentation](docs/api-docs.md)
- [Security Guide](SECURITY.md)
- [Repository Protection Guide](docs/REPOSITORY_PROTECTION.md)

## 📄 License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

**Thank you for contributing to the Useless Facts App!** 🎉

Your contributions help make this project better for everyone. We appreciate your time and effort in improving the codebase and user experience.
