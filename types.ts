
export interface TableData {
  headers: string[];
  rows: string[][];
}

export interface ProcessingResult {
  data: TableData;
  success: boolean;
  error?: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  PREPROCESSING = 'PREPROCESSING',
  EXTRACTING = 'EXTRACTING',
  REVIEW = 'REVIEW',
  ERROR = 'ERROR'
}
