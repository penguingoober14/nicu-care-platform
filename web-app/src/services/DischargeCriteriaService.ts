import { Timestamp } from 'firebase/firestore';
import type { Baby, VitalSign } from '../types';
import type { DischargeCriteria, DischargeReadinessSummary } from '../types/discharge-criteria.types';
import type { FeedingCompliance } from '../types/compliance.types';
import type { EpisodeLog } from '../types/episodes.types';
import { DISCHARGE_CRITERIA } from '../config/unitDefaults';
import { EpisodeCounterService } from './EpisodeCounterService';

export class DischargeCriteriaService {
  static assessReadiness(
    baby: Baby,
    currentWeight: number,
    feedCompliance: FeedingCompliance,
    episodeLogs: EpisodeLog[],
    currentRespiratorySupport?: string
  ): DischargeCriteria {
    const now = Timestamp.now();

    // Gate 1: Weight
    const weightMet = currentWeight >= DISCHARGE_CRITERIA.weightGate.minimumWeightGrams;

    // Gate 2: Respiratory
    const episodeFreeDays = EpisodeCounterService.calculateEpisodeFreeDays(episodeLogs);
    const respiratoryMet =
      !currentRespiratorySupport &&
      episodeFreeDays >= DISCHARGE_CRITERIA.respiratoryGate.episodeFreeDays;

    // Gate 3: Feeding
    const feedingMet =
      feedCompliance.oralPercentage >= DISCHARGE_CRITERIA.feedingGate.oralPercentageTarget &&
      feedCompliance.ngRemovalReadiness?.ready === true;

    const gatesMet = [weightMet, respiratoryMet, feedingMet].filter(Boolean).length;
    const readinessScore = (gatesMet / 3) * 100;

    let overallStatus: DischargeCriteria['overallStatus'] = 'not_ready';
    if (gatesMet === 3) overallStatus = 'ready';
    else if (gatesMet >= 2) overallStatus = 'approaching';

    return {
      id: `discharge-criteria-${baby.id}-${now.toMillis()}`,
      babyId: baby.id,
      assessmentDate: now,
      assessedBy: 'system',
      overallStatus,
      readinessScore: Math.round(readinessScore),
      weightCriterion: {
        required: true,
        met: weightMet,
        currentWeight,
        targetWeight: DISCHARGE_CRITERIA.weightGate.minimumWeightGrams,
        lastWeighed: now,
        gainTrend: 'adequate',
      },
      respiratoryCriterion: {
        required: true,
        met: respiratoryMet,
        noRespiratorySupport: !currentRespiratorySupport,
        currentSupport: currentRespiratorySupport,
        episodeFreeForDays: episodeFreeDays,
        requiredEpisodeFreeDays: DISCHARGE_CRITERIA.respiratoryGate.episodeFreeDays,
        episodeRate: 0,
        noRespiratoryMeds: true,
      },
      feedingCriterion: {
        required: true,
        met: feedingMet,
        fullOralFeeds: feedCompliance.oralPercentage === 100,
        oralPercentage: feedCompliance.oralPercentage,
        targetOralPercentage: 100,
        oralFeedsConsecutiveDays: 2,
        requiredConsecutiveDays: 2,
        ngTubeRemoved: feedCompliance.ngRemovalReadiness?.ready || false,
        establishedMethod: 'mixed',
        feedingDuration: { average: 20, acceptable: true },
      },
      dischargeDateConfidence: 'low',
      currentBlockers: [],
      actionsPending: [],
      createdAt: now,
      updatedAt: now,
    };
  }

  static generateSummary(criteria: DischargeCriteria): DischargeReadinessSummary {
    const gatesMet = [
      criteria.weightCriterion.met,
      criteria.respiratoryCriterion.met,
      criteria.feedingCriterion.met,
    ].filter(Boolean).length;

    let statusColor: 'red' | 'amber' | 'green' = 'red';
    if (gatesMet === 3) statusColor = 'green';
    else if (gatesMet >= 2) statusColor = 'amber';

    return {
      babyId: criteria.babyId,
      lastUpdated: criteria.assessmentDate,
      gatesMet,
      totalGates: 3,
      progressPercentage: criteria.readinessScore,
      status: criteria.overallStatus,
      statusColor,
      nextMilestone: {
        criterion: 'weight',
        description: 'Reach 1.8kg',
        estimatedDays: 5,
      },
      gates: {
        weight: {
          met: criteria.weightCriterion.met,
          detail: `${criteria.weightCriterion.currentWeight}g / ${criteria.weightCriterion.targetWeight}g`,
        },
        respiratory: {
          met: criteria.respiratoryCriterion.met,
          detail: `${criteria.respiratoryCriterion.episodeFreeForDays} / ${criteria.respiratoryCriterion.requiredEpisodeFreeDays} days`,
        },
        feeding: {
          met: criteria.feedingCriterion.met,
          detail: `${criteria.feedingCriterion.oralPercentage}% oral`,
        },
      },
      estimatedDischargeDate: criteria.estimatedDischargeDate,
      dischargeConfidence: criteria.dischargeDateConfidence,
    };
  }
}
