import { getStore } from "@netlify/blobs";

const CAREERS = {
  "Python Developer": ["Python", "SQL", "Flask", "Git", "REST APIs", "Debugging"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "Responsive Design", "Git", "REST APIs"],
  "Data Analyst": ["Python", "SQL", "Excel", "Statistics", "Data Visualization", "Pandas"],
  "Machine Learning Engineer": ["Python", "Statistics", "Pandas", "NumPy", "Scikit-learn", "SQL"],
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "Python", "Flask", "SQL", "Git"],
  "UI/UX Designer": ["Figma", "Wireframing", "Prototyping", "Typography", "User Research", "Visual Design"]
};
const ALL_SKILLS = [...new Set(Object.values(CAREERS).flat())].sort();
const store = () => getStore({ name: "skillmatch-profiles", region: "ap-southeast-1" });
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});
const validId = (id) => typeof id === "string" && /^[a-f0-9-]{36}$/i.test(id);

export default async (request) => {
  try {
    const url = new URL(request.url);
    if (request.method === "GET" && url.searchParams.get("action") === "config") {
      return json({ careers: CAREERS, allSkills: ALL_SKILLS });
    }
    if (request.method === "GET") {
      const id = url.searchParams.get("id");
      if (!validId(id)) return json({ error: "A valid profile ID is required." }, 400);
      const profile = await store().get(`profile-${id}`, { type: "json", consistency: "strong" });
      if (!profile) return json({ error: "Profile not found." }, 404);
      return json({ profile });
    }
    if (request.method !== "POST") return json({ error: "Method not allowed." }, 405);
    const body = await request.json();
    const { action, id } = body || {};
    if (!validId(id)) return json({ error: "A valid profile ID is required." }, 400);

    if (action === "register") {
      const name = String(body.name || "").trim().slice(0, 80);
      const email = String(body.email || "").trim().toLowerCase().slice(0, 120);
      const education = String(body.education || "").trim().slice(0, 120);
      if (!name || !/^\S+@\S+\.\S+$/.test(email) || !education) {
        return json({ error: "Enter a name, valid email and education/course." }, 400);
      }
      const existing = await store().get(`profile-${id}`, { type: "json", consistency: "strong" });
      const profile = existing || {
        id, name, email, education,
        createdAt: new Date().toISOString(),
        assessments: []
      };
      if (existing) {
        profile.name = name; profile.email = email; profile.education = education;
      }
      await store().setJSON(`profile-${id}`, profile);
      return json({ profile });
    }

    const profile = await store().get(`profile-${id}`, { type: "json", consistency: "strong" });
    if (!profile) return json({ error: "Profile not found. Please register again on this device." }, 404);

    if (action === "analyze") {
      const career = String(body.career || "");
      const skills = Array.isArray(body.skills) ? body.skills.filter(s => ALL_SKILLS.includes(s)) : [];
      if (!Object.hasOwn(CAREERS, career)) return json({ error: "Choose a valid career path." }, 400);
      const required = CAREERS[career];
      const matched = required.filter(skill => skills.includes(skill));
      const missing = required.filter(skill => !skills.includes(skill));
      const score = Math.round((matched.length / required.length) * 100);
      const assessment = {
        id: crypto.randomUUID(), career, skills, matched, missing, score,
        createdAt: new Date().toISOString()
      };
      profile.assessments = [assessment, ...(profile.assessments || [])].slice(0, 100);
      await store().setJSON(`profile-${id}`, profile);
      return json({ profile, assessment });
    }
    return json({ error: "Unknown action." }, 400);
  } catch (error) {
    console.error("SkillMatch API error:", error);
    return json({ error: "Something went wrong on the server. Check the Netlify function logs." }, 500);
  }
};
