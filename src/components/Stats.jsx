import { useState, useEffect, useRef } from "react";
import { ActivityCalendar } from "react-activity-calendar";
import { motion } from "framer-motion";
import { FadeIn } from "./FadeIn";
import { HEATMAP_FALLBACK } from "../data/heatmapFallback";

// ─── Default live profile fallback (devyansh__01 / devyansh-01) ──────────────
const FALLBACK = {
  leetcode: { easy: 58, medium: 46, hard: 3, streak: 78, globalRank: 1563053 },
  github: { repos: 3, followers: 1, stars: 1 },
  heatmap: HEATMAP_FALLBACK,
  totalActive: 112,
};

// ─── Skeleton shimmer block ───────────────────────────────────────────────────
function Skeleton({ className = "" }) {
  return (
    <div
      className={`bg-[var(--surface-2)] rounded-lg animate-pulse ${className}`}
    />
  );
}

// ─── Theme-aware colours ─────────────────────────────────────────────────────
function useThemeColors() {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
    } catch { }
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return {
    isDark,
    level0: isDark ? "#222222" : "#EBEDF0",
    level1: isDark ? "#555555" : "#9BE9A8",
    level2: isDark ? "#888888" : "#40C463",
    level3: isDark ? "#BBBBBB" : "#30A14E",
    level4: isDark ? "#FFFFFF" : "#216E39",
    text: isDark ? "#737373" : "#8F897E",
  };
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Stats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);
  const colors = useThemeColors();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function loadStats() {
      // 1. Try local/Vercel serverless /api/metrics
      try {
        const r = await fetch("/api/metrics");
        if (r.ok) {
          const json = await r.json();
          if (json?.leetcode && (json.leetcode.easy || json.leetcode.medium || json.leetcode.hard)) {
            setData(json);
            setLoading(false);
            return;
          }
        }
      } catch (e) { }

      // 2. Direct browser fetch to Alfa LeetCode API & GitHub API
      try {
        const [lcRes, ghRes] = await Promise.allSettled([
          fetch("https://alfa-leetcode-api.onrender.com/userProfile/devyansh__01"),
          fetch("https://api.github.com/users/devyansh-01"),
        ]);

        let leetcode = { easy: 58, medium: 46, hard: 3, streak: 78, globalRank: 1563053 };
        let github = { repos: 3, followers: 1, stars: 1 };
        let submissionCalendar = {};

        if (lcRes.status === "fulfilled" && lcRes.value.ok) {
          const lcData = await lcRes.value.json();
          submissionCalendar = lcData.submissionCalendar || {};
          leetcode = {
            easy: lcData.easySolved ?? 58,
            medium: lcData.mediumSolved ?? 46,
            hard: lcData.hardSolved ?? 3,
            streak: 78,
            globalRank: lcData.ranking ?? 1563053,
          };
        }

        if (ghRes.status === "fulfilled" && ghRes.value.ok) {
          const ghData = await ghRes.value.json();
          github = {
            repos: ghData.public_repos ?? 3,
            followers: ghData.followers ?? 1,
            stars: 1,
          };
        }

        // Build heatmap from calendar if available
        let heatmap = HEATMAP_FALLBACK;
        if (Object.keys(submissionCalendar).length > 0) {
          const merged = {};
          for (const [ts, cnt] of Object.entries(submissionCalendar)) {
            const day = Math.floor(parseInt(ts) / 86400) * 86400;
            merged[day] = (merged[day] ?? 0) + cnt;
          }
          const today = new Date();
          const utcToday = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
          const startDate = new Date(utcToday);
          startDate.setUTCFullYear(startDate.getUTCFullYear() - 1);
          startDate.setUTCDate(startDate.getUTCDate() + 1);

          const result = [];
          for (let d = new Date(startDate); d <= utcToday; d.setUTCDate(d.getUTCDate() + 1)) {
            const unixDay = Math.floor(d.getTime() / 1000);
            const dateStr = d.toISOString().split("T")[0];
            const cnt = merged[unixDay] ?? 0;
            let level = 0;
            if (cnt > 0 && cnt <= 2) level = 2;
            else if (cnt > 2 && cnt <= 6) level = 3;
            else if (cnt > 6) level = 4;
            result.push({ date: dateStr, count: cnt, level });
          }
          heatmap = result;
        }

        setData({
          leetcode,
          github,
          heatmap,
          totalActive: heatmap.filter((d) => d.count > 0).length,
        });
        setLoading(false);
      } catch (err) {
        setData(FALLBACK);
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const d = data ?? FALLBACK;
  const lc = d.leetcode;
  const gh = d.github;
  const totalSolved = (lc.easy ?? 0) + (lc.medium ?? 0) + (lc.hard ?? 0);

  const dist = [
    { label: "Easy", count: lc.easy ?? 58, color: "#10b981" },
    { label: "Medium", count: lc.medium ?? 46, color: "#f59e0b" },
    { label: "Hard", count: lc.hard ?? 3, color: "#ef4444" },
  ].map((item) => ({
    ...item,
    pct: totalSolved ? Math.round((item.count / totalSolved) * 100) : 0,
  }));

  const { isDark } = colors;

  const calTheme = {
    light: [colors.level0, colors.level1, colors.level2, colors.level3, colors.level4],
    dark: [colors.level0, colors.level1, colors.level2, colors.level3, colors.level4],
  };

  // Group heatmap by month
  const monthsData = [];
  if (d.heatmap && d.heatmap.length > 0) {
    const groups = {};
    d.heatmap.forEach((day) => {
      const month = day.date.substring(0, 7);
      if (!groups[month]) groups[month] = [];
      groups[month].push(day);
    });
    Object.keys(groups).sort().forEach((k) => monthsData.push(groups[k]));
  }

  return (
    <section id="stats" className="min-h-[calc(100vh-68px)] flex flex-col py-12 sm:py-16 relative">
      <div className="max-w-6xl mx-auto px-6 w-full my-auto">

        {/* ── Section header ─────────────────────────────────────── */}
        <FadeIn className="mb-12 md:mb-16">
          <p className="section-label">Metrics</p>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            Consistent <span className="gradient-text">growth.</span>
          </h2>
          <p className="text-sm text-[var(--fg-muted)]">Live data pulled from my profiles.</p>
        </FadeIn>

        <div className="grid lg:grid-cols-12 gap-5">

          {/* ── Left column ──────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-5 min-w-0">

            {/* Problems Solved — hero card */}
            <FadeIn delay={0.1}>
              <a
                href="https://leetcode.com/u/devyansh__01/"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-6 sm:p-7 flex flex-col justify-between block hover:-translate-y-1 transition-transform overflow-hidden group"
              >
                <div>
                  <p className="text-[var(--fg-muted)] text-sm font-normal mb-1.5">
                    Problems Solved
                  </p>
                  {loading ? (
                    <Skeleton className="h-12 w-32 mb-3.5" />
                  ) : (
                    <p className="text-[50px] sm:text-[54px] font-bold text-[var(--accent)] mb-3.5 tracking-tight leading-none">
                      {totalSolved > 0 ? totalSolved : 107}
                    </p>
                  )}
                </div>

                <div className="border-t border-[var(--border)] pt-3.5 mt-auto flex items-center justify-between text-xs sm:text-sm font-mono text-[var(--fg-dim)]">
                  {loading ? (
                    <>
                      <Skeleton className="h-3.5 w-24" />
                      <Skeleton className="h-3.5 w-32" />
                    </>
                  ) : (
                    <>
                      <span>Streak · {lc.streak || 78}</span>
                      <span>
                        Global rank #{lc.globalRank ? lc.globalRank.toLocaleString() : "1,563,053"}
                      </span>
                    </>
                  )}
                </div>
              </a>
            </FadeIn>

            {/* Problem Distribution card */}
            <FadeIn delay={0.2} className="card p-6 sm:p-7 flex flex-col justify-center overflow-hidden">
              <p className="text-[var(--fg)] text-sm sm:text-base font-semibold mb-4">
                Problem Distribution
              </p>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-3.5 w-full mb-1.5" />
                      <Skeleton className="h-2 w-full rounded-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {dist.map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between text-xs sm:text-sm font-medium mb-1.5">
                        <span className="text-[var(--fg-muted)]">{item.label}</span>
                        <span className="font-mono text-[var(--fg)]">{item.count}</span>
                      </div>
                      <div className="h-2 bg-[#EAE3D7] dark:bg-[#2A2A2A] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.pct}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </FadeIn>
          </div>

          {/* ── Right column ─────────────────────────────────────── */}
          <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6 min-w-0">

            {/* Activity Map card */}
            <FadeIn delay={0.3} className="card p-6 sm:p-7 flex-1 overflow-hidden min-w-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-4">
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-0.5">Activity Map</h3>
                  {loading ? (
                    <Skeleton className="h-3.5 w-44" />
                  ) : (
                    <p className="text-xs sm:text-sm text-[var(--fg-muted)]">
                      {d.totalActive}+ active days in the last year
                    </p>
                  )}
                </div>
              </div>

              {loading ? (
                <Skeleton className="h-26 w-full" />
              ) : d.heatmap && d.heatmap.length > 0 ? (
                <div className="overflow-x-auto pb-3 custom-scrollbar">
                  <div className="flex gap-2 sm:gap-2.5 min-w-max">
                    {monthsData.map((monthData, i) => {
                      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const dateParts = monthData[0].date.split("-");
                      const mIdx = parseInt(dateParts[1], 10) - 1;
                      const mName = monthNames[mIdx];

                      return (
                        <div key={i} className="flex flex-col gap-1.5">
                          <span className="text-[9px] text-[var(--fg-muted)] pl-1">{mName}</span>
                          <ActivityCalendar
                            data={monthData}
                            theme={calTheme}
                            colorScheme={isDark ? "dark" : "light"}
                            blockSize={8.5}
                            blockMargin={2}
                            blockRadius={2}
                            fontSize={9.5}
                            showColorLegend={false}
                            showTotalCount={false}
                            showWeekdayLabels={i === 0}
                            showMonthLabels={false}
                            labels={{ weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] }}
                            style={{ color: colors.text }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-[var(--fg-dim)]">No activity data available.</p>
              )}
            </FadeIn>

            {/* Platform cards — LeetCode + GitHub */}
            <FadeIn delay={0.4} className="grid grid-cols-1 sm:grid-cols-2 gap-5">

              {/* LeetCode card */}
              <a
                href="https://leetcode.com/u/devyansh__01/"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 flex flex-col justify-between group block hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-bold text-base text-[var(--fg)]">LeetCode</p>
                  <span className="text-[var(--border-focus)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sm">
                    ↗
                  </span>
                </div>
                {loading ? (
                  <Skeleton className="h-3.5 w-24 mt-1" />
                ) : (
                  <p className="text-xs sm:text-sm text-[var(--fg-muted)]">
                    {totalSolved > 0 ? `${totalSolved} solved` : "107 solved"}
                  </p>
                )}
              </a>

              {/* GitHub card */}
              <a
                href="https://github.com/devyansh-01"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-5 flex flex-col justify-between group block hover:-translate-y-1 transition-transform"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="font-bold text-base text-[var(--fg)]">GitHub</p>
                  <span className="text-[var(--border-focus)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all text-sm">
                    ↗
                  </span>
                </div>
                {loading ? (
                  <Skeleton className="h-3.5 w-32 mt-1" />
                ) : (
                  <p className="text-xs sm:text-sm text-[var(--fg-muted)]">
                    {gh.repos > 0
                      ? `${gh.repos} repos · ${gh.stars || 1} ★ · ${gh.followers} followers`
                      : "3 repos · 1 ★ · 1 followers"}
                  </p>
                )}
              </a>

            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
