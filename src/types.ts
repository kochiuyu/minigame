export interface GameField {
  id: string;
  label: string;
  type: 'select' | 'number';
  options?: string[];
  step?: number;
  postReveal?: boolean;
}

export type RoundData = {
  isStep1Locked?: boolean;
  isStep2Locked?: boolean;
  step1Time?: string;
  step2Time?: string;
  [key: string]: string | boolean | undefined;
};

export type WeekConfig = {
  id: number;
  title: string;
  purpose: string;
  strategies: string;
  payoffs: string;
  instructions: string[];
  partners?: number;
  fields: GameField[];
  calculate: (data: RoundData) => Record<string, string | number | undefined> | null;
};

export interface StudentInfo {
  name: string;
  id: string;
  alias: string;
}

export type RoundsState = {
  [weekId: number]: {
    [roundNum: number]: RoundData;
  };
};

export type ReflectionsState = {
  [weekId: number]: string;
};
