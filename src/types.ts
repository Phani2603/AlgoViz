export interface Process {
  id: string;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  color: string;
  remainingTime: number;
  waitingTime: number;
  turnaroundTime: number;
}

export interface PageFrame {
  id: string;
  page: number | null;
  isHit?: boolean;
  referenceCount?: number;
  lastUsed?: number;
}

export type AlgorithmType = 'FCFS' | 'SJF' | 'Priority' | 'RoundRobin' | 'MLFQ';
export type PageReplacementType = 'FIFO' | 'LRU' | 'OPT' | 'Clock';