// Lloyd's 1D K-Means, deterministic farthest-point initialization, k=3.
function salaryClusters(salaries) {
  if (salaries.some(v => !Number.isFinite(v) || v < 0)) throw new Error('Invalid salary data');
  const values = [...salaries].sort((a, b) => a - b);
  const unique = [...new Set(values)];
  let centers = unique.length ? [unique[0]] : [];
  while (centers.length < Math.min(3, unique.length)) {
    centers.push(unique.reduce((best, v) => {
      const distance = x => Math.min(...centers.map(c => Math.abs(x - c)));
      return distance(v) > distance(best) ? v : best;
    }, unique[0]));
  }
  let groups = [];
  for (let iteration = 0; iteration < 100 && centers.length; iteration++) {
    groups = centers.map(() => []);
    for (const value of values) {
      let nearest = 0;
      centers.forEach((center, i) => {
        if (Math.abs(value - center) < Math.abs(value - centers[nearest])) nearest = i;
      });
      groups[nearest].push(value);
    }
    const next = groups.map((group, i) => group.length ? group.reduce((a, b) => a + b, 0) / group.length : centers[i]);
    const done = next.every((v, i) => Math.abs(v - centers[i]) < 1e-8);
    centers = next;
    if (done) break;
  }
  // Empty tiers use null: no average exists when fewer than 3 distinct salaries.
  const clusters = centers.map((centroid, i) => ({ centroid: Math.round(centroid * 100) / 100, count: groups[i].length }))
    .sort((a, b) => a.centroid - b.centroid);
  while (clusters.length < 3) clusters.push({ centroid: null, count: 0 });
  return clusters.map((cluster, i) => ({ group: `Tier ${i + 1}`, ...cluster }));
}
module.exports = { salaryClusters };
