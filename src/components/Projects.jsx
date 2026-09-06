import { useState, useEffect, useCallback } from "react";
import { FadeIn, StaggerParent, StaggerItem } from "./FadeIn";
import insyteImg from "../assets/insyte.png";
import iplImg from "../assets/ipl.png";

const PROJECTS = [
  {
    id: "insyte",
    category: "DATA ANALYSIS & AUTOMATION",
    title: "Insyte — Smart Dataset Analyzer",
    description:
      "An automated dataset analysis platform that processes datasets, performs data cleaning, generates statistical summaries, visualizations, and automated insights.",
    tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Streamlit"],
    image: insyteImg,
    github: "https://github.com/devyansh-01",
    demo: "https://insyte-dataset-analyzer-btpqnnvvlfr87pn3dkarjw.streamlit.app/",
    highlights: [
      {
        title: "Automated Dataset Processing",
        desc: "Processes datasets and generates statistical summaries.",
      },
      {
        title: "Data Cleaning",
        desc: "Detects missing values, duplicates, and data inconsistencies.",
      },
      {
        title: "Visual Insights",
        desc: "Generates multiple visualizations for easier interpretation.",
      },
      {
        title: "Automated Insights",
        desc: "Reduces manual analysis effort through automated insight generation.",
      },
    ],
  },
  {
    id: "ipl",
    category: "DATA ANALYSIS & VISUALIZATION",
    title: "IPL Data Analysis",
    description:
      "An analytical project exploring IPL match data to identify player and team performance trends, scoring patterns, venue-based trends, and match insights.",
    tech: ["Python", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Power BI"],
    image: iplImg,
    github: "https://github.com/devyansh-01",
    demo: null,
    highlights: [
      {
        title: "Analysis Across 15+ Seasons",
        desc: "Analyzed IPL data covering 15+ seasons and 10,000+ match records.",
      },
      {
        title: "Player & Team Performance",
        desc: "Identified player and team performance trends.",
      },
      {
        title: "Data Visualization",
        desc: "Created visualizations highlighting scoring patterns and team statistics.",
      },
      {
        title: "Venue-Based Insights",
        desc: "Explored venue-based trends and win probabilities.",
      },
    ],
  },
];

function ProjectModal({ project, onClose }) {
  const handleKey = useCallback(
    (e) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [handleKey]);

  if (!project) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative bg-[var(--surface)] border border-[var(--border)] rounded-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          width: "72vw",
          maxWidth: "1100px",
          minWidth: 0,
          animation: "modalIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--surface-2)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--border)] transition-colors"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Screenshot */}
        <div className="w-full h-52 sm:h-64 overflow-hidden rounded-t-2xl bg-[var(--surface-2)]">
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover object-top"
          />
        </div>

        <div className="p-6 sm:p-8">
          {/* Category */}
          <p className="text-xs font-mono font-semibold tracking-widest text-[var(--accent)] uppercase mb-3">
            {project.category}
          </p>

          {/* Title */}
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight">
            {project.title}
          </h3>

          {/* Description */}
          <p className="text-[var(--fg-muted)] leading-relaxed mb-8">
            {project.description}
          </p>

          {/* Highlights */}
          <div className="mb-8">
            <p className="text-xs font-mono font-semibold tracking-widest text-[var(--fg-dim)] uppercase mb-4">
              Highlights
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {project.highlights.map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]"
                >
                  <p className="text-sm font-semibold mb-1">{h.title}</p>
                  <p className="text-xs text-[var(--fg-muted)] leading-relaxed">
                    {h.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Tech stack */}
          <div className="mb-8">
            <p className="text-xs font-mono font-semibold tracking-widest text-[var(--fg-dim)] uppercase mb-3">
              Tech Stack
            </p>
            <div className="flex flex-wrap gap-2">
              {project.tech.map((t) => (
                <span key={t} className="badge px-3 py-1 text-xs">
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex gap-3 flex-wrap">
            {project.demo && (
              <a
                href={project.demo}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm px-5 py-2.5"
              >
                Live Demo ↗
              </a>
            )}
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-sm px-5 py-2.5"
            >
              GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  const [selected, setSelected] = useState(null);

  return (
    <section id="projects" className="min-h-[calc(100vh-68px)] flex flex-col py-12 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-6 w-full my-auto">
        <FadeIn className="mb-10 md:mb-16">
          <p className="section-label">Selected Work</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight max-w-2xl">
            Focus on <span className="gradient-text">impact.</span>
          </h2>
        </FadeIn>

        <StaggerParent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROJECTS.map((p) => (
            <StaggerItem key={p.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelected(p)}
                onKeyDown={(e) => e.key === "Enter" && setSelected(p)}
                className="group card flex flex-col overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer h-full"
              >
                {/* Screenshot */}
                <div className="w-full h-44 sm:h-52 overflow-hidden bg-[var(--surface-2)] shrink-0">
                  <img
                    src={p.image}
                    alt={p.title}
                    className="w-full h-full object-cover object-top group-hover:scale-[1.03] transition-transform duration-500"
                  />
                </div>

                {/* Card body */}
                <div className="p-6 flex flex-col flex-1">
                  {/* Category */}
                  <p className="text-xs font-mono font-semibold tracking-widest text-[var(--accent)] uppercase mb-2">
                    {p.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-xl font-bold mb-3 group-hover:text-[var(--accent)] transition-colors leading-snug">
                    {p.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-[var(--fg-muted)] leading-relaxed mb-5">
                    {p.description}
                  </p>

                  {/* Tech badges */}
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {p.tech.map((t) => (
                      <span key={t} className="badge px-2.5 py-1 text-xs">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)] group-hover:gap-2 transition-all duration-200 mt-auto">
                    View details
                    <span className="text-base leading-none">↗</span>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerParent>
      </div>

      {/* Modal */}
      {selected && (
        <ProjectModal project={selected} onClose={() => setSelected(null)} />
      )}

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </section>
  );
}
