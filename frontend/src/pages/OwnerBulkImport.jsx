import React, { useState } from 'react';
import API from '../api';
import { Upload, CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

const OwnerBulkImport = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
    setResults(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a CSV file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setError('');
    setResults(null);

    try {
      const res = await API.post('/members/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResults(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse CSV file upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-extrabold text-white">
          Bulk Member <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">CSV Importer</span>
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Add dozens of trainees to your gym directory simultaneously using spreadsheets.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm flex items-center gap-2 max-w-xl">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg max-w-xl">
        <h3 className="text-sm font-bold text-slate-100 mb-4">Upload Trainees Spreadsheet</h3>
        
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-slate-800 rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-950/40 hover:bg-slate-950/80 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload size={32} className="text-indigo-400" />
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-300">
                {file ? file.name : 'Click to select or drag CSV file'}
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                CSV headers must include: <code className="text-indigo-400 font-mono text-[9px]">name, email, membership_plan</code>
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={uploading || !file}
            className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Parsing CSV file...</span>
              </>
            ) : (
              <span>Import Member Records</span>
            )}
          </button>
        </form>
      </div>

      {/* Upload summary results */}
      {results && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-2xl space-y-6">
          <h3 className="text-sm font-bold text-slate-100 mb-2">Import Results Summary</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <CheckCircle2 size={24} className="text-emerald-400" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Created Records</span>
                <span className="text-xl font-bold text-slate-200">{results.successCount}</span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center gap-3">
              <XCircle size={24} className="text-red-400" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase tracking-wider">Failed Rows</span>
                <span className="text-xl font-bold text-slate-200">{results.errorCount}</span>
              </div>
            </div>
          </div>

          {results.errors.length > 0 && (
            <div className="space-y-2 border-t border-slate-800 pt-4">
              <span className="block text-[10px] font-bold text-red-400 uppercase tracking-wider">
                Audited Errors Breakdown ({results.errors.length})
              </span>
              <div className="max-h-60 overflow-y-auto bg-slate-950 p-4 rounded-xl border border-slate-850 divide-y divide-slate-900 font-mono text-[10px] text-red-400 space-y-2 leading-relaxed">
                {results.errors.map((err, idx) => (
                  <div key={idx} className="pt-2 first:pt-0">{err}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerBulkImport;
