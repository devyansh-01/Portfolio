import { FadeIn, StaggerParent, StaggerItem } from "./FadeIn";

const CATEGORIES = [
  {
    title: "Backend Engineering",
    desc: "Building reliable APIs and server-side applications.",
    skills: ["Python", "Flask", "REST APIs", "PostgreSQL", "Redis"],
  },
  {
    title: "Data & Analytics",
    desc: "Working with data to uncover insights and build analytical solutions.",
    skills: ["Pandas", "NumPy", "Matplotlib", "Seaborn", "Power BI", "Tableau", "Excel"],
  },
  {
    title: "Programming",
    desc: "Strong foundation in programming and problem solving.",
    skills: ["Python", "C", "C++", "SQL"],
  },
  {
    title: "Databases & Tools",
    desc: "Tools for building, testing, and managing applications.",
    skills: ["MySQL", "PostgreSQL", "Snowflake", "Git", "GitHub", "Docker", "Postman", "Jupyter Notebook"],
  },
  {
    title: "AI & Emerging Technology",
    desc: "Exploring AI-driven solutions and practical intelligent applications.",
    skills: ["AI/ML", "Machine Learning", "Automation"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="min-h-[calc(100vh-68px)] flex flex-col py-12 sm:py-16 relative">
      <div className="max-w-screen-xl mx-auto relative px-4 sm:px-6 w-full my-auto">
        
        {/* Background blob bound to the inner container */}
        <div className="absolute inset-0 bg-[var(--surface-2)]/30 rounded-3xl -z-10 hidden md:block" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 md:py-10">
          <FadeIn>
            <div className="text-center mb-8 md:mb-10">
              <p className="section-label mb-2">Capabilities</p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                A refined <span className="gradient-text">toolset.</span>
              </h2>
            </div>
          </FadeIn>

        <StaggerParent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
          {CATEGORIES.map((cat) => (
            <StaggerItem key={cat.title}>
              <div className="card h-full p-6 flex flex-col hover:-translate-y-1 transition-transform duration-300">
                <h3 className="text-lg font-bold mb-2">{cat.title}</h3>
                <p className="text-sm text-[var(--fg-muted)] mb-7 leading-relaxed">
                  {cat.desc}
                </p>
                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((s) => (
                    <span key={s} className="badge px-3 py-1 text-xs">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerParent>
        </div>
      </div>
    </section>
  );
}
