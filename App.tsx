
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import PreviewTable from './components/PreviewTable';
import { AppStatus, TableData } from './types';
import { extractTableFromImage } from './services/geminiService';
import { downloadAsExcel } from './utils/excelUtils';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<TableData | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      setFileName(file.name);
      setStatus(AppStatus.PREPROCESSING);
      setError(null);

      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        
        try {
          setStatus(AppStatus.EXTRACTING);
          const data = await extractTableFromImage(base64, file.type);
          setExtractedData(data);
          setStatus(AppStatus.REVIEW);
        } catch (err: any) {
          console.error(err);
          setError(err.message || 'Failed to extract data. Ensure the image is clear and contains a table.');
          setStatus(AppStatus.ERROR);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setError('An unexpected error occurred during processing.');
      setStatus(AppStatus.ERROR);
    }
  }, []);

  const handleDownload = () => {
    if (extractedData) {
      const exportName = fileName.split('.')[0] + '.xlsx';
      downloadAsExcel(extractedData, exportName);
    }
  };

  const handleDataUpdate = (newData: TableData) => {
    setExtractedData(newData);
  };

  const reset = () => {
    setStatus(AppStatus.IDLE);
    setExtractedData(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Physical Paper to <span className="text-indigo-600">Digital Excel</span>
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Our AI-powered engine uses Gemini Vision to detect tables and extract structured data from your scans with unmatched precision.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {status === AppStatus.IDLE && (
            <FileUploader onFileSelect={handleFileSelect} isLoading={false} />
          )}

          {(status === AppStatus.PREPROCESSING || status === AppStatus.EXTRACTING) && (
            <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-200 flex flex-col items-center">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {status === AppStatus.PREPROCESSING ? 'Enhancing Image...' : 'Analyzing Table Structure...'}
              </h3>
              <p className="text-gray-500 mt-2">This usually takes about 5-10 seconds depending on complexity.</p>
              
              <div className="mt-8 w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-500 ease-out" 
                  style={{ width: status === AppStatus.PREPROCESSING ? '30%' : '75%' }}
                ></div>
              </div>
            </div>
          )}

          {status === AppStatus.REVIEW && extractedData && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-100 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Extraction complete
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Source: {fileName}</span>
              </div>
              <PreviewTable 
                data={extractedData} 
                onDownload={handleDownload}
                onReset={reset}
                onUpdate={handleDataUpdate}
              />
            </div>
          )}

          {status === AppStatus.ERROR && (
            <div className="bg-red-50 rounded-2xl p-12 border border-red-100 text-center shadow-sm">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-900">Something went wrong</h3>
              <p className="text-red-700 mt-2">{error || 'An error occurred while processing the file.'}</p>
              <button
                onClick={reset}
                className="mt-6 bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition shadow-sm active:scale-95"
              >
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Feature Grid */}
        {status === AppStatus.IDLE && (
          <div className="mt-24 grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900">AI Deskewing</h4>
              <p className="text-gray-500 text-sm mt-2">Automatically fixes tilted scans and camera photos for perfect table alignment.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900">Manual Correction</h4>
              <p className="text-gray-500 text-sm mt-2">Fix extraction errors instantly with our intuitive inline spreadsheet-style editor.</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900">Privacy First</h4>
              <p className="text-gray-500 text-sm mt-2">Files are processed in-memory and never stored. Your document's security is our priority.</p>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Quick Access Bar (Responsive CTA) */}
      <div className="fixed bottom-8 right-8 z-40 md:hidden">
        <button 
          onClick={() => status !== AppStatus.IDLE && reset()}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition active:scale-95"
        >
          {status === AppStatus.IDLE ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
        </button>
      </div>
      
      <footer className="mt-24 border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} ScanTable Pro. Powered by Gemini Flash.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
