import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Printer } from "lucide-react";
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
        <div className="flex gap-2">
          <Button onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print / Save as PDF
          </Button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="max-w-[210mm] mx-auto p-8 print:p-6 text-black bg-white">
        {/* Header */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h1 className="text-3xl font-bold mb-2">Forensic Face AI System</h1>
          <p className="text-lg text-gray-600">AI-Powered Suspect Identification Platform</p>
          <p className="text-sm text-gray-500 mt-1">Project Documentation Summary</p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Problem Statement */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                🎯 Problem Statement
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Traditional forensic sketch creation requires skilled artists and is time-consuming. 
                Manual suspect matching across databases is inefficient and error-prone. 
                This system uses AI to automate and accelerate the forensic identification process.
              </p>
            </section>

            {/* Key Features */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                ✨ Key Features
              </h2>
              <ul className="space-y-1.5 text-gray-700">
                <li><strong>• AI Sketch Generation:</strong> Text-to-image using Google Imagen 3.0</li>
                <li><strong>• Chatbot Clarification:</strong> Follow-up questions for ambiguous descriptions</li>
                <li><strong>• Face Matching:</strong> Vector similarity search using pgvector</li>
                <li><strong>• Case Management:</strong> Create, track, and manage investigations</li>
                <li><strong>• Comparison Tools:</strong> Side-by-side sketch vs. photo analysis</li>
                <li><strong>• Role-Based Access:</strong> Admin, Analyst, Officer permissions</li>
                <li><strong>• Real-time Alerts:</strong> Telegram notifications for high-confidence matches</li>
              </ul>
            </section>

            {/* Technology Stack */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                🛠️ Technology Stack
              </h2>
              <div className="grid grid-cols-2 gap-2 text-gray-700">
                <div>
                  <p className="font-semibold">Frontend:</p>
                  <p>React, TypeScript, Tailwind CSS</p>
                </div>
                <div>
                  <p className="font-semibold">Backend:</p>
                  <p>Supabase, PostgreSQL</p>
                </div>
                <div>
                  <p className="font-semibold">AI/ML:</p>
                  <p>Google Gemini API</p>
                </div>
                <div>
                  <p className="font-semibold">Vector DB:</p>
                  <p>pgvector extension</p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* System Architecture */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                🏗️ System Architecture
              </h2>
              <div className="bg-gray-50 p-3 rounded border text-xs font-mono">
                <pre className="whitespace-pre-wrap">
{`┌─────────────────────────────────┐
│     Frontend (React + TS)       │
│  ┌─────┐ ┌─────┐ ┌──────────┐  │
│  │Auth │ │Cases│ │Comparison│  │
│  └──┬──┘ └──┬──┘ └────┬─────┘  │
└─────┼───────┼─────────┼────────┘
      │       │         │
      ▼       ▼         ▼
┌─────────────────────────────────┐
│   Supabase Edge Functions       │
│  ┌────────┐ ┌─────────────────┐│
│  │Sketch  │ │Find Matches     ││
│  │Generate│ │(Auth + Search)  ││
│  └───┬────┘ └────────┬────────┘│
└──────┼───────────────┼─────────┘
       │               │
       ▼               ▼
┌──────────────┐ ┌────────────────┐
│Google Gemini │ │PostgreSQL      │
│• Imagen 3.0  │ │• pgvector      │
│• Embeddings  │ │• RLS Policies  │
└──────────────┘ └────────────────┘`}
                </pre>
              </div>
            </section>

            {/* Security Features */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                🔒 Security Implementation
              </h2>
              <ul className="space-y-1 text-gray-700">
                <li>• <strong>Row Level Security (RLS)</strong> on all database tables</li>
                <li>• <strong>JWT Authentication</strong> for API endpoints</li>
                <li>• <strong>Role-based policies</strong> (admin, analyst, officer)</li>
                <li>• <strong>Audit logging</strong> for all user actions</li>
                <li>• <strong>Encrypted storage</strong> for sensitive media</li>
              </ul>
            </section>

            {/* Workflow */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                📋 User Workflow
              </h2>
              <ol className="space-y-1 text-gray-700 list-decimal list-inside">
                <li>Officer creates a new case</li>
                <li>Eyewitness provides suspect description</li>
                <li>System asks clarifying questions</li>
                <li>AI generates forensic sketch</li>
                <li>System matches against suspect database</li>
                <li>Analyst reviews matches with comparison tools</li>
                <li>High-confidence matches trigger alerts</li>
              </ol>
            </section>

            {/* Database Schema */}
            <section>
              <h2 className="text-lg font-bold border-b border-gray-300 pb-1 mb-2">
                📊 Core Database Tables
              </h2>
              <div className="text-xs text-gray-700 grid grid-cols-2 gap-1">
                <div><strong>users</strong> - User accounts & roles</div>
                <div><strong>cases</strong> - Investigation cases</div>
                <div><strong>suspects</strong> - Suspect profiles</div>
                <div><strong>media</strong> - Evidence & sketches</div>
                <div><strong>matches</strong> - AI match results</div>
                <div><strong>audit_logs</strong> - Activity tracking</div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-300 text-center text-xs text-gray-500">
          <p>Forensic Face AI System • Built with React, Supabase & Google Gemini</p>
          <p className="mt-1">© 2024-2025 • Academic Project Documentation</p>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:p-6 {
            padding: 1.5rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProjectSummary;
