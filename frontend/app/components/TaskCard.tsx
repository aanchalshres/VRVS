type Task = {
  id: number;
  title: string;
  description: string;
  match_score: number;
};

function MatchBadge({ score }: { score: number }) {
  const color =
    score >= 70 ? 'bg-green-100 text-green-800' :
    score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-500';

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
      {score}% match
    </span>
  );
}

export function TaskCard({ task }: { task: Task }) {
  return (
    <div className="border rounded-lg p-4 flex justify-between items-start">
      <div>
        <h3 className="font-medium text-gray-900">{task.title}</h3>
        <p className="text-sm text-gray-500 mt-1">{task.description}</p>
      </div>
      <MatchBadge score={task.match_score} />
    </div>
  );
}