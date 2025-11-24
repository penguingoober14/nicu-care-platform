import { Timestamp } from 'firebase/firestore';
import type {
  FeedingRecord,
  EnhancedCarePlan,
} from '../types';
import type {
  FeedingCompliance,
  NGRemovalTracker,
  FeedOralTracking,
} from '../types/compliance.types';
import { FEEDING_DEFAULTS, NG_REMOVAL_CRITERIA } from '../config/unitDefaults';

/**
 * Feed Compliance Service
 * Pure calculation functions for feed tracking and NG removal readiness
 */
export class FeedComplianceService {
  /**
   * Calculate 24-hour rolling window compliance
   */
  static calculate24HrCompliance(
    babyId: string,
    feeds: FeedingRecord[],
    carePlan: EnhancedCarePlan,
    endTime: Timestamp = Timestamp.now()
  ): FeedingCompliance {
    const windowHours = 24;
    const windowStart = Timestamp.fromMillis(
      endTime.toMillis() - windowHours * 60 * 60 * 1000
    );

    // Filter feeds in window
    const feedsInWindow = feeds.filter(
      (f) =>
        f.babyId === babyId &&
        f.feedTime.toMillis() >= windowStart.toMillis() &&
        f.feedTime.toMillis() <= endTime.toMillis()
    );

    // Calculate scheduled feeds based on care plan
    const feedFrequencyHours = carePlan.feedingPlan?.frequency || 3;
    const totalFeedsScheduled = Math.floor(windowHours / feedFrequencyHours);

    // Calculate oral percentage
    const oralFeeds = feedsInWindow.filter((f) => f.route === 'oral_bottle' || f.route === 'oral_breast');
    const ngFeeds = feedsInWindow.filter((f) => f.route === 'NG_tube' || f.route === 'OG_tube');

    // Volume compliance
    const prescribedVolumePerFeed = carePlan.feedingPlan?.volumePerFeed || 0;
    const totalPrescribed = totalFeedsScheduled * prescribedVolumePerFeed;
    const totalActual = feedsInWindow.reduce((sum, f) => sum + f.volume.actual, 0);

    // Calculate oral volume percentage
    const oralVolume = feedsInWindow
      .filter((f) => f.route === 'oral_bottle' || f.route === 'oral_breast')
      .reduce((sum, f) => sum + f.volume.actual, 0);
    const oralPercentage = totalActual > 0 ? (oralVolume / totalActual) * 100 : 0;

    // Check NG removal readiness
    const ngRemovalReadiness = this.checkNGRemovalReadiness(babyId, feeds, endTime);

    return {
      id: `compliance-${babyId}-${endTime.toMillis()}`,
      babyId,
      calculatedAt: Timestamp.now(),
      windowStart,
      windowEnd: endTime,
      windowHours,
      totalFeedsScheduled,
      totalFeedsCompleted: feedsInWindow.length,
      completionRate: totalFeedsScheduled > 0 ? (feedsInWindow.length / totalFeedsScheduled) * 100 : 0,
      oralFeeds: oralFeeds.length,
      ngFeeds: ngFeeds.length,
      oralPercentage: Math.round(oralPercentage * 10) / 10,
      volumeCompliance: {
        totalPrescribed,
        totalActual,
        complianceRate: totalPrescribed > 0 ? (totalActual / totalPrescribed) * 100 : 0,
      },
      missedFeeds: [], // TODO: Calculate from scheduled vs actual
      ngRemovalReadiness,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  /**
   * Check NG removal readiness
   */
  static checkNGRemovalReadiness(
    babyId: string,
    feeds: FeedingRecord[],
    endTime: Timestamp = Timestamp.now()
  ): FeedingCompliance['ngRemovalReadiness'] {
    const threshold = NG_REMOVAL_CRITERIA.oralPercentageThreshold;
    const requiredHours = NG_REMOVAL_CRITERIA.consecutiveHours;
    const minimumFeeds = NG_REMOVAL_CRITERIA.minimumConsecutiveFeeds;

    // Get recent feeds
    const windowStart = Timestamp.fromMillis(
      endTime.toMillis() - requiredHours * 60 * 60 * 1000
    );
    const recentFeeds = feeds
      .filter(
        (f) =>
          f.babyId === babyId &&
          f.feedTime.toMillis() >= windowStart.toMillis() &&
          f.feedTime.toMillis() <= endTime.toMillis()
      )
      .sort((a, b) => a.feedTime.toMillis() - b.feedTime.toMillis());

    if (recentFeeds.length < minimumFeeds) {
      return {
        oralThresholdMet: false,
        consecutiveHoursMet: false,
        zeroTopUpsMet: false,
        ready: false,
        feedsUntilReady: minimumFeeds - recentFeeds.length,
        currentConsecutiveStreak: 0,
      };
    }

    // Check each feed for oral percentage
    const feedsAboveThreshold = recentFeeds.filter((f) => {
      const oralVolume =
        f.route === 'oral_bottle' || f.route === 'oral_breast' ? f.volume.actual : 0;
      const totalVolume = f.volume.actual;
      const oralPercentage = totalVolume > 0 ? (oralVolume / totalVolume) * 100 : 0;
      return oralPercentage >= threshold;
    });

    const oralThresholdMet = feedsAboveThreshold.length === recentFeeds.length;
    const consecutiveHoursMet = recentFeeds.length >= minimumFeeds;
    const zeroTopUpsMet = !NG_REMOVAL_CRITERIA.allowNGTopUps
      ? recentFeeds.every((f) => f.route !== 'NG_tube' && f.route !== 'OG_tube')
      : true;

    return {
      oralThresholdMet,
      consecutiveHoursMet,
      zeroTopUpsMet,
      ready: oralThresholdMet && consecutiveHoursMet && zeroTopUpsMet,
      feedsUntilReady: oralThresholdMet ? 0 : minimumFeeds - feedsAboveThreshold.length,
      currentConsecutiveStreak: feedsAboveThreshold.length,
    };
  }

  /**
   * Calculate oral percentage for a single feed
   */
  static calculateFeedOralPercentage(feed: FeedingRecord): number {
    const oralVolume =
      feed.route === 'oral_bottle' || feed.route === 'oral_breast' ? feed.volume.actual : 0;
    const totalVolume = feed.volume.actual;
    return totalVolume > 0 ? (oralVolume / totalVolume) * 100 : 0;
  }

  /**
   * Calculate feed volume based on current weight
   */
  static calculateFeedVolume(
    currentWeightGrams: number,
    feedFrequencyHours: number,
    mlPerKgPerDay: number = FEEDING_DEFAULTS.standardVolumeMlPerKgPerDay
  ): number {
    const weightKg = currentWeightGrams / 1000;
    const totalDailyVolume = weightKg * mlPerKgPerDay;
    const feedsPerDay = 24 / feedFrequencyHours;
    return Math.round(totalDailyVolume / feedsPerDay);
  }

  /**
   * Check if today is a weigh day
   */
  static isWeighDay(date: Date = new Date()): boolean {
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    return FEEDING_DEFAULTS.weighDays.includes(dayName as any);
  }

  /**
   * Get next weigh day
   */
  static getNextWeighDay(fromDate: Date = new Date()): Date {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDayIndex = fromDate.getDay();

    // Find next weigh day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (currentDayIndex + i) % 7;
      const nextDayName = daysOfWeek[nextDayIndex];
      if (FEEDING_DEFAULTS.weighDays.includes(nextDayName as any)) {
        const nextDate = new Date(fromDate);
        nextDate.setDate(fromDate.getDate() + i);
        return nextDate;
      }
    }

    return fromDate; // fallback
  }
}
