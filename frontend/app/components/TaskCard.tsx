import { RecommendationScores, getOverallScore, generateExplanation, getMatchColor, getScoreBarColor, formatScore } from '@/app/lib/scoring';

type Task = {
  id: number;
  title: string;
  description: string;
  match_score?: number;
  recommendation_score?: number;
  semantic_match_score?: number;
  skill_overlap_score?: number;
  distance_score?: number;
  availability_score?: number;
  trust_score?: number;
};

function MatchBadge({ score }: { score: number }) {
  const color = getMatchColor(score);

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${color}`}>
      {score}% match
    </span>
  );
}

function ScoreBar({ label, value }: { label: string; value: number | undefined | null }) {
  const pct = value !== undefined && value !== null ? Math.round(value * 100) : 0;
  const barColor = getScoreBarColor(value ?? 0);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-[#6B7280] shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-[#6B7280] font-medium">{pct}%</span>
    </div>
  );
}

function Explanation({ reasons }: { reasons: string[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {reasons.map((reason, i) => (
        <span key={i} className="text-xs bg-[#4F46C8]/10 text-[#4F46C8] px-2 py-0.5 rounded-full">
          {reason}
        </span>
      ))}
    </div>
  );
}

export function TaskCard({ task }: { task: Task }) {
  const overall = getOverallScore(task as RecommendationScores);
  const reasons = generateExplanation(task as RecommendationScores);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-gray-900">{task.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{task.description}</p>
        </div>
        <MatchBadge score={overall} />
      </div>

      <div className="space-y-1 pt-2 border-t border-gray-100">
        <ScoreBar label="Semantic" value={task.semantic_match_score} />
        <ScoreBar label="Skills" value={task.skill_overlap_score} />
        <ScoreBar label="Distance" value={task.distance_score} />
        <ScoreBar label="Availability" value={task.availability_score} />
        <ScoreBar label="Trust" value={task.trust_score} />
      </div>

      <Explanation reasons={reasons} />
    </div>
  );
}