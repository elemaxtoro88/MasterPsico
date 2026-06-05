/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RosenbergAnswer {
  questionId: number;
  score: number; // 1 to 4
}

export interface CAFEUAnswer {
  questionId: number;
  score: number; // 1 to 5
}

export interface JournalAnalysis {
  valence: number; // -100 to 100
  valenceLabel: string; // e.g. "Abatido", "Estable", "Energético"
  identifiedDistortions: string[]; // e.g. ["Catastrofismo", "Pensamiento todo o nada"]
  keyConstructs: { name: string; score: number; description: string }[];
  empatheticFeedback: string;
  copingStrategies: string[];
}

export interface SavedResult {
  id: string;
  date: string;
  testType: 'rosenberg' | 'cafeu' | 'journal' | 'reflection' | 'mask_reflection';
  score?: number;
  label?: string;
  details?: any;
}
