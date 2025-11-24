import { Timestamp } from 'firebase/firestore';
import type {
  Baby,
  FeedingRecord,
  VitalSignsRecord,
  MedicationAdministration,
  Episode,
  RespiratorySupport,
  PeripheralCentralLineRecord,
  NasoOrogastricTubeInsertion,
} from '../types';
import { FeedComplianceService } from './FeedComplianceService';
import { EpisodeCounterService } from './EpisodeCounterService';
import { LineAlertService } from './LineAlertService';

export interface ShiftTimes {
  start: Timestamp;
  end: Timestamp;
  type: 'day' | 'night';
}

export interface HandoverSummary {
  baby: Baby;
  shift: ShiftTimes;
  generatedAt: Timestamp;
  generatedBy: string;

  // Clinical summary
  vitalSigns: {
    latestHR?: number;
    latestRR?: number;
    latestTemp?: number;
    latestSpO2?: number;
    abnormalCount: number;
    trends: string[];
  };

  feeding: {
    totalFeeds: number;
    feedsCompleted: number;
    completionRate: number;
    oralPercentage: number;
    toleranceIssues: string[];
    ngRemovalReadiness?: boolean;
  };

  medications: {
    totalDue: number;
    given: number;
    missed: number;
    missedList: string[];
  };

  respiratory: {
    currentSupport?: string;
    changes: number;
    episodeSummary: {
      apnoeas: number;
      bradycardias: number;
      desaturations: number;
      interventionRate: number;
    };
  };

  linesAndTubes: {
    activeLines: Array<{
      type: string;
      insertionDate: Timestamp;
      daysInSitu: number;
      alertLevel: 'none' | 'info' | 'warning' | 'critical';
    }>;
    activeTubes: Array<{
      type: string;
      insertionDate: Timestamp;
      lastpH?: number;
      phStatus: 'safe' | 'warning' | 'critical';
    }>;
    alerts: string[];
  };

  problems: string[];
  tasks: string[];
  notes: string;
}

export class HandoverService {
  /**
   * Calculate shift start and end times based on current time
   * Day shift: 08:00 - 20:00 (8am - 8pm)
   * Night shift: 20:00 - 08:00 (8pm - 8am)
   */
  static getCurrentShiftTimes(now: Date = new Date()): ShiftTimes {
    const hour = now.getHours();
    const isDayShift = hour >= 8 && hour < 20;

    const shiftStart = new Date(now);
    const shiftEnd = new Date(now);

    if (isDayShift) {
      // Day shift: 08:00 - 20:00
      shiftStart.setHours(8, 0, 0, 0);
      shiftEnd.setHours(20, 0, 0, 0);
    } else {
      // Night shift: 20:00 - 08:00
      if (hour >= 20) {
        // Currently in night shift (8pm to midnight)
        shiftStart.setHours(20, 0, 0, 0);
        shiftEnd.setDate(shiftEnd.getDate() + 1);
        shiftEnd.setHours(8, 0, 0, 0);
      } else {
        // Currently in night shift (midnight to 8am)
        shiftStart.setDate(shiftStart.getDate() - 1);
        shiftStart.setHours(20, 0, 0, 0);
        shiftEnd.setHours(8, 0, 0, 0);
      }
    }

    return {
      start: Timestamp.fromDate(shiftStart),
      end: Timestamp.fromDate(shiftEnd),
      type: isDayShift ? 'day' : 'night',
    };
  }

  /**
   * Get shift times for a specific shift type on a given date
   */
  static getShiftTimes(date: Date, shiftType: 'day' | 'night'): ShiftTimes {
    const shiftStart = new Date(date);
    const shiftEnd = new Date(date);

    if (shiftType === 'day') {
      shiftStart.setHours(8, 0, 0, 0);
      shiftEnd.setHours(20, 0, 0, 0);
    } else {
      shiftStart.setHours(20, 0, 0, 0);
      shiftEnd.setDate(shiftEnd.getDate() + 1);
      shiftEnd.setHours(8, 0, 0, 0);
    }

    return {
      start: Timestamp.fromDate(shiftStart),
      end: Timestamp.fromDate(shiftEnd),
      type: shiftType,
    };
  }

  /**
   * Generate comprehensive handover summary for a baby
   */
  static generateHandover(
    baby: Baby,
    feeds: FeedingRecord[],
    vitals: VitalSignsRecord[],
    meds: MedicationAdministration[],
    episodes: Episode[],
    respiratory: RespiratorySupport[],
    lines: PeripheralCentralLineRecord[],
    tubes: NasoOrogastricTubeInsertion[],
    shift: ShiftTimes,
    generatedBy: string,
    problems: string[] = [],
    tasks: string[] = [],
    notes: string = ''
  ): HandoverSummary {
    // Filter data to current shift
    const shiftFeeds = feeds.filter(
      (f) => f.feedTime.toMillis() >= shift.start.toMillis() && f.feedTime.toMillis() <= shift.end.toMillis()
    );

    const shiftVitals = vitals.filter(
      (v) => v.timestamp.toMillis() >= shift.start.toMillis() && v.timestamp.toMillis() <= shift.end.toMillis()
    );

    const shiftMeds = meds.filter(
      (m) => m.scheduledTime.toMillis() >= shift.start.toMillis() && m.scheduledTime.toMillis() <= shift.end.toMillis()
    );

    const shiftEpisodes = episodes.filter(
      (e) => e.timestamp.toMillis() >= shift.start.toMillis() && e.timestamp.toMillis() <= shift.end.toMillis()
    );

    const shiftRespiratory = respiratory.filter(
      (r) => r.startTime.toMillis() >= shift.start.toMillis() && r.startTime.toMillis() <= shift.end.toMillis()
    );

    // Vital signs summary
    const latestVital = shiftVitals[shiftVitals.length - 1];
    const abnormalVitals = shiftVitals.filter(
      (v) =>
        (v.heartRate && (v.heartRate < 100 || v.heartRate > 180)) ||
        (v.respiratoryRate && (v.respiratoryRate < 30 || v.respiratoryRate > 70)) ||
        (v.temperature && (v.temperature < 36.5 || v.temperature > 37.5)) ||
        (v.oxygenSaturation && v.oxygenSaturation < 90)
    );

    const vitalSigns = {
      latestHR: latestVital?.heartRate,
      latestRR: latestVital?.respiratoryRate,
      latestTemp: latestVital?.temperature,
      latestSpO2: latestVital?.oxygenSaturation,
      abnormalCount: abnormalVitals.length,
      trends: [], // TODO: Calculate trends (increasing/decreasing)
    };

    // Feeding summary
    const feedingCompliance = FeedComplianceService.calculate24HrCompliance(baby.id, feeds, {} as any);
    const toleranceIssues: string[] = [];
    shiftFeeds.forEach((feed) => {
      if (feed.tolerance === 'poor') toleranceIssues.push(`Poor tolerance at ${feed.feedTime.toDate().toLocaleTimeString()}`);
      if (feed.vomiting?.occurred) toleranceIssues.push(`Vomiting at ${feed.feedTime.toDate().toLocaleTimeString()}`);
      if (feed.residual && feed.residual > 5) toleranceIssues.push(`Residual ${feed.residual}ml at ${feed.feedTime.toDate().toLocaleTimeString()}`);
    });

    const feeding = {
      totalFeeds: shiftFeeds.length,
      feedsCompleted: shiftFeeds.filter((f) => f.volume.actual >= f.volume.prescribed * 0.9).length,
      completionRate: shiftFeeds.length > 0
        ? (shiftFeeds.filter((f) => f.volume.actual >= f.volume.prescribed * 0.9).length / shiftFeeds.length) * 100
        : 0,
      oralPercentage: feedingCompliance.oralPercentage,
      toleranceIssues,
      ngRemovalReadiness: feedingCompliance.ngRemovalReadiness?.ready,
    };

    // Medications summary
    const givenMeds = shiftMeds.filter((m) => m.status === 'given');
    const missedMeds = shiftMeds.filter((m) => m.status === 'pending' && m.scheduledTime.toMillis() < Date.now());
    const medications = {
      totalDue: shiftMeds.length,
      given: givenMeds.length,
      missed: missedMeds.length,
      missedList: missedMeds.map((m) => `${m.medicationName} (${m.scheduledTime.toDate().toLocaleTimeString()})`),
    };

    // Respiratory & episodes
    const latestResp = shiftRespiratory[shiftRespiratory.length - 1];
    const episodeLog = EpisodeCounterService.createShiftLog(
      baby.id,
      shift.type === 'day' ? 'day' : 'night',
      shiftEpisodes,
      shift.start,
      shift.end
    );

    const respiratory = {
      currentSupport: latestResp?.mode,
      changes: shiftRespiratory.length,
      episodeSummary: {
        apnoeas: episodeLog.apnoeas.length,
        bradycardias: episodeLog.bradycardias.length,
        desaturations: episodeLog.desaturations.length,
        interventionRate: episodeLog.summary.interventionRate,
      },
    };

    // Lines & tubes
    const activeLines = lines
      .filter((line) => !line.removalDate)
      .map((line) => {
        const lineWithAlerts = LineAlertService.calculateLineAlerts(line);
        return {
          type: line.lineType,
          insertionDate: line.insertionDate,
          daysInSitu: lineWithAlerts.daysInSitu,
          alertLevel: lineWithAlerts.alertLevel,
        };
      });

    const activeTubes = tubes
      .filter((tube) => !tube.removalDate)
      .map((tube) => {
        const tubeWithAlerts = LineAlertService.calculateTubeAlerts(tube);
        const lastCheck = tube.tubeChecks[tube.tubeChecks.length - 1];
        return {
          type: tube.tubeType,
          insertionDate: tube.insertionDate,
          lastpH: lastCheck?.pH,
          phStatus: tubeWithAlerts.phStatus,
        };
      });

    const allAlerts = LineAlertService.getAllActiveAlertsForBaby(baby.id, lines, tubes);
    const linesAndTubes = {
      activeLines,
      activeTubes,
      alerts: allAlerts.filter((a) => a.severity === 'warning' || a.severity === 'critical').map((a) => a.message),
    };

    return {
      baby,
      shift,
      generatedAt: Timestamp.now(),
      generatedBy,
      vitalSigns,
      feeding,
      medications,
      respiratory,
      linesAndTubes,
      problems,
      tasks,
      notes,
    };
  }

  /**
   * Format handover summary as plain text for printing/export
   */
  static formatHandoverText(handover: HandoverSummary): string {
    const shiftType = handover.shift.type === 'day' ? 'Day' : 'Night';
    const shiftDate = handover.shift.start.toDate().toLocaleDateString();

    let text = `NICU HANDOVER SUMMARY\n`;
    text += `====================\n\n`;
    text += `Patient: ${handover.baby.firstName} ${handover.baby.lastName}\n`;
    text += `Hospital Number: ${handover.baby.hospitalNumber}\n`;
    text += `Bed: ${handover.baby.bedNumber}\n`;
    text += `Shift: ${shiftType} - ${shiftDate}\n`;
    text += `Generated: ${handover.generatedAt.toDate().toLocaleString()}\n\n`;

    // Problems
    if (handover.problems.length > 0) {
      text += `PROBLEMS:\n`;
      handover.problems.forEach((p, i) => {
        text += `  ${i + 1}. ${p}\n`;
      });
      text += `\n`;
    }

    // Vital Signs
    text += `VITAL SIGNS:\n`;
    text += `  Latest: HR ${handover.vitalSigns.latestHR || 'N/A'}, `;
    text += `RR ${handover.vitalSigns.latestRR || 'N/A'}, `;
    text += `Temp ${handover.vitalSigns.latestTemp || 'N/A'}°C, `;
    text += `SpO2 ${handover.vitalSigns.latestSpO2 || 'N/A'}%\n`;
    text += `  Abnormal readings: ${handover.vitalSigns.abnormalCount}\n\n`;

    // Feeding
    text += `FEEDING:\n`;
    text += `  Feeds this shift: ${handover.feeding.feedsCompleted}/${handover.feeding.totalFeeds} (${handover.feeding.completionRate.toFixed(0)}%)\n`;
    text += `  Oral intake: ${handover.feeding.oralPercentage.toFixed(1)}%\n`;
    if (handover.feeding.ngRemovalReadiness) {
      text += `  ⚠ NG TUBE READY FOR REMOVAL\n`;
    }
    if (handover.feeding.toleranceIssues.length > 0) {
      text += `  Tolerance issues:\n`;
      handover.feeding.toleranceIssues.forEach((issue) => {
        text += `    - ${issue}\n`;
      });
    }
    text += `\n`;

    // Medications
    text += `MEDICATIONS:\n`;
    text += `  Given: ${handover.medications.given}/${handover.medications.totalDue}\n`;
    if (handover.medications.missed > 0) {
      text += `  ⚠ MISSED MEDICATIONS:\n`;
      handover.medications.missedList.forEach((med) => {
        text += `    - ${med}\n`;
      });
    }
    text += `\n`;

    // Respiratory
    text += `RESPIRATORY:\n`;
    text += `  Current support: ${handover.respiratory.currentSupport || 'Room air'}\n`;
    text += `  A/B/D episodes: ${handover.respiratory.episodeSummary.apnoeas}A / `;
    text += `${handover.respiratory.episodeSummary.bradycardias}B / `;
    text += `${handover.respiratory.episodeSummary.desaturations}D\n`;
    text += `  Intervention rate: ${handover.respiratory.episodeSummary.interventionRate.toFixed(0)}%\n\n`;

    // Lines & Tubes
    text += `LINES & TUBES:\n`;
    if (handover.linesAndTubes.activeLines.length > 0) {
      text += `  Lines:\n`;
      handover.linesAndTubes.activeLines.forEach((line) => {
        text += `    - ${line.type}: ${line.daysInSitu} days`;
        if (line.alertLevel !== 'none') {
          text += ` [${line.alertLevel.toUpperCase()}]`;
        }
        text += `\n`;
      });
    }
    if (handover.linesAndTubes.activeTubes.length > 0) {
      text += `  Tubes:\n`;
      handover.linesAndTubes.activeTubes.forEach((tube) => {
        text += `    - ${tube.type}: pH ${tube.lastpH || 'N/A'}`;
        if (tube.phStatus !== 'safe') {
          text += ` [${tube.phStatus.toUpperCase()}]`;
        }
        text += `\n`;
      });
    }
    if (handover.linesAndTubes.alerts.length > 0) {
      text += `  ⚠ ALERTS:\n`;
      handover.linesAndTubes.alerts.forEach((alert) => {
        text += `    - ${alert}\n`;
      });
    }
    text += `\n`;

    // Tasks
    if (handover.tasks.length > 0) {
      text += `TASKS FOR NEXT SHIFT:\n`;
      handover.tasks.forEach((task, i) => {
        text += `  ${i + 1}. ${task}\n`;
      });
      text += `\n`;
    }

    // Notes
    if (handover.notes) {
      text += `ADDITIONAL NOTES:\n`;
      text += `${handover.notes}\n\n`;
    }

    text += `Generated by: ${handover.generatedBy}\n`;

    return text;
  }
}
