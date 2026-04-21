export type ArtTestCaseResult = {
  name: string;
  state: 'pass' | 'fail' | 'skip' | 'todo' | 'unknown';
  durationMs?: number;
  errorMessage?: string;
  errorStack?: string;
};

export type ArtTestFileResult = {
  filepath: string;
  total: number;
  passed: number;
  failed: number;
  durationMs?: number;
  tests: ArtTestCaseResult[];
};

export type ArtTestsRunResponse = {
  ok: boolean;
  message?: string;
  artId: string;
  matchedSpecs: number;
  files: ArtTestFileResult[];
};

export type ArtTestsRunHistoryItem = {
  id: string;
  timestamp: number;
  source: 'manual' | 'watch';
  result: ArtTestsRunResponse;
};

export type ArtTestsRunTriggerResponse = {
  ok: boolean;
  message?: string;
  artId: string;
  matchedSpecs: number;
  triggered?: boolean;
};
