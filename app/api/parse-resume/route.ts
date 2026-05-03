import { NextRequest, NextResponse } from "next/server";

// Skill keywords organized by category
const SKILL_KEYWORDS: Record<string, string[]> = {
  languages: [
    "javascript", "typescript", "python", "java", "c++", "c#", "go", "golang",
    "rust", "ruby", "swift", "kotlin", "php", "scala", "r", "dart", "lua",
    "perl", "haskell", "elixir", "clojure", "objective-c", "shell", "bash",
    "powershell", "sql", "html", "css", "sass", "scss", "less",
  ],
  frontend: [
    "react", "reactjs", "react.js", "next.js", "nextjs", "vue", "vuejs",
    "vue.js", "angular", "angularjs", "svelte", "nuxt", "nuxtjs", "gatsby",
    "remix", "tailwind", "tailwindcss", "bootstrap", "material ui", "mui",
    "chakra ui", "styled-components", "redux", "zustand", "mobx", "jquery",
    "webpack", "vite", "babel", "storybook",
  ],
  backend: [
    "node.js", "nodejs", "express", "expressjs", "express.js", "nestjs",
    "nest.js", "fastify", "koa", "django", "flask", "fastapi", "spring",
    "spring boot", "springboot", "rails", "ruby on rails", "laravel",
    "asp.net", ".net", "gin", "echo", "fiber",
  ],
  databases: [
    "mongodb", "mongoose", "postgresql", "postgres", "mysql", "sqlite",
    "redis", "elasticsearch", "dynamodb", "cassandra", "neo4j", "couchdb",
    "mariadb", "oracle", "sql server", "mssql", "prisma", "sequelize",
    "typeorm", "drizzle", "supabase", "firebase", "firestore",
  ],
  cloud: [
    "aws", "amazon web services", "azure", "gcp", "google cloud",
    "digitalocean", "heroku", "vercel", "netlify", "cloudflare",
    "ec2", "s3", "lambda", "ecs", "eks", "fargate", "cloudfront",
    "route53", "rds", "sqs", "sns", "amplify",
  ],
  devops: [
    "docker", "kubernetes", "k8s", "jenkins", "ci/cd", "cicd",
    "github actions", "gitlab ci", "circleci", "travis ci", "terraform",
    "ansible", "puppet", "chef", "nginx", "apache", "linux",
    "prometheus", "grafana", "datadog", "new relic", "elk stack",
    "argocd", "helm",
  ],
  tools: [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "slack", "figma", "postman", "swagger", "graphql", "rest api",
    "restful", "grpc", "websocket", "socket.io", "rabbitmq", "kafka",
    "microservices", "serverless", "agile", "scrum",
  ],
  testing: [
    "jest", "mocha", "chai", "cypress", "selenium", "playwright",
    "testing library", "enzyme", "vitest", "puppeteer", "junit",
    "pytest", "rspec", "jasmine", "karma", "supertest",
  ],
  mobile: [
    "react native", "flutter", "swift", "swiftui", "kotlin",
    "android", "ios", "xamarin", "ionic", "expo",
  ],
  ai_ml: [
    "machine learning", "deep learning", "tensorflow", "pytorch",
    "scikit-learn", "pandas", "numpy", "opencv", "nlp",
    "natural language processing", "computer vision", "keras",
    "hugging face", "langchain", "openai", "llm", "gpt",
    "neural network", "data science", "data analysis",
  ],
};

// Technology keywords (frameworks, tools, platforms)
const TECH_KEYWORDS = [
  "REST APIs", "GraphQL", "Docker", "Kubernetes", "CI/CD",
  "Microservices", "Serverless", "WebSocket", "OAuth", "JWT",
  "SSR", "SSG", "SPA", "PWA", "SEO", "Responsive Design",
  "Unit Testing", "Integration Testing", "E2E Testing",
  "Agile", "Scrum", "Kanban", "TDD", "BDD", "DDD",
  "Design Patterns", "System Design", "Data Structures",
  "Algorithms", "OOP", "Functional Programming",
  "Clean Architecture", "MVC", "MVVM", "Event-Driven",
  "Message Queue", "Caching", "Load Balancing",
  "Database Design", "API Design", "Cloud Architecture",
  "DevOps", "Infrastructure as Code", "Monitoring",
  "Performance Optimization", "Security", "Authentication",
  "Authorization", "State Management", "Version Control",
];

function extractSkills(text: string): string[] {
  const lowerText = text.toLowerCase();
  const foundSkills = new Set<string>();

  for (const [, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      // Use word boundary matching
      const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`\\b${escapedKeyword}\\b`, "i");
      if (regex.test(lowerText)) {
        // Capitalize properly for display
        const displayName = formatSkillName(keyword);
        foundSkills.add(displayName);
      }
    }
  }

  return Array.from(foundSkills).slice(0, 15); // Return top 15 skills
}

function formatSkillName(skill: string): string {
  const nameMap: Record<string, string> = {
    "javascript": "JavaScript", "typescript": "TypeScript", "python": "Python",
    "java": "Java", "c++": "C++", "c#": "C#", "go": "Go", "golang": "Go",
    "rust": "Rust", "ruby": "Ruby", "swift": "Swift", "kotlin": "Kotlin",
    "php": "PHP", "scala": "Scala", "r": "R", "dart": "Dart",
    "react": "React", "reactjs": "React", "react.js": "React",
    "next.js": "Next.js", "nextjs": "Next.js",
    "vue": "Vue.js", "vuejs": "Vue.js", "vue.js": "Vue.js",
    "angular": "Angular", "angularjs": "Angular",
    "svelte": "Svelte", "nuxt": "Nuxt.js", "nuxtjs": "Nuxt.js",
    "node.js": "Node.js", "nodejs": "Node.js",
    "express": "Express.js", "expressjs": "Express.js", "express.js": "Express.js",
    "nestjs": "NestJS", "nest.js": "NestJS",
    "django": "Django", "flask": "Flask", "fastapi": "FastAPI",
    "spring": "Spring", "spring boot": "Spring Boot", "springboot": "Spring Boot",
    "mongodb": "MongoDB", "mongoose": "Mongoose",
    "postgresql": "PostgreSQL", "postgres": "PostgreSQL",
    "mysql": "MySQL", "sqlite": "SQLite", "redis": "Redis",
    "elasticsearch": "Elasticsearch", "dynamodb": "DynamoDB",
    "aws": "AWS", "azure": "Azure", "gcp": "GCP",
    "docker": "Docker", "kubernetes": "Kubernetes", "k8s": "Kubernetes",
    "jenkins": "Jenkins", "ci/cd": "CI/CD", "cicd": "CI/CD",
    "terraform": "Terraform", "nginx": "Nginx", "linux": "Linux",
    "git": "Git", "github": "GitHub", "gitlab": "GitLab",
    "graphql": "GraphQL", "rest api": "REST API", "restful": "RESTful",
    "firebase": "Firebase", "firestore": "Firestore",
    "supabase": "Supabase", "prisma": "Prisma",
    "tailwind": "Tailwind CSS", "tailwindcss": "Tailwind CSS",
    "bootstrap": "Bootstrap", "redux": "Redux",
    "jest": "Jest", "cypress": "Cypress", "selenium": "Selenium",
    "playwright": "Playwright",
    "react native": "React Native", "flutter": "Flutter",
    "machine learning": "Machine Learning", "deep learning": "Deep Learning",
    "tensorflow": "TensorFlow", "pytorch": "PyTorch",
    "pandas": "Pandas", "numpy": "NumPy",
    "html": "HTML", "css": "CSS", "sass": "Sass", "scss": "SCSS",
    "sql": "SQL", "bash": "Bash", "shell": "Shell",
    "webpack": "Webpack", "vite": "Vite",
    "agile": "Agile", "scrum": "Scrum",
    "microservices": "Microservices", "serverless": "Serverless",
    "rabbitmq": "RabbitMQ", "kafka": "Kafka",
    "websocket": "WebSocket", "socket.io": "Socket.IO",
    "vercel": "Vercel", "netlify": "Netlify", "heroku": "Heroku",
    "postman": "Postman", "swagger": "Swagger",
    "figma": "Figma", "jira": "Jira",
    "storybook": "Storybook",
    "expo": "Expo", "ionic": "Ionic",
    "openai": "OpenAI", "langchain": "LangChain",
    "data science": "Data Science", "data analysis": "Data Analysis",
  };

  return nameMap[skill.toLowerCase()] || skill.charAt(0).toUpperCase() + skill.slice(1);
}

function extractKeyTechnologies(text: string): string[] {
  const lowerText = text.toLowerCase();
  const found: string[] = [];

  for (const tech of TECH_KEYWORDS) {
    const escapedTech = tech.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escapedTech}\\b`, "i");
    if (regex.test(lowerText)) {
      found.push(tech);
    }
  }

  return found.slice(0, 8); // Return top 8 technologies
}

function detectExperienceLevel(text: string): string {
  const lowerText = text.toLowerCase();

  // Check for explicit years of experience
  const yearPatterns = [
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i,
    /experience\s*(?:of)?\s*(\d+)\+?\s*(?:years?|yrs?)/i,
    /(\d+)\+?\s*(?:years?|yrs?)\s*(?:in|working|developing|programming|coding)/i,
  ];

  let maxYears = 0;
  for (const pattern of yearPatterns) {
    const match = text.match(pattern);
    if (match) {
      const years = parseInt(match[1]);
      if (years > maxYears) maxYears = years;
    }
  }

  // Check for date ranges in experience sections (e.g., "2019 - 2024", "2019 - Present")
  const dateRangePattern = /(\d{4})\s*[-–—]\s*(\d{4}|present|current|ongoing|now)/gi;
  const matches = [...text.matchAll(dateRangePattern)];
  if (matches.length > 0) {
    let earliestStart = 9999;
    for (const match of matches) {
      const startYear = parseInt(match[1]);
      if (startYear >= 1990 && startYear <= new Date().getFullYear()) {
        earliestStart = Math.min(earliestStart, startYear);
      }
    }
    if (earliestStart < 9999) {
      const yearsFromDates = new Date().getFullYear() - earliestStart;
      if (yearsFromDates > maxYears) maxYears = yearsFromDates;
    }
  }

  // Check for seniority keywords
  const seniorKeywords = ["senior", "lead", "principal", "architect", "staff", "director", "vp", "head of", "manager"];
  const midKeywords = ["mid-level", "mid level", "intermediate"];
  const juniorKeywords = ["junior", "intern", "internship", "entry-level", "entry level", "fresher", "graduate", "trainee"];

  const hasSeniorKeyword = seniorKeywords.some(k => lowerText.includes(k));
  const hasMidKeyword = midKeywords.some(k => lowerText.includes(k));
  const hasJuniorKeyword = juniorKeywords.some(k => lowerText.includes(k));

  // Determine level based on years and keywords
  if (maxYears >= 8 || (hasSeniorKeyword && maxYears >= 5)) {
    return "Senior (8+ years)";
  } else if (maxYears >= 5 || hasSeniorKeyword) {
    return "Mid-Senior (5-8 years)";
  } else if (maxYears >= 3 || hasMidKeyword) {
    return "Mid-Level (3-5 years)";
  } else if (maxYears >= 1) {
    return "Junior (1-3 years)";
  } else if (hasJuniorKeyword) {
    return "Entry Level (0-1 years)";
  } else if (hasSeniorKeyword) {
    return "Mid-Senior (5-8 years)";
  } else {
    // Default based on content richness
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 800) return "Mid-Senior (5-8 years)";
    if (wordCount > 400) return "Mid-Level (3-5 years)";
    if (wordCount > 200) return "Junior (1-3 years)";
    return "Entry Level (0-1 years)";
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    const fileName = file.name.toLowerCase();
    let extractedText = "";

    if (fileName.endsWith(".pdf")) {
      // Parse PDF
      const buffer = Buffer.from(await file.arrayBuffer());
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfParse = require("pdf-parse/lib/pdf-parse.js");
      const pdfData = await pdfParse(buffer);
      extractedText = pdfData.text;
    } else if (
      fileName.endsWith(".docx") ||
      fileName.endsWith(".doc")
    ) {
      // Parse DOCX
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Please upload PDF or DOCX." },
        { status: 400 }
      );
    }

    if (!extractedText || extractedText.trim().length < 20) {
      return NextResponse.json(
        { error: "Could not extract text from the file. The file may be image-based or empty." },
        { status: 422 }
      );
    }

    // Extract data from resume text
    const detectedSkills = extractSkills(extractedText);
    const keyTechnologies = extractKeyTechnologies(extractedText);
    const experienceLevel = detectExperienceLevel(extractedText);

    // Calculate ATS Score
    const wordCount = extractedText.split(/\s+/).length;
    
    // 1. Word Count Score (Max 20)
    let wordScore = 5;
    if (wordCount >= 350 && wordCount <= 900) {
      wordScore = 20;
    } else if (wordCount > 200 || wordCount > 900) {
      wordScore = 12;
    }

    // 2. Skill Score (Max 35 points - requires ~14 unique skills)
    const skillScore = Math.min(35, detectedSkills.length * 2.5);
    
    // 3. Tech Keywords Score (Max 30 points - requires 10 keywords)
    const techScore = Math.min(30, keyTechnologies.length * 3);
    
    // 4. Formatting/Action Score (Max 15 points - based on bullet points)
    // Matches •, -, * followed by space, or typical resume bullet characters
    const bulletPoints = (extractedText.match(/(?:[•\-\*]|\u2022|\u2023|\u25E6|\u2043|\u2219)\s/g) || []).length;
    const formatScore = Math.min(15, bulletPoints * 1.5);

    let rawScore = wordScore + skillScore + techScore + formatScore;

    // Apply a penalty if it lacks depth but has many keywords
    if (experienceLevel === "Entry-Level" && rawScore > 80) {
      rawScore -= 12; 
    }

    // Dynamic adjustment to make it feel realistic (between 35 and 98)
    const atsScore = Math.max(35, Math.min(98, Math.round(rawScore - (Math.random() * 4))));

    return NextResponse.json({
      success: true,
      detectedSkills: detectedSkills.length > 0 ? detectedSkills : ["General Programming"],
      keyTechnologies: keyTechnologies.length > 0 ? keyTechnologies : ["Software Development"],
      experienceLevel,
      atsScore,
      resumeText: extractedText.slice(0, 5000), // Send first 5000 chars for AI context
    });
  } catch (error) {
    console.error("Resume parsing error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
