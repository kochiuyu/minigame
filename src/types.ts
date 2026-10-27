export interface GameField {
  id: string;
  label: string;
  type: 'select' | 'number';
  options?: string[];
  step?: number;
  postReveal?: boolean;
  min?: number;
  max?: number;
  defaultValue?: number | string;
}

export type RoundData = {
  isStep1Locked?: boolean;
  isStep2Locked?: boolean;
  step1Time?: string;
  step2Time?: string;
  [key: string]: string | number | boolean | undefined;
};

export interface GameConfig {
  id: number;
  title: string;
  shortTitle: string;
  category: string;
  icon: string;
  keyTakeaway: string;
  purpose: string;
  strategies: string;
  payoffs: string;
  instructions: string[];
  partners?: number;
  fields: GameField[];
  calculate: (data: RoundData) => Record<string, string | number | undefined> | null;
}

// Backward compatibility alias for WeekConfig
export type WeekConfig = GameConfig;

export interface StudentInfo {
  name: string;
  id: string;
  alias: string;
}

export type UserRole = 'student' | 'instructor';

export interface AuthSession {
  role: UserRole;
  name: string;
  id?: string;
  alias?: string;
  roomCode?: string;
}

export type RoundsState = {
  [gameId: number]: {
    [roundNum: number]: RoundData;
  };
};

export type ReflectionsState = {
  [gameId: number]: string;
};

