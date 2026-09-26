import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';

interface DynamicConfig {
  siteTitle?: string;
  themeColor?: string;
  enableProvisioning?: boolean;
  announcementText?: string;
  customJsSnippet?: string;
}

export default function App() {
  const [config, setConfig] = useState<DynamicConfig>({});
  const [provisionStatus, setProvisionStatus] = useState<string>('Idle');
  const [provisioningItem, setProvisioningItem] = useState<string>('');

  // Fetch live public JSON file to update JavaScript state for all clients
  const fetchGlobalConfig = async () => {
    try {
      const response = await fetch('/data/database.json');
      if (response.ok) {
        const data = await response.json();
        const liveConfig = data.config || {};
        setConfig(liveConfig);

        // Execute custom JS dynamic script payload if present in the JSON file
        if (liveConfig.customJsSnippet) {
          try {
            const runCustomScript = new Function(liveConfig.customJsSnippet);
            runCustomScript();
          } catch (err) {
            console.error('Error executing dynamic JS from JSON:', err);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load JSON dynamic script config:', error);
    }
  };

  useEffect(() => {
    fetchGlobalConfig();
    const interval = setInterval(fetchGlobalConfig, 5000); // Poll for live updates
    return () => clearInterval(interval);
  }, []);

  const handleProvision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provisioningItem) return;
    setProvisionStatus(`Provisioning resource: "${provisioningItem}"...`);
    setTimeout(() => {
      setProvisionStatus(`Successfully provisioned "${provisioningItem}"!`);
      setProvisioningItem('');
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col"
      style={{ backgroundColor: config.themeColor || undefined }}
    >
      <Header title={config.siteTitle || "Travel Agency Voyage"} />

      {config.announcementText && (
        <div className="bg-amber-600 text-white text-center py-2 px-4 text-sm font-semibold">
          {config.announcementText}
        </div>
      )}

      <HeroSection />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-8">
        {/* Provisioning Section */}
        <section className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <h2 className="text-2xl font-bold text-emerald-400 mb-2">Resource Provisioning</h2>
          <p className="text-slate-300 text-sm mb-4">
            Provision agency assets, dynamic service endpoints, or client resources directly below.
          </p>

          <form onSubmit={handleProvision} className="flex gap-3 max-w-md">
            <input
              type="text"
              value={provisioningItem}
              onChange={(e) => setProvisioningItem(e.target.value)}
              placeholder="Enter resource name..."
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg transition"
            >
              Provision
            </button>
          </form>

          {provisionStatus && (
            <p className="mt-3 text-sm font-mono text-emerald-300 bg-slate-900/60 p-2 rounded inline-block">
              {provisionStatus}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}