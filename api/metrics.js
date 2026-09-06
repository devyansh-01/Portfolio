import * as cheerio from "cheerio";

// ─── 6-hour in-memory cache ───────────────────────────────────────────────────
const CACHE_TTL = 6 * 60 * 60 * 1000;
let cache = null;
let cacheTs = 0;

const LC_HANDLE = "devyansh__01";
const GH_HANDLE = "devyansh-01";

// ─── LeetCode (GraphQL with Alfa fallback) ──────────────────────────────────
async function fetchLeetCode() {
  try {
    const query = `
      query getUserData($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            streak
            submissionCalendar
          }
          profile {
            ranking
          }
        }
      }
    `;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: "https://leetcode.com",
      },
      body: JSON.stringify({ query, variables: { username: LC_HANDLE } }),
    });

    if (res.ok) {
      const { data } = await res.json();
      if (data?.matchedUser) {
        const stats = data.matchedUser.submitStats?.acSubmissionNum ?? [];
        const easy   = stats.find((s) => s.difficulty === "Easy")?.count   ?? 0;
        const medium = stats.find((s) => s.difficulty === "Medium")?.count ?? 0;
        const hard   = stats.find((s) => s.difficulty === "Hard")?.count   ?? 0;

        const calRaw = data.matchedUser.userCalendar?.submissionCalendar ?? "{}";
        const calendar = JSON.parse(calRaw);
        const streak   = data.matchedUser.userCalendar?.streak ?? 0;
        const globalRank = data.matchedUser.profile?.ranking ?? null;

        return { easy, medium, hard, calendar, streak, globalRank };
      }
    }
  } catch (e) {}

  // Fallback to Alfa LeetCode API
  const res2 = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${LC_HANDLE}`);
  if (!res2.ok) throw new Error("Failed to fetch LeetCode data");
  const data2 = await res2.json();

  return {
    easy: data2.easySolved ?? 58,
    medium: data2.mediumSolved ?? 46,
    hard: data2.hardSolved ?? 3,
    calendar: data2.submissionCalendar ?? {},
    streak: 78,
    globalRank: data2.ranking ?? 1563053,
  };
}

// ─── GitHub (REST) ────────────────────────────────────────────────────────────
async function fetchGitHub() {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${GH_HANDLE}`, {
      headers: { "User-Agent": "portfolio-metrics" },
    }),
    fetch(`https://api.github.com/users/${GH_HANDLE}/repos?per_page=100`, {
      headers: { "User-Agent": "portfolio-metrics" },
    }),
  ]);

  if (!userRes.ok) throw new Error(`GitHub user error: ${userRes.status}`);
  const user = await userRes.json();

  let stars = 0;
  if (reposRes.ok) {
    const repos = await reposRes.json();
    stars = repos.reduce((acc, r) => acc + (r.stargazers_count ?? 0), 0);
  }

  return {
    repos: user.public_repos ?? 0,
    followers: user.followers ?? 0,
    stars,
  };
}

// ─── Heatmap builder (LeetCode only) ─────────────────────────────────────────
function buildHeatmap(lcCalendar) {
  const merged = {};

  for (const [ts, cnt] of Object.entries(lcCalendar)) {
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
    result.push({ date: dateStr, count: merged[unixDay] ?? 0, level: 0 });
  }

  for (const r of result) {
    if (r.count === 0)      r.level = 0;
    else if (r.count <= 2)  r.level = 2;
    else if (r.count <= 6)  r.level = 3;
    else                    r.level = 4;
  }

  return result;
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (cache && Date.now() - cacheTs < CACHE_TTL) {
    return res.status(200).json({ ...cache, cached: true });
  }

  try {
    const [lc, gh] = await Promise.allSettled([
      fetchLeetCode(),
      fetchGitHub(),
    ]);

    const lcData = lc.status === "fulfilled"
      ? lc.value
      : { easy: 0, medium: 0, hard: 0, calendar: {}, streak: 0, globalRank: null };

    const ghData = gh.status === "fulfilled"
      ? gh.value
      : { repos: 0, followers: 0, stars: 0 };

    const heatmap = buildHeatmap(lcData.calendar);
    const totalActive = heatmap.filter((d) => d.count > 0).length;

    const payload = {
      leetcode: {
        easy:       lcData.easy,
        medium:     lcData.medium,
        hard:       lcData.hard,
        streak:     lcData.streak,
        globalRank: lcData.globalRank,
      },
      github: {
        repos:     ghData.repos,
        followers: ghData.followers,
        stars:     ghData.stars,
      },
      heatmap,
      totalActive,
      fetchedAt: new Date().toISOString(),
    };

    cache = payload;
    cacheTs = Date.now();

    return res.status(200).json({ ...payload, cached: false });
  } catch (err) {
    console.error("Metrics error:", err);
    return res.status(500).json({ error: "Failed to fetch metrics." });
  }
}
