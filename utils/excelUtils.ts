
import * as XLSX from 'xlsx';
import { TableData } from '../types';

export const downloadAsExcel = (tableData: TableData, fileName: string = 'extracted_data.xlsx') => {
  // Combine headers and rows for sheet generation
  const fullData = [tableData.headers, ...tableData.rows];
  
  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(fullData);
  
  // Auto-size columns for better aesthetics
  const colWidths = tableData.headers.map((_, i) => {
    const maxLen = Math.max(
      ...fullData.map(row => (row[i] ? row[i].toString().length : 5))
    );
    return { wch: maxLen + 2 };
  });
  ws['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(wb, ws, "ScannedTable");
  
  // Trigger download
  XLSX.writeFile(wb, fileName);
};
