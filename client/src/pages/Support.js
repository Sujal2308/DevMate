import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

// FAQ Item Component with smooth animations
const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const contentRef = useRef(null);

  return (
    <div className="bg-x-dark border border-x-border rounded-xl overflow-hidden transition-all duration-300 hover:border-x-blue/50">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-x-darker transition-colors duration-200"
      >
        <h3
          className="text-lg text-x-white pr-4"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {question}
        </h3>
        <svg
          className={`w-5 h-5 text-x-blue transform transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden`}
      >
        <div
          className="px-6 pb-4 text-x-gray leading-relaxed"
          style={{ fontFamily: "Poppins, sans-serif" }}
        >
          {answer}
        </div>
      </div>
    </div>
  );
};

// Custom Select Component
const CustomSelect = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        className="w-full px-4 pr-10 py-3 bg-x-darker border border-x-border rounded-lg text-x-white focus:border-x-blue focus:ring-1 focus:ring-x-blue transition-colors duration-200 flex justify-between items-center"
        onClick={() => setOpen((o) => !o)}
      >
        <span>{selectedOption ? selectedOption.label : "Select..."}</span>
        <svg
          className="w-5 h-5 text-x-blue ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-10 mt-2 w-full bg-x-dark border border-x-border rounded-lg shadow-lg overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange({ target: { name: "priority", value: opt.value } });
                setOpen(false);
              }}
              className={`px-4 py-3 cursor-pointer transition-all duration-150 text-x-white hover:bg-x-blue/80 hover:text-white ${
                value === opt.value
                  ? "bg-x-blue/60 text-white font-semibold"
                  : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// Contact Form Component
const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    priority: "medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        priority: "medium",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 2000);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-x-white mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-x-darker border border-x-border rounded-lg text-x-white placeholder-x-gray focus:border-x-blue focus:ring-1 focus:ring-x-blue transition-colors duration-200"
            placeholder="Enter your full name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-x-white mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 bg-x-darker border border-x-border rounded-lg text-x-white placeholder-x-gray focus:border-x-blue focus:ring-1 focus:ring-x-blue transition-colors duration-200"
            placeholder="Enter your email"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-x-white mb-2">
          Priority Level
        </label>
        <CustomSelect
          value={formData.priority}
          onChange={handleChange}
          options={[
            { value: "low", label: "Low - General inquiry" },
            { value: "medium", label: "Medium - Account issues" },
            { value: "high", label: "High - Technical problems" },
            { value: "urgent", label: "Urgent - Security concerns" },
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-x-white mb-2">
          Subject *
        </label>
        <input
          type="text"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-4 py-3 bg-x-darker border border-x-border rounded-lg text-x-white placeholder-x-gray focus:border-x-blue focus:ring-1 focus:ring-x-blue transition-colors duration-200"
          placeholder="Brief description of your issue"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-x-white mb-2">
          Message *
        </label>
        <textarea
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={6}
          className="w-full px-4 py-3 bg-x-darker border border-x-border rounded-lg text-x-white placeholder-x-gray focus:border-x-blue focus:ring-1 focus:ring-x-blue transition-colors duration-200 resize-vertical"
          placeholder="Please provide detailed information about your issue or question..."
        />
      </div>

      {submitStatus === "success" && (
        <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4 text-green-400">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>
              Your message has been sent successfully! We'll get back to you
              within 24 hours.
            </span>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg transition-all duration-300 ${
          isSubmitting
            ? "opacity-70 cursor-not-allowed"
            : "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {isSubmitting ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Sending...</span>
          </div>
        ) : (
          "Send Message"
        )}
      </button>
    </form>
  );
};

// Guideline Item Component
const GuidelineItem = ({ icon, title, description, tips }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-x-dark border border-x-border rounded-xl p-6 hover:border-x-blue/50 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-2xl flex-shrink-0 border-4 border-purple-500">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold text-x-white mb-3">{title}</h3>
          <p className="text-x-gray mb-4 leading-relaxed">{description}</p>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-x-blue hover:text-x-blue-hover font-medium text-sm transition-colors duration-200"
          >
            {isExpanded ? "Show Less" : "Show Tips"} →
          </button>

          <div
            className={`transition-all duration-300 ease-in-out ${
              isExpanded ? "max-h-96 opacity-100 mt-4" : "max-h-0 opacity-0"
            } overflow-hidden`}
          >
            <ul className="space-y-2">
              {tips?.map((tip, index) => (
                <li
                  key={index}
                  className="flex items-start space-x-3 text-sm text-x-gray"
                >
                  <span className="w-1.5 h-1.5 bg-x-blue rounded-full mt-2 flex-shrink-0"></span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Support Component
const Support = () => {
  const [activeSection, setActiveSection] = useState("faq");
  const [openFAQ, setOpenFAQ] = useState(null);

  // Ref for contact section
  const contactSectionRef = useRef(null);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
  }, []);

  // Handler to switch to contact section and scroll
  const goToContactSection = () => {
    setActiveSection("contact");
    setTimeout(() => {
      if (contactSectionRef.current) {
        contactSectionRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100); // Wait for section to render
  };

  const faqData = [
    {
      question: "How do I create my first post on DevMate?",
      answer:
        "To create a post, click the 'Create' button in the navigation bar or the floating '+' button on your feed. You can share code snippets, project updates, questions, or general thoughts. Use markdown for formatting and add relevant tags to help others discover your content.",
    },
    {
      question: "How can I customize my profile?",
      answer:
        "Go to your profile page and click 'Edit Profile'. You can update your display name, bio, profile picture, location, skills, and social links. A complete profile helps other developers connect with you and understand your expertise.",
    },
    {
      question: "What types of content can I share?",
      answer:
        "DevMate supports various content types: code snippets with syntax highlighting, project showcases, tutorials, questions, job postings, and general developer discussions. All content should be relevant to software development and follow our community guidelines.",
    },
    {
      question: "How does the privacy system work?",
      answer:
        "You can set posts as public (visible to everyone), followers-only, or private (only you). Your profile visibility, contact information, and activity status can also be customized in Settings > Privacy. We never share your data with third parties.",
    },
    {
      question: "How do I report inappropriate content?",
      answer:
        "Click the three-dot menu on any post or comment and select 'Report'. Choose the appropriate reason and provide additional details if needed. Our moderation team reviews all reports within 24 hours and takes appropriate action.",
    },
    {
      question: "Can I delete my account and data?",
      answer:
        "Yes, you can permanently delete your account in Settings > Account > Delete Account. This action removes all your posts, comments, and personal data within 30 days. Downloaded backups of your content are available before deletion.",
    },
    {
      question: "How do I connect with other developers?",
      answer:
        "Use the Explore page to discover developers by skills, location, or interests. Follow users whose content you enjoy, participate in discussions, and join community events. The platform also suggests relevant connections based on your activity.",
    },
    {
      question: "What should I do if I forgot my password?",
      answer:
        "Click 'Forgot Password' on the login page and enter your email address. You'll receive a password reset link within a few minutes. If you don't see the email, check your spam folder or contact support.",
    },
  ];

  const guidelines = [
    {
      icon: "🤝",
      title: "Be Respectful & Professional",
      description:
        "Treat all community members with respect and professionalism. DevMate is a place for constructive collaboration and learning.",
      tips: [
        "Use constructive language when providing feedback",
        "Respect different skill levels and backgrounds",
        "Avoid personal attacks or discriminatory comments",
        "Be patient with newcomers and help them learn",
      ],
    },
    {
      icon: "💻",
      title: "Share Quality Content",
      description:
        "Post content that adds value to the developer community. Focus on sharing knowledge, experiences, and useful resources.",
      tips: [
        "Provide clear descriptions for code snippets",
        "Use proper formatting and syntax highlighting",
        "Include relevant tags to help discoverability",
        "Share original content or properly credit sources",
      ],
    },
    {
      icon: "🔒",
      title: "Protect Privacy & Security",
      description:
        "Keep your personal information and others' data safe. Be mindful of what you share publicly.",
      tips: [
        "Don't share sensitive credentials or API keys",
        "Respect others' privacy and personal information",
        "Use privacy settings to control who sees your content",
        "Report security vulnerabilities responsibly",
      ],
    },
    {
      icon: "🚫",
      title: "Avoid Prohibited Content",
      description:
        "Certain types of content are not allowed on DevMate to maintain a safe and professional environment.",
      tips: [
        "No spam, self-promotion, or excessive advertising",
        "No malicious code or harmful software",
        "No copyright infringement or plagiarism",
        "No off-topic content unrelated to development",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-x-black text-x-white">
      {/* Back to Home Navigation (Mobile only, fixed, back arrow icon, functional, highest z-index, visible) */}
      <div className="md:hidden">
        <Link
          to="/"
          className="fixed top-20 left-4 z-[9999] w-12 h-12 flex items-center justify-center rounded-full border-2 border-transparent bg-x-dark/90 text-2xl font-bold text-x-white hover:bg-x-darker hover:border-x-blue transition-all duration-200 group shadow-lg"
          aria-label="Back to Home"
          style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.18)" }}
        >
          <svg
            className="h-7 w-7 text-white group-hover:text-x-green transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Back to Home Navigation (Desktop only, fixed, back arrow icon, functional) */}
      <div className="fixed top-20 left-6 z-50 hidden md:flex items-center">
        <Link
          to="/"
          className="w-12 h-12 flex items-center justify-center rounded-full border-2 border-x-border bg-x-dark/90 text-2xl font-bold text-x-white hover:bg-x-darker hover:border-x-blue transition-all duration-200 group shadow-lg"
          aria-label="Back to Home"
        >
          <svg
            className="h-7 w-7 text-x-gray group-hover:text-x-blue transition-all duration-200"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative pt-28 md:pt-20 pb-16 overflow-hidden animate-hero-fade-in">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-x-blue/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-x-green/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-x-purple/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-x-white mb-6">
            How Can We
            <span className="block bg-gradient-to-r from-x-blue to-x-green bg-clip-text text-transparent animate-help-you-gradient">
              <span className="help-you-animated">Help You?</span>
            </span>
          </h1>
          <p
            className="text-xl md:text-2xl text-x-gray mb-8 max-w-3xl mx-auto leading-relaxed"
            style={{ fontFamily: "Poppins, sans-serif" }}
          >
            Get the support you need to make the most of DevMate. Find answers,
            get help, and learn about our community guidelines.
          </p>

          {/* Quick Contact Options */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <div className="flex flex-row items-center px-6 py-3 bg-x-dark border border-x-border rounded-lg text-center">
              <span className="w-full text-center font-mono md:font-normal">
                support@devmate.com
              </span>
            </div>
            <button
              onClick={goToContactSection}
              className="px-6 py-3 bg-[#0a1747] md:bg-[#0a1747] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Contact Support
            </button>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-0 z-40 bg-x-black/95 backdrop-blur-sm border-b border-x-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
            {[
              { id: "faq", label: "FAQ", icon: "❓" },
              { id: "contact", label: "Contact", icon: "📞" },
              { id: "guidelines", label: "Guidelines", icon: "📋" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 whitespace-nowrap transition-all duration-200 ${
                  activeSection === tab.id
                    ? "border-x-blue text-x-blue"
                    : "border-transparent text-x-gray hover:text-x-white hover:border-x-gray"
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* FAQ Section */}
          {activeSection === "faq" && (
            <div id="faq-section" className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    background: "linear-gradient(90deg, #C0C0C0, #ECECEC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Frequently Asked Questions
                </h2>
                <p className="text-xl text-x-gray font-mono">
                  Find quick answers to common questions about DevMate
                </p>
              </div>

              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <FAQItem
                    key={index}
                    question={faq.question}
                    answer={faq.answer}
                    isOpen={openFAQ === index}
                    onToggle={() =>
                      setOpenFAQ(openFAQ === index ? null : index)
                    }
                  />
                ))}
              </div>

              <div className="mt-12 text-center">
                <p className="text-x-gray mb-4">
                  Can't find what you're looking for?
                </p>
                <button
                  onClick={goToContactSection}
                  className="px-6 py-3 bg-[tomato] text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Contact Support
                </button>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === "contact" && (
            <div
              id="contact-section"
              ref={contactSectionRef}
              className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-12">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    background: "linear-gradient(90deg, #C0C0C0, #ECECEC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Contact Support
                </h2>
                <p className="text-xl text-x-gray">
                  Get in touch with our support team for personalized assistance
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8 sm:gap-6">
                {/* Email Support Card */}
                <div className="bg-x-dark/70 border border-x-border rounded-lg p-4 sm:p-6 min-h-[90px] flex flex-col sm:items-center sm:text-center text-left backdrop-blur-md">
                  <div className="flex flex-row items-center sm:flex-col sm:items-center w-full">
                    <div className="w-12 h-12 sm:w-10 sm:h-10 bg-black rounded-full flex items-center justify-center mr-3 sm:mr-0 sm:mb-4">
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                    <div>
                      <div
                        className="text-white text-lg sm:text-xl font-bold mb-1"
                        style={{ fontFamily: "Poppins, sans-serif" }}
                      >
                        Send an email on
                      </div>
                      <a
                        href="mailto:support@devmate.com"
                        className="text-x-blue hover:underline text-base font-mono"
                        style={{ fontFamily: "Poppins, monospace" }}
                      >
                        support@devmate.com
                      </a>
                    </div>
                  </div>
                </div>
                {/* Response Time Card */}
                <div className="bg-x-dark/70 border border-x-border rounded-lg p-4 sm:p-6 min-h-[90px] flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center backdrop-blur-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center mr-4 sm:mr-0 mb-0 sm:mb-4">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-x-white mb-1 sm:mb-2">
                      Response Time
                    </h3>
                    <p className="text-x-gray text-xs sm:text-sm mb-2 sm:mb-3">
                      We typically respond within
                    </p>
                    <span className="text-x-green font-semibold text-xs sm:text-base">
                      24 hours
                    </span>
                  </div>
                </div>
                {/* Location Card */}
                <div className="bg-x-dark/70 border border-x-border rounded-lg p-4 sm:p-6 min-h-[90px] flex flex-row sm:flex-col items-center sm:items-center text-left sm:text-center backdrop-blur-md">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-black rounded-full flex items-center justify-center mr-4 sm:mr-0 mb-0 sm:mb-4">
                    <svg
                      className="w-6 h-6 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-x-white mb-1 sm:mb-2">
                      Location
                    </h3>
                    <p className="text-x-gray text-xs sm:text-sm mb-2 sm:mb-3">
                      Based in
                    </p>
                    <span className="text-x-blue text-xs sm:text-base">
                      Global Support
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-x-dark border border-x-border rounded-xl p-8">
                <h3 className="text-2xl font-bold text-x-white mb-6">
                  Send us a Message
                </h3>
                <ContactForm />
              </div>
            </div>
          )}

          {/* Guidelines Section */}
          {activeSection === "guidelines" && (
            <div id="guidelines-section" className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2
                  className="text-4xl font-bold mb-4"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    background: "linear-gradient(90deg, #C0C0C0, #ECECEC)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Community Guidelines
                </h2>
                <p className="text-xl text-x-gray font-mono block">
                  <span className="block sm:inline">
                    Learn about our community standards and best practices for
                  </span>
                  <span className="block sm:inline">engaging on DevMate</span>
                </p>
              </div>

              <div className="grid gap-8">
                {guidelines.map((guideline, index) => (
                  <GuidelineItem
                    key={index}
                    icon={guideline.icon}
                    title={guideline.title}
                    description={guideline.description}
                    tips={guideline.tips}
                  />
                ))}
              </div>

              <div className="mt-12 bg-gradient-to-r from-x-blue/10 to-x-green/10 border border-x-blue/20 rounded-xl p-8 text-center">
                <h3 className="text-2xl font-bold text-x-white mb-4">
                  Have Questions About Our Guidelines?
                </h3>
                <p className="text-x-gray mb-6 font-mono">
                  If you're unsure about whether content is appropriate or have
                  questions about our community standards, don't hesitate to
                  reach out.
                </p>
                <button
                  onClick={goToContactSection}
                  className="px-6 py-3 bg-amber-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Ask a Question
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Desktop Footer */}
      <footer className="border-t border-x-border bg-x-black hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-[#38bdf8] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold text-x-white">DevMate</span>
              </div>
              <p className="text-x-gray mb-4 max-w-md">
                Get the support you need to succeed on DevMate. We're here to
                help you connect, learn, and grow.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-x-white font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => setActiveSection("faq")}
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    FAQ
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("contact")}
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("guidelines")}
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    Guidelines
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-x-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:support@devmate.com"
                    className="text-x-gray hover:text-x-blue transition-colors"
                  >
                    support@devmate.com
                  </a>
                </li>
                <li className="text-x-gray">24/7 Support</li>
                <li className="text-x-gray">Global Coverage</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-x-border pt-6 flex flex-col md:flex-row justify-between items-center">
            <div className="text-x-gray text-sm mb-2 md:mb-0">
              © 2025 DevMate Support. Here to help developers succeed.
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-x-green rounded-full animate-pulse"></div>
              <span className="text-x-green text-sm">Support team online</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Footer: Home page style only */}
      <div
        className="border-t border-x-border/50 pt-8 bg-x-black w-full block md:hidden px-4 pb-8"
        style={{ minHeight: "180px" }}
      >
        <div className="flex flex-col items-center space-y-6 pb-0 h-full">
          {/* Logo and name */}
          <div className="flex flex-col w-full mb-2">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-x-blue rounded-full flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">D</span>
                </div>
                <span className="text-xl font-bold text-x-white">DevMate</span>
              </div>
              <div className="flex items-center space-x-2">
                <span role="img" aria-label="sparkles" className="text-2xl">
                  🧑‍💻
                </span>
                <span role="img" aria-label="flamingo" className="text-2xl">
                  🦩
                </span>
                <span role="img" aria-label="chat" className="text-2xl">
                  💬
                </span>
              </div>
            </div>
            <span
              className="mt-3 text-xs pl-2"
              style={{
                color: "silver",
                fontFamily: "monospace",
                letterSpacing: "0.03em",
              }}
            >
              Built for coders. Designed for inspiration.
            </span>
            <div className="flex flex-row justify-center items-center space-x-6 mt-10 mb-4">
              <a
                href="#faq-section"
                className="text-x-gray text-sm font-medium hover:underline"
              >
                FAQ
              </a>
              <span className="h-4 w-px bg-x-border mx-3"></span>
              <a
                href="#contact-section"
                className="text-x-gray text-sm font-medium hover:underline"
              >
                Contact
              </a>
              <span className="h-4 w-px bg-x-border mx-3"></span>
              <a
                href="#guidelines-section"
                className="text-x-gray text-sm font-medium hover:underline"
              >
                Guidelines
              </a>
            </div>
          </div>
          {/* Copyright */}
          <div className="text-x-gray text-xs text-center border-t border-x-border/30 pt-2 mb-6 w-full">
            © 2025 DevMate. Made with <span className="text-red-400">❤️</span>{" "}
            for developers.
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes helpYouGradient {
          0% {
            color: #fb7185;
          }
          25% {
            color: #38bdf8;
          }
          50% {
            color: #34d399;
          }
          75% {
            color: #fbbf24;
          }
          100% {
            color: #fb7185;
          }
        }
        .help-you-animated {
          animation: helpYouGradient 3s linear infinite;
        }
        @keyframes heroFadeIn {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-hero-fade-in {
          animation: heroFadeIn 1s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
};

export default Support;
