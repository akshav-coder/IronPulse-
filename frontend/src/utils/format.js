/**
 * Format a date string into a relative time string (e.g. "3 hours ago", "2 days ago")
 * or a readable date if older.
 */
export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'just now';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'yesterday';
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Calculate totals and averages from workout logs
 */
export const calculateMetrics = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalWeight: 0,
      totalReps: 0,
      totalDuration: 0,
      averageDuration: 0,
    };
  }

  const totalWorkouts = workouts.length;
  let totalWeight = 0;
  let totalReps = 0;
  let totalDuration = 0;

  workouts.forEach((w) => {
    totalWeight += (w.load || 0) * (w.reps || 0);
    totalReps += w.reps || 0;
    totalDuration += w.duration || 0;
  });

  return {
    totalWorkouts,
    totalWeight, // total volume lifted (load * reps)
    totalReps,
    totalDuration,
    averageDuration: Math.round(totalDuration / totalWorkouts),
  };
};
