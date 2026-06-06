export default function Changelog() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-extrabold mb-8">Changelog</h1>
        <div className="space-y-12">
          <section>
            <h3 className="text-xl font-bold border-b pb-2 mb-4">v1.0.0-beta.2 (June 5, 2026)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Auth:</strong> Replaced NextAuth with Supabase Auth (email + Google sign-in).</li>
              <li><strong>Architecture:</strong> Migrated to Next.js 16.2 App Router with src/ folder.</li>
              <li><strong>Styling:</strong> Upgraded to Tailwind CSS v4 with CSS-first configuration.</li>
              <li><strong>Types:</strong> Replaced all any types with proper TypeScript interfaces.</li>
              <li><strong>API:</strong> Removed legacy serverless functions in favor of App Router routes.</li>
            </ul>
          </section>
          <section>
            <h3 className="text-xl font-bold border-b pb-2 mb-4">v1.0.0-beta.1 (June 3, 2026)</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Architecture:</strong> Migrated to NextAuth + Supabase Profiles for secure multi-tenant isolation.</li>
              <li><strong>Sync Engine:</strong> Implemented robust Google Service Account sync with row identity enforcement.</li>
              <li><strong>UI:</strong> Rebuilt the table renderer using TanStack Table v8 + TanStack Virtual for 100k+ row performance.</li>
              <li><strong>Payments:</strong> Integrated Lipia Online Mpesa for the product-tables layout.</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}