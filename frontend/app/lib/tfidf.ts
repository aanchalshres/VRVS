// lib/tfidf.ts

export async function getTfIdfVector(type: 'volunteers' | 'tasks', id: number) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/${type}/${id}/tfidf`,
    { cache: 'no-store' }  // always fresh
  );
  if (!res.ok) throw new Error('Failed to fetch TF-IDF vector');
  return res.json() as Promise<{ tfidf_vector: Record<string, number> }>;
}

export async function recomputeVectors(token: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/tfidf/recompute`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}