import React from 'react'
import { useNavigate } from 'react-router-dom'
import './LandingPage.css'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-container">
      {/* Animated Background */}
      <div className="landing-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-content">
          <div className="logo-section">
            <div className="logo-icon">📚</div>
            <span className="logo-text">BookSummarizer</span>
          </div>
          <div className="nav-buttons">
            <button className="btn-nav" onClick={() => navigate('/login')}>
              Sign In
            </button>
            <button className="btn-primary" onClick={() => navigate('/register')}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-icon">✨</span>
            <span>AI-Powered Intelligence</span>
          </div>

          <h1 className="hero-title">
            Stop Drowning in Pages.<br />
            <span className="gradient-text">Start Swimming in Ideas.</span>
          </h1>

          <p className="hero-description">
            Transform lengthy books into actionable insights in seconds.
            Let AI do the heavy lifting while you focus on what matters—understanding and applying knowledge.
          </p>

          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate('/register')}>
              Try It Free
              <span className="btn-icon">→</span>
            </button>
            <button className="btn-hero-secondary" onClick={() => navigate('/login')}>
              <span className="play-icon">▶</span>
              See How It Works
            </button>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Books Summarized</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Time Saved</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">5-Min</div>
              <div className="stat-label">Average Read</div>
            </div>
          </div>
        </div>

        {/* Floating Cards Animation */}
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">📖</div>
            <div className="card-title">Upload</div>
            <div className="card-desc">Your book or text</div>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">🤖</div>
            <div className="card-title">AI Processing</div>
            <div className="card-desc">Intelligent analysis</div>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">✅</div>
            <div className="card-title">Get Summary</div>
            <div className="card-desc">Key insights ready</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Everything You Need to Master Any Book</h2>
          <p className="section-subtitle">
            Powerful features designed to help you extract maximum value from every page
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon-wrapper blue">
              <span className="feature-icon">⚡</span>
            </div>
            <h3 className="feature-title">Lightning Fast</h3>
            <p className="feature-description">
              Get comprehensive summaries in under a minute. No more spending hours on lengthy books.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper purple">
              <span className="feature-icon">🎯</span>
            </div>
            <h3 className="feature-title">Smart Extraction</h3>
            <p className="feature-description">
              AI identifies and highlights the most important concepts, themes, and actionable insights.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper pink">
              <span className="feature-icon">📊</span>
            </div>
            <h3 className="feature-title">Multiple Formats</h3>
            <p className="feature-description">
              Choose between bullet points for quick scanning or paragraph format for detailed overviews.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper orange">
              <span className="feature-icon">💾</span>
            </div>
            <h3 className="feature-title">Export Anywhere</h3>
            <p className="feature-description">
              Download your summaries as PDF or TXT files. Access your knowledge library anytime, anywhere.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper green">
              <span className="feature-icon">📚</span>
            </div>
            <h3 className="feature-title">Your Library</h3>
            <p className="feature-description">
              Keep all your summaries organized in one place. Build your personal knowledge base over time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-wrapper teal">
              <span className="feature-icon">🔒</span>
            </div>
            <h3 className="feature-title">Privacy First</h3>
            <p className="feature-description">
              Your books and summaries are private and secure. We never share your data with anyone.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="section-header">
          <h2 className="section-title">From Book to Brilliance in 3 Steps</h2>
          <p className="section-subtitle">
            Our intuitive process makes summarizing books effortless
          </p>
        </div>

        <div className="steps-container">
          <div className="step-item">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3 className="step-title">Upload Your Book</h3>
              <p className="step-description">
                Simply upload a PDF file or paste your text directly. We support books, articles, research papers, and more.
              </p>
            </div>
          </div>

          <div className="step-connector"></div>

          <div className="step-item">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3 className="step-title">Choose Your Style</h3>
              <p className="step-description">
                Select bullet points for quick insights or paragraph format for detailed summaries. Set your desired length.
              </p>
            </div>
          </div>

          <div className="step-connector"></div>

          <div className="step-item">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3 className="step-title">Get Your Summary</h3>
              <p className="step-description">
                Receive a comprehensive summary in seconds. Download, share, or save it to your library for future reference.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Ready to Transform Your Reading?</h2>
          <p className="cta-description">
            Join thousands of readers who are learning faster and retaining more with AI-powered summaries.
          </p>
          <div className="cta-buttons">
            <button className="btn-cta-primary" onClick={() => navigate('/register')}>
              Start Summarizing Free
              <span className="btn-icon">→</span>
            </button>
            <button className="btn-cta-secondary" onClick={() => navigate('/login')}>
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="logo-icon">📚</div>
              <span className="logo-text">BookSummarizer</span>
            </div>
            <p className="footer-tagline">
              Stop drowning in pages. Start swimming in ideas.
            </p>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2026 BookSummarizer. Powered by AI. Built with intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
