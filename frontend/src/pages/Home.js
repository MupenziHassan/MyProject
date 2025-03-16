import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Early Cancer Detection Saves Lives</h1>
            <p className="hero-subtitle">
              Advanced AI-powered cancer risk assessment based on your health data
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">Get Started</Link>
              <Link to="/about" className="btn btn-outline">Learn More</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/images/hero-image.png" alt="Cancer prediction technology" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        {/* ... Feature blocks ... */}
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        {/* ... Process steps ... */}
      </section>

      {/* Testimonials Section */}
      <section className="testimonials">
        {/* ... Testimonial cards ... */}
      </section>

      {/* Call to Action */}
      <section className="cta">
        <div className="container">
          <h2>Take Control of Your Health Today</h2>
          <p>Join thousands of users who have benefited from early risk assessment</p>
          <Link to="/register" className="btn btn-primary">Create Your Account</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
