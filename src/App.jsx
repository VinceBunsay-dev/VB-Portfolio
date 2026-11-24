import { useState, useEffect, useRef } from "react";
import { DEVELOPER_PROFILE, WORK_CARDS } from "./data/projects";
import IridescentCross3D from "./components/IridescentCross3D";
import "./App.css";

function AnimatedStatNumber({ target, active }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    let current = 0;
    const stepTime = Math.max(45, Math.floor(850 / Math.max(target, 1)));

    const timer = setInterval(() => {
      current += 1;
      setCount(current);
      if (current >= target) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target, active]);

  return <span>{String(count).padStart(2, "0")}</span>;
}

export default function App() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeSection, setActiveSection] = useState("top");
  const [statsVisible, setStatsVisible] = useState(false);
  const [scrollRatio, setScrollRatio] = useState(0);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const snapRef = useRef(null);
  const dragStartX = useRef(null);

  const nextCard = () => {
    setActiveIndex((prev) => (prev + 1) % WORK_CARDS.length);
  };

  const prevCard = () => {
    setActiveIndex((prev) => (prev - 1 + WORK_CARDS.length) % WORK_CARDS.length);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const normX = (e.clientX / window.innerWidth - 0.5) * 2;
      const normY = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouse({ x: normX, y: normY });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const container = snapRef.current;
    if (!container) return;

    const handleScroll = () => {
      const maxScroll = container.scrollHeight - container.clientHeight;
      const ratio = maxScroll > 0 ? container.scrollTop / maxScroll : 0;
      setScrollRatio(ratio);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const container = snapRef.current;
    if (!container) return;

    const sectionIds = ["top", "about", "stats", "work"];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
            if (entry.target.id === "stats") {
              setStatsVisible(true);
            }
          }
        });
      },
      { root: container, threshold: 0.45 }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handlePointerDown = (e) => {
    dragStartX.current = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (dragStartX.current === null) return;
    const diff = e.clientX - dragStartX.current;
    if (diff < -45) nextCard();
    if (diff > 45) prevCard();
    dragStartX.current = null;
  };

  // Continuous aurora wash movement synchronized with scroll & cursor
  const bgShiftX = -scrollRatio * 420 + mouse.x * 75;
  const bgShiftY = (0.5 - scrollRatio) * 160 + mouse.y * 55;
  
  const marqueeItems = Array.from({ length: 8 });

  return (
    <div className="kinetic-page">
      {/* Ambient Aurora & Shifting Teal/Violet Backdrop */}
      <div className="aurora-bg" aria-hidden="true">
        <div
          className="aurora-wash"
          style={{
            transform: `translate3d(${bgShiftX}px, ${bgShiftY}px, 0) scale(${
              1.08 + scrollRatio * 0.06
            })`,
          }}
        />
      </div>

      {/* 3D Iridescent Cross Emblem Across Sections */}
      <IridescentCross3D scrollRatio={scrollRatio} mouse={mouse} />

      {/* Fixed Top Bar */}
      <header className="top-bar">
        <a href="#top" className="monogram">
          {DEVELOPER_PROFILE.monogram}
        </a>
        <a href={`mailto:${DEVELOPER_PROFILE.email}`} className="say-hello-btn">
          SAY HELLO
        </a>
      </header>

      <main ref={snapRef} className="snap-container">
        {/* TOP HERO */}
        <section id="top" className="snap-section top-hero-grid">
          <svg
            className="section-circuit-svg"
            viewBox="0 0 1100 460"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M340 42 H670 L700 72 V145 H1030 M60 365 H310 L340 395 V440"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="1.25"
            />
          </svg>

          <div className="hero-left-col">
            <h1 className="mega-name">
              <span>{DEVELOPER_PROFILE.firstName}</span>
              <span>{DEVELOPER_PROFILE.lastName}</span>
            </h1>

            <p className="portfolio-year-tag">{DEVELOPER_PROFILE.yearTag}</p>

            <div className="pillars-row">
              {DEVELOPER_PROFILE.pillars.map((pillar, i) => (
                <span key={pillar} className="pillar-item">
                  {pillar}
                  {i < DEVELOPER_PROFILE.pillars.length - 1 && (
                    <span className="pillar-asterisk">✳</span>
                  )}
                </span>
              ))}
            </div>

            <a href="#about" className="scroll-explore-link">
              SCROLL TO EXPLORE ↓
            </a>
          </div>

          <div className="hero-right-col" />
        </section>

        {/* 01. ABOUT */}
        <section id="about" className="snap-section about-showcase">
          <div className="about-grid">
            <div className="about-card-wrap">
              <span className="pixel-dots dots-top" aria-hidden="true" />
              <div className="about-photo-frame">
                {DEVELOPER_PROFILE.photoUrl ? (
                  <img
                    src={DEVELOPER_PROFILE.photoUrl}
                    alt={`${DEVELOPER_PROFILE.firstName} ${DEVELOPER_PROFILE.lastName}`}
                    className="about-photo-img"
                  />
                ) : (
                  <div className="about-monogram-card">
                    <span className="about-card-badge">01 // PROFILE</span>
                    <span className="about-card-big-initials">VB</span>
                    <span className="about-card-sub">FULL-STACK + 4 YRS CSR OPS</span>
                  </div>
                )}
              </div>
              <span className="pixel-dots dots-bottom" aria-hidden="true" />
            </div>

            <div className="about-bio-col">
              <h2 className="about-role-heading">
                <span>{DEVELOPER_PROFILE.roleTitleTop}</span>
                <span>{DEVELOPER_PROFILE.roleTitleBottom}</span>
              </h2>

              <p className="about-bio-text">{DEVELOPER_PROFILE.bio}</p>

              <div className="about-footer-row">
                <p className="about-location">
                  <span className="location-spark">✳</span> {DEVELOPER_PROFILE.location}
                </p>

                <svg
                  className="signature-svg"
                  viewBox="0 0 220 70"
                  fill="none"
                  aria-label="Signature flourish"
                >
                  <path
                    d="M16 48 C34 14, 46 14, 52 46 C56 26, 68 24, 74 42 C82 28, 96 28, 106 40 C124 22, 168 18, 204 26"
                    stroke="rgba(248, 250, 252, 0.85)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <div className="hero-cta-row">
                <a href="#work" className="action-pill primary">
                  VIEW PROJECTS ↓
                </a>
                <a
                  href={DEVELOPER_PROFILE.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="action-pill secondary"
                >
                  GITHUB ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 02. STATS */}
        <section id="stats" className="snap-section stats-showcase">
          <svg
            className="section-circuit-svg"
            viewBox="0 0 1000 420"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M120 40 H620 L650 70 V140 H940 M40 240 H240 L270 270 V360 H780 L810 330 V220"
              stroke="rgba(255, 255, 255, 0.14)"
              strokeWidth="1.25"
            />
          </svg>

          <div className="stats-inner-wrap">
            <div className="stats-split-layout">
              <div className="stats-visual-col" />

              <div className="stats-list-col">
                {DEVELOPER_PROFILE.stats.map((item) => (
                  <div key={item.label} className="stat-row-item">
                    <div className="stat-num-cluster">
                      <span className="stat-hollow-num">
                        <AnimatedStatNumber target={item.target} active={statsVisible} />
                      </span>
                      <span className="stat-plus-sign">{item.plus}</span>
                    </div>
                    <span className="stat-side-label">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stack-ticker-wrap">
              {DEVELOPER_PROFILE.stack.map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 03. WORK (DUAL SELECTED WORK MARQUEES + LEFT-PEEL / RIGHT-STACK DECK) */}
        <section id="work" className="snap-section work-section">
          {/* Upper Marquee Rail */}
          <div className="marquee-rail rail-upper" aria-hidden="true">
            <div className="marquee-track scroll-left">
              {marqueeItems.map((_, i) => (
                <span key={`up-a-${i}`} className="marquee-badge">
                  SELECTED WORK
                </span>
              ))}
              {marqueeItems.map((_, i) => (
                <span key={`up-b-${i}`} className="marquee-badge">
                  SELECTED WORK
                </span>
              ))}
            </div>
          </div>

          {/* Lower Staggered Marquee Rail */}
          <div className="marquee-rail rail-lower" aria-hidden="true">
            <div className="marquee-track scroll-right">
              {marqueeItems.map((_, i) => (
                <span key={`dn-a-${i}`} className="marquee-badge">
                  SELECTED WORK
                </span>
              ))}
              {marqueeItems.map((_, i) => (
                <span key={`dn-b-${i}`} className="marquee-badge">
                  SELECTED WORK
                </span>
              ))}
            </div>
          </div>

          <div
            className="deck-stage"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
          >
            {WORK_CARDS.map((card, idx) => {
              const total = WORK_CARDS.length;
              const stackStep = (idx - activeIndex + total) % total;

              let cardTransform = "";
              let cardOpacity = 1;
              let cardZIndex = 10;

              if (stackStep === 0) {
                cardTransform = `perspective(1000px) rotateY(${mouse.x * 3.5}deg) rotateX(${
                  -mouse.y * 3.5
                }deg) translate3d(0px, 0px, 0px) rotate(0deg) scale(1)`;
                cardOpacity = 1;
                cardZIndex = 20;
              } else {
                cardTransform = `translate3d(${-stackStep * 28}px, ${
                  -stackStep * 6
                }px, 0px) rotate(${-stackStep * 1.6}deg) scale(${1 - stackStep * 0.035})`;
                cardOpacity = Math.max(0.45, 0.88 - stackStep * 0.16);
                cardZIndex = 18 - stackStep;
              }

              return (
                <article
                  key={card.id}
                  onClick={() => stackStep !== 0 && setActiveIndex(idx)}
                  className={`stacked-card ${stackStep === 0 ? "is-front" : "is-side"}`}
                  style={{
                    zIndex: cardZIndex,
                    transform: cardTransform,
                    opacity: cardOpacity,
                  }}
                >
                  <div className="card-top">
                    <div className="card-meta-row">
                      <span className="card-index">#{card.index}</span>
                      <span className="card-category">{card.category}</span>
                    </div>

                    <p className="card-description">{card.description}</p>

                    <ul className="card-highlights">
                      {card.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>

                    <div className="card-tech-row">
                      {card.tech.map((t) => (
                        <span key={t} className="card-mini-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div
                    className="card-bottom"
                    style={{ backgroundColor: card.accent }}
                  >
                    <div>
                      <h2 className="card-title">{card.title}</h2>
                      <p className="card-role">{card.roleBadge}</p>
                    </div>

                    <div className="card-links">
                      {card.liveUrl && (
                        <a
                          href={card.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          LIVE ↗
                        </a>
                      )}
                      {card.repoUrl && (
                        <a
                          href={card.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="card-btn"
                          onClick={(e) => e.stopPropagation()}
                        >
                          CODE ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="deck-controls">
            <button onClick={prevCard} className="deck-nav-btn" aria-label="Previous card">
              ← PREV
            </button>
            <span className="deck-counter">
              0{activeIndex + 1} / 0{WORK_CARDS.length}
            </span>
            <button onClick={nextCard} className="deck-nav-btn" aria-label="Next card">
              NEXT →
            </button>
          </div>
        </section>
      </main>

      {/* Floating Bottom Navigation Dock */}
      <nav className="floating-dock" aria-label="Section navigation">
        <a href="#top" className="dock-brand">
          {DEVELOPER_PROFILE.monogram}
        </a>
        <a
          href="#about"
          className={`dock-link ${activeSection === "about" ? "is-active" : ""}`}
        >
          01. ABOUT
        </a>
        <span className="dock-star">✳</span>
        <a
          href="#stats"
          className={`dock-link ${activeSection === "stats" ? "is-active" : ""}`}
        >
          02. STATS
        </a>
        <span className="dock-star">✳</span>
        <a
          href="#work"
          className={`dock-link ${activeSection === "work" ? "is-active" : ""}`}
        >
          03. WORK
        </a>
      </nav>
    </div>
  );
}