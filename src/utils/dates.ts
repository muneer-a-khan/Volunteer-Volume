import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfDay,
  endOfDay,
  isSameDay,
  isBefore,
  isAfter,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
} from 'date-fns';

export function formatDate(date: string | Date, formatString: string = 'PPp'): string {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return format(parsedDate, formatString);
}

export function addDaysToDate(date: string | Date, days: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return addDays(parsedDate, days);
}

export function subDaysFromDate(date: string | Date, days: number): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return subDays(parsedDate, days);
}

export function getStartOfDay(date: string | Date): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return startOfDay(parsedDate);
}

export function getEndOfDay(date: string | Date): Date {
  const parsedDate = typeof date === 'string' ? parseISO(date) : date;
  return endOfDay(parsedDate);
}

export function isSameDate(date1: string | Date, date2: string | Date): boolean {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isSameDay(parsedDate1, parsedDate2);
}

export function isDateBefore(date1: string | Date, date2: string | Date): boolean {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isBefore(parsedDate1, parsedDate2);
}

export function isDateAfter(date1: string | Date, date2: string | Date): boolean {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return isAfter(parsedDate1, parsedDate2);
}

export function getMinutesDifference(date1: string | Date, date2: string | Date): number {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInMinutes(parsedDate1, parsedDate2);
}

export function getHoursDifference(date1: string | Date, date2: string | Date): number {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInHours(parsedDate1, parsedDate2);
}

export function getDaysDifference(date1: string | Date, date2: string | Date): number {
  const parsedDate1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const parsedDate2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  return differenceInDays(parsedDate1, parsedDate2);
} 