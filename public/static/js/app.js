const API = "/.netlify/functions/api";
const CAREERS_FALLBACK = {
  "Python Developer": ["Python", "SQL", "Flask", "Git", "REST APIs", "Debugging"],
  "Web Developer": ["HTML", "CSS", "JavaScript", "Responsive Design", "Git", "REST APIs"],
  "Data Analyst": ["Python", "SQL", "Excel", "Statistics", "Data Visualization", "Pandas"],
  "Machine Learning Engineer": ["Python", "Statistics", "Pandas", "NumPy", "Scikit-learn", "SQL"],
  "Full Stack Developer": ["HTML", "CSS", "JavaScript", "Python", "Flask", "SQL", "Git"],
  "UI/UX Designer": ["Figma", "Wireframing", "Prototyping", "Typography", "User Research", "Visual Design"]
};
const ALL_SKILLS = [...new Set(Object.values(CAREERS_FALLBACK).flat())].sort();
const app = document.getElementById("app");
const profileKey = "skillmatch_profile_id";
let profile = null;
let toastTimer;
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));
const id = () => crypto.randomUUID();
const dateLabel = value => new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
function flash(message, type="info") {
  const stack = document.getElementById("flashStack");
  stack.innerHTML = `<div class="flash ${type}">${esc(message)}</div>`;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => stack.innerHTML = "", 4500);
}
async function api(url, options={}) {
  const response = await fetch(url, { ...options, headers: { "content-type":"application/json", ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}
function setNav() {
  const active = !!profile;
  document.getElementById("navDashboard").hidden = !active;
  document.getElementById("navHistory").hidden = !active;
  document.getElementById("navLogout").hidden = !active;
  document.getElementById("navCta").hidden = active;
}
function shell(content) { app.innerHTML = content; window.scrollTo({top:0, behavior:"smooth"}); }
function landing() {
  shell(`<section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="pulse"></span> YOUR CAREER, CLEARER</div><h1>Turn your skills into your <span class="gradient-text">next opportunity.</span></h1><p class="hero-lead">Discover where you stand, uncover the skills you're missing, and take the next step toward a career you want.</p><div class="hero-actions"><a class="button button-primary" href="#/${profile ? "dashboard" : "register"}">${profile ? "Open my dashboard" : "Explore my career match"} <span>→</span></a><a class="text-link" href="#how-it-works">See how it works <span>↓</span></a></div><div class="hero-proof"><div class="avatar-stack"><i>✦</i><i>◎</i><i>↗</i></div><span>Small steps. Stronger skills. Brighter careers.</span></div></div><div class="hero-visual"><div class="visual-glow"></div><div class="preview-card"><div class="preview-top"><span class="mini-label">CAREER SNAPSHOT</span><span class="live-pill">● LIVE PREVIEW</span></div><div class="preview-role"><div class="role-icon">⌘</div><div><strong>Python Developer</strong><small>Career skill overview</small></div></div><div class="score-row"><div><small>SKILL MATCH</small><div class="big-score">75<span>%</span></div></div><div class="ring"><div class="ring-inner">75%</div></div></div><div class="preview-divider"></div><div class="preview-list-title">YOUR SKILL CHECKLIST <span>3 of 4</span></div><div class="skill-line"><span class="check">✓</span> Python <span class="skill-status">Matched</span></div><div class="skill-line"><span class="check">✓</span> SQL <span class="skill-status">Matched</span></div><div class="skill-line"><span class="check">✓</span> Git <span class="skill-status">Matched</span></div><div class="skill-line"><span class="todo">＋</span> Flask <span class="skill-status missing">To learn</span></div><div class="tip-box"><span>✧</span><div><strong>Your next move</strong><small>Explore Flask to strengthen your profile.</small></div></div></div><div class="floating-note"><span>↗</span><div><b>Keep growing</b><small>Your roadmap starts here</small></div></div></div></section><section class="stats-strip"><div><strong>06</strong><span>Career paths</span></div><div><strong>20+</strong><span>Technical skills</span></div><div><strong>01</strong><span>Clear next step</span></div><div><strong>100%</strong><span>Student focused</span></div></section><section class="how-section" id="how-it-works"><div class="section-heading"><div class="eyebrow">A SIMPLE START</div><h2>Your next chapter, in <span class="gradient-text">three steps.</span></h2><p>No complicated assessments. Just a clearer view of your skills.</p></div><div class="steps-grid"><article class="step-card"><div class="step-number">01</div><div class="step-icon">✳</div><h3>Choose your direction</h3><p>Select the career path you're curious about and tell us what you already know.</p></article><article class="step-card"><div class="step-number">02</div><div class="step-icon">⌁</div><h3>See your skill match</h3><p>Compare your current skills with a curated list of skills for that career.</p></article><article class="step-card"><div class="step-number">03</div><div class="step-icon">↗</div><h3>Build your roadmap</h3><p>Find the missing skills and focus your learning on what comes next.</p></article></div></section><section class="bottom-cta"><div><div class="eyebrow">YOUR FUTURE IS A WORK IN PROGRESS</div><h2>Ready to see your <span class="gradient-text">skill match?</span></h2></div><a class="button button-primary" href="#/${profile ? "dashboard" : "register"}">Get started <span>→</span></a></section>`);
}
function registerPage() {
  shell(`<section class="form-layout"><div class="form-intro"><div class="eyebrow">LET'S GET TO KNOW YOU</div><h1>Your journey starts with <span class="gradient-text">you.</span></h1><p>Create a simple student profile to save your career assessments and track your progress.</p><div class="form-benefit"><span>✦</span> Your assessment history stays together in one dashboard.</div></div><form class="glass-form" id="registerForm"><div class="form-kicker">STUDENT PROFILE <span>01 / 01</span></div><h2>Tell us about yourself</h2><label for="name">Full name</label><input id="name" name="name" placeholder="e.g. Alex Morgan" required maxlength="80" value="${esc(profile?.name || "")}"><label for="email">Email address</label><input id="email" name="email" type="email" placeholder="you@example.com" required maxlength="120" value="${esc(profile?.email || "")}"><label for="education">Education / course</label><input id="education" name="education" placeholder="e.g. B.Tech Computer Science" required maxlength="120" value="${esc(profile?.education || "")}"><button class="button button-primary full-button" type="submit">${profile ? "Update my profile" : "Create my profile"} <span>→</span></button><p class="form-note">Student demo: no password is requested. Avoid entering sensitive personal information.</p></form></section>`);
  document.getElementById("registerForm").addEventListener("submit", async e => {
    e.preventDefault(); const button=e.currentTarget.querySelector("button"); button.disabled=true; button.textContent="Saving…";
    const form=new FormData(e.currentTarget); const profileId=localStorage.getItem(profileKey)||id();
    try { const result=await api(API,{method:"POST",body:JSON.stringify({action:"register",id:profileId,name:form.get("name"),email:form.get("email"),education:form.get("education")})}); localStorage.setItem(profileKey,profileId); profile=result.profile; setNav(); flash("Your student profile is ready.","success"); location.hash="#/dashboard"; }
    catch(err){flash(err.message,"error");button.disabled=false;button.innerHTML="Create my profile <span>→</span>";}
  });
}
function dashboard() {
  if (!profile) return registerPage();
  const history=profile.assessments||[], latest=history[0];
  shell(`<section class="dashboard-header"><div><div class="eyebrow">YOUR PERSONAL WORKSPACE</div><h1>Hey, <span class="gradient-text">${esc(profile.name.split(" ")[0])}.</span> <span class="wave">✦</span></h1><p>Your next opportunity starts with understanding where you are today.</p></div><a class="button button-primary" href="#/analyze">New analysis <span>＋</span></a></section><div class="dashboard-grid"><section class="panel welcome-panel"><div class="panel-label">STUDENT PROFILE</div><div class="profile-row"><div class="profile-avatar">${esc(profile.name.charAt(0).toUpperCase())}</div><div><h3>${esc(profile.name)}</h3><p>${esc(profile.education)}</p></div></div><div class="profile-email">${esc(profile.email)}</div><div class="profile-foot">Profile stored with this browser's private profile ID</div></section><section class="panel metric-panel"><div class="panel-label">ASSESSMENTS COMPLETED</div><div class="metric-number">${history.length}</div><p>Your saved career check-ins</p><div class="metric-decoration">✧</div></section><section class="panel metric-panel"><div class="panel-label">CAREER PATHS</div><div class="metric-number">06</div><p>Available to explore</p><div class="metric-decoration">⌁</div></section></div>${latest ? latestPanel(latest) : `<section class="panel empty-state"><div class="empty-icon">⌁</div><div class="eyebrow">YOUR FIRST STEP</div><h2>Your career dashboard is ready.</h2><p>Complete your first skill analysis to see your match score, strengths and learning opportunities here.</p><a class="button button-primary" href="#/analyze">Start my first analysis <span>→</span></a></section>`}<section class="panel history-panel"><div class="panel-heading"><div><div class="panel-label">RECENT ACTIVITY</div><h2>Assessment history</h2></div><a class="text-link" href="#/history">View all →</a></div>${history.length?historyTable(history.slice(0,5)):"<p class='muted'>No assessments yet. Your first result will appear here.</p>"}</section>`);
}
function latestPanel(item) {
  return `<section class="panel analysis-panel"><div class="panel-heading"><div><div class="panel-label">LATEST CAREER ANALYSIS</div><h2>${esc(item.career)}</h2></div><span class="subtle-tag">Saved result</span></div><div class="analysis-content"><div class="score-card"><div class="score-circle" style="--score:${item.score}%"><div><strong>${item.score}%</strong><small>SKILL MATCH</small></div></div><p>${item.score>=80?"Strong starting match — keep sharpening your skills.":item.score>=50?"You're building momentum. Focus on the skills below.":"A great place to start. Pick one missing skill and begin learning."}</p></div><div class="chart-wrap"><div class="score-circle" style="--score:${item.score}%;width:150px;height:150px"><div><strong>${item.matched.length}/${item.matched.length+item.missing.length}</strong><small>SKILLS MATCHED</small></div></div></div><div class="skill-results"><div><h3><span class="check">✓</span> Matched skills <small>${item.matched.length}</small></h3><div class="tag-list">${item.matched.map(s=>`<span class="skill-tag good">${esc(s)}</span>`).join("")||"<span class='muted'>No matched skills yet.</span>"}</div></div><div><h3><span class="todo">＋</span> Skills to develop <small>${item.missing.length}</small></h3><div class="tag-list">${item.missing.map(s=>`<span class="skill-tag todo-tag">${esc(s)}</span>`).join("")||"<span class='muted'>You matched all listed skills. Amazing!</span>"}</div></div></div></div></section>`;
}
function historyTable(items) { return `<div class="table-scroll"><table><thead><tr><th>CAREER PATH</th><th>MATCH SCORE</th><th>DATE</th></tr></thead><tbody>${items.map(x=>`<tr><td><strong>${esc(x.career)}</strong></td><td><span class="table-score">${x.score}%</span><div class="mini-progress"><span style="width:${x.score}%"></span></div></td><td>${dateLabel(x.createdAt)}</td></tr>`).join("")}</tbody></table></div>`; }
function analyzePage() {
  if (!profile) return registerPage();
  shell(`<section class="analyze-header"><div class="eyebrow">SKILL GAP ANALYSIS</div><h1>Let's map your <span class="gradient-text">next move.</span></h1><p>Choose a career and select every skill you currently have. Be honest — this is your personal starting point.</p></section><form class="analysis-form" id="analysisForm"><section class="panel form-section"><div class="section-count">01</div><div class="form-section-content"><div class="panel-label">CHOOSE YOUR DIRECTION</div><h2>Which career interests you?</h2><div class="career-grid">${Object.entries(CAREERS_FALLBACK).map(([career,skills],i)=>`<label class="career-option"><input type="radio" name="career" value="${esc(career)}" ${i===0?"checked":""} required><span class="career-option-inner"><span class="career-symbol">${["⌁","◎","▥","◈","⌘","✳"][i]}</span><strong>${esc(career)}</strong><small>${skills.length} key skills</small></span></label>`).join("")}</div></div></section><section class="panel form-section"><div class="section-count">02</div><div class="form-section-content"><div class="panel-label">YOUR CURRENT TOOLKIT</div><h2>Which skills do you already know?</h2><p class="muted">Select all that apply. You can update this in another assessment later.</p><div class="skill-picker">${ALL_SKILLS.map(skill=>`<label class="skill-choice"><input type="checkbox" name="skills" value="${esc(skill)}"><span>${esc(skill)}</span></label>`).join("")}</div><div class="selected-count"><span id="selectedCount">0</span> skills selected</div></div></section><div class="submit-row"><a class="text-link" href="#/dashboard">← Back to dashboard</a><button class="button button-primary" type="submit">Calculate my skill match <span>→</span></button></div></form>`);
  const form=document.getElementById("analysisForm"), count=document.getElementById("selectedCount");
  form.addEventListener("change",()=>count.textContent=form.querySelectorAll('input[name="skills"]:checked').length);
  form.addEventListener("submit",async e=>{e.preventDefault();const button=form.querySelector("button[type=submit]");button.disabled=true;button.textContent="Analysing…";const data=new FormData(form);const skills=data.getAll("skills");try{const result=await api(API,{method:"POST",body:JSON.stringify({action:"analyze",id:profile.id,career:data.get("career"),skills})});profile=result.profile;flash("Your skill analysis has been saved.","success");location.hash="#/dashboard";}catch(err){flash(err.message,"error");button.disabled=false;button.innerHTML="Calculate my skill match <span>→</span>";}});
}
function historyPage() {
  if (!profile) return registerPage(); const history=profile.assessments||[];
  shell(`<section class="dashboard-header"><div><div class="eyebrow">YOUR PROGRESS</div><h1>Assessment <span class="gradient-text">history.</span></h1><p>Every check-in is another step toward your goals.</p></div><a class="button button-primary" href="#/analyze">New analysis <span>＋</span></a></section><section class="panel history-panel"><div class="panel-heading"><div><div class="panel-label">SAVED RESULTS</div><h2>${history.length} assessment(s)</h2></div></div>${history.length?historyTable(history):`<div class="empty-state compact"><div class="empty-icon">⌁</div><h2>No assessments yet</h2><p>Start an analysis to create your first saved result.</p><a class="button button-primary" href="#/analyze">Start analysis →</a></div>`}</section>`);
}
async function navigate() {
  const route=location.hash.replace(/^#\/?/,"").split("?")[0]||"home";
  if(route==="logout"){profile=null;localStorage.removeItem(profileKey);setNav();flash("You have been logged out.");location.hash="#/";return;}
  try {
    const profileId=localStorage.getItem(profileKey);
    if(profileId){const result=await api(`${API}?id=${encodeURIComponent(profileId)}`);profile=result.profile;}
    else profile=null;
  } catch { profile=null; localStorage.removeItem(profileKey); }
  setNav();
  if(route==="register") registerPage(); else if(route==="dashboard") dashboard(); else if(route==="analyze") analyzePage(); else if(route==="history") historyPage(); else landing();
}
window.addEventListener("hashchange",navigate);
navigate();
