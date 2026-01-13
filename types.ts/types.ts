
export interface LevelData {
  id: number;
  problem: string;
  totalCakes: number;
  shareWith: number; // số người chia
  correctWhole: number;
  correctNumerator: number;
  correctDenominator: number;
}

export type InputMode = 'natural' | 'fraction' | 'mixed';

export interface UserAnswer {
  mode: InputMode;
  whole: string;
  numerator: string;
  denominator: string;
}

export interface PlacedCake {
  id: string;
  x: number;
  y: number;
  isCut: boolean; // Với miếng bánh đơn lẻ (slice) thì isCut là true
  slices: number; // Tổng số miếng của cái bánh gốc (mẫu số)
  startAngle?: number; // Góc bắt đầu của miếng bánh này
  isSlice?: boolean; // Đánh dấu đây là một miếng bánh nhỏ
}

/**
 * Fix: Added Topic interface to resolve error in constants.tsx
 */
export interface Topic {
  id: string;
  name: string;
  icon: string;
  color: string;
}

/**
 * Fix: Added UserStats interface to resolve error in components/Layout.tsx
 */
export interface UserStats {
  level: number;
  xp: number;
  streak: number;
}

/**
 * Fix: Added Quiz interface to resolve error in components/QuizCard.tsx
 */
export interface Quiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}
