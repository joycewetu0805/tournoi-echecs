import { addDays, setHours, setMinutes, setSeconds, setMilliseconds, isAfter, isBefore, isWithinInterval, startOfWeek } from 'date-fns';

export function getWeeklySchedule(reference = new Date()) {
  const weekStart = startOfWeek(reference, { weekStartsOn: 1 });
  const registrationOpen = setMilliseconds(setSeconds(setMinutes(setHours(weekStart, 0), 0), 0), 0);
  const registrationClose = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 4), 22), 0), 0), 0);
  const publishAt = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 3), 11), 0), 0), 0);
  const tournamentStart = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 5), 11), 0), 0), 0);
  const pauseStart = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 5), 13), 0), 0), 0);
  const pauseEnd = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 5), 13), 30), 0), 0);
  const tournamentEnd = setMilliseconds(setSeconds(setMinutes(setHours(addDays(weekStart, 5), 16), 0), 0), 0);

  return {
    registrationOpen,
    registrationClose,
    publishAt,
    tournamentStart,
    pauseStart,
    pauseEnd,
    tournamentEnd
  };
}

export function isRegistrationOpen(now = new Date()) {
  const { registrationOpen, registrationClose } = getWeeklySchedule(now);
  return isWithinInterval(now, { start: registrationOpen, end: registrationClose });
}

export function isPublishTime(now = new Date()) {
  const { publishAt } = getWeeklySchedule(now);
  return isAfter(now, publishAt);
}

export function isTournamentLive(now = new Date()) {
  const { tournamentStart, tournamentEnd } = getWeeklySchedule(now);
  return isWithinInterval(now, { start: tournamentStart, end: tournamentEnd });
}

export function isPauseTime(now = new Date()) {
  const { pauseStart, pauseEnd } = getWeeklySchedule(now);
  return isWithinInterval(now, { start: pauseStart, end: pauseEnd });
}

export function assertBeforeRegistrationClose(now = new Date()) {
  const { registrationClose } = getWeeklySchedule(now);
  if (isAfter(now, registrationClose)) {
    throw new Error('REGISTRATION_CLOSED');
  }
}

export function assertTournamentNotEnded(now = new Date()) {
  const { tournamentEnd } = getWeeklySchedule(now);
  if (isAfter(now, tournamentEnd)) {
    throw new Error('TOURNAMENT_ENDED');
  }
}

export function assertAfterRegistrationClose(now = new Date()) {
  const { registrationClose } = getWeeklySchedule(now);
  if (isBefore(now, registrationClose)) {
    throw new Error('REGISTRATION_OPEN');
  }
}
