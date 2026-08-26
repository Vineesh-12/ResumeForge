<div align="center">

# ⚡ ResumeForge AI
### *Free, Client-Side AI ATS Resume Tailor & Interactive Copilot*

[![Live Demo](https://img.shields.io/badge/Live_Demo-resume--forge--psi.vercel.app-00DC82?style=for-the-badge&logo=vercel&logoColor=white)](https://resume-forge-psi.vercel.app/)
[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.2-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Google Gemini AI](https://img.shields.io/badge/Google_Gemini-3.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://aistudio.google.com/)
[![ATS Standard](https://img.shields.io/badge/ATS_Score-95%2B_Guaranteed-10B981?style=for-the-badge&logo=shieldcheck&logoColor=white)](https://resume-forge-psi.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge)](./LICENSE)

<br />

**ResumeForge** is an open-source, 100% in-browser AI-powered resume tailoring platform. It semantically analyzes job descriptions, diagnoses ATS keyword gaps, performs non-destructive additive tailoring using Google's XYZ formula, and exports uncorrupted, text-selectable **Harvard-Jake ATS standard** PDF resumes.

[🚀 **Try the Live Web App**](https://resume-forge-psi.vercel.app/) • [📖 **Read Documentation**](#-how-it-works) • [🛠️ **Local Setup**](#-getting-started) • [🤝 **Contributing**](#-contributing)

</div>

---

## 🌟 Key Highlights

- **🔒 100% Client-Side Privacy:** Your resume files and Gemini API keys never leave your browser. Zero backend servers, zero database telemetry.
- **🛡️ Additive & Non-Destructive Tailoring:** AI never deletes or truncates your existing projects, technical skills, or links. All tailoring strictly augments and enriches your baseline.
- **🎯 100-Point ATS Screening Diagnostic:** Deep keyword density breakdown across technical skills, action verbs, and structural hierarchy.
- **✏️ Human-Friendly Live Visual Editor:** Edit any section with word-processor controls (bold, italic, bullets), unlimited custom links (GitHub, Live Demos, Proofs), and custom credential badges.
- **🤖 Built-in AI Resume Copilot Chat:** Conversational AI assistant with full undo history to refine summaries, rewrite bullets with metrics, or answer interview questions.
- **📄 Battle-Tested Harvard-Jake ATS Standard:** Generates clean, single-column, text-selectable PDFs via `@react-pdf/renderer` with clickable hyperlinks and zero parsing errors.

---

## 🚀 Live Demo

Experience the live app deployed on Vercel:  
👉 **[https://resume-forge-psi.vercel.app/](https://resume-forge-psi.vercel.app/)**

---

## 📊 Core Features Breakdown

### 1. In-Browser PDF Parsing (`react-pdftotext`)
- Extract unstructured resume text in milliseconds directly in WebAssembly/browser memory.
- Standardizes sections: Contact, Professional Summary, Skills, Work Experience, Projects, Education, and Certifications.

### 2. Semantic ATS Diagnostic & 100-Point Scorer
- **Match Matrix:** Identifies 100% exact matches, synonym matches (e.g. *TypeScript* ➔ *JavaScript*, *CI/CD* ➔ *GitHub Actions*), and missing high-priority job keywords.
- **Scoring Engine:** Evaluates keyword density (35 pts), top-third keyword placement (15 pts), section hierarchy (15 pts), XYZ impact formulas (15 pts), category breadth (10 pts), and contact parsability (10 pts).

### 3. Smart Skill Guard & Diff Engine
- Verifies missing keywords before injection to prevent ATS hallucinations.
- Displays full before/after diffs explaining the reasoning behind every rewritten bullet.

### 4. Interactive Visual Resume Editor
- **Unlimited Custom Links:** Add GitHub repositories, live deployed application URLs, portfolio links, and certificate proofs with custom labels.
- **Rich Typography Support:** Instant formatting toggles, custom date ranges, and *"Currently Working Here"* presence flags.

### 5. Conversational AI Resume Copilot
- Intelligent intent classifier: answers general questions without altering data, or executes precise section edits when commanded.
- Instant 1-click **Undo** mechanism to restore previous resume drafts.

---

## 🏗️ Architecture & Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | [React 19](https://react.dev/) + [Vite 8](https://vitejs.dev/) | Ultra-fast client-side SPA rendering with HMR |
| **Routing** | [React Router v7](https://reactrouter.com/) | Seamless 4-step wizard workflow (`/`, `/analyze`, `/tailor`, `/export`) |
| **AI Engine** | [Google Gemini 3.5 Flash](https://ai.google.dev/) | Structured JSON parsing, XYZ bullet synthesis, and chat copilot |
| **PDF Generation** | [@react-pdf/renderer](https://react-pdf.org/) | High-precision single-column ATS vector PDF generation |
| **PDF Extraction** | [react-pdftotext](https://www.npmjs.com/package/react-pdftotext) | Client-side in-memory PDF text extraction |
| **Icons & UI** | [Lucide React](https://lucide.dev/) | Modern, sleek iconography |
| **Styling** | Vanilla CSS3 Tokens | Ultra-modern dark glassmorphism design system with responsive layouts |
| **Deployment** | [Vercel](https://vercel.com/) | Edge CDN deployment with automatic GitHub CI/CD |

---

## 📂 Project Structure

```bash
ResumeForge/
├── public/                     # Static assets & icons
│   ├── favicon.svg             # App favicon
│   ├── icons.svg               # SVG sprite definitions
│   └── _redirects              # Netlify SPA redirect rules
├── src/
│   ├── assets/                 # Brand assets & illustrations
│   ├── components/             # Reusable UI component modules
│   │   ├── ApiKeyModal/        # Gemini API Key configuration modal
│   │   ├── ATSScore/           # 100-Point ATS radial gauge & breakdown
│   │   ├── ChangeLog/          # Before/after diff visualizer
│   │   ├── GapAnalysis/        # Keyword matching matrix
│   │   ├── Header/             # Global sticky navigation bar
│   │   ├── LoadingOverlay/     # Multi-step AI progress overlay
│   │   ├── PDFPreview/         # Live PDF canvas & plain-text generator
│   │   ├── ResumeChat/         # AI Copilot conversational chat widget
│   │   ├── ResumeEditor/       # Human form editor with multi-links
│   │   ├── ResumeUpload/       # Drag-and-drop PDF dropzone
│   │   ├── SkillBadge/         # Colored keyword chips
│   │   └── SkillVerification/  # Skill Guard approval panel
│   ├── context/
│   │   └── AppContext.jsx      # Global state (Resume, JD, Gaps, AI state)
│   ├── pages/                  # Wizard route pages
│   │   ├── InputPage.jsx       # Step 1: Upload resume & paste JD
│   │   ├── AnalysisPage.jsx    # Step 2: ATS keyword & gap report
│   │   ├── TailorPage.jsx      # Step 3: Live editor, Skill Guard & Copilot
│   │   └── ExportPage.jsx      # Step 4: Harvard-Jake PDF download
│   ├── services/               # AI & data processing engines
│   │   ├── atsScorer.js        # 100-point diagnostic scoring algorithm
│   │   ├── gapAnalyzer.js      # Semantic keyword matching & density counter
│   │   ├── geminiService.js    # Gemini API wrapper with retry & model fallback
│   │   ├── jdAnalyzer.js       # Job description requirement parser
│   │   ├── pdfParser.js        # Client-side PDF text extractor
│   │   ├── resumeAnalyzer.js   # Structured JSON resume parser
│   │   ├── resumeChat.js       # Copilot chat intent classifier & editor
│   │   └── resumeTailor.js     # Additive non-destructive tailor engine
│   ├── templates/              # PDF templates
│   │   ├── HarvardJakeTemplate.jsx # Harvard-Jake single-column ATS format
│   │   └── templateStyles.js   # Precision typography stylesheet
│   ├── utils/                  # Keyword dictionaries & utilities
│   │   ├── actionVerbs.js      # Strong action verbs catalog
│   │   └── skillSynonyms.js    # 150+ technology synonym mappings
│   ├── App.jsx                 # App root with layout shell
│   ├── index.css               # Global theme tokens & glassmorphic system
│   └── main.jsx                # React DOM entry point
├── .env.example                # Environment variables template
├── .gitignore                  # Git ignore rules
├── package.json                # Project dependencies and metadata
├── vercel.json                 # Vercel SPA routing rules
└── vite.config.js              # Vite bundler configuration
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.0.0 or later)
- npm, pnpm, or yarn
- A free **[Google Gemini API Key](https://aistudio.google.com/app/apikey)**

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vineesh-12/ResumeForge.git
   cd ResumeForge
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (Optional):**
   ```bash
   cp .env.example .env
   ```
   Add your Gemini API key:
   ```env
   VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
   ```
   *(Note: You can also enter your key directly inside the web UI via the 🔑 modal).*

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🔑 Obtaining a Free Gemini API Key

1. Visit **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with your Google account.
3. Click **"Create API Key"** in a new or existing project.
4. Copy your key and paste it into the **ResumeForge API Key Modal** (🔑 icon in the header).

---

## 🛡️ Privacy & Security

- **Zero Cloud Storage:** No resume data, job postings, or personal identifiable information (PII) is sent to any external server or saved in a remote database.
- **Local Browser Memory:** Resume states and API keys are stored solely in your browser's `localStorage` and memory.
- **Direct AI Endpoint:** API calls go directly from your client browser to Google's official Gemini endpoint (`generativelanguage.googleapis.com`).

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!  
Feel free to check the [issues page](https://github.com/Vineesh-12/ResumeForge/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for more information.

---

<div align="center">

**Built with ❤️ for students, new graduates, and software engineers worldwide.**

⭐ **Star this repository if you find it helpful!**

</div>
