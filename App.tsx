
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
      const exportName = fileName.split('.')[0].replace(/\s+/g, '_') + '.xlsx';
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
    <div className="min-h-screen bg-gray-50 pb-10 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 md:py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Scan to <span className="text-indigo-600">Excel</span>
          </h1>
          <p className="mt-4 text-sm md:text-lg text-gray-500 max-w-2xl mx-auto">
            Professional OCR for physical documents. Just snap a photo or upload a file.
          </p>
        </div>

        <div className="max-w-4xl mx-auto w-full">
          {status === AppStatus.IDLE && (
            <FileUploader onFileSelect={handleFileSelect} isLoading={false} />
          )}

          {(status === AppStatus.PREPROCESSING || status === AppStatus.EXTRACTING) && (
            <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-gray-100 flex flex-col items-center animate-pulse">
              <div className="relative w-16 h-16 md:w-20 md:h-20 mb-6">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-gray-900 text-center">
                {status === AppStatus.PREPROCESSING ? 'Optimizing Image...' : 'Extracting Data...'}
              </h3>
              <p className="text-gray-400 mt-2 text-xs md:text-sm text-center">Using Gemini 3.0 Flash for ultra-fast processing</p>
            </div>
          )}

          {status === AppStatus.REVIEW && extractedData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-1.5 text-[10px] md:text-xs font-bold text-green-600 uppercase tracking-widest bg-green-50 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                  Ready for review
                </div>
                <span className="text-[10px] md:text-xs font-medium text-gray-400 truncate max-w-[150px]">{fileName}</span>
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
            <div className="bg-white rounded-3xl p-8 md:p-12 border-2 border-red-50 text-center shadow-xl">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Extraction Failed</h3>
              <p className="text-gray-500 mt-2 text-sm">{error || 'Please try again with a clearer photo.'}</p>
              <button
                onClick={reset}
                className="mt-6 w-full md:w-auto bg-gray-900 text-white px-8 py-3 rounded-2xl font-bold hover:bg-black transition active:scale-95"
              >
                Try Another Scan
              </button>
            </div>
          )}
        </div>

        {/* Informational Section */}
        {status === AppStatus.IDLE && (
          <div className="mt-16 md:mt-24 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <FeatureCard 
              icon={<path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />}
              title="Snap & Convert"
              desc="Use your phone camera to scan sheets directly. Perfect for mobile field work."
            />
            <FeatureCard 
              icon={<path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />}
              title="Excel Export"
              desc="Get fully structured .xlsx files with formatting and columns preserved."
            />
             <FeatureCard 
              icon={<path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />}
              title="Smart Edit"
              desc="Correct AI results on the fly with our powerful spreadsheet-style interface."
            />
          </div>
        )}
      </main>

      <footer className="mt-12 md:mt-auto border-t border-gray-100 py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-widest">
            ScanTable Pro &copy; {new Date().getFullYear()} &bull; Enterprise Grade OCR
          </p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-6 md:p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300">
    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {icon}
      </svg>
    </div>
    <h4 className="font-bold text-gray-900 mb-2">{title}</h4>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

export default App;
