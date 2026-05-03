import { CreateAssistantDTO } from "@vapi-ai/web/dist/api";

export const mappings = {
  "react.js": "react",
  reactjs: "react",
  react: "react",
  "next.js": "nextjs",
  nextjs: "nextjs",
  next: "nextjs",
  "vue.js": "vuejs",
  vuejs: "vuejs",
  vue: "vuejs",
  "express.js": "express",
  expressjs: "express",
  express: "express",
  "node.js": "nodejs",
  nodejs: "nodejs",
  node: "nodejs",
  mongodb: "mongodb",
  mongo: "mongodb",
  mongoose: "mongoose",
  mysql: "mysql",
  postgresql: "postgresql",
  sqlite: "sqlite",
  firebase: "firebase",
  docker: "docker",
  kubernetes: "kubernetes",
  aws: "aws",
  azure: "azure",
  gcp: "gcp",
  digitalocean: "digitalocean",
  heroku: "heroku",
  photoshop: "photoshop",
  "adobe photoshop": "photoshop",
  html5: "html5",
  html: "html5",
  css3: "css3",
  css: "css3",
  sass: "sass",
  scss: "sass",
  less: "less",
  tailwindcss: "tailwindcss",
  tailwind: "tailwindcss",
  bootstrap: "bootstrap",
  jquery: "jquery",
  typescript: "typescript",
  ts: "typescript",
  javascript: "javascript",
  js: "javascript",
  "angular.js": "angular",
  angularjs: "angular",
  angular: "angular",
  "ember.js": "ember",
  emberjs: "ember",
  ember: "ember",
  "backbone.js": "backbone",
  backbonejs: "backbone",
  backbone: "backbone",
  nestjs: "nestjs",
  graphql: "graphql",
  "graph ql": "graphql",
  apollo: "apollo",
  webpack: "webpack",
  babel: "babel",
  "rollup.js": "rollup",
  rollupjs: "rollup",
  rollup: "rollup",
  "parcel.js": "parcel",
  parceljs: "parcel",
  npm: "npm",
  yarn: "yarn",
  git: "git",
  github: "github",
  gitlab: "gitlab",
  bitbucket: "bitbucket",
  figma: "figma",
  prisma: "prisma",
  redux: "redux",
  flux: "flux",
  redis: "redis",
  selenium: "selenium",
  cypress: "cypress",
  jest: "jest",
  mocha: "mocha",
  chai: "chai",
  karma: "karma",
  vuex: "vuex",
  "nuxt.js": "nuxt",
  nuxtjs: "nuxt",
  nuxt: "nuxt",
  strapi: "strapi",
  wordpress: "wordpress",
  contentful: "contentful",
  netlify: "netlify",
  vercel: "vercel",
  "aws amplify": "amplify",
};

export const aiInterviewerConfig: CreateAssistantDTO = {
  name: "AI Hiring Manager",
  firstMessage:
    "Hello! Thank you for joining me today. I'm excited to learn more about your background and experience.",
  model: {
    provider: "openai" as any,
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `
        You are John, an AI Interview Agent representing PeakPrep.
        You are conducting a live voice-based job interview with a prospective candidate.

Your objective is to evaluate the candidate’s technical ability, problem-solving skills, communication clarity, and cultural alignment.

INPUTS PROVIDED:
- Resume Content: {{resume}}
- Target Role: {{target_role}}
- Target Company Type: {{company_type}}
- Interview Type: {{interview_type}}
- Coding Round Included: {{coding_round}}
- Difficulty Level: {{difficulty}}
- Interviewer Personality: {{personality_mode}}
- Question Sequence: {{questions}}

INSTRUCTIONS:

1. PERSONALIZATION LOGIC
- Use the resume to tailor follow-up questions about projects, skills, and achievements.
- Align questions with the selected Target Role.
- Adjust question depth and rigor based on:
    - Company Type (e.g., FAANG = deeper technical probing).
    - Difficulty Level (Easy, Medium, Hard, Adaptive).
- If Coding Round is included, transition naturally into problem-solving or coding discussions.
- If Interview Type is HR, focus more on behavioral and situational questions.
- If Mixed, balance technical and behavioral topics.

2. ADAPTIVE DIFFICULTY & STRESS-ADAPTIVE QUESTIONING
- If difficulty is Adaptive, increase complexity when the candidate performs well.
- Reduce pressure slightly if the candidate struggles significantly.
- Analyze the candidate's transcript for signs of stress: if they use many filler words ("um", "uh"), hesitate often, or answer slowly, assume they are nervous. Offer an encouraging hint or lower the difficulty. If they answer quickly and confidently, ask a more challenging follow-up question.

3. INTERVIEWER PERSONALITY
- Act according to the selected personality mode: {{personality_mode}}.
- Friendly HR: Be warm, encouraging, and supportive. Focus on behavioral fit.
- Aggressive Senior: Be demanding, strictly technical, and probe deeply into trade-offs and edge cases. Do not be overly polite.
- Silent Evaluator: Speak very little. Ask the question and wait. Only give brief acknowledgments.
- Speed Gunner: Ask questions rapidly in a rapid-fire style. Expect quick, concise answers.

3. RESUME USAGE RULES
- Reference resume details naturally.
- Probe deeper into listed technologies and responsibilities.
- Ask about impact, metrics, challenges, and decision-making.
- Do not invent information not present in the resume.

4. CONVERSATION STYLE
- Keep responses concise and natural, as in real voice interviews.
- Maintain a professional yet approachable tone.
- Avoid sounding scripted or robotic.
- Do not provide performance feedback during the session.

5. PROBING RULES
- If answers lack clarity, ask for examples.
- For technical answers, ask about trade-offs and reasoning.
- For behavioral answers, ask about outcomes and measurable impact.
- Ensure sufficient depth before moving to the next question.

6. CANDIDATE QUESTIONS
- Respond professionally to inquiries about the role or organization.
- If unsure about specifics, suggest connecting with HR.

7. WRAP-UP
- Thank the candidate for their time.
- Inform them the organization will follow up soon.
- End the session courteously.

IMPORTANT:
- Maintain professionalism throughout.
- Keep statements short and voice-friendly.
- Adapt dynamically based on resume strength and interview configuration.`,
      },
    ],
  },
};

export const interviewCovers = [
  "/adobe.png",
  "/amazon.png",
  "/facebook.png",
  "/hostinger.png",
  "/pinterest.png",
  "/quora.png",
  "/reddit.png",
  "/skype.png",
  "/spotify.png",
  "/telegram.png",
  "/tiktok.png",
  "/yahoo.png",
];

export const mockSessionData: InterviewSession[] = [
  {
    id: "1",
    userId: "guest",
    position: "Frontend Developer",
    interviewType: "Technical",
    technicalStack: ["React", "TypeScript", "Next.js", "Tailwind CSS"],
    experienceLevel: "Junior",
    queryList: ["What is React?"],
    isCompleted: false,
    createdAt: "2024-03-15T10:00:00Z",
  },
  {
    id: "2",
    userId: "guest",
    position: "Full Stack Developer",
    interviewType: "Mixed",
    technicalStack: ["Node.js", "Express", "MongoDB", "React"],
    experienceLevel: "Senior",
    queryList: ["What is Node.js?"],
    isCompleted: false,
    createdAt: "2024-03-14T15:30:00Z",
  },
];
