
import React, { useState, useMemo } from 'react';
import { MediaFile } from '../types';

interface MediaTableProps {
  files: MediaFile[];
}

const MediaTable: React.FC<MediaTableProps> = ({ files }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredFiles = useMemo(() => {
    return files.filter(f => 
      f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.mimeType.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => b.indexedAt - a.indexedAt);
  }, [files, searchTerm]);

  const formatSize = (bytes: string) => {
    const b = parseInt(bytes);
    if (b === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(b) / Math.log(k));
    return parseFloat((b / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="whiteboard-card overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-800">Registry Contents ({filteredFiles.length})</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search media..."
            className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full sm:w-64 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-500 uppercase text-xs font-semibold tracking-wider border-b border-slate-200">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Size</th>
              <th className="px-6 py-4">Checksum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  No files indexed yet. Connect Google Drive to begin.
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        file.mimeType.startsWith('video') ? 'bg-blue-100 text-blue-600' :
                        file.mimeType.startsWith('audio') ? 'bg-purple-100 text-purple-600' :
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {file.mimeType.startsWith('video') ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 012 2h6a2 2 0 012 2H4a2 2 0 01-2-2V6z"/></svg>
                        ) : file.mimeType.startsWith('audio') ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z"/></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"/></svg>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-slate-400">ID: {file.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{file.mimeType}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">{formatSize(file.size)}</td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-400 uppercase">
                    {file.md5Checksum ? file.md5Checksum.substring(0, 12) + '...' : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MediaTable;
