import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Sparkles, CheckCircle2, Lock, Heart } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="global-saas-footer">
      <div className="footer-container">
        {/* Brand & Mission Column */}
        <div className="footer-brand-col">
          <div className="footer-logo-row">
            <div className="footer-logo-icon">
              <Shield size={18} />
            </div>
            <span className="footer-brand-title">ResumeForge</span>
            <span className="footer-free-tag">100% FREE</span>
          </div>

          <p className="footer-brand-desc">
            The open, privacy-first AI resume tailoring engine. Built on the battle-tested Harvard-Jake ATS format to help engineers and job seekers beat algorithmic filters and land interviews.
          </p>

          <div className="footer-status-pill">
            <span className="status-live-dot" />
            <span>All Systems Operational • 100% In-Browser Privacy</span>
          </div>
        </div>

        {/* Links Column 1: Product */}
        <div className="footer-links-col">
          <h5 className="footer-heading">Product</h5>
          <ul className="footer-nav-list">
            <li><Link to="/app">ATS Resume Optimizer</Link></li>
            <li><Link to="/settings">Account &amp; Profile Defaults</Link></li>
            <li><Link to="/export">Harvard-Jake Template Gallery</Link></li>
          </ul>
        </div>

        {/* Links Column 2: Legal & Trust */}
        <div className="footer-links-col">
          <h5 className="footer-heading">Legal &amp; Trust</h5>
          <ul className="footer-nav-list">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
            <li><Link to="/security">Security Architecture</Link></li>
            <li><Link to="/contact">Contact &amp; Bug Report</Link></li>
          </ul>
        </div>

        {/* Links Column 3: Trust Badges */}
        <div className="footer-links-col">
          <h5 className="footer-heading">ATS Compliance</h5>
          <div className="footer-compliance-box">
            <div className="compliance-row">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>Workday &amp; Greenhouse Ready</span>
            </div>
            <div className="compliance-row">
              <CheckCircle2 size={14} className="text-emerald" />
              <span>Taleo &amp; Lever Compatible</span>
            </div>
            <div className="compliance-row">
              <Lock size={14} className="text-emerald" />
              <span>Zero User Data Sold</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="footer-copyright">
            &copy; {new Date().getFullYear()} ResumeForge. Built with <Heart size={12} className="heart-icon" /> for job seekers worldwide. Open &amp; Free.
          </p>
        </div>
      </div>
    </footer>
  )
}
