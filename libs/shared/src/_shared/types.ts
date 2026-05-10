export type ILog = {
  module: string;
  method?: string;
  steps: Array<{ message: string; data?: unknown }>;
  error?: unknown;
  requestStartTime?: Date;
  lastStepTime?: Date;
  totalProcessingDuration?: string;
  processingTime?: number;
};

export interface RepositorySession {
  withTransaction(fn: () => Promise<void>): Promise<void>;
  endSession(): Promise<void>;
}
