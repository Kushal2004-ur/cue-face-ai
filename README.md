# 🔍 Forensic Face AI - Intelligent Suspect Identification System

<div align="center">

![Forensic Face AI](https://img.shields.io/badge/Forensic-Face%20AI-blue?style=for-the-badge&logo=eye)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=flat-square&logo=supabase)
![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

**An AI-powered forensic identification system that transforms eyewitness descriptions into sketches and matches them against suspect databases using vector similarity search.**

[Live Demo](https://lovable.dev/projects/5974afc4-c0dc-4206-ae6d-5b06e921c0a3) · [Report Bug](https://github.com/yourusername/forensic-face-ai/issues) · [Request Feature](https://github.com/yourusername/forensic-face-ai/issues)

</div>

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Database Setup](#-database-setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Security](#-security)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)
- [Screenshots](#-screenshots)

---

## 📸 Screenshots

### Dashboard & Case Management
<p align="center">
  <img src="screenshots/dashboard.png" alt="Dashboard" width="800"/>
  <br><em>Main dashboard showing active cases and recent matches</em>
</p>

<p align="center">
  <img src="screenshots/cases.png" alt="Cases List" width="800"/>
  <br><em>Case management interface with status tracking</em>
</p>

### AI Sketch Generation
<p align="center">
  <img src="screenshots/sketch-generator.png" alt="Sketch Generator" width="800"/>
  <br><em>AI-powered sketch generation from witness descriptions</em>
</p>

<p align="center">
  <img src="screenshots/clarification-chat.png" alt="Clarification Chat" width="800"/>
  <br><em>Intelligent chatbot asking follow-up questions for detailed descriptions</em>
</p>

### Suspect Matching
<p align="center">
  <img src="screenshots/matching-results.png" alt="Matching Results" width="800"/>
  <br><em>AI matching results with confidence scores</em>
</p>

<p align="center">
  <img src="screenshots/comparison-modal.png" alt="Comparison Modal" width="800"/>
  <br><em>Side-by-side comparison of sketch and suspect photo with overlay feature</em>
</p>

### Demo GIFs

#### Complete Workflow Demo
<p align="center">
  <img src="screenshots/demo-workflow.gif" alt="Workflow Demo" width="800"/>
  <br><em>Full workflow: Description → Sketch → Matching → Alert</em>
</p>

#### Sketch Generation in Action
<p align="center">
  <img src="screenshots/demo-sketch-generation.gif" alt="Sketch Generation" width="800"/>
  <br><em>Watch AI generate a forensic sketch from text description</em>
</p>

#### Image Comparison Tools
<p align="center">
  <img src="screenshots/demo-comparison.gif" alt="Comparison Tools" width="800"/>
  <br><em>Using overlay blend, zoom, and pan features</em>
</p>

### Mobile Responsive Views
<p align="center">
  <img src="screenshots/mobile-dashboard.png" alt="Mobile Dashboard" width="300"/>
  <img src="screenshots/mobile-case.png" alt="Mobile Case" width="300"/>
  <img src="screenshots/mobile-matches.png" alt="Mobile Matches" width="300"/>
  <br><em>Fully responsive design for mobile devices</em>
</p>

---

### 📁 Adding Your Own Screenshots

To add screenshots to this README:

1. **Create a `screenshots` folder** in the project root:
   ```bash
   mkdir screenshots
   ```

2. **Capture screenshots** of key features:
   - Dashboard view
   - Case creation/detail
   - Sketch generation process
   - Matching results
   - Comparison modal with overlay
   - Admin dashboard

3. **Record GIFs** using tools like:
   - [ScreenToGif](https://www.screentogif.com/) (Windows)
   - [Gifox](https://gifox.io/) (macOS)
   - [Peek](https://github.com/phw/peek) (Linux)

4. **Optimize images** for web:
   - Use PNG for static screenshots
   - Keep GIFs under 10MB
   - Compress with [TinyPNG](https://tinypng.com/) or [Squoosh](https://squoosh.app/)

5. **Commit to repository**:
   ```bash
   git add screenshots/
   git commit -m "Add screenshots and demo GIFs"
   git push
   ```

## 🎯 About The Project

**Forensic Face AI** is a cutting-edge law enforcement tool that revolutionizes the suspect identification process. Traditional methods rely on manual sketch artists and time-consuming database searches. Our system automates this entire workflow using advanced AI technologies.

### Problem Statement
- Manual forensic sketching is time-consuming and expensive
- Subjective interpretation leads to inconsistent results
- Database searching is labor-intensive with limited accuracy
- Delayed identification can compromise investigations

### Our Solution
An end-to-end AI pipeline that:
1. Captures witness descriptions through an intelligent chatbot
2. Generates photorealistic forensic sketches using Imagen 3.0
3. Creates vector embeddings for similarity matching
4. Automatically searches the suspect database
5. Sends real-time alerts for high-confidence matches

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🎨 **AI Sketch Generation** | Generate forensic sketches from text descriptions using Google Imagen 3.0 |
| 💬 **Smart Clarification Bot** | Conversational AI that asks follow-up questions for detailed descriptions |
| 🔍 **Vector Similarity Search** | pgvector-powered cosine similarity matching against suspect database |
| 📊 **Match Confidence Scoring** | Visual indicators showing match probability (green ≥80%, amber 60-79%, red <60%) |
| 🔔 **Telegram Alerts** | Automatic notifications for high-confidence matches |
| 👥 **Role-Based Access Control** | Admin, Analyst, and Officer permission levels |
| 📱 **Responsive Design** | Works seamlessly on desktop, tablet, and mobile |
| 🔒 **Enterprise Security** | JWT auth, RLS policies, and comprehensive audit logging |
| 🖼️ **Image Comparison Tools** | Side-by-side view, overlay blending, zoom/pan functionality |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Accessible component library
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Framer Motion** - Animations

### Backend (Supabase)
- **PostgreSQL** - Primary database
- **pgvector** - Vector similarity search extension
- **Edge Functions** - Serverless API endpoints (Deno)
- **Row Level Security** - Fine-grained access control
- **Supabase Auth** - JWT-based authentication
- **Supabase Storage** - Secure media storage

### AI/ML Services
- **Google Imagen 3.0** - Sketch generation
- **Google text-embedding-004** - 768-dimensional embeddings
- **Gemini Pro Vision** - Image analysis and description
- **Gemini Flash** - NLP for description refinement

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  React   │  │  Auth    │  │  State   │  │   UI     │        │
│  │  Router  │  │  Context │  │  (Query) │  │ (shadcn) │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SUPABASE EDGE FUNCTIONS                      │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ generate-sketch│  │ generate-embed │  │ find-matches   │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐    │
│  │ refine-desc    │  │ clarify-quest  │  │ telegram-alert │    │
│  └────────────────┘  └────────────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │  cases   │  │ suspects │  │  media   │  │ matches  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                       │
│  │  users   │  │  audits  │  │ settings │                       │
│  └──────────┘  └──────────┘  └──────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0 or higher) - [Download](https://nodejs.org/)
- **npm** or **bun** - Package manager
- **Git** - Version control
- **Supabase Account** - [Sign up free](https://supabase.com/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/forensic-face-ai.git
   cd forensic-face-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables** (see next section)

4. **Start the development server**
   ```bash
   npm run dev
   # or
   bun dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

### Environment Variables

Create a `.env` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: For local Supabase development
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Edge Function Secrets (Configure in Supabase Dashboard)

Navigate to **Project Settings → Edge Functions → Secrets** and add:

| Secret Name | Description |
|-------------|-------------|
| `LOVABLE_API_KEY` | Lovable AI Gateway API key for Imagen & Gemini |
| `OPENAI_API_KEY` | OpenAI API key (backup for embeddings) |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token for alerts |
| `TELEGRAM_CHAT_ID` | Target chat/group ID for notifications |

---

## 💾 Database Setup

### Option 1: Using Supabase Cloud (Recommended)

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration files in order:
   ```
   supabase/migrations/
   ```
3. Enable the `pgvector` extension:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### Option 2: Local Development with Supabase CLI

1. **Install Supabase CLI**
   ```bash
   npm install -g supabase
   ```

2. **Initialize and start local Supabase**
   ```bash
   supabase init
   supabase start
   ```

3. **Apply migrations**
   ```bash
   supabase db push
   ```

4. **Deploy Edge Functions locally**
   ```bash
   supabase functions serve
   ```

### Database Schema Overview

| Table | Purpose |
|-------|---------|
| `users` | User accounts with roles (admin/analyst/officer) |
| `cases` | Investigation cases with status tracking |
| `suspects` | Suspect profiles with photo embeddings |
| `media` | Sketches and photos with vector embeddings |
| `matches` | AI-generated match results with confidence scores |
| `audit_logs` | Complete activity trail for compliance |
| `system_settings` | Configurable thresholds and settings |

---

## 📖 Usage

### Creating a New Case

1. Navigate to **Cases** → **New Case**
2. Enter case title and description
3. Add witness description or upload reference images

### Generating a Forensic Sketch

1. Open a case → **Generate Sketch**
2. Enter the witness description
3. Answer AI clarification questions for better accuracy
4. Review and confirm the generated sketch

### Matching Against Suspects

1. After sketch generation, matching runs automatically
2. View matches in the **Matches** tab
3. Click on a match to open the comparison modal
4. Use overlay/side-by-side view to analyze
5. **Link to Case** or **Mark as False Positive**

### Adding Suspects to Database

1. Navigate to **Suspects** → **Add Suspect**
2. Upload a clear frontal photo
3. Enter suspect name and notes
4. System automatically generates embedding

---

## 📡 API Documentation

### Edge Functions

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/generate-sketch` | POST | Generate sketch from description |
| `/generate-sketch-embedding` | POST | Create vector embedding for media |
| `/generate-suspect-embedding` | POST | Create embedding for suspect photo |
| `/find-suspect-matches` | POST | Search for similar suspects |
| `/refine-description` | POST | Enhance description with AI |
| `/generate-clarifying-questions` | POST | Get follow-up questions |
| `/send-telegram-alert` | POST | Send match notification |
| `/get-media-url` | POST | Generate signed URL for media |

### Example: Generate Sketch

```javascript
const response = await supabase.functions.invoke('generate-sketch', {
  body: {
    description: "Male, 30s, oval face, brown eyes, short black hair",
    caseId: "uuid-here"
  }
});
```

---

## 🔒 Security

### Authentication
- JWT-based authentication via Supabase Auth
- Session management with automatic refresh
- Protected routes requiring authentication

### Authorization
- **Role-Based Access Control (RBAC)**:
  - `admin` - Full system access
  - `analyst` - Case management & analysis
  - `officer` - View & basic operations

### Data Protection
- **Row Level Security (RLS)** on all tables
- Encrypted storage for sensitive media
- Signed URLs with 2-minute expiration
- Input validation and sanitization

### Audit Trail
- All actions logged with actor, target, and payload
- Tamper-proof audit log table
- Compliance-ready reporting

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Write tests for new features
- Update documentation as needed

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

**Project Link:** https://github.com/Kushal2004-ur/cue-face-ai
---

<div align="center">

⭐ **Star this repo if you find it useful!** ⭐
