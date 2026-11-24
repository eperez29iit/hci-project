// A night has two fixed local dates and one replaceable bedtime reminder.
export const TEN_MINUTES = 10 * 60 * 1000;
export const DEMO_SPEED = 60;

function parts(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error('Choose both a bedtime and a wake-up time.');
  }
  return value.split(':').map(Number);
}

export function demoStart(realTime) {
  const evening = new Date(realTime);
  return evening.setHours(22, 56, 0, 0);
}

export function clockTime(night, realTime, demo) {
  if (!demo) return realTime;
  if (!night) return demoStart(realTime);
  return demoStart(night.startedAt) + (realTime - night.startedAt) * DEMO_SPEED;
}

function localTimeOn(reference, hour, minute, daysLater = 0) {
  const date = new Date(reference);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + daysLater, hour, minute).getTime();
}

export function planNight(bedtime, wakeTime, realTime, demo = false, startedAt = realTime) {
  const now = clockTime({ startedAt }, realTime, demo);
  const [bedHour, bedMinute] = parts(bedtime);
  let bedAt = localTimeOn(now, bedHour, bedMinute);
  // Choosing the current minute means bedtime is due now.
  const currentMinute = Math.floor(now / 60000) * 60000;
  if (bedAt < currentMinute) bedAt = localTimeOn(now, bedHour, bedMinute, 1);

  const [wakeHour, wakeMinute] = parts(wakeTime);
  let wakeAt = localTimeOn(bedAt, wakeHour, wakeMinute);
  if (wakeAt <= bedAt) wakeAt = localTimeOn(bedAt, wakeHour, wakeMinute, 1);
  return { version: 1, startedAt, bedAt, wakeAt, reminderAt: bedAt, sleeping: false };
}

export function validNight(night) {
  if (night?.version !== 1 || typeof night.sleeping !== 'boolean') return false;
  const times = [night.startedAt, night.bedAt, night.wakeAt, night.reminderAt];
  return times.every(stamp => Number.isFinite(stamp) && Number.isFinite(+new Date(stamp))) &&
    night.wakeAt > night.bedAt && night.reminderAt >= night.bedAt;
}

export function phaseOf(night, now) {
  if (!night) return 'plan';
  if (now >= night.wakeAt) return 'wake';
  if (night.sleeping) return 'sleep';
  return now >= night.reminderAt ? 'bed' : 'wait';
}

export function respond(night, action, now) {
  const phase = phaseOf(night, now);
  if (action === 'awake' && phase === 'wake') return null;
  // Remaining in a phase never creates another alert. Only an explicit tap rearms it.
  if (phase !== 'bed') return night;
  if (action === 'later') return { ...night, reminderAt: now + TEN_MINUTES };
  if (action === 'in-bed') return { ...night, sleeping: true };
  return night;
}

export function countdown(target, now) {
  const seconds = Math.max(0, Math.ceil((target - now) / 1000));
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map(number => String(number).padStart(2, '0'));
}

const clockFormatter = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });
export const shortTime = stamp => clockFormatter.format(stamp);
