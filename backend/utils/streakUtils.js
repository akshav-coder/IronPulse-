import Attendance from '../models/Attendance.js';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

// Buckets by local calendar day (not UTC) to match the local-time day bounds
// already used elsewhere in attendanceController.js (getDayBounds).
const toLocalDateKey = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const daysBetween = (laterKey, earlierKey) =>
  Math.round((new Date(laterKey).getTime() - new Date(earlierKey).getTime()) / ONE_DAY_MS);

// Computes a member's current and longest attendance streak, where a
// "streak day" is any calendar day with at least one Attendance check-in.
export const computeStreaks = async (memberId) => {
  const records = await Attendance.find({ member_id: memberId }).select('date');
  const uniqueDays = [...new Set(records.map((r) => toLocalDateKey(r.date)))].sort();

  if (uniqueDays.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // descending, most recent first
  const daysDesc = [...uniqueDays].reverse();
  const todayKey = toLocalDateKey(new Date());
  const yesterdayKey = toLocalDateKey(new Date(Date.now() - ONE_DAY_MS));

  let currentStreak = 0;
  if (daysDesc[0] === todayKey || daysDesc[0] === yesterdayKey) {
    currentStreak = 1;
    for (let i = 0; i < daysDesc.length - 1; i++) {
      if (daysBetween(daysDesc[i], daysDesc[i + 1]) === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  let longestStreak = 1;
  let run = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    if (daysBetween(uniqueDays[i], uniqueDays[i - 1]) === 1) {
      run++;
    } else {
      longestStreak = Math.max(longestStreak, run);
      run = 1;
    }
  }
  longestStreak = Math.max(longestStreak, run, currentStreak);

  return { currentStreak, longestStreak };
};

export const getMonthlyCheckInDayCount = async (memberId, referenceDate = new Date()) => {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const records = await Attendance.find({ member_id: memberId, date: { $gte: monthStart } }).select('date');
  return new Set(records.map((r) => toLocalDateKey(r.date))).size;
};
