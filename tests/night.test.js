import assert from 'node:assert/strict';
import test from 'node:test';
import { planNight, validNight, phaseOf, respond, countdown, clockTime, TEN_MINUTES } from '../src/night.js';

const local = (day, hour, minute, second = 0) => +new Date(2026, 10, day, hour, minute, second);
const example = () => planNight('23:00', '07:00', local(24, 22, 40));

test('an overnight plan uses tomorrow’s local wake-up time', () => {
  const n = example();
  assert.equal(n.bedAt, local(24, 23, 0));
  assert.equal(n.wakeAt, local(25, 7, 0));
  assert.equal(phaseOf(n, n.bedAt - 1), 'wait');
  assert.equal(phaseOf(n, n.bedAt), 'bed');
});

test('one snooze creates exactly one reminder ten minutes from the tap', () => {
  const n = example();
  const tap = n.bedAt + 4200;
  const later = respond(n, 'later', tap);
  assert.equal(later.reminderAt, tap + TEN_MINUTES);
  assert.equal(later.wakeAt, n.wakeAt);
  assert.equal(respond(later, 'later', tap + 1), later);
  assert.equal(phaseOf(later, later.reminderAt - 1), 'wait');
  assert.equal(phaseOf(later, later.reminderAt), 'bed');
  assert.equal(phaseOf(later, later.reminderAt + 60000), 'bed');
  const again = respond(later, 'later', later.reminderAt);
  assert.equal(again.reminderAt, tap + 2 * TEN_MINUTES);
});

test('a restored session resumes its one deadline and finishes the loop', () => {
  const n = example();
  const snoozed = respond(n, 'later', n.bedAt);
  const restored = JSON.parse(JSON.stringify(snoozed));
  assert.ok(validNight(restored));
  assert.equal(phaseOf(restored, n.bedAt + 5000), 'wait');
  const asleep = respond(restored, 'in-bed', restored.reminderAt);
  assert.equal(phaseOf(asleep, restored.reminderAt), 'sleep');
  assert.equal(respond(asleep, 'later', restored.reminderAt + 1), asleep);
  assert.equal(phaseOf(asleep, n.wakeAt), 'wake');
  assert.equal(respond(asleep, 'awake', n.wakeAt), null);
  assert.equal(phaseOf(null, n.wakeAt), 'plan');
});

test('a postponed bedtime cannot move a wake alarm that is already due', () => {
  const n = planNight('06:58', '07:00', local(24, 6, 55));
  const later = respond(n, 'later', n.bedAt);
  assert.equal(phaseOf(later, n.wakeAt), 'wake');
  assert.equal(phaseOf(n, n.wakeAt + 1000), 'wake');
});

test('the current minute rings now, an earlier bedtime rolls to tomorrow', () => {
  assert.equal(phaseOf(planNight('23:00', '07:00', local(24,23,0,40)), local(24,23,0,40)), 'bed');
  assert.equal(planNight('22:59','07:00',local(24,23,0)).bedAt, local(25,22,59));
  assert.equal(planNight('07:00','07:00',local(24,6,0)).wakeAt, local(25,7,0));
});

test('countdowns round up, stop at zero and recover after a sleeping tab', () => {
  assert.deepEqual(countdown(3661000, 0), ['01','01','01']);
  assert.deepEqual(countdown(500, 499), ['00','00','01']);
  assert.deepEqual(countdown(500, 1500), ['00','00','00']);
});

test('invalid settings and damaged stored sessions are rejected', () => {
  assert.throws(() => planNight('25:30', '07:00', Date.now()));
  assert.throws(() => planNight('23:00', '', Date.now()));
  assert.equal(validNight({}), false);
  assert.equal(validNight({ ...example(), wakeAt:NaN }), false);
});

test('editing or refreshing a class demo preserves the same clock', () => {
  const real = local(24, 13, 0);
  const n = planNight('23:00', '23:25', real, true);
  assert.equal(phaseOf(n, clockTime(n, real + 3999, true)), 'wait');
  assert.equal(phaseOf(n, clockTime(n, real + 4000, true)), 'bed');
  const edited = planNight('23:04', '23:25', real + 2000, true, n.startedAt);
  assert.equal(clockTime(edited,real+2000,true),local(24,22,58));
});
