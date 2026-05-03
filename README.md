<div align="center">
  <h1>
    <bold>PeakPrep</bold><br>
    <strong>Intelligent Review & Interview System</strong>
  </h1>
  <p>AI-Powered Voice Interview Platform</p>
</div>

PeakPrep is a modern web application that leverages cutting-edge AI technology to provide realistic job interview practice sessions. Built with Next.js and powered by Vapi's voice AI agents with GPT-4o, it offers an immersive interview experience with real-time conversational intelligence.

### ✨ Key Features

- **Real-Time Voice Interviews** - Natural conversation flow with AI voice agents powered by Vapi
- **AI-Generated Questions** - Dynamic interview questions tailored to your role, experience level, and tech stack
- **System Design Whiteboarding** - Draw system architecture diagrams with AI-vision critiques
- **ATS Resume Scoring** - Automatic parsing and scoring of your resume with competitive programming integration
- **Real-Time Transcription** - Live conversation tracking with transcript display for both user and AI
- **Intelligent Feedback** - Comprehensive feedback summary with areas of improvement and automatically generated PDF reports
- **Government Internships** - Built-in portal for applying to prestigious internships like ISRO, NITI Aayog, and DRDO

### 🏗️ Tech Stack

<div align="center">
  <div>
    <img src="https://img.shields.io/badge/-Next.js_15-black?style=for-the-badge&logoColor=white&logo=nextdotjs&color=000000" alt="next.js" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
    <img src="https://img.shields.io/badge/-Vapi_AI-white?style=for-the-badge&color=5dfeca" alt="vapi" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS-black?style=for-the-badge&logoColor=white&logo=tailwindcss&color=06B6D4" alt="tailwindcss" />
    <img src="https://img.shields.io/badge/-Firebase-black?style=for-the-badge&logoColor=white&logo=firebase&color=DD2C00" alt="firebase" />
    <img src="https://img.shields.io/badge/-Docker-black?style=for-the-badge&logoColor=white&logo=docker&color=2496ED" alt="docker" />
  </div>
</div>

### Frontend
- **Next.js 15** - React framework with App Router and Server Components
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling with custom design system and glassmorphism effects
- **Excalidraw** - Integrated whiteboarding for System Design

### Backend & Services
- **Firebase Admin SDK** - Firestore database for session data
- **Vapi AI** - Voice agent integration powered by OpenAI GPT-4o
- **Groq Vision API** - High-speed vision model for system design critique and resume parsing
- **Clerk** - User Authentication

---

## 🎯 Usage

### Interview Flow
1. **Setup Session** - Provide your target company, role, resume, and profile links to generate an ATS score.
2. **Start Session** - Click "Start Interview" to enter the simulation.
3. **AI Conversation** - Natural voice interaction is conducted by the AI agent.
4. **Whiteboarding** - Switch to the "System Design" tab to draw architectures and click "Get AI Critique" for live feedback.
5. **End Interview** - Session completion generates a detailed, downloadable PDF report.

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Docker** (optional for containerized deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Nightkilller/PeakPrep---Ai-Interviewer.git
cd PeakPrep---Ai-Interviewer
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env.local` file in the root directory (Note: This file is ignored by Git, keep your keys safe!):

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Vapi AI Configuration
NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_web_token
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_vapi_workflow_id
VAPI_API_KEY=your_vapi_server_key

# AI Vision & Parsing
GROQ_API_KEY=your_groq_api_key

# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

# Firebase Admin SDK
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🐳 Docker Deployment

To run PeakPrep using Docker:

1. **Build the image**
```bash
docker build -t peakprep-app .
```

2. **Run the container** (Make sure to pass your environment variables or use an env file)
```bash
docker run -p 3000:3000 --env-file .env.local peakprep-app
```

---

## 📁 Project Structure

```
PeakPrep/
├── app/                    # Next.js App Router
│   ├── interview/          # Interview pages
│   ├── setup/             # Interview setup & ATS scoring
│   ├── dashboard/         # User analytics dashboard
│   ├── layout.tsx         # Root layout with navigation
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles and design system
├── components/            # React components
│   ├── Agent.tsx          # Voice agent component with real-time transcription
│   └── Whiteboard.tsx     # System design drawing canvas
├── lib/                   # Utilities and actions
├── constants/             # Application constants
├── firebase/              # Firebase configuration
└── public/                # Static assets
```

---

## 🎨 Design Features

- **Modern UI/UX** - Dark theme with glassmorphism effects
- **Responsive Design** - Works on desktop and laptop
- **Dynamic Feedback** - ATS visualization and PDF report generation

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).


