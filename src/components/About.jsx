import { FadeIn } from "./FadeIn";

const STATS = [
  { value: "03+", label: "Development Domains" },
  { value: "02+", label: "Projects Built" },
  { value: "01+", label: "Years Coding" },
];

export default function About() {
  return (
    <section id="about" className="min-h-[calc(100vh-68px)] flex flex-col py-12 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-6 w-full my-auto">
        <FadeIn>
          <p className="section-label">About Me</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-12 md:mb-16 max-w-2xl">
            Engineering with <span className="gradient-text">intent.</span>
          </h2>
        </FadeIn>

        <div className="grid md:grid-cols-12 gap-10 md:gap-12 lg:gap-20 items-start">
          <div className="md:col-span-7 space-y-6 text-[var(--fg-muted)] leading-relaxed">
            <FadeIn delay={0.1}>
              <p>
                As a Computer Science student specializing in Data Science, I'm passionate about engineering practical solutions to real-world problems. My interests span backend development, data, and AI, allowing me to approach software from both an engineering and analytical perspective.
              </p>
            </FadeIn>
            <FadeIn delay={0.15}>
              <p>
                Through hands-on projects and continuous experimentation, I enjoy turning ideas into working solutions and learning from every challenge along the way. I'm particularly interested in understanding how systems work behind the scenes, how different components come together, and how thoughtful engineering can make applications more reliable and useful.
              </p>
            </FadeIn>
            <FadeIn delay={0.2}>
              <p>
                I enjoy solving challenging problems, exploring new technologies, and constantly pushing myself beyond what I already know. My goal is to grow into an engineer who can transform complex ideas into reliable, scalable, and meaningful products.
              </p>
            </FadeIn>
          </div>

          <div className="md:col-span-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-4 sm:gap-6 mt-8 md:mt-0">
            {STATS.map((stat, i) => (
              <FadeIn key={stat.label} delay={0.2 + i * 0.1}>
                <div className="card p-6 text-center md:text-left">
                  <p className="text-3xl md:text-4xl font-bold text-[var(--fg)] mb-2">{stat.value}</p>
                  <p className="text-sm font-mono text-[var(--fg-muted)]">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
