import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ProjectSummary = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Hidden when printing */}
      <div className="print:hidden bg-background border-b p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print / Save as PDF
        </Button>
      </div>

      {/* PDF Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-6 text-black bg-white leading-relaxed">
        {/* Title Page with Team */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-4xl font-bold mb-3">Forensic Face AI System</h1>
          <p className="text-xl text-gray-600 mb-2">AI-Powered Suspect Identification Platform</p>
          <p className="text-sm text-gray-500 mb-6">Technical Documentation & Presentation Guide</p>
          
          {/* Team Members */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">👥 Project Team</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-bold text-blue-800">Team Member 1</p>
                <p className="text-gray-600">Project Lead</p>
                <p className="text-xs text-gray-400">Frontend & Architecture</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-bold text-green-800">Team Member 2</p>
                <p className="text-gray-600">Backend Developer</p>
                <p className="text-xs text-gray-400">Supabase & APIs</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-bold text-purple-800">Team Member 3</p>
                <p className="text-gray-600">AI/ML Engineer</p>
                <p className="text-xs text-gray-400">Gemini Integration</p>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <p className="font-bold text-orange-800">Team Member 4</p>
                <p className="text-gray-600">UI/UX Designer</p>
                <p className="text-xs text-gray-400">Design & Testing</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">Guide: Prof. [Mentor Name] | Department of Computer Science</p>
          </div>
        </div>

        {/* Diagrams Section - AI Prompts for Generation */}
        <div className="space-y-8 text-[15px]">
          
          {/* System Architecture Diagram Prompt */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mb-4">
              📐 System Architecture Diagram
            </h2>
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">🎨 AI Prompt to Generate Architecture Diagram:</h3>
              <div className="bg-white p-4 rounded border border-blue-300 text-sm text-gray-800">
                <p className="italic mb-4 text-blue-700">Copy this prompt and paste it into Claude, ChatGPT, or Gemini to generate a professional architecture diagram:</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-xs leading-relaxed">
                  <p className="mb-2"><strong>Prompt:</strong></p>
                  <p>
                    "Create a professional three-tier system architecture diagram for a Forensic Face AI System with the following layers:
                  </p>
                  <p className="mt-2"><strong>LAYER 1 - PRESENTATION LAYER (Top):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Technology: React 18 + TypeScript</li>
                    <li>Components: Dashboard, Cases, Suspects, Matches, Sketch Generator, Comparison Modal, Admin Dashboard, Auth Pages</li>
                    <li>Styling: Tailwind CSS + shadcn/ui component library</li>
                  </ul>
                  <p className="mt-2"><strong>LAYER 2 - APPLICATION LAYER (Middle):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Technology: Supabase Edge Functions (Deno Runtime)</li>
                    <li>Functions: generate-sketch, generate-sketch-embedding, find-suspect-matches, refine-description, generate-clarifying-questions, send-telegram-alert</li>
                    <li>Show API Gateway connecting to all functions</li>
                  </ul>
                  <p className="mt-2"><strong>LAYER 3 - DATA/SERVICES LAYER (Bottom - 3 boxes side by side):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Box 1 - DATA LAYER: PostgreSQL Database with pgvector extension, Supabase Storage (case-evidence bucket)</li>
                    <li>Box 2 - AI/ML LAYER: Google Gemini API with Imagen 3.0 (Sketch Generation) and text-embedding-004 (768-dim Embeddings)</li>
                    <li>Box 3 - EXTERNAL SERVICES: Telegram Bot API for alerts</li>
                  </ul>
                  <p className="mt-2">Use clean professional styling with blue color scheme, arrows showing data flow between layers, and icons for each component. Make it PowerPoint-friendly (16:9 aspect ratio)."</p>
                </div>
              </div>
            </div>
          </section>

          {/* Methodology Block Diagram Prompt */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-green-800 border-l-4 border-green-800 pl-4 mb-4">
              🔄 Methodology Block Diagram
            </h2>
            <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
              <h3 className="font-bold text-green-900 mb-3">🎨 AI Prompt to Generate Methodology Diagram:</h3>
              <div className="bg-white p-4 rounded border border-green-300 text-sm text-gray-800">
                <p className="italic mb-4 text-green-700">Copy this prompt and paste it into Claude, ChatGPT, or Gemini to generate a professional methodology diagram:</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-xs leading-relaxed">
                  <p className="mb-2"><strong>Prompt:</strong></p>
                  <p>
                    "Create a professional methodology block diagram for a Forensic Face AI System showing 4 phases with sub-processes:
                  </p>
                  <p className="mt-2"><strong>PHASE 1 - INPUT (Green):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Step 1.1: Eyewitness Description (witness provides verbal/written description)</li>
                    <li>Step 1.2: Case Creation (officer creates new case in system)</li>
                    <li>Step 1.3: Evidence Upload (photos, documents uploaded)</li>
                  </ul>
                  <p className="mt-2"><strong>PHASE 2 - PROCESSING (Blue):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Step 2.1: Ambiguity Detection (AI identifies vague terms like 'average height')</li>
                    <li>Step 2.2: Chatbot Clarification (AI asks follow-up questions)</li>
                    <li>Step 2.3: Description Refinement (final detailed description compiled)</li>
                    <li>Step 2.4: AI Sketch Generation (Imagen 3.0 creates forensic sketch)</li>
                  </ul>
                  <p className="mt-2"><strong>PHASE 3 - MATCHING (Purple):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Step 3.1: Generate Embeddings (convert sketch to 768-dim vector)</li>
                    <li>Step 3.2: Cosine Similarity Calculation (compare with suspect database)</li>
                    <li>Step 3.3: Database Search (pgvector finds nearest neighbors)</li>
                    <li>Step 3.4: Threshold Filtering (return matches above 0.7 similarity)</li>
                  </ul>
                  <p className="mt-2"><strong>PHASE 4 - OUTPUT (Orange):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Step 4.1: Match Results Display (ranked list with confidence scores)</li>
                    <li>Step 4.2: Telegram Alerts (auto-notify for matches over 80%)</li>
                    <li>Step 4.3: Visual Comparison Tools (side-by-side sketch vs photo)</li>
                    <li>Step 4.4: Officer Review & Confirmation</li>
                  </ul>
                  <p className="mt-2"><strong>FEEDBACK LOOP (Bottom):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Officer marks matches as True/False Positive → Logged to audit_logs → Improves future accuracy</li>
                  </ul>
                  <p className="mt-2">Use horizontal flow with arrows connecting phases, color-coded boxes, and icons. Make it PowerPoint-friendly (16:9 aspect ratio)."</p>
                </div>
              </div>
            </div>
          </section>

          {/* Data Flow Diagram Prompt */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-purple-800 border-l-4 border-purple-800 pl-4 mb-4">
              📊 Data Flow Diagram (DFD)
            </h2>
            <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
              <h3 className="font-bold text-purple-900 mb-3">🎨 AI Prompt to Generate DFD:</h3>
              <div className="bg-white p-4 rounded border border-purple-300 text-sm text-gray-800">
                <p className="italic mb-4 text-purple-700">Copy this prompt and paste it into Claude, ChatGPT, or Gemini to generate a Level 1 Data Flow Diagram:</p>
                <div className="bg-gray-50 p-4 rounded font-mono text-xs leading-relaxed">
                  <p className="mb-2"><strong>Prompt:</strong></p>
                  <p>
                    "Create a Level 1 Data Flow Diagram (DFD) for a Forensic Face AI System using standard DFD notation:
                  </p>
                  <p className="mt-2"><strong>EXTERNAL ENTITY (Rectangle at top):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Law Enforcement User (Officer/Analyst/Admin)</li>
                  </ul>
                  <p className="mt-2"><strong>PROCESSES (Circles/Rounded rectangles - numbered):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>1.0 User Authentication: Login/Logout, Role Verification, Session Management</li>
                    <li>2.0 Case Management: Create Case, View Cases, Update Status, Assign Officers</li>
                    <li>3.0 Suspect Management: Add Suspect, Upload Photo, Generate Embedding, Edit Details</li>
                    <li>4.0 Sketch Generation: Text Input, Ambiguity Detection, AI Clarification, Imagen 3.0 Generation</li>
                    <li>5.0 Face Matching: Embedding Generation, Vector Search, Cosine Similarity, Score Calculation</li>
                    <li>6.0 Alert Notification: Threshold Check, Telegram Bot Integration, Email (future)</li>
                  </ul>
                  <p className="mt-2"><strong>DATA STORES (Open-ended rectangles - labeled D1, D2, etc.):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>D1: users (id, email, role, name)</li>
                    <li>D2: cases (id, title, description, status, created_by)</li>
                    <li>D3: suspects (id, name, photo_url, photo_embedding, notes)</li>
                    <li>D4: media (id, case_id, url, type, embedding)</li>
                    <li>D5: matches (id, case_id, suspect_id, score, status)</li>
                    <li>D6: audit_logs (id, action, actor_id, target_type, payload)</li>
                  </ul>
                  <p className="mt-2"><strong>EXTERNAL SYSTEMS (Rectangles on side):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>Google Gemini API (for AI processing)</li>
                    <li>Telegram Bot API (for notifications)</li>
                  </ul>
                  <p className="mt-2"><strong>DATA FLOWS (Arrows with labels):</strong></p>
                  <ul className="list-disc pl-5 mb-2">
                    <li>User → 1.0: Credentials</li>
                    <li>1.0 → D1: Verify Role</li>
                    <li>User → 2.0: Case Details</li>
                    <li>2.0 → D2: Store Case</li>
                    <li>User → 3.0: Suspect Info + Photo</li>
                    <li>3.0 → D3: Store Suspect</li>
                    <li>3.0 → Google Gemini: Photo for Embedding</li>
                    <li>User → 4.0: Description Text</li>
                    <li>4.0 → Google Gemini: Generate Sketch</li>
                    <li>4.0 → D4: Store Sketch</li>
                    <li>5.0 → D3: Query Embeddings</li>
                    <li>5.0 → D5: Store Matches</li>
                    <li>6.0 → Telegram: Send Alert</li>
                    <li>All Processes → D6: Audit Log</li>
                  </ul>
                  <p className="mt-2">Use standard DFD symbols with clean arrows, proper labeling, and professional color scheme. Make it PowerPoint-friendly (16:9 aspect ratio)."</p>
                </div>
              </div>
            </div>
          </section>

          {/* Backend (Supabase) Detailed Information */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-orange-800 border-l-4 border-orange-800 pl-4 mb-4">
              🗄️ Backend Architecture (Supabase)
            </h2>
            
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-bold text-orange-900 mb-2">Overview</h3>
                <p className="text-gray-700 text-sm">
                  Supabase serves as our Backend-as-a-Service (BaaS), providing authentication, database, 
                  real-time subscriptions, storage, and serverless edge functions - eliminating the need 
                  for traditional server infrastructure.
                </p>
              </div>

              {/* PostgreSQL Database */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-orange-700 mb-3">1. PostgreSQL Database</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Core Tables:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li><strong>users:</strong> Stores user profiles with roles (admin/analyst/officer)</li>
                      <li><strong>cases:</strong> Investigation cases with status tracking</li>
                      <li><strong>suspects:</strong> Suspect records with photo embeddings</li>
                      <li><strong>media:</strong> Evidence files and generated sketches</li>
                      <li><strong>matches:</strong> AI-generated match results with confidence scores</li>
                      <li><strong>audit_logs:</strong> Complete activity trail for compliance</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Special Features:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li><strong>pgvector extension:</strong> Native vector similarity search</li>
                      <li><strong>768-dimension vectors:</strong> Face embeddings storage</li>
                      <li><strong>Cosine similarity:</strong> Built-in distance functions</li>
                      <li><strong>Indexed search:</strong> Fast nearest-neighbor queries</li>
                      <li><strong>Database triggers:</strong> Auto-generate audit logs</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Edge Functions */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-orange-700 mb-3">2. Edge Functions (Deno Runtime)</h3>
                <div className="space-y-3 text-sm">
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">generate-sketch</p>
                    <p className="text-gray-600">Calls Google Imagen 3.0 API to generate forensic sketches from text descriptions. Returns base64-encoded PNG images.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">generate-sketch-embedding</p>
                    <p className="text-gray-600">Converts sketch descriptions into 768-dimensional vectors using text-embedding-004 model for similarity matching.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">find-suspect-matches</p>
                    <p className="text-gray-600">Performs vector similarity search against suspect database using cosine distance. Returns ranked matches above threshold.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">generate-clarifying-questions</p>
                    <p className="text-gray-600">Detects ambiguous terms in descriptions and generates targeted follow-up questions using Gemini Pro.</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="font-semibold">send-telegram-alert</p>
                    <p className="text-gray-600">Sends real-time notifications to configured Telegram channels when high-confidence matches are found.</p>
                  </div>
                </div>
              </div>

              {/* Storage */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-orange-700 mb-3">3. Supabase Storage</h3>
                <div className="text-sm text-gray-700">
                  <p className="mb-2"><strong>Bucket:</strong> case-evidence (private)</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Stores uploaded evidence photos, suspect images, and generated sketches</li>
                    <li>Secured with RLS policies - only authorized users can access</li>
                    <li>Generates signed URLs with expiration for temporary access</li>
                    <li>Supports images up to 50MB with automatic optimization</li>
                  </ul>
                </div>
              </div>

              {/* Authentication */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-orange-700 mb-3">4. Authentication System</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Email/Password:</strong> Standard authentication with email verification</li>
                    <li><strong>JWT Tokens:</strong> Secure, stateless authentication for API calls</li>
                    <li><strong>Session Management:</strong> Automatic token refresh with secure storage</li>
                    <li><strong>Role Mapping:</strong> Users linked to roles via database trigger on signup</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* AI/ML Layer Detailed Information */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-purple-800 border-l-4 border-purple-800 pl-4 mb-4">
              🤖 AI/ML Architecture Layer
            </h2>
            
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-bold text-purple-900 mb-2">AI Integration Overview</h3>
                <p className="text-gray-700 text-sm">
                  Our system leverages Google's Gemini family of AI models for multiple tasks: image generation, 
                  text embedding, and natural language understanding. All AI calls are made through secure 
                  edge functions with API key protection.
                </p>
              </div>

              {/* Image Generation */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-3">1. Image Generation - Imagen 3.0</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Capabilities:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Photorealistic forensic sketch generation</li>
                      <li>Understanding of facial feature descriptions</li>
                      <li>Multiple art styles (sketch, portrait, realistic)</li>
                      <li>High-resolution output (1024x1024 pixels)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Prompt Engineering:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Structured prompts for consistency</li>
                      <li>Prefix: "Forensic sketch style portrait..."</li>
                      <li>Explicit feature descriptions</li>
                      <li>Safety filters for appropriate content</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-3 bg-gray-100 p-3 rounded text-xs font-mono">
                  <p className="font-semibold mb-1">Sample API Call:</p>
                  <code>POST /v1beta/models/imagen-3.0-generate-001:generateImages</code>
                </div>
              </div>

              {/* Text Embeddings */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-3">2. Text Embeddings - text-embedding-004</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">How It Works:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>Converts text descriptions to 768-dimensional vectors</li>
                      <li>Captures semantic meaning of facial features</li>
                      <li>Similar descriptions → similar vectors</li>
                      <li>Enables mathematical comparison of faces</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Technical Specs:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li><strong>Model:</strong> text-embedding-004</li>
                      <li><strong>Dimensions:</strong> 768 (configurable)</li>
                      <li><strong>Task Type:</strong> SEMANTIC_SIMILARITY</li>
                      <li><strong>Max Tokens:</strong> 2048</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Similarity Matching */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-3">3. Vector Similarity Matching</h3>
                <div className="text-sm">
                  <p className="mb-3 text-gray-700">
                    Using PostgreSQL's pgvector extension, we perform cosine similarity search to find matching suspects.
                  </p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                    <p className="font-semibold mb-1">Cosine Similarity Formula:</p>
                    <code>similarity = 1 - (vector1 &lt;=&gt; vector2)</code>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-green-100 p-2 rounded text-center">
                      <p className="font-bold text-green-800">≥ 70%</p>
                      <p className="text-xs text-green-600">High Confidence</p>
                    </div>
                    <div className="bg-yellow-100 p-2 rounded text-center">
                      <p className="font-bold text-yellow-800">50-70%</p>
                      <p className="text-xs text-yellow-600">Medium Confidence</p>
                    </div>
                    <div className="bg-red-100 p-2 rounded text-center">
                      <p className="font-bold text-red-800">&lt; 50%</p>
                      <p className="text-xs text-red-600">Low Confidence</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Natural Language Processing */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-3">4. Natural Language Processing - Gemini Pro</h3>
                <div className="text-sm text-gray-700">
                  <p className="mb-2"><strong>Clarifying Questions System:</strong></p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Ambiguity Detection:</strong> Identifies vague terms like "average height", "normal build"</li>
                    <li><strong>Question Generation:</strong> Creates context-aware follow-up questions</li>
                    <li><strong>Description Refinement:</strong> Merges user responses into detailed descriptions</li>
                    <li><strong>Iterative Improvement:</strong> Multiple rounds until description is precise</li>
                  </ul>
                </div>
              </div>

              {/* ML Pipeline */}
              <div className="border rounded-lg p-4 bg-gradient-to-r from-purple-50 to-blue-50">
                <h3 className="font-bold text-purple-700 mb-3">5. Complete ML Pipeline</h3>
                <div className="font-mono text-xs bg-white p-3 rounded">
                  <pre className="whitespace-pre-wrap">
{`Input Description
      │
      ▼
[Ambiguity Detection] ──Yes──▶ [Generate Questions] ─▶ [User Response]
      │                                                       │
      │No                                                     │
      │◀──────────────────────────────────────────────────────┘
      ▼
[Description Refinement] ──▶ Final Description
      │
      ├──▶ [Imagen 3.0] ──▶ Forensic Sketch Image
      │
      └──▶ [text-embedding-004] ──▶ 768-dim Vector
                                        │
                                        ▼
                              [pgvector Search]
                                        │
                                        ▼
                              Ranked Match Results`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Security Implementation Detailed */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-red-800 border-l-4 border-red-800 pl-4 mb-4">
              🔐 Security Implementation Details
            </h2>
            
            <div className="space-y-6">
              {/* Overview */}
              <div className="bg-red-50 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">Security Philosophy</h3>
                <p className="text-gray-700 text-sm">
                  Our system implements defense-in-depth with multiple security layers. Given the sensitive 
                  nature of forensic data, we prioritize data protection, access control, and complete 
                  auditability of all system actions.
                </p>
              </div>

              {/* Authentication */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">1. Authentication Layer</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">JWT</span>
                    <div>
                      <p className="font-semibold">JSON Web Tokens</p>
                      <p className="text-gray-600">Stateless authentication with cryptographic signing. Tokens include user ID, role, and expiration.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">HTTPS</span>
                    <div>
                      <p className="font-semibold">TLS 1.3 Encryption</p>
                      <p className="text-gray-600">All data in transit encrypted. HSTS headers enforce secure connections.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded font-bold text-xs">HASH</span>
                    <div>
                      <p className="font-semibold">Password Security</p>
                      <p className="text-gray-600">Passwords hashed with bcrypt (cost factor 10). Never stored in plain text.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Authorization - RLS */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">2. Row Level Security (RLS)</h3>
                <div className="text-sm">
                  <p className="text-gray-700 mb-3">
                    PostgreSQL RLS policies enforce data access at the database level - even if application 
                    code has bugs, unauthorized data access is prevented.
                  </p>
                  <div className="bg-gray-100 p-3 rounded font-mono text-xs mb-3">
                    <p className="font-semibold mb-1">Example Policy (cases table):</p>
                    <code>
                      CREATE POLICY "Users can view cases"<br/>
                      ON cases FOR SELECT<br/>
                      USING (is_officer_or_above());
                    </code>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border p-2 rounded text-center">
                      <p className="font-bold text-blue-800">Officer</p>
                      <p className="text-xs">View Only</p>
                    </div>
                    <div className="border p-2 rounded text-center">
                      <p className="font-bold text-green-800">Analyst</p>
                      <p className="text-xs">View + Create + Edit</p>
                    </div>
                    <div className="border p-2 rounded text-center">
                      <p className="font-bold text-red-800">Admin</p>
                      <p className="text-xs">Full Access + Users</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role-Based Access */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">3. Role-Based Access Control (RBAC)</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Permission</th>
                      <th className="p-2 text-center">Officer</th>
                      <th className="p-2 text-center">Analyst</th>
                      <th className="p-2 text-center">Admin</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t">
                      <td className="p-2">View Cases</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Create Cases</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Generate Sketches</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Add Suspects</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">Manage Users</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                    <tr className="border-t">
                      <td className="p-2">View Audit Logs</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-red-600">✗</td>
                      <td className="p-2 text-center text-green-600">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Audit Logging */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">4. Comprehensive Audit Logging</h3>
                <div className="text-sm text-gray-700">
                  <p className="mb-2">Every action is recorded with:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Actor ID:</strong> Who performed the action</li>
                    <li><strong>Timestamp:</strong> When it happened (UTC)</li>
                    <li><strong>Action Type:</strong> INSERT, UPDATE, DELETE, VIEW</li>
                    <li><strong>Target:</strong> Which record was affected</li>
                    <li><strong>Payload:</strong> Before/after values for changes</li>
                  </ul>
                  <div className="mt-3 bg-gray-100 p-3 rounded font-mono text-xs">
                    <p className="font-semibold mb-1">Implemented via Database Triggers:</p>
                    <code>CREATE TRIGGER cases_audit_trigger<br/>AFTER INSERT OR UPDATE OR DELETE ON cases<br/>FOR EACH ROW EXECUTE FUNCTION audit_trigger();</code>
                  </div>
                </div>
              </div>

              {/* API Security */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">5. API & Edge Function Security</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="font-semibold mb-2">Request Validation:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>CORS policies restrict origins</li>
                      <li>Input sanitization on all parameters</li>
                      <li>Rate limiting to prevent abuse</li>
                      <li>Request body size limits</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold mb-2">Secret Management:</p>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>API keys stored in Supabase Vault</li>
                      <li>Never exposed to frontend code</li>
                      <li>Rotatable without code changes</li>
                      <li>Environment-specific secrets</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Storage Security */}
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-red-700 mb-3">6. File Storage Security</h3>
                <div className="text-sm text-gray-700">
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Private Buckets:</strong> No public access to evidence files</li>
                    <li><strong>Signed URLs:</strong> Temporary access tokens with expiration (1 hour default)</li>
                    <li><strong>RLS on Storage:</strong> Users can only access files related to their authorized cases</li>
                    <li><strong>File Type Validation:</strong> Only allowed image formats accepted</li>
                    <li><strong>Malware Scanning:</strong> Files scanned on upload (Supabase built-in)</li>
                  </ul>
                </div>
              </div>

              {/* Security Summary */}
              <div className="bg-gradient-to-r from-red-100 to-orange-100 p-4 rounded-lg">
                <h3 className="font-bold text-red-900 mb-2">🛡️ Security Layers Summary</h3>
                <div className="grid grid-cols-3 gap-2 text-xs text-center">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 1</p>
                    <p>HTTPS/TLS</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 2</p>
                    <p>JWT Auth</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 3</p>
                    <p>RBAC</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 4</p>
                    <p>RLS Policies</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 5</p>
                    <p>Audit Logs</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-bold">Layer 6</p>
                    <p>Encrypted Storage</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Reference */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-gray-800 pl-4 mb-4">
              📋 Quick Reference
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-gray-700 mb-2">Technology Stack</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Frontend: React 18 + TypeScript</li>
                  <li>• Styling: Tailwind CSS + shadcn/ui</li>
                  <li>• Backend: Supabase (BaaS)</li>
                  <li>• Database: PostgreSQL + pgvector</li>
                  <li>• AI: Google Gemini (Imagen 3.0)</li>
                  <li>• Alerts: Telegram Bot API</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-gray-700 mb-2">Key Metrics</h3>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Sketch Generation: ~5-10 seconds</li>
                  <li>• Embedding Dimensions: 768</li>
                  <li>• Match Threshold: 70%+</li>
                  <li>• Max DB Results: 10 matches</li>
                  <li>• Image Resolution: 1024x1024</li>
                  <li>• Token Limit: 2048 per request</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 border rounded-lg p-4">
              <h3 className="font-bold text-gray-700 mb-2">Edge Functions Reference</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-gray-50 p-2 rounded">
                  <code>generate-sketch</code> - Image generation
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <code>generate-sketch-embedding</code> - Vectorization
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <code>find-suspect-matches</code> - Similarity search
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <code>generate-clarifying-questions</code> - NLP
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <code>refine-description</code> - Text processing
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <code>send-telegram-alert</code> - Notifications
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Forensic Face AI System • Technical Documentation</p>
          <p className="mt-1">© 2024-2025 • Academic Project • Department of Computer Science</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .page-break-before {
            page-break-before: always;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectSummary;
