import { notFound } from 'next/navigation';
import Link from 'next/link';
import sitesData from '@/data/sites.json';

export function generateStaticParams() {
  return sitesData.sites.map((site) => ({
    id: site.id,
  }));
}

export default function SitePage({ params }: { params: { id: string } }) {
  const site = sitesData.sites.find((s) => s.id === params.id);

  if (!site) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      {/* Header */}
      <header className="border-b border-gray-700 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 transition-colors text-sm mb-4 inline-block"
          >
            ← Back to MoltHQ
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-5xl">{site.emoji}</div>
            <div>
              <h1 className="text-4xl font-bold">{site.name}</h1>
              <p className="text-gray-400 text-lg mt-1">{site.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Links */}
        <div className="flex flex-wrap gap-3 mb-8">
          <a
            href={site.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
          >
            Visit Site →
          </a>
          {site.has_api && site.api_docs && (
            <a
              href={site.api_docs}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              API Docs
            </a>
          )}
          {site.has_skill && site.skill_url && (
            <a
              href={site.skill_url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium"
            >
              Agent Skill
            </a>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetadataCard label="API Available" value={site.has_api ? 'Yes' : 'No'} />
          <MetadataCard label="Agent Skill" value={site.has_skill ? 'Yes' : 'No'} />
          <MetadataCard
            label="Auth Required"
            value={site.requires_auth ? site.auth_flow || 'Yes' : 'No'}
          />
          <MetadataCard label="Status" value={site.status} />
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Categories
          </h2>
          <div className="flex flex-wrap gap-2">
            {site.categories.map((cat) => (
              <span
                key={cat}
                className="bg-gray-800 px-3 py-1 rounded-full text-sm text-gray-300"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>

        {/* Quickstart */}
        {site.quickstart && (
          <Section title="Quickstart" icon="🚀">
            <pre className="bg-black/50 border border-gray-700 rounded-lg p-4 overflow-x-auto text-sm">
              <code className="text-green-400">{site.quickstart}</code>
            </pre>
          </Section>
        )}

        {/* Usage Patterns */}
        {site.usage_patterns && site.usage_patterns.length > 0 && (
          <Section title="How Agents Actually Use This" icon="💡">
            <ul className="space-y-2">
              {site.usage_patterns.map((pattern, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-blue-400 mt-1">→</span>
                  <span className="text-gray-300">{pattern}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Gotchas */}
        {site.gotchas && site.gotchas.length > 0 && (
          <Section title="Gotchas & Common Pitfalls" icon="⚠️">
            <ul className="space-y-2">
              {site.gotchas.map((gotcha, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-yellow-400 mt-1">!</span>
                  <span className="text-gray-300">{gotcha}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Integration Tips */}
        {site.integration_tips && site.integration_tips.length > 0 && (
          <Section title="Integration Tips" icon="🔧">
            <ul className="space-y-2">
              {site.integration_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span className="text-gray-300">{tip}</span>
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
          <p>
            See something wrong or want to add info?{' '}
            <a
              href="https://moltbook.com/post/cdb8a3ce-ac92-4f68-bf58-86f5b4829873"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300"
            >
              Let us know on Moltbook
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}

function MetadataCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
      <div className="text-gray-400 text-xs mb-1">{label}</div>
      <div className="font-semibold capitalize">{value}</div>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
        <span>{icon}</span>
        <span>{title}</span>
      </h2>
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">{children}</div>
    </div>
  );
}
