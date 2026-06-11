import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Testimonials from "../../components/testimonials/Testimonials";
import "./home.css";
import "@fontsource/roboto";
import "@fontsource/roboto/700.css";
import "@fontsource/lato";
import "@fontsource/open-sans";

import image1 from "../../images/e-learning.jpg";
import image2 from "../../images/img.jpg";
import image3 from "../../images/post-thumb.webp";



const Home = ({ user }) => {
  const navigate = useNavigate();


  const images = [image1, image2, image3];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); 
    return () => clearTimeout(timer); 
  }, [currentImageIndex]);

  return (
    <div className="home-page-container">
      <div className="home">
        <div className="home-container">
          <div className="home-content">
            {user && (
              <span className="welcome-tag">👋 Welcome back, {user.name}!</span>
            )}
            <h1>Knowledge Empowered, Skills Perfected</h1>
            <p>
              Accelerate your personal and professional growth with MentOur. Access top-tier curriculum, engage in interactive Q&A discussions, and earn industry-recognized certifications.
            </p>
            <div className="home-cta-buttons">
              <button onClick={() => navigate("/courses")} className="common-btn explore-btn">
                Explore Courses
              </button>
              <button onClick={() => navigate("/about")} className="common-btn outline-btn">
                Learn More
              </button>
            </div>
            
            <div className="hero-metrics">
              <div className="metric-item">
                <span className="metric-num">10k+</span>
                <span className="metric-lbl">Active Students</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-num">200+</span>
                <span className="metric-lbl">Lectures</span>
              </div>
              <div className="metric-divider"></div>
              <div className="metric-item">
                <span className="metric-num">4.8★</span>
                <span className="metric-lbl">Top Reviews</span>
              </div>
            </div>
          </div>
          
          <div className="home-visual">
            <div className="image-slider-wrapper">
              <img
                src={images[currentImageIndex]}
                alt={`Slide ${currentImageIndex + 1}`}
                className="slider-image"
              />
              <div className="slider-dots">
                {images.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === currentImageIndex ? "active" : ""}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="features">
        <h2>Why Choose MentOur?</h2>
        <div className="feature-cards">
          <div
            className="feature-card"
            style={{ backgroundImage: 'url("/src/images/earth.jpg")' }}
          >
            <div className="feature-card-text">
              <h3>Global Community</h3>
              <p>Connect with learners and expert instructors from around the globe.</p>
            </div>
          </div>
          <div
            className="feature-card"
            style={{ backgroundImage: 'url("/src/images/education.png")' }}
          >
            <div className="feature-card-text">
              <h3>Interactive Q&A</h3>
              <p>Post questions tagged at exact timestamps and seek through lectures.</p>
            </div>
          </div>
          <div
            className="feature-card"
            style={{ backgroundImage: 'url("/src/images/certificate.jpg")' }}
          >
            <div className="feature-card-text">
              <h3>Earn Certifications</h3>
              <p>Pass quizzes and claim your official graduation credentials.</p>
            </div>
          </div>
        </div>
      </div>

      <Testimonials />

      <div className="cta">
        <div className="cta-content">
          <h2>Join MentOur Today</h2>
          <p>
            Start your journey towards personal and professional growth. Discover
            endless possibilities with MentOur!
          </p>
          <button onClick={() => navigate("/Login")} className="cta-btn">
            Join Now
          </button>
        </div>
        <img src="/src/images/thumbnail-removebg.png" alt="Join Now" className="cta-image" />
      </div>
    </div>
  );
};

export default Home;
