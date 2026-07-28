import type { QuizType } from '../../domain/quiz';
import type { Level } from '../../domain/types';

export const LEVELS: Level[] = ['beginner', 'intermediate', 'hard'];

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  hard: 'Hard',
};

export const TYPE_LABEL: Record<QuizType, string> = {
  seen: 'Words I’ve Seen',
  random: 'Random Quiz',
};
