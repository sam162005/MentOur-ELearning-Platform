import React, { useState } from "react";
import "./about.css";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { FaGraduationCap, FaUsers, FaAward, FaBookOpen, FaChevronDown } from "react-icons/fa";

const About = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mission");
  const [openFaq, setOpenFaq] = useState(null);
  
  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const tabData = {
    mission: {
      title: "Our Mission",
      content: "To democratize education by providing high-quality, practical, and affordable courses that enable individuals globally to transform their careers and lives. We believe in learning by doing.",
    },
    vision: {
      title: "Our Vision",
      content: "To build the world's most supportive and project-centric learning community where anyone can acquire modern, production-grade skills and receive verified credentialing recognized worldwide.",
    },
    values: {
      title: "Our Core Values",
      content: "Student success first, curriculum excellence, industry-alignment, accessible pricing, and continuous lifelong support from peer and instructor mentors.",
    },
  };

  const faqs = [
    {
      q: "How do I enroll in a course?",
      a: "Simply head over to the Courses catalog, pick your desired course, and click 'Get Started'. After completing payment, you will have instant access to all lectures, discussion boards, and quizzes."
    },
    {
      q: "Are the certificates verified?",
      a: "Yes! Every course includes an automated certification milestone. Once you complete 100% of the lectures and pass the course's final validation exam with a score of 70% or higher, you can print or download your verified Certificate of Completion."
    },
    {
      q: "Can I learn at my own pace?",
      a: "Absolutely. All courses are self-paced. Your progress and lecture playtimes are saved automatically on our servers, so you can resume learning right where you left off on any device."
    },
    {
      q: "How do I ask questions if I get stuck?",
      a: "Each lecture has an interactive Q&A Discussion Board. You can post a question directly tied to the exact video timestamp of where you got stuck, and our instructors or community peers will reply to help you out."
    }
  ];

  const team = [
    {
      name: "Sam",
      role: "Founder & Lead Developer",
      desc: "Full Stack Engineer passionate about building scalable web ecosystems and interactive learning experiences.",
      initial: "S"
    },
    {
      name: "John Durairaj",
      role: "Lead Systems Instructor",
      desc: "IT infrastructure expert specializing in Windows Server, Directory Services, and cloud operations.",
      initial: "J"
    },
    {
      name: "Varun",
      role: "Data Science Lead",
      desc: "Machine Learning Researcher focused on making analytics, statistics, and big data modeling accessible to everyone.",
      initial: "V"
    },
    {
      name: "Majid",
      role: "Cloud Architect",
      desc: "AWS & GCP certified designer specializing in cloud architecture, DevOps, and containerized deployment paths.",
      initial: "M"
    }
  ];

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Please fill in all contact fields.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast.success("Message sent successfully! We will get back to you soon.");
      setName("");
      setEmail("");
      setMessage("");
      setLoading(false);
    }, 1000);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="about-page-wrapper">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Welcome to <span className="text-gradient">MentOur</span></h1>
          <p>
            An innovative, high-impact e-learning ecosystem designed to empower
            individuals with verified, production-grade skills and credentialing to advance their careers.
          </p>
          <div className="hero-btns">
            <button className="common-btn explore-btn" onClick={() => navigate("/courses")}>
              Explore Courses
            </button>
          </div>
        </div>
      </section>

      {/* Tabs section (Mission, Vision, Values) */}
      <section className="about-tabs-section">
        <div className="tabs-container">
          <div className="tab-buttons">
            {Object.keys(tabData).map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tabData[tab].title}
              </button>
            ))}
          </div>
          <div className="tab-content">
            <h3>{tabData[activeTab].title}</h3>
            <p>{tabData[activeTab].content}</p>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="about-stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <FaBookOpen className="stat-icon" />
            <h3>10+</h3>
            <p>Expert-Led Courses</p>
          </div>
          <div className="stat-card">
            <FaUsers className="stat-icon" />
            <h3>500+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-card">
            <FaAward className="stat-icon" />
            <h3>150+</h3>
            <p>Certificates Issued</p>
          </div>
          <div className="stat-card">
            <FaGraduationCap className="stat-icon" />
            <h3>100%</h3>
            <p>Self-Paced Learning</p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-team-section">
        <h2>Meet Our Expert Instructors</h2>
        <div className="team-grid">
          {team.map((member, idx) => (
            <div key={idx} className="team-card">
              <div className="team-avatar-placeholder">
                {member.initial}
              </div>
              <h3>{member.name}</h3>
              <span className="team-role">{member.role}</span>
              <p>{member.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section className="about-faq-section">
        <h2>Frequently Asked Questions</h2>
        <div className="faq-list">
          {faqs.map((faq, idx) => (
            <div key={idx} className={`faq-item ${openFaq === idx ? "open" : ""}`}>
              <button className="faq-question" onClick={() => toggleFaq(idx)}>
                <span>{faq.q}</span>
                <FaChevronDown className="faq-chevron" />
              </button>
              <div className="faq-answer">
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact Us Form Section */}
      <section className="about-contact-section">
        <div className="contact-container">
          <div className="contact-info">
            <h2>Get In Touch</h2>
            <p>Have questions about a course, licensing, or corporate coaching? Send us a message and our support team will respond within 24 hours.</p>
            <div className="contact-details">
              <p>📍 Chennai, Tamil Nadu, India</p>
              <p>✉️ samgiftson563@gmail.com</p>
              <p>📞 +91 98765 43210</p>
            </div>
          </div>
          <div className="contact-form-card">
            <h3>Send Message</h3>
            <form onSubmit={handleContactSubmit}>
              <div className="form-group">
                <label>Your Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message</label>
                <textarea
                  placeholder="How can we help you?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={4}
                />
              </div>
              <button type="submit" disabled={loading} className="common-btn submit-btn">
                {loading ? "Sending..." : "Submit Message"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
