'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Clock,
} from 'lucide-react';
import { CsvCatalogRow, RowValidationError } from '@/lib/catalog-sync';

interface ImportLog {
  id: string;
  source: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  status: string;
  createdAt: string;
}

export default function AdminCsvImportPage() {
  const [csvText, setCsvText] = useState('');
  const [fileName, setFileName] = useState('');
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    totalRows: number;
    validCount: number;
    errorCount: number;
    errors: RowValidationError[];
    previewRows: CsvCatalogRow[];
    allValidRows: CsvCatalogRow[];
  } | null>(null);
  const [importSuccessMessage, setImportSuccessMessage] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [recentLogs, setRecentLogs] = useState<ImportLog[]>([]);

  // Fetch recent import logs
  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/admin/import/logs');
      const data = await res.json();
      if (data.logs) setRecentLogs(data.logs);
    } catch {}
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setValidationResult(null);
    setImportSuccessMessage('');
    setGeneralError('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text || '');
    };
    reader.readAsText(file);
  };

  const handleValidate = async () => {
    if (!csvText.trim()) {
      setGeneralError('Please select a CSV file or paste CSV text.');
      return;
    }

    setValidating(true);
    setGeneralError('');
    setImportSuccessMessage('');

    try {
      const res = await fetch('/api/admin/import/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvContent: csvText }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setValidationResult(data);
      } else {
        setGeneralError(data.error || 'Validation error');
      }
    } catch {
      setGeneralError('Network failure during CSV inspection.');
    } finally {
      setValidating(false);
    }
  };

  const handleExecuteImport = async () => {
    if (!validationResult || validationResult.allValidRows.length === 0) return;

    setImporting(true);
    setGeneralError('');

    try {
      const res = await fetch('/api/admin/import/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rows: validationResult.allValidRows,
          filename: fileName || 'Uploaded CSV',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setImportSuccessMessage(data.message);
        setValidationResult(null);
        setCsvText('');
        setFileName('');
        fetchLogs();
      } else {
        setGeneralError(data.error || 'Import failed.');
      }
    } catch {
      setGeneralError('Network failure during catalog import.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200">
        <div>
          <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-[#9A7B1C]">
            Catalog Management
          </span>
          <h1 className="font-serif text-3xl font-semibold text-stone-900">
            CSV Bulk Import
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Upload or paste your fixed 17-column CSV file. Upsert by SKU automatically creates missing categories.
          </p>
        </div>

        <a
          href="/api/admin/import/sample"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors shadow-sm self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-[#D4AF37]" />
          <span>Download Sample Template</span>
        </a>
      </div>

      {generalError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
          {generalError}
        </div>
      )}

      {importSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{importSuccessMessage}</span>
        </div>
      )}

      {/* Upload & Input Box */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* File Picker */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Select CSV File
            </label>
            <div className="border-2 border-dashed border-stone-300 hover:border-[#D4AF37] rounded-xl p-6 text-center cursor-pointer transition-colors bg-stone-50/50">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                <span className="text-xs font-medium text-stone-700 block">
                  {fileName ? (
                    <strong className="text-stone-900">{fileName}</strong>
                  ) : (
                    'Click to browse or drop CSV file here'
                  )}
                </span>
                <span className="text-[10px] text-stone-400 block">
                  Fixed format with 17 required columns
                </span>
              </label>
            </div>
          </div>

          {/* Paste CSV text */}
          <div>
            <label className="block text-xs font-semibold text-stone-900 uppercase tracking-wider mb-2">
              Or Paste Raw CSV Data
            </label>
            <textarea
              rows={5}
              placeholder="sku,name,description,category,subcategory,price,mrp,stock,metal,purity,stone,occasion,gender,weight_grams,image_urls,is_bestseller,status&#10;JM-RNG-101,Diamond Tiara Ring,...,Rings,Bands,45000,52000,10,Gold,22K,Diamond,Bridal,Women,4.5,https://...,TRUE,ACTIVE"
              value={csvText}
              onChange={(e) => {
                setCsvText(e.target.value);
                setValidationResult(null);
              }}
              className="w-full text-xs font-mono p-3 rounded-xl border border-stone-300 focus:outline-none focus:border-[#D4AF37] bg-stone-50"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            type="button"
            onClick={handleValidate}
            disabled={validating || !csvText.trim()}
            className="px-6 py-2.5 bg-stone-900 hover:bg-[#9A7B1C] text-white text-xs font-semibold uppercase tracking-widest rounded-xl transition-colors shadow-sm disabled:opacity-40"
          >
            {validating ? 'Inspecting & Validating...' : 'Validate CSV Rows'}
          </button>
        </div>
      </div>

      {/* Validation Result & Preview Section */}
      {validationResult && (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-stone-100">
            <div>
              <h2 className="font-serif text-xl font-semibold text-stone-900">
                Validation Summary
              </h2>
              <div className="text-xs text-stone-500 mt-0.5">
                Total Rows: <strong>{validationResult.totalRows}</strong> • Valid:{' '}
                <strong className="text-emerald-700">{validationResult.validCount}</strong> • Invalid:{' '}
                <strong className="text-rose-600">{validationResult.errorCount}</strong>
              </div>
            </div>

            {validationResult.validCount > 0 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={importing}
                className="px-6 py-3 bg-[#D4AF37] hover:bg-[#B38F24] text-stone-950 text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <span>{importing ? 'Upserting to Database...' : `Import ${validationResult.validCount} Products`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Row Errors Inspector */}
          {validationResult.errors.length > 0 && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
              <h3 className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                Row Errors ({validationResult.errors.length})
              </h3>
              <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
                {validationResult.errors.map((err, i) => (
                  <div key={i} className="flex gap-2 text-rose-900 bg-white/70 p-2 rounded border border-rose-100">
                    <span className="font-mono font-bold text-rose-700">Row {err.rowNumber} [{err.sku}]:</span>
                    <span>{err.errors.join('; ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Valid Rows Preview Table */}
          {validationResult.previewRows.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider mb-3">
                Preview Valid Rows ({validationResult.previewRows.length} of {validationResult.validCount})
              </h3>
              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-200">
                    <tr>
                      <th className="p-3">SKU</th>
                      <th className="p-3">Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Price</th>
                      <th className="p-3">MRP</th>
                      <th className="p-3">Metal / Purity</th>
                      <th className="p-3">Weight</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {validationResult.previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-stone-50/50">
                        <td className="p-3 font-mono font-bold text-stone-900">{r.sku}</td>
                        <td className="p-3 font-medium text-stone-900">{r.name}</td>
                        <td className="p-3 text-stone-700">{r.category}</td>
                        <td className="p-3 font-semibold text-stone-900">₹{r.price.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-stone-400 line-through">₹{r.mrp.toLocaleString('en-IN')}</td>
                        <td className="p-3">{r.purity} {r.metal}</td>
                        <td className="p-3">{r.weight_grams}g</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800">
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import History Log */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-4">
        <h2 className="font-serif text-lg font-semibold text-stone-900 flex items-center gap-2 pb-3 border-b border-stone-100">
          <Clock className="w-4 h-4 text-[#D4AF37]" />
          Import History Log
        </h2>

        {recentLogs.length === 0 ? (
          <p className="text-xs text-stone-500">No import history yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider font-semibold border-b border-stone-100">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Total Rows</th>
                  <th className="p-3">Success</th>
                  <th className="p-3">Failed</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="p-3 text-stone-500">{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                    <td className="p-3 font-medium text-stone-900">{log.source}</td>
                    <td className="p-3">{log.totalRows}</td>
                    <td className="p-3 font-semibold text-emerald-700">{log.successCount}</td>
                    <td className="p-3 font-semibold text-rose-600">{log.errorCount}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
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
