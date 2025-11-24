import { Timestamp } from 'firebase/firestore';

/**
 * Helper functions to generate timestamps
 */
export const now = () => Timestamp.now();

export const daysAgo = (days: number) =>
  Timestamp.fromDate(new Date(Date.now() - days * 24 * 60 * 60 * 1000));

export const hoursAgo = (hours: number) =>
  Timestamp.fromDate(new Date(Date.now() - hours * 60 * 60 * 1000));

/**
 * Get today at specific time
 */
export const todayAt = (hour: number, minute = 0) => {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return Timestamp.fromDate(date);
};

/**
 * Create timestamp from date string
 */
export const fromDateString = (dateString: string) =>
  Timestamp.fromDate(new Date(dateString));
