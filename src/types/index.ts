export type Language = 'en' | 'de';

export type View = 'train' | 'stats';

export type FeedbackState = 'correct' | 'wrong' | null;

export type LocalizedText = Record<Language, string>;

export type Problem = {
  id: string;
  group: number;
  left: string;
  right: string;
  answer: string;
};

export type RawModule = {
  id: string;
  kind: 'explicit' | 'multiplication-grid';
  title: LocalizedText;
  shortTitle: LocalizedText;
  description: LocalizedText;
  source?: string;
  symbol: string;
  problems?: Problem[];
  range?: {
    from: number;
    to: number;
  };
};

export type MathModule = Omit<RawModule, 'problems' | 'range'> & {
  problems: Problem[];
  range?: RawModule['range'];
};

export type ProblemStats = {
  attempts: number;
  correct: number;
  wrong: number;
  lastAnsweredAt?: string;
};

export type StatsRecord = Record<string, ProblemStats>;

export type ModuleStats = {
  attempts: number;
  correct: number;
  wrong: number;
  practiced: number;
  accuracy: number;
  missed: Array<{
    problem: Problem;
    stat: ProblemStats;
  }>;
};

export type SessionStats = {
  correct: number;
  wrong: number;
};
