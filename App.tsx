
import React from 'react';
import { useRegistry } from './services/useRegistry';
import { useGoogleDrive } from './services/useGoogleDrive';
import MediaTable from './components/MediaTable';
import ProgressBar from './components/ProgressBar';

const App: React.FC = () => {
  const { registry, upsertMedia, clearRegistry } = useRegistry();
  const { 
    accessToken, 
    login, 
    openPicker, 
    fetchFilesRecursively, 
    progress,
    isReady 
  } = useGoogleDrive(upsertMedia);

  const handleStartIndexing = () => {
    openPicker((folderId) => {
      fetchFilesRecursively(folderId);
    });
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">S</div>
            <h1 className="text-xl font-bold text-slate-900 hidden sm:block">Story Graph <span className="text-slate-400 font-medium">Registry</span></h1>
          </div>
          
          <div className="flex items-center gap-3">
            {!accessToken ? (
              <button
                onClick={login}
                disabled={!isReady}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.224 1.224-3.136 2.552-6.712 2.552-5.44 0-9.76-4.4-9.76-9.84s4.32-9.84 9.76-9.84c2.952 0 5.176 1.152 6.76 2.68l2.304-2.304C18.592 1.392 15.824 0 12.48 0 6.504 0 1.624 4.88 1.624 10.88s4.88 10.88 10.856 10.88c3.224 0 5.672-1.056 7.608-3.088 1.984-1.984 2.616-4.784 2.616-7.024 0-.664-.048-1.296-.152-1.84H12.48z"/>
                </svg>
                Connect Drive
              </button>
            ) : (
              <>
                <button
                  onClick={clearRegistry}
                  className="text-slate-500 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Clear Local Registry
                </button>
                <button
                  onClick={handleStartIndexing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Index Folder
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 mt-8">
        {!accessToken ? (
          <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Build Your Local Media Registry</h2>
            <p className="text-slate-500 max-w-lg mb-8 text-lg">
              Connect your Google Drive, select a project folder, and we'll recursively index all your video, audio, and image assets into a fast, local database.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
              <div className="whiteboard-card p-6 text-left">
                <div className="text-indigo-600 font-bold mb-2">01</div>
                <h3 className="font-bold text-slate-800 mb-1">Authenticated</h3>
                <p className="text-sm text-slate-500">Secure GIS login with metadata-only read scopes.</p>
              </div>
              <div className="whiteboard-card p-6 text-left">
                <div className="text-indigo-600 font-bold mb-2">02</div>
                <h3 className="font-bold text-slate-800 mb-1">Recursive</h3>
                <p className="text-sm text-slate-500">Auto-traversal of infinite subfolders via Drive API v3.</p>
              </div>
              <div className="whiteboard-card p-6 text-left">
                <div className="text-indigo-600 font-bold mb-2">03</div>
                <h3 className="font-bold text-slate-800 mb-1">Local Index</h3>
                <p className="text-sm text-slate-500">High-speed IndexedDB storage for offline discovery.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <ProgressBar progress={progress} />
            <MediaTable files={registry} />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="mt-12 py-8 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
          <p>© 2024 Story Graph Media Sync Registry · Browser Native Tool</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <span>Client Ready: {isReady ? '✅' : '⏳'}</span>
            <span>Local DB: {registry.length > 0 ? 'Active' : 'Empty'}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
