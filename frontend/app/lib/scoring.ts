export interface RecommendationScores {
  recommendation_score?: number;
  match_score?: number;
  semantic_match_score?: number;
  skill_overlap_score?: number;
  distance_score?: number;
  availability_score?: number;
  trust_score?: number;
}

export function getOverallScore(scores: RecommendationScores): number {
  return scores.recommendation_score ?? scores.match_score ?? 0;
}

export function generateExplanation(scores: RecommendationScores): string[] {
  const reasons: string[] = [];

  const semantic = scores.semantic_match_score ?? 0;
  const skill = scores.skill_overlap_score ?? 0;
  const distance = scores.distance_score ?? 0;
  const availability = scores.availability_score ?? 0;
  const trust = scores.trust_score ?? 0;

  if (semantic >= 0.7) {
    reasons.push('Strong semantic match');
  } else if (semantic >= 0.4) {
    reasons.push('Good semantic match');
  }

  if (skill >= 0.7) {
    reasons.push('Excellent skill overlap');
  } else if (skill >= 0.4) {
    reasons.push('Good skill overlap');
  }

  if (distance >= 0.7) {
    reasons.push('Nearby location');
  } else if (distance >= 0.4) {
    reasons.push('Reasonable distance');
  }

  if (availability >= 0.7) {
    reasons.push('Availability overlap');
  }

  if (trust >= 0.7) {
    reasons.push('High trust score');
  } else if (trust >= 0.4) {
    reasons.push('Established volunteer');
  }

  if (reasons.length === 0) {
    reasons.push('General match');
  }

  return reasons;
}

export function getMatchColor(score: number): string {
  if (score >= 70) return 'bg-green-100 text-green-800 border-green-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

export function getScoreBarColor(value: number): string {
  if (value >= 0.7) return 'bg-green-500';
  if (value >= 0.4) return 'bg-yellow-500';
  return 'bg-gray-400';
}

export function formatScore(value: number | undefined | null): string {
  if (value === undefined || value === null) return 'N/A';
  return (value * 100).toFixed(0);
}
