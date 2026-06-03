export default function Changelog() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
      <div className="max-w-3xl mx-auto prose dark:prose-invert">
        <h1 className="text-4xl font-extrabold mb-8">Changelog</h1>
        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-bold border-b pb-2 mb-4">v1.0.0-beta.1 (June 3, 2026)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Architecture:</strong> Migrated to NextAuth + Supabase Profiles for secure multi-tenant isolation.</li>
              <li><strong>Sync Engine:</strong> Implemented robust Google Service Account sync with row identity enforcement.</li>
              <li><strong>UI:</strong> Rebuilt the table renderer using TanStack Table v8 + TanStack Virtual for 100k+ row performance.</li>
              <li><strong>Payments:</strong> Integrated Lipia Online Mpesa for the product-tables layout.</li>
              <li><strong>SEO:</strong> Integrated dynamic metadata and rule-based layout detection.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold mb-4">Architectural Decisions</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>NextAuth:</strong> Chosen over Supabase Auth to fulfill the requirement of Google-only sign-up with server-side flexibility.</li>
              <li><strong>TanStack Virtual:</strong> Essential for the performance requirement of handling massive datasets without UI lag.</li>
              <li><strong>Lipia Integration:</strong> Decoupled payment logic from UI to support future alternative providers.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
