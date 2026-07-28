export type Phase = 'home' | 'playing' | 'feedback' | 'review' | 'results';
export type ActivePhase = 'playing' | 'feedback';
export type ReviewReturnPhase = ActivePhase | 'results' | 'home';
