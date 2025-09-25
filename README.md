# Forensic Face AI - Complete Facial Reconstruction System

A comprehensive forensic facial reconstruction system that transforms textual descriptions into facial sketches, matches them against criminal databases, and automatically alerts police stations when potential suspects are identified.

![System Authentication](https://github.com/user-attachments/assets/1c642fdb-445e-42f8-aa1d-232ecaccde83)

## 🎯 System Overview

This system provides a complete end-to-end forensic workflow:

1. **Text Analysis**: Convert eyewitness descriptions into detailed prompts
2. **AI Sketch Generation**: Create professional forensic sketches using Google Gemini
3. **Suspect Matching**: Compare sketches against criminal database using vector embeddings
4. **Automated Alerts**: Send notifications to police stations for high-confidence matches
5. **Case Management**: Full investigation lifecycle tracking with role-based access

## ✨ Key Features

### 🔍 **AI-Powered Sketch Generation**
- Natural language processing of witness descriptions
- Professional forensic sketch output with Gemini AI
- Vector embedding generation for similarity matching

### 🎯 **Intelligent Suspect Matching**
- pgvector-powered similarity search
- Configurable confidence thresholds
- Real-time match scoring and ranking

### 🚨 **Automated Alert System**  
- Instant notifications to police stations
- Priority-based alert classification
- Email distribution with case details

### 👮 **Police Network Integration**
- Multi-station alert distribution
- Real-time notification dashboard
- Station-specific jurisdiction management

### 🔐 **Enterprise Security**
- Row-Level Security on all database operations
- Role-based access control (Officer/Analyst/Admin)
- Complete audit logging and compliance

## 🏗️ Technical Architecture

### Frontend Stack
- **React 18** with TypeScript for type safety
- **Next.js** for modern React development
- **Tailwind CSS** + **shadcn/ui** for consistent design
- **React Query** for server state management

### Backend Infrastructure  
- **Supabase** PostgreSQL with real-time capabilities
- **pgvector** extension for similarity search
- **Serverless Edge Functions** for AI processing
- **Row-Level Security** for data protection

### AI & Machine Learning
- **Google Gemini API** for text-to-image generation
- **Vector embeddings** for facial similarity
- **Automated matching algorithms** with confidence scoring

## 📋 Complete Workflow

1. **Case Creation**: Officers create cases with suspect descriptions
2. **Sketch Generation**: AI converts text to forensic sketches  
3. **Database Matching**: Vector similarity search against suspects
4. **Alert Distribution**: Automatic notifications to police stations
5. **Investigation Support**: Real-time collaboration and case tracking

See [FORENSIC_WORKFLOW.md](./FORENSIC_WORKFLOW.md) for detailed process documentation.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd cue-face-ai
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Add your Supabase and Gemini API credentials
```

4. **Run database migrations**
```bash
npx supabase db push
```

5. **Start development server**
```bash
npm run dev
```

Visit `http://localhost:8080` to access the application.

## 👥 User Roles

### 🎖️ **Officer**
- Create and manage cases
- Generate sketches from descriptions
- View matches for assigned cases

### 🔍 **Analyst**  
- Full case and suspect management
- Police network administration
- Alert system oversight

### ⚙️ **Admin**
- Complete system administration
- User management and roles
- System monitoring and configuration

## 🛡️ Security Features

- **Authentication**: Secure login with Supabase Auth
- **Authorization**: Role-based permissions system  
- **Data Protection**: Encryption at rest and in transit
- **Audit Trail**: Complete activity logging
- **Compliance**: GDPR and law enforcement standards

## 📊 Database Schema

### Core Tables
- `cases` - Investigation cases
- `suspects` - Criminal database with photo embeddings
- `media` - Evidence and generated sketches
- `matches` - AI-generated suspect matches
- `police_stations` - Connected law enforcement agencies  
- `alerts` - Automated match notifications

### AI Features
- Vector similarity search with pgvector
- Automated embedding generation
- Real-time match scoring

## 🔌 API Integration

### Supabase Edge Functions
- **generate-sketch**: AI sketch creation
- **find-suspect-matches**: Vector similarity matching
- **send-alert-notifications**: Email alert system
- **generate-suspect-embedding**: Photo processing

### External Services
- Google Gemini API for AI generation
- Email providers for notifications
- File storage for evidence

## 🎨 UI Components

Built with modern, accessible components:
- Responsive design for all devices
- Real-time notifications and updates
- Intuitive case management interface
- Advanced search and filtering

## 📈 Performance & Scaling

- **Serverless**: Auto-scaling based on demand
- **Caching**: Optimized query performance
- **CDN**: Global content delivery
- **Monitoring**: Built-in performance tracking

## 🤝 Contributing

This system is designed for law enforcement and forensic applications. Contributions should maintain high security and accuracy standards.

## 📄 License

This project is designed for law enforcement and forensic investigation purposes.

## 🆘 Support

For technical support or system administration questions, please refer to the system documentation or contact your administrator.

---

**Built with modern web technologies for professional forensic investigation workflows.**
