import { Timestamp } from 'firebase/firestore';
import type { PeripheralCentralLineRecord, NasoOrogastricTubeInsertion } from '../types';
import type { Alert, LineWithAlerts, TubeWithAlerts } from '../types/alerts.types';
import { LINE_ALERT_THRESHOLDS, TUBE_ALERT_THRESHOLDS } from '../config/unitDefaults';

export class LineAlertService {
  static calculateLineAlerts(line: PeripheralCentralLineRecord): LineWithAlerts {
    const now = Timestamp.now();
    const hoursInSitu = (now.toMillis() - line.insertionDate.toMillis()) / (1000 * 60 * 60);
    const daysInSitu = hoursInSitu / 24;

    const threshold = LINE_ALERT_THRESHOLDS.find((t) => t.lineType === line.lineType);
    if (!threshold) {
      return {
        lineId: line.id,
        babyId: line.babyId,
        lineType: line.lineType,
        insertionSite: line.insertionSite,
        insertionDate: line.insertionDate,
        isActive: line.isActive,
        daysInSitu: Math.floor(daysInSitu),
        hoursInSitu: Math.floor(hoursInSitu),
        alertLevel: 'none',
        alerts: [],
      };
    }

    const alerts: Alert[] = [];
    let alertLevel: 'none' | 'info' | 'warning' | 'critical' = 'none';

    // Check duration thresholds
    const warningHours = threshold.warningThreshold.unit === 'hours'
      ? threshold.warningThreshold.value
      : threshold.warningThreshold.value * 24;
    const criticalHours = threshold.criticalThreshold.unit === 'hours'
      ? threshold.criticalThreshold.value
      : threshold.criticalThreshold.value * 24;

    if (hoursInSitu >= criticalHours) {
      alertLevel = 'critical';
      alerts.push({
        id: `line-duration-critical-${line.id}`,
        babyId: line.babyId,
        type: 'line_duration',
        severity: 'critical',
        status: 'active',
        title: `${line.lineType} Duration Critical`,
        message: `Line has been in situ for ${Math.floor(daysInSitu)} days. Consider removal.`,
        sourceType: 'line',
        sourceId: line.id,
        createdAt: now,
        actionRequired: true,
        actionType: 'check_line',
      });
    } else if (hoursInSitu >= warningHours) {
      alertLevel = 'warning';
      alerts.push({
        id: `line-duration-warning-${line.id}`,
        babyId: line.babyId,
        type: 'line_duration',
        severity: 'warning',
        status: 'active',
        title: `${line.lineType} Duration Warning`,
        message: `Line has been in situ for ${Math.floor(daysInSitu)} days. Monitor closely.`,
        sourceType: 'line',
        sourceId: line.id,
        createdAt: now,
        actionRequired: false,
      });
    }

    return {
      lineId: line.id,
      babyId: line.babyId,
      lineType: line.lineType,
      insertionSite: line.insertionSite,
      insertionDate: line.insertionDate,
      isActive: line.isActive,
      daysInSitu: Math.floor(daysInSitu),
      hoursInSitu: Math.floor(hoursInSitu),
      alertLevel,
      alerts,
    };
  }

  static calculateTubeAlerts(tube: NasoOrogastricTubeInsertion): TubeWithAlerts {
    const now = Timestamp.now();
    const hoursInSitu = (now.toMillis() - tube.insertionDateTime.toMillis()) / (1000 * 60 * 60);
    const daysInSitu = hoursInSitu / 24;

    const threshold = TUBE_ALERT_THRESHOLDS.find((t) => t.tubeType === tube.tubeType);
    const alerts: Alert[] = [];
    let alertLevel: 'none' | 'info' | 'warning' | 'critical' = 'none';
    let phStatus: 'safe' | 'warning' | 'critical' | 'unknown' = 'unknown';

    // Check pH if available
    const lastCheck = tube.tubeChecks[tube.tubeChecks.length - 1];
    if (lastCheck?.pH && threshold) {
      if (lastCheck.pH >= threshold.phThresholds.critical) {
        phStatus = 'critical';
        alertLevel = 'critical';
        alerts.push({
          id: `tube-ph-critical-${tube.id}`,
          babyId: tube.babyId,
          type: 'tube_ph_high',
          severity: 'critical',
          status: 'active',
          title: 'NG Tube pH Critical',
          message: `pH is ${lastCheck.pH}. DO NOT FEED. Recheck position immediately.`,
          sourceType: 'tube',
          sourceId: tube.id,
          createdAt: now,
          actionRequired: true,
          actionType: 'check_line',
        });
      } else if (lastCheck.pH >= threshold.phThresholds.warning) {
        phStatus = 'warning';
        if (alertLevel !== 'critical') alertLevel = 'warning';
        alerts.push({
          id: `tube-ph-warning-${tube.id}`,
          babyId: tube.babyId,
          type: 'tube_ph_high',
          severity: 'warning',
          status: 'active',
          title: 'NG Tube pH High',
          message: `pH is ${lastCheck.pH}. Recheck before next feed.`,
          sourceType: 'tube',
          sourceId: tube.id,
          createdAt: now,
          actionRequired: true,
          actionType: 'check_line',
        });
      } else {
        phStatus = 'safe';
      }
    }

    return {
      tubeId: tube.id,
      babyId: tube.babyId,
      tubeType: tube.tubeType,
      insertionDate: tube.insertionDateTime,
      isActive: tube.isActive,
      daysInSitu: Math.floor(daysInSitu),
      hoursInSitu: Math.floor(hoursInSitu),
      lastPH: lastCheck?.pH,
      lastPHCheck: lastCheck?.date,
      phStatus,
      alertLevel,
      alerts,
    };
  }

  static getAllActiveAlertsForBaby(
    babyId: string,
    lines: PeripheralCentralLineRecord[],
    tubes: NasoOrogastricTubeInsertion[]
  ): Alert[] {
    const activeLines = lines.filter((l) => l.babyId === babyId && l.isActive);
    const activeTubes = tubes.filter((t) => t.babyId === babyId && t.isActive);

    const lineAlerts = activeLines.flatMap((line) => this.calculateLineAlerts(line).alerts);
    const tubeAlerts = activeTubes.flatMap((tube) => this.calculateTubeAlerts(tube).alerts);

    return [...lineAlerts, ...tubeAlerts].sort((a, b) => {
      const severityOrder = { critical: 0, warning: 1, info: 2 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    });
  }
}
