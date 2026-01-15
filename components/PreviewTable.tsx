
import React, { useState, useEffect } from 'react';
import { TableData } from '../types';

interface PreviewTableProps {
  data: TableData;
  onDownload: () => void;
  onReset: () => void;
  onUpdate: (newData: TableData) => void;
}

const PreviewTable: React.FC<PreviewTableProps> = ({ data, onDownload, onReset, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState<TableData>(data);

  // Sync local data if props change (e.g., after a new scan)
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleCellChange = (rowIndex: number, cellIndex: number, value: string) => {
    const newRows = [...localData.rows];
    newRows[rowIndex] = [...newRows[rowIndex]];
    newRows[rowIndex][cellIndex] = value;
    setLocalData({ ...localData, rows: newRows });
  };

  const handleHeaderChange = (index: number, value: string) => {
    const newHeaders = [...localData.headers];
    newHeaders[index] = value;
    setLocalData({ ...localData, headers: newHeaders });
  };

  const saveChanges = () => {
    onUpdate(localData);
    setIsEditing(false);
  };

  const cancelChanges = () => {
    setLocalData(data);
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
        <div>
          <h3 className="font-semibold text-gray-900">Extraction Results</h3>
          <p className="text-xs text-gray-500">
            {isEditing ? 'Editing mode: click on any cell to modify its content.' : 'Review and verify the data before downloading.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={onReset}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md transition"
              >
                Discard
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-md hover:bg-indigo-100 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Data
              </button>
              <button
                onClick={onDownload}
                className="bg-green-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-green-700 transition flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Excel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={cancelChanges}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-md transition"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="bg-indigo-600 text-white text-sm font-medium px-4 py-1.5 rounded-md hover:bg-indigo-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto max-h-[60vh]">
        <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
          <thead className="sticky top-0 bg-white border-b border-gray-200 z-10">
            <tr>
              {localData.headers.map((header, i) => (
                <th key={i} className="px-6 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50 border-r border-gray-100 last:border-r-0">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full bg-indigo-50/30 border border-transparent focus:border-indigo-400 focus:bg-white rounded px-2 py-1 outline-none transition"
                      value={header}
                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                    />
                  ) : (
                    <div className="px-2 py-1">{header}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {localData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50/50 transition">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-2 text-sm text-gray-600 border-r border-gray-50 last:border-r-0">
                    {isEditing ? (
                      <textarea
                        rows={1}
                        className="w-full bg-white border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 rounded px-2 py-1 outline-none transition resize-none"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <div className="px-2 py-1 whitespace-pre-wrap break-words">{cell}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {localData.rows.length === 0 && (
        <div className="p-12 text-center text-gray-500 italic">
          No table data found in the image. Try a clearer scan.
        </div>
      )}
    </div>
  );
};

export default PreviewTable;
