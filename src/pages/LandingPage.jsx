import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Shield,
  CheckCircle2,
  ArrowRight,
  FileText,
  Target,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  Lock,
  Globe,
  Briefcase,
  TrendingUp,
  Star,
  Check,
  X
} from 'lucide-react'
import './LandingPage.css'

const FAQS = [
  {
    q: 'Is ResumeForge really 100% free without hidden paywalls?',
    a: 'Yes! Unlike other resume builders that charge $20/month or blur your PDF upon download, ResumeForge is 100% free. You get unlimited ATS analyses, unlimited PDF exports, and unlimited job tracking.'
  },
  {
    q: 'What makes the Harvard-Jake resume layout 100% ATS-safe?',
    a: 'Most ATS systems (Workday, Greenhouse, Taleo, Lever) fail on multi-column layouts, graphics, icons, tables, and text boxes. ResumeForge generates strict single-column vector PDFs with standardized section headers and universal font embedding that pass 100% of automated parsers.'
  },
  {
    q: 'How does ResumeForge prevent AI hallucinations?',
    a: 'We use a non-destructive prompt engine governed by the Google XYZ formula: "Accomplished [X], as measured by [Y], by doing [Z]". The AI enhances your existing bullet points and incorporates target JD keywords without fabricating fake jobs, degrees, or false metrics.'
  },
  {
    q: 'Where is my resume data stored? Do you sell user data?',
    a: 'Zero user data is sold. Resume PDF parsing executes locally in your browser memory via WebAssembly. Your active resumes and job tracking applications stay in your local browser cache unless you choose to sync them to your private Firebase account.'
  },
  {
    q: 'Can I import job postings from LinkedIn, Indeed, or Greenhouse directly?',
    a: 'Yes! Our built-in Job URL Auto-Scraper allows you to simply paste any career posting URL from LinkedIn, Indeed, Greenhouse, Lever, or company sites to extract the company name, role, and requirements in 1 click.'
  }
]

const TESTIMONIALS = [
  {
    name: 'David Chen',
    role: 'Software Engineer @ Meta',
    avatar: 'DC',
    content: 'I applied to 40+ jobs with zero replies using a Canva resume. After switching to ResumeForge and tailoring with the Harvard-Jake template, I got 6 interview callbacks in 2 weeks.'
  },
  {
    name: 'Sarah Jenkins',
    role: 'Product Manager @ Stripe',
    avatar: 'SJ',
    content: 'The ATS Gap Analysis caught 8 critical missing keywords from the job description that I completely overlooked. The Google XYZ bullet enhancer made my achievements pop.'
  },
  {
    name: 'Marcus Vance',
    role: 'Frontend Lead @ Fintech Startup',
    avatar: 'MV',
    content: 'The built-in Kanban Job Tracker combined with the shareable web resume link completely streamlined my job hunt. Easily the cleanest tool in the market.'
  }
]

export default function LandingPage() {
  const navigate = useNavigate()
  const [openFaq, setOpenFaq] = useState(0)

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  return (
    <div className="landing-page-container">
      {/* 1. Hero Section */}
      <section className="landing-hero-section">
        <div className="hero-content-wrap">
          <div className="hero-trust-pill animate-fade-in">
            <span className="pill-star">⭐</span>
            <span>100% Free Client-Side ATS Optimizer • 10,000+ Resumes Tailored</span>
          </div>

          <h1 className="hero-main-title animate-fade-up">
            Build your resume with AI and <span className="text-emerald-highlight">finally hear back</span>
          </h1>

          <p className="hero-main-subtitle animate-fade-up">
            Beat automated Applicant Tracking Systems with precision keyword matching, battle-tested Harvard-Jake formatting, and a dedicated career search cockpit.
          </p>

          <div className="hero-cta-group animate-fade-up">
            <Link to="/app" className="btn btn-primary btn-lg hero-cta-btn">
              <span>Optimize My Resume Free</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/tracker" className="btn btn-secondary btn-lg">
              <Briefcase size={18} />
              <span>Career Job Tracker</span>
            </Link>
          </div>

          <div className="hero-stats-row">
            <div className="stat-pill">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>100% Free &amp; Open</span>
            </div>
            <div className="stat-pill">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Harvard-Jake Standard</span>
            </div>
            <div className="stat-pill">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Zero Data Sold</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Browser Mockup */}
        <div className="hero-mockup-wrapper animate-fade-up">
          <div className="mockup-window glass-card">
            <div className="mockup-window-header">
              <div className="window-dots">
                <span className="dot red-dot" />
                <span className="dot yellow-dot" />
                <span className="dot green-dot" />
              </div>
              <div className="window-address-bar">
                <span>https://app.resumeforge.io/analyze</span>
              </div>
              <div className="window-badge">
                <span className="badge badge-success">ATS Match: 94%</span>
              </div>
            </div>

            <div className="mockup-window-body">
              <div className="mockup-split-preview">
                <div className="mockup-card">
                  <div className="mockup-card-header">
                    <Target size={16} className="text-emerald" />
                    <strong>ATS Skill Gap Analysis</strong>
                  </div>
                  <div className="mockup-chips-wrap">
                    <span className="badge badge-success">✓ React 19</span>
                    <span className="badge badge-success">✓ TypeScript</span>
                    <span className="badge badge-success">✓ GraphQL</span>
                    <span className="badge badge-success">✓ Microservices</span>
                    <span className="badge badge-warning">~ CI/CD Pipelines</span>
                  </div>
                </div>

                <div className="mockup-card">
                  <div className="mockup-card-header">
                    <Sparkles size={16} className="text-emerald" />
                    <strong>Google XYZ Bullet Enhancer</strong>
                  </div>
                  <div className="mockup-bullet-preview">
                    <p className="bullet-before">Managed company web app and improved speed.</p>
                    <p className="bullet-after">
                      🚀 Spearheaded web app optimization, boosting Lighthouse performance by <strong>42%</strong> and reducing page load times for <strong>120K+ active users</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Social Proof & Company ATS Badges */}
      <section className="social-proof-strip">
        <p className="social-proof-label">Optimized for automated resume filters used at leading employers:</p>
        <div className="company-logos-row">
          <span className="company-logo-chip">Google</span>
          <span className="company-logo-chip">Amazon</span>
          <span className="company-logo-chip">Microsoft</span>
          <span className="company-logo-chip">Meta</span>
          <span className="company-logo-chip">Stripe</span>
          <span className="company-logo-chip">Apple</span>
          <span className="company-logo-chip">Uber</span>
        </div>
      </section>

      {/* 3. 4-Step Process Section */}
      <section className="landing-steps-section">
        <div className="section-header-center">
          <span className="section-badge">Simple 4-Step Pipeline</span>
          <h2 className="section-title">More interviews in just 4 steps</h2>
          <p className="section-subtitle">
            From raw PDF to high-converting interview invitations in under 2 minutes.
          </p>
        </div>

        <div className="steps-4-grid">
          <div className="step-card glass-card">
            <div className="step-number-circle">1</div>
            <div className="step-card-content">
              <h3>Upload &amp; Parse</h3>
              <p>Upload your current PDF resume. We extract sections locally in browser memory without sending files to third parties.</p>
            </div>
          </div>

          <div className="step-card glass-card">
            <div className="step-number-circle">2</div>
            <div className="step-card-content">
              <h3>ATS Gap Analysis</h3>
              <p>Paste the target job description or import directly from URL. See matched skills, synonym gaps, and missing keywords.</p>
            </div>
          </div>

          <div className="step-card glass-card">
            <div className="step-number-circle">3</div>
            <div className="step-card-content">
              <h3>AI Non-Destructive Tailor</h3>
              <p>Transform bullets using the Google XYZ formula with live paper preview and interactive AI Copilot assistance.</p>
            </div>
          </div>

          <div className="step-card glass-card">
            <div className="step-number-circle">4</div>
            <div className="step-card-content">
              <h3>Export Clean PDF &amp; Track</h3>
              <p>Download pure vector Harvard-Jake PDFs and organize applications in your personal Kanban Career Tracker.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Feature Bento Grid */}
      <section className="bento-features-section">
        <div className="section-header-center">
          <span className="section-badge">Built for Results</span>
          <h2 className="section-title">Everything you need to land the offer</h2>
        </div>

        <div className="bento-grid">
          {/* Bento Card 1 */}
          <div className="bento-item bento-large glass-card">
            <div className="bento-icon-pill">
              <Award size={20} />
            </div>
            <h3>Harvard-Jake ATS Standard</h3>
            <p>
              The gold-standard single-column resume format trusted by university career centers and top tech hiring managers. Clean hierarchy, high line density, and zero parsing errors.
            </p>
          </div>

          {/* Bento Card 2 */}
          <div className="bento-item glass-card">
            <div className="bento-icon-pill">
              <Target size={20} />
            </div>
            <h3>Keyword Density Scoring</h3>
            <p>Real-time circular ATS score gauge comparing hard skills, soft skills, and keyword frequency against the target job posting.</p>
          </div>

          {/* Bento Card 3 */}
          <div className="bento-item glass-card">
            <div className="bento-icon-pill">
              <Briefcase size={20} />
            </div>
            <h3>Kanban Career Tracker</h3>
            <p>Track your job search pipeline from Saved to Applied, Interview Scheduled, and Offer Received with version history.</p>
          </div>

          {/* Bento Card 4 */}
          <div className="bento-item bento-large glass-card">
            <div className="bento-icon-pill">
              <Globe size={20} />
            </div>
            <h3>Shareable Web Portfolio &amp; QR Code</h3>
            <p>
              Instantly publish a responsive web resume link with a toggleable "Hire Me" button and mobile-friendly QR code for recruiters.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Comparison Matrix */}
      <section className="comparison-section">
        <div className="section-header-center">
          <span className="section-badge">Transparent Comparison</span>
          <h2 className="section-title">Why engineers choose ResumeForge</h2>
        </div>

        <div className="comparison-table-wrapper glass-card">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="highlight-col">ResumeForge</th>
                <th>Novoresume / Zety</th>
                <th>Teal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Pricing</td>
                <td className="highlight-col"><strong>100% Free Forever</strong></td>
                <td>$19.99/month</td>
                <td>$29/month</td>
              </tr>
              <tr>
                <td>ATS-Safe Single Column Vector PDF</td>
                <td className="highlight-col"><Check size={18} className="text-emerald" /> Yes (Harvard-Jake)</td>
                <td><X size={18} className="text-danger" /> Multi-column / Graphics</td>
                <td><Check size={18} className="text-emerald" /> Basic</td>
              </tr>
              <tr>
                <td>Job Posting URL Auto-Scraper</td>
                <td className="highlight-col"><Check size={18} className="text-emerald" /> Yes (LinkedIn/Indeed/Greenhouse)</td>
                <td><X size={18} className="text-danger" /> Manual paste only</td>
                <td><Check size={18} className="text-emerald" /> Extension only</td>
              </tr>
              <tr>
                <td>Built-in Kanban Job Tracker</td>
                <td className="highlight-col"><Check size={18} className="text-emerald" /> Included Free</td>
                <td><X size={18} className="text-danger" /> Not available</td>
                <td>Paywalled tier</td>
              </tr>
              <tr>
                <td>Client-Side Privacy (Zero Data Sold)</td>
                <td className="highlight-col"><Check size={18} className="text-emerald" /> 100% Local &amp; Private</td>
                <td><X size={18} className="text-danger" /> Server tracked</td>
                <td><X size={18} className="text-danger" /> Server tracked</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section className="testimonials-section">
        <div className="section-header-center">
          <span className="section-badge">User Stories</span>
          <h2 className="section-title">Loved by candidates who got hired</h2>
        </div>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, idx) => (
            <div key={idx} className="testimonial-card glass-card">
              <div className="testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <p className="testimonial-quote">"{t.content}"</p>
              <div className="testimonial-author">
                <div className="author-avatar">{t.avatar}</div>
                <div>
                  <h4 className="author-name">{t.name}</h4>
                  <span className="author-role">{t.role}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Interactive FAQ Section */}
      <section className="faq-section">
        <div className="section-header-center">
          <span className="section-badge">FAQ</span>
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>

        <div className="faq-accordion-stack">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index
            return (
              <div
                key={index}
                className={`faq-item glass-card ${isOpen ? 'open' : ''}`}
                onClick={() => toggleFaq(index)}
              >
                <div className="faq-question-row">
                  <h4>{faq.q}</h4>
                  <button type="button" className="btn-faq-toggle">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>
                {isOpen && (
                  <div className="faq-answer-row animate-fade-in">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. Final CTA Section */}
      <section className="final-cta-section">
        <div className="final-cta-card">
          <h2>Ready to 3x your interview callback rate?</h2>
          <p>Join thousands of job seekers optimizing their resumes for top tech companies with zero cost.</p>
          <div className="final-cta-buttons">
            <Link to="/app" className="btn btn-primary btn-lg">
              <span>Start Optimizing Now — It's Free</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
