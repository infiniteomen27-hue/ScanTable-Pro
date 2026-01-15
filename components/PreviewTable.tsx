
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
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh]">
      <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/80 backdrop-blur-md sticky top-0 z-20">
        <div>
          <h3 className="font-bold text-gray-900">Extracted Table</h3>
          <p className="text-xs text-gray-500">
            {isEditing ? 'Editing cells' : 'Review and verify'}
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 sm:flex-none text-xs sm:text-sm font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-2 rounded-xl hover:bg-indigo-50 transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </button>
              <button
                onClick={onDownload}
                className="flex-1 sm:flex-none bg-indigo-600 text-white text-xs sm:text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-md shadow-indigo-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Excel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={cancelChanges}
                className="flex-1 sm:flex-none text-sm font-bold text-gray-500 px-3 py-2"
              >
                Cancel
              </button>
              <button
                onClick={saveChanges}
                className="flex-1 sm:flex-none bg-green-600 text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
              >
                Save
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="overflow-auto flex-1 bg-white">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr>
              {localData.headers.map((header, i) => (
                <th key={i} className="px-4 py-3 text-[10px] font-bold text-gray-500 uppercase tracking-wider border-b border-r border-gray-100 last:border-r-0 min-w-[150px]">
                  {isEditing ? (
                    <input
                      type="text"
                      className="w-full bg-white border border-gray-200 focus:border-indigo-500 rounded-md px-2 py-1 outline-none text-gray-900 font-medium"
                      value={header}
                      onChange={(e) => handleHeaderChange(i, e.target.value)}
                    />
                  ) : (
                    <div className="px-2 py-1 truncate">{header}</div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {localData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-indigo-50/20 transition group">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm text-gray-600 border-r border-gray-50 last:border-r-0">
                    {isEditing ? (
                      <textarea
                        rows={1}
                        className="w-full bg-white border border-transparent group-hover:border-gray-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-lg px-2 py-1.5 outline-none transition resize-none text-sm min-h-[38px] flex items-center"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }}
                      />
                    ) : (
                      <div className="px-2 py-1.5 whitespace-pre-wrap break-words min-h-[38px]">{cell || <span className="text-gray-300 italic">empty</span>}</div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between items-center md:hidden">
        <button
          onClick={onReset}
          className="text-xs font-bold text-red-500 uppercase tracking-widest"
        >
          Discard All
        </button>
        <span className="text-[10px] text-gray-400"> Swipe → to view columns </span>
      </div>
    </div>
  );
};

export default PreviewTable;
