'use client';

import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  Link as LinkIcon,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Save,
  Play,
  FileSpreadsheet,
} from 'lucide-react';

interface SyncConfig {
  id: string;
  sheetUrl: string;
  syncIntervalMinutes: number;
  deactivateMissing: boolean;
  lastSyncAt: string | null;
  lastSyncStatus: string | null;
  lastSyncMessage: string | null;
}

export default function AdminSyncPage() {
  const [config, setConfig] = useState<SyncConfig | null>(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [syncInterval, setSyncInterval] = useState('15');
  const [deactivateMissing, setDeactivateMissing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<Array<{
    id: string;
    source: string;
    totalRows: number;
    successCount: number;
    errorCount: number;
    status: string;
    createdAt: string;
  }>>([]);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/sync/config');
      const data = await res.json();
      if (data.config) {
        setConfig(data.config);
        setSheetUrl(data.config.sheetUrl || '');
        setSyncInterval(String(data.config.syncIntervalMinutes || 15));
        setDeactivateMissing(Boolean(data.config.deactivateMissing));
      }
    } catch {}
  };

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/import/logs');
      const data = await res.json();
      if (data.logs) {
        const sheetLogs = data.logs.filter((l: { type: string }) => l.type === 'GOOGLE_SHEET_SYNC');
        setLogs(sheetLogs);
      }
    } catch {}
  };

  useEffect(() => {
    fetchConfig();
    fetchLogs();
  }, []);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/sync/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl,
          syncIntervalMinutes: syncInterval,
          deactivateMissing,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setConfig(data.config);
        setMessage('Google Sheet sync preferences saved successfully.');
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch {
      setError('Network error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTriggerSyncNow = async () => {
    if (!sheetUrl.trim()) {
      setError('Please provide a Google Sheets or Google Drive CSV URL first.');
      return;
    }

    setSyncing(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/admin/sync/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sheetUrl,
          deactivateMissing,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMessage(data.result?.message || 'Sync completed successfully!');
        fetchConfig();
        fetchLogs();
      } else {
        setError(data.error || 'Sync execution failed');
      }
    } catch {
      setError('Network error while triggering sync.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Catalog Automation
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            Google Sheets & Drive Auto-Sync
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Seamlessly synchronize your master inventory spreadsheet with the live online store.
          </p>
        </div>

        <button
          type="button"
          onClick={handleTriggerSyncNow}
          disabled={syncing || !sheetUrl.trim()}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md self-start sm:self-auto disabled:opacity-40"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>{syncing ? 'Syncing Catalog...' : 'Sync Now'}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Sync Status Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-stone-500 text-xs block">Engine Status</span>
          <div className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                config?.lastSyncStatus === 'SUCCESS'
                  ? 'bg-emerald-500'
                  : config?.lastSyncStatus === 'FAILED'
                  ? 'bg-rose-500'
                  : 'bg-amber-500'
              }`}
            />
            <span>{config?.lastSyncStatus || 'IDLE'}</span>
          </div>
          <span className="text-[11px] text-stone-400 block">
            {config?.lastSyncMessage || 'Standing by for trigger'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-stone-500 text-xs block">Last Sync Execution</span>
          <div className="text-sm font-bold text-stone-900">
            {config?.lastSyncAt
              ? new Date(config.lastSyncAt).toLocaleString('en-IN')
              : 'Never Synced'}
          </div>
          <span className="text-[11px] text-stone-400 block">
            Schedule: Every {config?.syncIntervalMinutes || 15} mins
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-1">
          <span className="text-stone-500 text-xs block">Automated Sync Cron URL</span>
          <div className="text-xs font-mono font-semibold text-stone-800 truncate">
            /api/cron/sync
          </div>
          <span className="text-[11px] text-stone-400 block">
            Vercel Cron / External Cron Compatible
          </span>
        </div>
      </div>

      {/* How to Connect Google Sheet Guide Card */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#9A7B1C]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              How to Connect Your Google Sheet
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/api/admin/import/sample"
              download
              className="text-xs font-semibold text-[#9A7B1C] hover:underline flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Download CSV Template</span>
            </a>
            <span className="text-stone-300">|</span>
            <a
              href="/admin/import"
              className="text-xs font-semibold text-stone-700 hover:text-stone-950 underline"
            >
              Direct CSV File Upload →
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-stone-600">
          <div className="p-3 bg-white rounded-xl border border-amber-100">
            <strong className="block text-stone-900 mb-1">Step 1: Open Google Sheet</strong>
            Create or copy your inventory sheet with the 17 fixed columns (SKU, name, price, stock, image_urls, etc.).
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-100">
            <strong className="block text-stone-900 mb-1">Step 2: Share Publicly (Crucial)</strong>
            Click <strong>Share</strong> (top right) → Change <em>General access</em> to <strong>&quot;Anyone with the link&quot; (Viewer)</strong> → Click <strong>Copy link</strong>.
          </div>
          <div className="p-3 bg-white rounded-xl border border-amber-100">
            <strong className="block text-stone-900 mb-1">Step 3: Paste &amp; Sync</strong>
            Paste the copied link in the field below and click <strong>&quot;Sync Now&quot;</strong>.
          </div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveConfig} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <h2 className="font-serif text-xl font-semibold text-stone-900 border-b border-stone-100 pb-3 flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-[#D4AF37]" />
          Spreadsheet Source Configuration
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
              Google Sheet Link or Google Drive CSV Link *
            </label>
            <input
              type="url"
              required
              placeholder="https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit?usp=sharing"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              className="w-full text-xs font-mono py-3 px-4 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
            />
            <p className="text-[11px] text-stone-500 mt-1">
              Supports standard public Google Sheet sharing URLs, published CSV links, and Google Drive files. Must adhere to the 17 fixed columns.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div>
              <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-1.5">
                Automatic Sync Interval (Minutes)
              </label>
              <select
                value={syncInterval}
                onChange={(e) => setSyncInterval(e.target.value)}
                className="w-full text-xs py-2.5 px-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-white font-medium text-stone-800"
              >
                <option value="5">Every 5 minutes</option>
                <option value="15">Every 15 minutes (Recommended)</option>
                <option value="30">Every 30 minutes</option>
                <option value="60">Every 1 hour</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={deactivateMissing}
                  onChange={(e) => setDeactivateMissing(e.target.checked)}
                  className="w-4 h-4 text-[#D4AF37] rounded border-stone-300 focus:ring-[#D4AF37]"
                />
                <span className="text-xs font-medium text-stone-800">
                  Mark products removed from spreadsheet as <strong className="text-rose-600">INACTIVE</strong>
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <span className="text-[11px] text-stone-400">
            Upsert by SKU updates existing products and creates missing categories automatically.
          </span>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors shadow-sm flex items-center gap-2"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>

      {/* Sync Logs Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          Google Sheet Sync History
        </h2>

        {logs.length === 0 ? (
          <p className="text-xs text-stone-500">No automatic sync executions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Total Rows</th>
                  <th className="p-3">Created / Updated</th>
                  <th className="p-3">Errors</th>
                  <th className="p-3">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3 text-stone-500">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                    <td className="p-3">{log.totalRows}</td>
                    <td className="p-3 font-semibold text-emerald-700">{log.successCount}</td>
                    <td className="p-3 font-semibold text-rose-600">{log.errorCount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
