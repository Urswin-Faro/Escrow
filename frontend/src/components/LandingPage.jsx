// frontend/src/components/LandingPage.jsx

import React from 'react';
import { FiArrowRight, FiLock, FiUsers, FiZap, FiCheckCircle } from 'react-icons/fi';

// --- Sub-Component 1: Hero Section ---
const HeroSection = ({ onShowLogin }) => {
  return (
    <header className="hero-container">
      <div className="hero-content">
        {/* Optional: Add a simple navigation/login button here */}
        <div className="top-nav">
             {/* You would need to style this div and button to match the 'Login' button in the image */}
             <button onClick={onShowLogin} className="login-button">Login</button>
        </div>
        <h1 className="hero-title">
          Secure Escrow Services for Safe Transactions
        </h1>
        <p className="hero-subtitle">
          Protect your payments with our business escrow solution. Funds are held securely until both parties confirm transaction completion.
        </p>
        <div className="button-group">
          {/* Change to onClick and pass handler for SPA view switch, or use proper router link */}
          <button onClick={onShowLogin} className="btn btn-primary">
            Start Your First Escrow <FiArrowRight />
          </button>
          <a href="/learn-more" className="btn btn-secondary">
            Learn More
          </a>
        </div>
      </div>
    </header>
  );
};


// --- Sub-Component 2: Why Choose Section ---
const WhyChoose = () => {
  const features = [
    { icon: <FiLock />, title: "Secure Transactions", description: "Your funds are protected with end-to-end security until both parties confirm completion." },
    { icon: <FiUsers />, title: "Trusted Platform", description: "Connect with verified buyers and sellers in a safe, regulated environment." },
    { icon: <FiZap />, title: "Fast Processing", description: "Quick setup and automated payments with streamlined workflows." },
  ];

  return (
    <section className="why-choose-section">
      <div className="container">
        <h2 className="section-heading">Why Choose SecureEscrow</h2>
        <p className="section-subtext">
          Built for modern businesses and individuals who need guaranteed transaction security.
        </p>
        <div className="cards-container">
          {features.map((feature, index) => (
            <div className="feature-card" key={index}>
              <div className="card-icon">{feature.icon}</div>
              <h3 className="card-title">{feature.title}</h3>
              <p className="card-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


// --- Sub-Component 3: Transaction Flow & Protection (NEW) ---
const TransactionFlow = () => {
    const flowSteps = [
        { num: 1, text: "Buyer funds the escrow account" },
        { num: 2, text: "Seller delivers goods/services" },
        { num: 3, text: "Funds released to seller" },
    ];

    const protectionPoints = [
        "Buyer protection with secure fund holding",
        "Seller guarantee of payment upon delivery",
        "Dispute resolution system",
        "Real-time transaction tracking",
        "Multiple payment methods supported",
        "Transparent fee structure",
    ];

    return (
        <section className="flow-section">
            <div className="container flow-layout">
                {/* LEFT COLUMN: Transaction Flow */}
                <div className="flow-column">
                    <h2 className="column-title">Transaction Flow</h2>
                    {flowSteps.map(step => (
                        <div key={step.num} className="flow-item">
                            <div className="flow-number">{step.num}</div>
                            <span className="flow-text">{step.text}</span>
                        </div>
                    ))}
                </div>

                {/* RIGHT COLUMN: Complete Transaction Protection */}
                <div className="flow-column">
                    <h2 className="column-title">Complete Transaction Protection</h2>
                    <ul className="protection-list">
                        {protectionPoints.map((point, index) => (
                            <li key={index} className="protection-item">
                                <FiCheckCircle className="check-icon" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
};

// --- Sub-Component 4: Final CTA Section (Next step for styling) ---
const FinalCTA = ({ onShowLogin }) => {
    return (
        <section className="cta-section">
            <h2 className="cta-heading">Ready to Secure Your Next Transaction?</h2>
            <p className="cta-subtext">
                Join thousands of users who trust SecureEscrow. Get started in minutes with our simple, secure platform.
            </p>
            <button onClick={onShowLogin} className="cta-button btn-primary">
                Create Your First Escrow
            </button>
            <footer className="footer-copyright">
                © 2025 SecureEscrow. All rights reserved.
            </footer>
        </section>
    );
}


// --- Main LandingPage Component ---
const LandingPage = ({ onShowLogin, onShowRegister }) => {
    return (
        <main>
            {/* The main 'Login' button is usually a standalone header component,
                but we'll keep it integrated for simplicity here. */}
            <HeroSection onShowLogin={onShowLogin} />
            <WhyChoose />
            <TransactionFlow />
            <FinalCTA onShowLogin={onShowLogin} />
        </main>
    );
}

export default LandingPage;