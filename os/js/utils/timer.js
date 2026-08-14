export function elapsedMs(task, at = Date.now()){
  if (!task.timing.startedAt) return 0;
  const end = task.timing.finishedAt ? new Date(task.timing.finishedAt).getTime() : at;
  const activePause = task.timing.pausedAt ? Math.max(0, at - new Date(task.timing.pausedAt).getTime()) : 0;
  return Math.max(0, end - new Date(task.timing.startedAt).getTime() - task.timing.totalPausedMs - activePause);
}
export function formatDuration(ms){
  const total = Math.floor(ms / 1000), h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}
export function actualMinutes(task){ return Math.round(elapsedMs(task) / 60000); }

