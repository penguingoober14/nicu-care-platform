import { Timestamp } from 'firebase/firestore';
import type { Episode, EpisodeLog, EpisodeCounterState, EpisodeType } from '../types/episodes.types';
import { EPISODE_THRESHOLDS } from '../config/unitDefaults';

/**
 * Episode Counter Service
 * Manages A/B/D episode tracking and shift summaries
 */
export class EpisodeCounterService {
  /**
   * Create episode log for current shift
   */
  static createShiftLog(
    babyId: string,
    shift: 'day' | 'night' | 'long_day',
    episodes: Episode[],
    shiftStart: Timestamp,
    shiftEnd: Timestamp = Timestamp.now()
  ): EpisodeLog {
    const apnoeas = episodes.filter((e) => e.type === 'apnoea');
    const bradycardias = episodes.filter((e) => e.type === 'bradycardia');
    const desaturations = episodes.filter((e) => e.type === 'desaturation');

    const selfResolvedCount = episodes.filter((e) => e.selfResolved).length;
    const stimulationCount = episodes.filter((e) =>
      e.interventions.some((i) =>
        i.includes('stimulation') || i === 'gentle_stimulation' || i === 'vigorous_stimulation'
      )
    ).length;
    const oxygenIncreaseCount = episodes.filter((e) =>
      e.interventions.includes('increased_oxygen')
    ).length;
    const baggingCount = episodes.filter((e) => e.interventions.includes('bag_mask_ventilation')).length;

    const shiftDurationHours = (shiftEnd.toMillis() - shiftStart.toMillis()) / (1000 * 60 * 60);
    const episodesPerHour = episodes.length / shiftDurationHours;
    const interventionRate =
      episodes.length > 0 ? ((episodes.length - selfResolvedCount) / episodes.length) * 100 : 0;

    const summary = {
      totalEpisodes: episodes.length,
      apnoeaCount: apnoeas.length,
      bradycardiaCount: bradycardias.length,
      desaturationCount: desaturations.length,
      selfResolvedCount,
      stimulationCount,
      oxygenIncreaseCount,
      baggingCount,
      episodesPerHour: Math.round(episodesPerHour * 10) / 10,
      interventionRate: Math.round(interventionRate * 10) / 10,
    };

    // Check clinical significance
    const clinicallySignificant =
      episodes.length > EPISODE_THRESHOLDS.alertThresholds.episodesPerShift ||
      interventionRate > EPISODE_THRESHOLDS.alertThresholds.interventionRate;

    return {
      id: `episode-log-${babyId}-${shiftStart.toMillis()}`,
      babyId,
      shift,
      shiftStart,
      shiftEnd,
      apnoeas,
      bradycardias,
      desaturations,
      summary,
      clinicallySignificant,
      escalatedToMedicalTeam: false,
      flaggedForHandover: clinicallySignificant,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  }

  /**
   * Log a single episode
   */
  static logEpisode(
    babyId: string,
    type: EpisodeType,
    timestamp: Timestamp,
    details: {
      severity?: 'mild' | 'moderate' | 'severe';
      duration?: number;
      lowestValue?: number;
      interventions?: string[];
      selfResolved?: boolean;
      activityAtTime?: string;
      respiratorySupport?: string;
      recordedBy: string;
      notes?: string;
    }
  ): Episode {
    return {
      id: `episode-${babyId}-${timestamp.toMillis()}`,
      timestamp,
      type,
      severity: details.severity || 'moderate',
      duration: details.duration,
      lowestValue: details.lowestValue,
      selfResolved: details.selfResolved ?? true,
      interventionRequired: !details.selfResolved,
      interventions: details.selfResolved ? ['none_self_resolved'] : (details.interventions || []),
      activityAtTime: details.activityAtTime,
      respiratorySupport: details.respiratorySupport,
      recordedBy: details.recordedBy,
    };
  }

  /**
   * Calculate episode counter state
   */
  static calculateCounterState(
    babyId: string,
    shift: 'day' | 'night' | 'long_day',
    episodes: Episode[]
  ): EpisodeCounterState {
    const apnoeas = episodes.filter((e) => e.type === 'apnoea');
    const bradycardias = episodes.filter((e) => e.type === 'bradycardia');
    const desaturations = episodes.filter((e) => e.type === 'desaturation');

    const recentEpisodes = episodes
      .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
      .slice(0, 5);

    const selfResolvedCount = episodes.filter((e) => e.selfResolved).length;
    const selfResolvedPercentage =
      episodes.length > 0 ? (selfResolvedCount / episodes.length) * 100 : 100;

    return {
      babyId,
      currentShift: shift,
      apnoeaCount: apnoeas.length,
      bradycardiaCount: bradycardias.length,
      desaturationCount: desaturations.length,
      lastApnoea: apnoeas[apnoeas.length - 1]?.timestamp,
      lastBradycardia: bradycardias[bradycardias.length - 1]?.timestamp,
      lastDesaturation: desaturations[desaturations.length - 1]?.timestamp,
      recentEpisodes,
      selfResolvedPercentage: Math.round(selfResolvedPercentage),
      rateIncreasing: false, // TODO: Compare to previous shift
      requiresReview: episodes.length > EPISODE_THRESHOLDS.alertThresholds.episodesPerShift,
    };
  }

  /**
   * Check if episode rate is increasing
   */
  static isRateIncreasing(currentLog: EpisodeLog, previousLog?: EpisodeLog): boolean {
    if (!previousLog) return false;

    const currentRate = currentLog.summary.episodesPerHour;
    const previousRate = previousLog.summary.episodesPerHour;

    if (previousRate === 0) return currentRate > 0;

    const increasePercentage = ((currentRate - previousRate) / previousRate) * 100;
    return increasePercentage > EPISODE_THRESHOLDS.alertThresholds.increaseTrend;
  }

  /**
   * Calculate episode-free days
   */
  static calculateEpisodeFreeDays(logs: EpisodeLog[]): number {
    if (logs.length === 0) return 0;

    const sortedLogs = logs.sort((a, b) => b.shiftStart.toMillis() - a.shiftStart.toMillis());

    let consecutiveDays = 0;
    let currentDate: Date | null = null;

    for (const log of sortedLogs) {
      const logDate = log.shiftStart.toDate();
      logDate.setHours(0, 0, 0, 0);

      // Check if this is a new day
      if (!currentDate) {
        currentDate = logDate;
      } else {
        const dayDiff = Math.floor(
          (currentDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (dayDiff > 1) {
          // Gap in logs
          break;
        }
        currentDate = logDate;
      }

      // Check if this shift had episodes
      if (log.summary.totalEpisodes > 0) {
        break;
      }

      // Count shifts without episodes (2 shifts = 1 day)
      consecutiveDays += 0.5;
    }

    return Math.floor(consecutiveDays);
  }

  /**
   * Check discharge criteria for episodes
   */
  static meetsDischargeCriteria(logs: EpisodeLog[]): boolean {
    const episodeFreeDays = this.calculateEpisodeFreeDays(logs);
    return episodeFreeDays >= EPISODE_THRESHOLDS.dischargeCriteria.episodeFreeDays;
  }
}
