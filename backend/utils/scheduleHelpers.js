function toMinutes(time) {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function timesOverlap(startA, endA, startB, endB) {
  const sA = toMinutes(startA);
  const eA = toMinutes(endA);
  const sB = toMinutes(startB);
  const eB = toMinutes(endB);
  if (sA >= eA) return { valid: false, message: "End time must be after start time." };
  return { valid: true, overlaps: sA < eB && eA > sB };
}

async function findScheduleConflict(Schedule, { teacher, dayOfWeek, startTime, endTime, excludeId }) {
  if (!teacher || !dayOfWeek || !startTime || !endTime) return null;

  const range = timesOverlap(startTime, endTime, startTime, endTime);
  if (!range.valid) return range.message;

  const filter = { teacher, dayOfWeek };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Schedule.find(filter);
  for (const s of existing) {
    const { overlaps } = timesOverlap(startTime, endTime, s.startTime, s.endTime);
    if (overlaps) {
      return `Teacher already assigned during this time slot (${s.startTime}–${s.endTime}, ${s.subject}).`;
    }
  }
  return null;
}

module.exports = { toMinutes, timesOverlap, findScheduleConflict };
