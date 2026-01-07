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
        {/* Title Page */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-4xl font-bold mb-3">Forensic Face AI System</h1>
          <p className="text-xl text-gray-600 mb-2">AI-Powered Suspect Identification Platform</p>
          <p className="text-sm text-gray-500">Presentation Script & Technical Documentation</p>
        </div>

        {/* Script Sections */}
        <div className="space-y-8 text-[15px]">
          
          {/* Section 1: Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-blue-800 border-l-4 border-blue-800 pl-4 mb-4">
              1. Introduction (2 minutes)
            </h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-blue-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Good morning/afternoon. Today we are presenting the Forensic Face AI System - an intelligent 
                platform designed to revolutionize how law enforcement agencies identify criminal suspects. 
                Our system combines artificial intelligence with forensic science to generate suspect sketches 
                from eyewitness descriptions and automatically match them against criminal databases."
              </p>
            </div>
            <div className="pl-4">
              <p className="font-semibold mb-2">Key Points to Cover:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li>Project name: Forensic Face AI System</li>
                <li>Purpose: Automate forensic sketch generation and suspect identification</li>
                <li>Target users: Law enforcement agencies, forensic departments</li>
                <li>Core innovation: AI-powered sketch generation from text descriptions</li>
              </ul>
            </div>
          </section>

          {/* Section 2: Problem Statement */}
          <section>
            <h2 className="text-2xl font-bold text-red-800 border-l-4 border-red-800 pl-4 mb-4">
              2. Problem Statement (2 minutes)
            </h2>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-red-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Traditional forensic sketch creation faces several challenges. First, it requires highly 
                skilled forensic artists who are expensive and scarce. Second, the process is time-consuming - 
                a single sketch can take 2-4 hours. Third, eyewitness descriptions are often vague or ambiguous, 
                leading to inaccurate sketches. Finally, manually comparing sketches against suspect databases 
                with thousands of records is nearly impossible. Our system addresses all these challenges."
              </p>
            </div>
            <div className="pl-4">
              <p className="font-semibold mb-2">Problems We Solve:</p>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>Skill dependency:</strong> No need for trained forensic artists</li>
                <li><strong>Time consumption:</strong> Generate sketches in seconds, not hours</li>
                <li><strong>Ambiguous descriptions:</strong> AI asks clarifying questions to refine details</li>
                <li><strong>Manual matching:</strong> Automated database matching with confidence scores</li>
                <li><strong>Scalability:</strong> Can process multiple cases simultaneously</li>
              </ul>
            </div>
          </section>

          {/* Section 3: Solution & Features */}
          <section>
            <h2 className="text-2xl font-bold text-green-800 border-l-4 border-green-800 pl-4 mb-4">
              3. Our Solution & Key Features (5 minutes)
            </h2>
            <div className="bg-green-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-green-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Our solution is a comprehensive web-based platform with several integrated modules. 
                Let me walk you through each feature."
              </p>
            </div>

            <div className="space-y-4 pl-4">
              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 1: AI Sketch Generation</h3>
                <p className="text-gray-700 mb-2">
                  Users enter a text description of the suspect. Our system uses Google Gemini API with 
                  Imagen 3.0 model to generate a realistic forensic sketch. The AI understands facial 
                  features, expressions, and physical characteristics.
                </p>
                <p className="text-sm bg-yellow-100 p-2 rounded">
                  💡 <strong>Demo point:</strong> Show the sketch generation from "Male, approximately 30 years old, 
                  oval face, thick eyebrows, short black hair"
                </p>
              </div>

              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 2: Intelligent Chatbot Clarification</h3>
                <p className="text-gray-700 mb-2">
                  When eyewitnesses use vague terms like "average build" or "normal height", our chatbot 
                  automatically detects these ambiguous terms and asks follow-up questions to get precise 
                  details. This significantly improves sketch accuracy.
                </p>
                <p className="text-sm bg-yellow-100 p-2 rounded">
                  💡 <strong>Demo point:</strong> Show how the system asks "What do you mean by average build? 
                  Is the person slim, athletic, or heavy-set?"
                </p>
              </div>

              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 3: Face Matching Pipeline</h3>
                <p className="text-gray-700 mb-2">
                  Generated sketches are converted into mathematical vectors called face embeddings using 
                  Google Text-embedding-004 model. These embeddings are compared against all suspects in 
                  the database using cosine similarity. We use pgvector extension in PostgreSQL for 
                  efficient similarity search.
                </p>
                <p className="text-sm bg-yellow-100 p-2 rounded">
                  💡 <strong>Technical note:</strong> Embeddings are 768-dimensional vectors. 
                  Similarity above 70% is considered high confidence.
                </p>
              </div>

              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 4: Comparison Tools</h3>
                <p className="text-gray-700 mb-2">
                  Officers can compare sketches with suspect photos side-by-side. Features include 
                  zoom/pan controls, overlay mode with opacity adjustment, and swipe-diff visualization 
                  for detailed analysis.
                </p>
              </div>

              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 5: Case Management</h3>
                <p className="text-gray-700 mb-2">
                  Complete case lifecycle management - create cases, upload evidence, link suspects, 
                  track investigation status, and generate reports.
                </p>
              </div>

              <div className="border-l-2 border-green-300 pl-4">
                <h3 className="font-bold text-lg">Feature 6: Real-time Alerts</h3>
                <p className="text-gray-700 mb-2">
                  When a high-confidence match is found (above 70%), the system automatically sends 
                  Telegram notifications to assigned officers with suspect details.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Technical Architecture */}
          <section className="page-break-before">
            <h2 className="text-2xl font-bold text-purple-800 border-l-4 border-purple-800 pl-4 mb-4">
              4. Technical Architecture (3 minutes)
            </h2>
            <div className="bg-purple-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-purple-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Our system follows a modern three-tier architecture with a React frontend, 
                Supabase backend, and AI services integration."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-2">Frontend Layer</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <strong>React 18</strong> - UI library</li>
                  <li>• <strong>TypeScript</strong> - Type safety</li>
                  <li>• <strong>Tailwind CSS</strong> - Styling</li>
                  <li>• <strong>React Query</strong> - Data fetching</li>
                  <li>• <strong>React Router</strong> - Navigation</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-2">Backend Layer</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li>• <strong>Supabase</strong> - Backend as a Service</li>
                  <li>• <strong>PostgreSQL</strong> - Database</li>
                  <li>• <strong>pgvector</strong> - Vector similarity</li>
                  <li>• <strong>Edge Functions</strong> - Serverless APIs</li>
                  <li>• <strong>Row Level Security</strong> - Data protection</li>
                </ul>
              </div>
            </div>

            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold text-purple-700 mb-2">AI/ML Layer</h3>
              <ul className="text-sm space-y-1 text-gray-700">
                <li>• <strong>Google Gemini API</strong> - Main AI provider</li>
                <li>• <strong>Imagen 3.0</strong> - Image generation for sketches</li>
                <li>• <strong>Text-embedding-004</strong> - Face embedding generation</li>
                <li>• <strong>Cosine Similarity</strong> - Matching algorithm</li>
              </ul>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg font-mono text-xs">
              <p className="font-bold mb-2">System Flow:</p>
              <pre className="whitespace-pre-wrap">
{`User Input (Description)
    ↓
Chatbot Clarification (if needed)
    ↓
Edge Function: generate-sketch
    ↓
Google Imagen 3.0 → Sketch Image
    ↓
Edge Function: generate-sketch-embedding
    ↓
Text-embedding-004 → 768-dim Vector
    ↓
PostgreSQL pgvector → Similarity Search
    ↓
Edge Function: find-suspect-matches
    ↓
Results + Telegram Alerts (if high confidence)`}
              </pre>
            </div>
          </section>

          {/* Section 5: Database Design */}
          <section>
            <h2 className="text-2xl font-bold text-orange-800 border-l-4 border-orange-800 pl-4 mb-4">
              5. Database Design (2 minutes)
            </h2>
            <div className="bg-orange-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-orange-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "We use PostgreSQL with several interconnected tables. Let me explain the core schema."
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">users</h4>
                <p className="text-gray-600">id, email, name, role, created_at</p>
                <p className="text-xs text-gray-500 mt-1">Stores user accounts with roles (admin/analyst/officer)</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">cases</h4>
                <p className="text-gray-600">id, title, description, status, created_by</p>
                <p className="text-xs text-gray-500 mt-1">Investigation cases linked to creators</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">suspects</h4>
                <p className="text-gray-600">id, name, photo_url, photo_embedding, notes</p>
                <p className="text-xs text-gray-500 mt-1">Suspect profiles with face embeddings</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">media</h4>
                <p className="text-gray-600">id, case_id, url, type, embedding, meta</p>
                <p className="text-xs text-gray-500 mt-1">Evidence files and generated sketches</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">matches</h4>
                <p className="text-gray-600">id, case_id, suspect_id, score, status, evidence</p>
                <p className="text-xs text-gray-500 mt-1">AI-generated match results with confidence</p>
              </div>
              <div className="border rounded p-3">
                <h4 className="font-bold text-orange-700">audit_logs</h4>
                <p className="text-gray-600">id, actor_id, action, target_type, payload</p>
                <p className="text-xs text-gray-500 mt-1">Tracks all user actions for accountability</p>
              </div>
            </div>
          </section>

          {/* Section 6: Security */}
          <section>
            <h2 className="text-2xl font-bold text-red-700 border-l-4 border-red-700 pl-4 mb-4">
              6. Security Implementation (2 minutes)
            </h2>
            <div className="bg-red-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-red-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Security is critical for a forensic system handling sensitive criminal data. 
                We have implemented multiple layers of protection."
              </p>
            </div>

            <div className="space-y-3 pl-4">
              <div className="flex items-start gap-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">1</span>
                <div>
                  <p className="font-semibold">Row Level Security (RLS)</p>
                  <p className="text-gray-600 text-sm">Every database table has RLS policies. Users can only access data they are authorized to see.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">2</span>
                <div>
                  <p className="font-semibold">JWT Authentication</p>
                  <p className="text-gray-600 text-sm">All API endpoints require valid JWT tokens. Edge functions verify user identity before processing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">3</span>
                <div>
                  <p className="font-semibold">Role-Based Access Control</p>
                  <p className="text-gray-600 text-sm">Three roles: Admin (full access), Analyst (case management), Officer (view only).</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">4</span>
                <div>
                  <p className="font-semibold">Audit Logging</p>
                  <p className="text-gray-600 text-sm">Every action is logged with user ID, timestamp, and action details for accountability.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-bold">5</span>
                <div>
                  <p className="font-semibold">Encrypted Storage</p>
                  <p className="text-gray-600 text-sm">All media files stored in Supabase Storage with signed URLs for secure access.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 7: Demo Flow */}
          <section>
            <h2 className="text-2xl font-bold text-teal-800 border-l-4 border-teal-800 pl-4 mb-4">
              7. Live Demo Flow (5 minutes)
            </h2>
            <div className="bg-teal-50 p-4 rounded-lg mb-4">
              <p className="font-semibold text-teal-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "Now let me demonstrate the complete workflow of our system."
              </p>
            </div>

            <ol className="space-y-3 pl-4">
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                <div>
                  <p className="font-semibold">Login to the System</p>
                  <p className="text-gray-600 text-sm">Show the authentication page and login with test credentials.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                <div>
                  <p className="font-semibold">View Dashboard</p>
                  <p className="text-gray-600 text-sm">Show statistics - active cases, total suspects, recent matches.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                <div>
                  <p className="font-semibold">Create a New Case</p>
                  <p className="text-gray-600 text-sm">Navigate to Cases → New Case → Enter title and description.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                <div>
                  <p className="font-semibold">Generate AI Sketch</p>
                  <p className="text-gray-600 text-sm">Enter suspect description → Show clarifying questions → Generate sketch.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                <div>
                  <p className="font-semibold">View AI Matches</p>
                  <p className="text-gray-600 text-sm">Show the matches tab with confidence scores and suspect details.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">6</span>
                <div>
                  <p className="font-semibold">Compare Sketch with Suspect</p>
                  <p className="text-gray-600 text-sm">Open comparison modal → Show zoom, overlay, and swipe features.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-teal-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">7</span>
                <div>
                  <p className="font-semibold">Show Admin Dashboard</p>
                  <p className="text-gray-600 text-sm">Display user management, audit logs, and system statistics.</p>
                </div>
              </li>
            </ol>
          </section>

          {/* Section 8: Future Scope */}
          <section>
            <h2 className="text-2xl font-bold text-indigo-800 border-l-4 border-indigo-800 pl-4 mb-4">
              8. Future Enhancements (1 minute)
            </h2>
            <div className="bg-indigo-50 p-4 rounded-lg">
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Mobile App:</strong> React Native version for field officers</li>
                <li>• <strong>Video Analysis:</strong> Extract faces from CCTV footage</li>
                <li>• <strong>Age Progression:</strong> AI-based age progression for missing persons</li>
                <li>• <strong>Multi-language Support:</strong> Accept descriptions in regional languages</li>
                <li>• <strong>Integration:</strong> Connect with national criminal databases</li>
              </ul>
            </div>
          </section>

          {/* Section 9: Conclusion */}
          <section>
            <h2 className="text-2xl font-bold text-gray-800 border-l-4 border-gray-800 pl-4 mb-4">
              9. Conclusion (1 minute)
            </h2>
            <div className="bg-gray-100 p-4 rounded-lg">
              <p className="font-semibold text-gray-900 mb-2">🎤 What to say:</p>
              <p className="italic text-gray-700">
                "To summarize, the Forensic Face AI System demonstrates how artificial intelligence can 
                transform traditional forensic processes. By automating sketch generation and suspect 
                matching, we reduce investigation time from hours to minutes while maintaining high 
                accuracy. The system is secure, scalable, and ready for real-world deployment. 
                Thank you for your attention. We are happy to answer any questions."
              </p>
            </div>
          </section>

          {/* Q&A Preparation */}
          <section className="mt-8 border-t-2 border-gray-300 pt-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              📋 Anticipated Questions & Answers
            </h2>
            <div className="space-y-4 text-sm">
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">Q: How accurate is the AI sketch generation?</p>
                <p className="text-gray-700 mt-1">A: Accuracy depends on description quality. With detailed descriptions and clarifying questions, we achieve recognizable sketches. The matching algorithm uses 70%+ threshold for high confidence.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">Q: What happens if the AI generates wrong matches?</p>
                <p className="text-gray-700 mt-1">A: All matches are suggestions for human review. Officers can mark false matches, and the system learns from feedback. Final identification is always human-verified.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">Q: How do you ensure data privacy?</p>
                <p className="text-gray-700 mt-1">A: We use Row Level Security, JWT authentication, role-based access, audit logging, and encrypted storage. Only authorized personnel can access sensitive data.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">Q: Can the system scale to millions of suspects?</p>
                <p className="text-gray-700 mt-1">A: Yes. PostgreSQL with pgvector supports efficient similarity search on millions of records. Edge functions auto-scale with traffic.</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="font-semibold">Q: Why did you choose these technologies?</p>
                <p className="text-gray-700 mt-1">A: React for fast UI development, Supabase for integrated backend services, Google Gemini for state-of-the-art AI, and pgvector for efficient vector similarity search.</p>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Forensic Face AI System • Presentation Script</p>
          <p className="mt-1">© 2024-2025 • Academic Project</p>
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
