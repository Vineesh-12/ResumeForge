# Contributing to ResumeForge

Thank you for your interest in contributing to **ResumeForge**! We welcome contributions from everyone.

---

## 🚀 How to Contribute

### Reporting Bugs
- Search existing [GitHub Issues](https://github.com/Vineesh-12/ResumeForge/issues) before opening a new one.
- Provide a clear and descriptive title along with reproduction steps, expected behavior, and screenshots if applicable.

### Suggesting Enhancements
- Open a feature request issue describing the feature, why it is useful, and potential implementation ideas.

### Submitting Pull Requests
1. Fork the repository and create a branch from `main`.
2. Install dependencies: `npm install`.
3. Make your modifications following the existing code style (React functional components, clean state management, modular CSS).
4. Run `npm run build` to verify there are zero build or linting errors.
5. Commit with clear, descriptive commit messages.
6. Push to your fork and submit a Pull Request to `main`.

---

## 🛠️ Code Style Guidelines
- **CSS:** Use standard CSS custom properties (tokens defined in `src/index.css`) rather than hardcoding arbitrary colors.
- **Privacy:** Always maintain 100% client-side privacy. Never introduce remote logging or analytics containing user resume data or API keys.
- **ATS Compliance:** Any PDF template modifications must adhere strictly to single-column, standard hierarchy ATS standards.

---

## 📄 License
By contributing to ResumeForge, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
