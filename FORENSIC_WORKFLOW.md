# Forensic Facial Reconstruction System - Complete Workflow Documentation

## Overview

The Forensic Face AI System is a comprehensive solution for forensic facial reconstruction that takes textual descriptions and generates facial sketches, matches them against a criminal database, and automatically alerts police stations when potential suspects are identified.

## System Architecture

### Frontend (React/TypeScript)
- **Next.js with TypeScript**: Modern React framework with type safety
- **shadcn/ui Components**: Consistent, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management and caching

### Backend (Supabase)
- **PostgreSQL Database**: Relational database with vector extensions
- **Row-Level Security**: Comprehensive security policies
- **Serverless Functions**: Edge functions for AI processing
- **Real-time Subscriptions**: Live updates for alerts and matches

### AI Integration
- **Google Gemini API**: Text-to-image generation for sketches
- **Vector Embeddings**: Facial similarity comparisons using pgvector
- **Similarity Search**: Efficient nearest-neighbor search for face matching

## Complete Forensic Workflow

### 1. Case Creation and Evidence Input

**User Role**: Officer, Analyst, or Admin

1. **Create New Case**: Officers create cases with title and description
2. **Text Description Input**: Enter detailed eyewitness descriptions of suspects
3. **Evidence Upload**: Upload photos, documents, and other evidence

### 2. AI Sketch Generation

**Component**: `SketchGenerator.tsx`
**Backend Function**: `supabase/functions/generate-sketch/`

1. **Text Analysis**: Process natural language descriptions
2. **Enhanced Prompting**: Convert descriptions to forensic sketch prompts
3. **AI Generation**: Generate professional police sketches using Gemini
4. **Vector Embedding**: Create embeddings for similarity search
5. **Storage**: Save sketches to case evidence with metadata

### 3. Automated Suspect Matching

**Component**: `AIMatching.tsx`  
**Backend Function**: `supabase/functions/find-suspect-matches/`

1. **Embedding Comparison**: Compare sketch embeddings with suspect database
2. **Similarity Scoring**: Calculate confidence scores using vector similarity
3. **Threshold Filtering**: Filter matches based on configurable thresholds
4. **Match Recording**: Store high-confidence matches in database

### 4. Automated Alert System

**Database Trigger**: `trigger_suspect_alert()`
**Backend Function**: `supabase/functions/send-alert-notifications/`

1. **Automatic Trigger**: Database triggers create alerts for matches ≥ 70%
2. **Priority Assignment**: 
   - Critical: ≥90% similarity
   - High: ≥80% similarity  
   - Medium: ≥70% similarity
   - Low: <70% similarity
3. **Multi-Station Distribution**: Alerts sent to all connected police stations
4. **Email Notifications**: Formatted alerts with case details and match scores

### 5. Police Station Management

**Component**: `PoliceStations.tsx`
**Database Tables**: `police_stations`, `alerts`

1. **Station Network**: Manage connected police stations
2. **Alert Dashboard**: View and manage pending alerts
3. **Real-time Notifications**: Live updates via AlertNotifications component
4. **Alert Acknowledgment**: Police can acknowledge or dismiss alerts

## Database Schema

### Core Tables

```sql
-- Cases: Investigation cases
cases (id, title, description, status, created_by, created_at)

-- Suspects: Criminal database
suspects (id, name, photo_url, photo_embedding, notes, created_at)

-- Media: Case evidence and generated sketches  
media (id, case_id, url, type, embedding, meta, created_at)

-- Matches: AI-generated suspect matches
matches (id, case_id, suspect_id, score, threshold, evidence, created_at)

-- Police Stations: Connected law enforcement agencies
police_stations (id, name, address, city, state, contact_email, contact_phone, jurisdiction_area)

-- Alerts: Automated suspect match notifications
alerts (id, case_id, suspect_id, match_id, police_station_id, alert_type, status, priority, message, metadata, sent_at, acknowledged_at)
```

### Security Features

- **Row-Level Security (RLS)**: Enabled on all tables
- **Role-Based Access Control**: Officer, Analyst, Admin roles
- **Audit Logging**: Complete activity tracking
- **Authentication**: Supabase Auth integration

## User Roles and Permissions

### Officer
- Create and manage own cases
- Generate sketches and upload evidence
- View suspect matches for their cases
- Cannot directly manage suspects database

### Analyst  
- Full case management across all cases
- Suspect database management
- Police station network access
- Alert management and acknowledgment

### Admin
- Complete system administration
- User management and role assignment
- System configuration and monitoring
- Full audit trail access

## API Integration Points

### Supabase Edge Functions

1. **generate-sketch**: Text-to-sketch AI generation
2. **find-suspect-matches**: Vector similarity matching  
3. **send-alert-notifications**: Email alert distribution
4. **generate-suspect-embedding**: Process suspect photos for matching

### External Services

- **Google Gemini API**: AI image generation and embeddings
- **Supabase Storage**: Secure file storage for evidence
- **Email Service**: Alert notifications (configurable provider)

## Real-time Features

- **Live Alerts**: Real-time alert notifications in UI
- **Match Updates**: Instant updates when new matches are found
- **Case Collaboration**: Multiple users can work on cases simultaneously
- **System Status**: Live connection status and health monitoring

## Security and Compliance

- **Data Encryption**: All data encrypted at rest and in transit
- **Access Logging**: Complete audit trail of all system access
- **GDPR Compliance**: User data management and privacy controls
- **Evidence Chain**: Maintains forensic evidence integrity

## Deployment and Scaling

- **Serverless Architecture**: Auto-scaling based on demand
- **CDN Integration**: Global content delivery for performance
- **Database Optimization**: Indexed vector searches and query optimization
- **Monitoring**: Built-in performance and error tracking

## Integration Capabilities

The system is designed for easy integration with:
- Existing police database systems
- Court evidence management systems  
- National criminal databases
- Third-party AI services
- Custom forensic tools

This comprehensive system provides a complete end-to-end solution for forensic facial reconstruction with automated suspect matching and alert distribution.