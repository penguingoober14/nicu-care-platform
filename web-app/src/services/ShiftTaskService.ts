import { Timestamp } from 'firebase/firestore';
import type { Baby, MedicationPrescription, EnhancedCarePlan } from '../types';
import type {
  NursingTask,
  TaskCompletionSummary,
  ShiftHandoverReport
} from '../types/tasks';
import {
  generateAllTasks,
  generateFeedingTasks,
  generateMedicationTasks,
  generateVitalSignsTasks,
  generateProcedureTasks
} from '../utils/taskGenerator';
import { HandoverService, ShiftTimes } from './HandoverService';
import { SCREENING_SETTINGS, LINE_ALERT_THRESHOLDS, TUBE_ALERT_THRESHOLDS } from '../config/unitDefaults';

// ============================================================================
// TYPES
// ============================================================================

export type ShiftType = 'day' | 'night' | 'long_day';
export type RoleType = 'nurse' | 'doctor' | 'anp' | 'unit_manager' | 'hca';

export interface ShiftDefinition {
  type: ShiftType;
  startHour: number;
  endHour: number;
  durationHours: number;
}

export interface TaskReminder {
  id: string;
  taskId: string;
  babyId: string;
  reminderType: 'upcoming' | 'due_now' | 'overdue' | 'window_closing';
  scheduledFor: Timestamp;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  dismissed: boolean;
  dismissedAt?: Timestamp;
  dismissedBy?: string;
}

export interface ShiftTaskBundle {
  shiftId: string;
  shift: ShiftTimes;
  generatedAt: Timestamp;
  generatedBy: string;

  // Tasks grouped by baby
  tasksByBaby: Map<string, NursingTask[]>;

  // All tasks sorted chronologically
  allTasks: NursingTask[];

  // Reminders
  reminders: TaskReminder[];

  // Summary stats
  stats: {
    totalTasks: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
    byBaby: Record<string, number>;
  };
}

export interface ScreeningReminder {
  id: string;
  babyId: string;
  screeningType: 'nbbs' | 'nbbs_day28' | 'rop' | 'cranial_uss' | 'hearing' | 'infection_swabs';
  dueDate: Timestamp;
  description: string;
  status: 'upcoming' | 'due' | 'overdue' | 'completed';
  escalated: boolean;
}

export interface ShiftConfig {
  shifts: {
    day: ShiftDefinition;
    night: ShiftDefinition;
    long_day?: ShiftDefinition;
  };
  reminderLeadTimes: {
    routine: number;  // minutes before task
    important: number;
    urgent: number;
    critical: number;
  };
  taskWindowDefaults: {
    feeding: number;     // minutes either side
    medication: number;
    vital_signs: number;
    procedure: number;
  };
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

export const DEFAULT_SHIFT_CONFIG: ShiftConfig = {
  shifts: {
    day: { type: 'day', startHour: 8, endHour: 20, durationHours: 12 },
    night: { type: 'night', startHour: 20, endHour: 8, durationHours: 12 },
    long_day: { type: 'long_day', startHour: 7, endHour: 21, durationHours: 14 },
  },
  reminderLeadTimes: {
    routine: 15,     // 15 mins before
    important: 30,   // 30 mins before
    urgent: 45,      // 45 mins before
    critical: 60,    // 1 hour before
  },
  taskWindowDefaults: {
    feeding: 30,      // ±30 mins
    medication: 30,
    vital_signs: 30,
    procedure: 60,
  },
};

// ============================================================================
// SHIFT TASK SERVICE
// ============================================================================

export class ShiftTaskService {
  private config: ShiftConfig;

  constructor(config: ShiftConfig = DEFAULT_SHIFT_CONFIG) {
    this.config = config;
  }

  /**
   * Get shift times for a specific date and shift type
   */
  getShiftTimes(date: Date, shiftType: ShiftType): ShiftTimes {
    return HandoverService.getShiftTimes(date, shiftType === 'long_day' ? 'day' : shiftType);
  }

  /**
   * Generate all tasks for a shift across multiple babies
   * This is the main entry point for efficient bulk generation
   */
  generateShiftTasks(
    babies: Baby[],
    carePlans: EnhancedCarePlan[],
    prescriptions: MedicationPrescription[],
    shiftType: ShiftType,
    date: Date,
    generatedBy: string
  ): ShiftTaskBundle {
    const shift = this.getShiftTimes(date, shiftType);
    const shiftId = `shift-${shiftType}-${date.toISOString().split('T')[0]}`;

    const tasksByBaby = new Map<string, NursingTask[]>();
    const allTasks: NursingTask[] = [];
    const reminders: TaskReminder[] = [];

    // Stats tracking
    const stats = {
      totalTasks: 0,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      byBaby: {} as Record<string, number>,
    };

    // Process each baby
    babies.forEach(baby => {
      const babyCarePlans = carePlans.filter(cp => cp.babyId === baby.id && cp.status === 'active');
      const babyPrescriptions = prescriptions.filter(p => p.babyId === baby.id && p.status === 'approved');

      const babyTasks: NursingTask[] = [];

      // Generate tasks from each care plan
      babyCarePlans.forEach(carePlan => {
        // Generate for 24 hours starting from shift start
        const rawTasks = generateAllTasks(carePlan, babyPrescriptions, shift.start, 24);

        // Filter to only tasks within this shift window
        const shiftTasks = this.filterTasksToShift(rawTasks, shift);

        // Enhance tasks with shift info and windows
        const enhancedTasks = shiftTasks.map(task => this.enhanceTask(task, shift, shiftType));

        babyTasks.push(...enhancedTasks);
      });

      // Sort by scheduled time
      babyTasks.sort((a, b) => a.scheduledDateTime.toMillis() - b.scheduledDateTime.toMillis());

      // Generate reminders for this baby's tasks
      const babyReminders = this.generateReminders(babyTasks, baby.id);
      reminders.push(...babyReminders);

      // Store and accumulate
      tasksByBaby.set(baby.id, babyTasks);
      allTasks.push(...babyTasks);

      // Update stats
      stats.byBaby[baby.id] = babyTasks.length;
      babyTasks.forEach(task => {
        stats.byType[task.taskType] = (stats.byType[task.taskType] || 0) + 1;
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      });
    });

    // Sort all tasks chronologically
    allTasks.sort((a, b) => a.scheduledDateTime.toMillis() - b.scheduledDateTime.toMillis());
    stats.totalTasks = allTasks.length;

    return {
      shiftId,
      shift,
      generatedAt: Timestamp.now(),
      generatedBy,
      tasksByBaby,
      allTasks,
      reminders,
      stats,
    };
  }

  /**
   * Filter tasks to only those falling within the shift window
   */
  private filterTasksToShift(tasks: NursingTask[], shift: ShiftTimes): NursingTask[] {
    const shiftStartMs = shift.start.toMillis();
    const shiftEndMs = shift.end.toMillis();

    return tasks.filter(task => {
      const taskTime = task.scheduledDateTime.toMillis();
      return taskTime >= shiftStartMs && taskTime < shiftEndMs;
    });
  }

  /**
   * Enhance a task with shift info and time windows
   */
  private enhanceTask(task: NursingTask, shift: ShiftTimes, shiftType: ShiftType): NursingTask {
    const windowMinutes = this.config.taskWindowDefaults[task.taskType as keyof typeof this.config.taskWindowDefaults] || 30;
    const taskTimeMs = task.scheduledDateTime.toMillis();

    return {
      ...task,
      // Add window bounds
      windowStart: Timestamp.fromMillis(Math.max(
        shift.start.toMillis(),
        taskTimeMs - windowMinutes * 60 * 1000
      )),
      windowEnd: Timestamp.fromMillis(Math.min(
        shift.end.toMillis(),
        taskTimeMs + windowMinutes * 60 * 1000
      )),
    };
  }

  /**
   * Generate reminders for a set of tasks
   */
  private generateReminders(tasks: NursingTask[], babyId: string): TaskReminder[] {
    const reminders: TaskReminder[] = [];

    tasks.forEach(task => {
      const leadTime = this.config.reminderLeadTimes[task.priority];
      const taskTimeMs = task.scheduledDateTime.toMillis();
      const reminderTimeMs = taskTimeMs - leadTime * 60 * 1000;

      reminders.push({
        id: `reminder-${task.id}`,
        taskId: task.id,
        babyId,
        reminderType: 'upcoming',
        scheduledFor: Timestamp.fromMillis(reminderTimeMs),
        message: this.formatReminderMessage(task, 'upcoming'),
        priority: this.mapTaskPriorityToReminderPriority(task.priority),
        dismissed: false,
      });
    });

    return reminders;
  }

  /**
   * Format reminder message based on task type
   */
  private formatReminderMessage(task: NursingTask, type: TaskReminder['reminderType']): string {
    const timeStr = task.scheduledTimeOfDay ||
      new Date(task.scheduledDateTime.toMillis()).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    const prefix = {
      upcoming: `Due at ${timeStr}:`,
      due_now: 'Due now:',
      overdue: 'OVERDUE:',
      window_closing: 'Window closing:',
    }[type];

    const taskDescriptions: Record<string, string> = {
      feeding: `Feed due (${(task.taskDetails as any).volumeML}ml)`,
      medication: `Medication: ${(task.taskDetails as any).medicationName}`,
      vital_signs: 'Vital signs check',
      procedure: `Procedure: ${(task.taskDetails as any).procedureType?.replace(/_/g, ' ')}`,
      line_care: 'Line care',
      position_change: 'Position change',
      skin_care: 'Skin assessment',
      assessment: 'Assessment due',
    };

    return `${prefix} ${taskDescriptions[task.taskType] || task.taskType}`;
  }

  /**
   * Map task priority to reminder priority
   */
  private mapTaskPriorityToReminderPriority(taskPriority: string): TaskReminder['priority'] {
    const mapping: Record<string, TaskReminder['priority']> = {
      routine: 'low',
      important: 'medium',
      urgent: 'high',
      critical: 'critical',
    };
    return mapping[taskPriority] || 'medium';
  }

  /**
   * Generate screening reminders for babies based on their DOL/CGA
   */
  generateScreeningReminders(babies: Baby[], currentDate: Date = new Date()): ScreeningReminder[] {
    const reminders: ScreeningReminder[] = [];

    babies.forEach(baby => {
      const dobMs = baby.dateOfBirth.toMillis();
      const currentMs = currentDate.getTime();
      const ageInDays = Math.floor((currentMs - dobMs) / (24 * 60 * 60 * 1000));

      // Calculate corrected gestational age
      const cgaWeeks = baby.gestationalAgeAtBirth.weeks + Math.floor(ageInDays / 7);
      const cgaDays = (baby.gestationalAgeAtBirth.days + ageInDays) % 7;

      // NBBS Day 5
      if (ageInDays >= SCREENING_SETTINGS.nbbs.dayOfLife - SCREENING_SETTINGS.nbbs.reminderDaysBefore &&
          ageInDays <= SCREENING_SETTINGS.nbbs.dayOfLife + SCREENING_SETTINGS.nbbs.escalateIfOverdueDays) {
        const dueDate = new Date(dobMs + SCREENING_SETTINGS.nbbs.dayOfLife * 24 * 60 * 60 * 1000);
        reminders.push({
          id: `screening-nbbs-${baby.id}`,
          babyId: baby.id,
          screeningType: 'nbbs',
          dueDate: Timestamp.fromDate(dueDate),
          description: `Newborn Blood Spot screening - Day ${SCREENING_SETTINGS.nbbs.dayOfLife}`,
          status: ageInDays > SCREENING_SETTINGS.nbbs.dayOfLife ? 'overdue' :
                  ageInDays === SCREENING_SETTINGS.nbbs.dayOfLife ? 'due' : 'upcoming',
          escalated: ageInDays > SCREENING_SETTINGS.nbbs.dayOfLife + SCREENING_SETTINGS.nbbs.escalateIfOverdueDays,
        });
      }

      // NBBS Day 28 (for preterms <32 weeks)
      if (baby.gestationalAgeAtBirth.weeks < (SCREENING_SETTINGS.nbbsDay28.eligible.gestationalAge.max || 32)) {
        if (ageInDays >= SCREENING_SETTINGS.nbbsDay28.dayOfLife - SCREENING_SETTINGS.nbbsDay28.reminderDaysBefore &&
            ageInDays <= SCREENING_SETTINGS.nbbsDay28.dayOfLife + 7) {
          const dueDate = new Date(dobMs + SCREENING_SETTINGS.nbbsDay28.dayOfLife * 24 * 60 * 60 * 1000);
          reminders.push({
            id: `screening-nbbs28-${baby.id}`,
            babyId: baby.id,
            screeningType: 'nbbs_day28',
            dueDate: Timestamp.fromDate(dueDate),
            description: 'Preterm repeat NBBS - Day 28',
            status: ageInDays > SCREENING_SETTINGS.nbbsDay28.dayOfLife ? 'overdue' :
                    ageInDays === SCREENING_SETTINGS.nbbsDay28.dayOfLife ? 'due' : 'upcoming',
            escalated: false,
          });
        }
      }

      // ROP screening (for eligible preterms)
      const ropEligible = SCREENING_SETTINGS.rop.eligible;
      if ((ropEligible.gestationalAge && baby.gestationalAgeAtBirth.weeks < ropEligible.gestationalAge.max) ||
          (ropEligible.birthWeight && baby.birthWeight < ropEligible.birthWeight.max)) {
        if (cgaWeeks >= SCREENING_SETTINGS.rop.startWeeks && cgaWeeks <= SCREENING_SETTINGS.rop.endWeeks) {
          reminders.push({
            id: `screening-rop-${baby.id}-${cgaWeeks}`,
            babyId: baby.id,
            screeningType: 'rop',
            dueDate: Timestamp.fromDate(currentDate),
            description: `ROP screening due - CGA ${cgaWeeks}+${cgaDays}`,
            status: 'due',
            escalated: false,
          });
        }
      }

      // Weekly infection swabs
      const dayOfWeek = currentDate.toLocaleDateString('en-US', { weekday: 'long' });
      if (dayOfWeek === SCREENING_SETTINGS.infectionSwabs.swabDay) {
        reminders.push({
          id: `screening-swabs-${baby.id}-${currentDate.toISOString().split('T')[0]}`,
          babyId: baby.id,
          screeningType: 'infection_swabs',
          dueDate: Timestamp.fromDate(currentDate),
          description: `Weekly ${SCREENING_SETTINGS.infectionSwabs.swabTypes.join('/')} swabs`,
          status: 'due',
          escalated: false,
        });
      }

      // Cranial USS schedule
      if (baby.gestationalAgeAtBirth.weeks < (SCREENING_SETTINGS.cranialUSS.eligible.gestationalAge.max || 32)) {
        SCREENING_SETTINGS.cranialUSS.schedule.forEach(scan => {
          if ('dayOfLife' in scan && scan.dayOfLife) {
            const scanDue = ageInDays >= scan.dayOfLife - 1 && ageInDays <= scan.dayOfLife + 2;
            if (scanDue) {
              reminders.push({
                id: `screening-cuss-${baby.id}-dol${scan.dayOfLife}`,
                babyId: baby.id,
                screeningType: 'cranial_uss',
                dueDate: Timestamp.fromMillis(dobMs + scan.dayOfLife * 24 * 60 * 60 * 1000),
                description: scan.description,
                status: ageInDays > scan.dayOfLife ? 'overdue' : 'due',
                escalated: false,
              });
            }
          }
        });
      }

      // Hearing screening before discharge
      if (ageInDays >= SCREENING_SETTINGS.hearing.minDayOfLife) {
        reminders.push({
          id: `screening-hearing-${baby.id}`,
          babyId: baby.id,
          screeningType: 'hearing',
          dueDate: Timestamp.fromDate(currentDate),
          description: 'Hearing screening - required before discharge',
          status: 'upcoming',
          escalated: false,
        });
      }
    });

    return reminders;
  }

  /**
   * Get tasks due within next N minutes (for real-time alerts)
   */
  getUpcomingTasks(tasks: NursingTask[], withinMinutes: number = 30): NursingTask[] {
    const now = Date.now();
    const cutoff = now + withinMinutes * 60 * 1000;

    return tasks.filter(task => {
      const taskTime = task.scheduledDateTime.toMillis();
      return taskTime >= now && taskTime <= cutoff && task.status === 'pending';
    });
  }

  /**
   * Get overdue tasks
   */
  getOverdueTasks(tasks: NursingTask[]): NursingTask[] {
    const now = Date.now();

    return tasks.filter(task => {
      const windowEnd = task.windowEnd?.toMillis() || task.scheduledDateTime.toMillis();
      return windowEnd < now && (task.status === 'pending' || task.status === 'due');
    });
  }

  /**
   * Cluster tasks for grouped care (tasks within same time window)
   */
  clusterTasks(tasks: NursingTask[], windowMinutes: number = 30): Map<string, NursingTask[]> {
    const clusters = new Map<string, NursingTask[]>();

    // Group by baby first
    const byBaby = new Map<string, NursingTask[]>();
    tasks.forEach(task => {
      const existing = byBaby.get(task.babyId) || [];
      existing.push(task);
      byBaby.set(task.babyId, existing);
    });

    // For each baby, cluster by time
    byBaby.forEach((babyTasks, babyId) => {
      babyTasks.sort((a, b) => a.scheduledDateTime.toMillis() - b.scheduledDateTime.toMillis());

      let clusterStart: number | null = null;
      let currentCluster: NursingTask[] = [];

      babyTasks.forEach(task => {
        const taskTime = task.scheduledDateTime.toMillis();

        if (clusterStart === null || taskTime - clusterStart > windowMinutes * 60 * 1000) {
          // Start new cluster
          if (currentCluster.length > 0) {
            const clusterKey = `${babyId}-${new Date(clusterStart!).toISOString()}`;
            clusters.set(clusterKey, currentCluster);
          }
          clusterStart = taskTime;
          currentCluster = [task];
        } else {
          currentCluster.push(task);
        }
      });

      // Don't forget last cluster
      if (currentCluster.length > 0 && clusterStart !== null) {
        const clusterKey = `${babyId}-${new Date(clusterStart).toISOString()}`;
        clusters.set(clusterKey, currentCluster);
      }
    });

    return clusters;
  }

  /**
   * Generate role-specific task view
   * Different roles see different subsets of tasks
   */
  filterTasksForRole(tasks: NursingTask[], role: RoleType): NursingTask[] {
    switch (role) {
      case 'nurse':
        // Nurses see all bedside tasks
        return tasks;

      case 'hca':
        // HCAs see basic care tasks
        return tasks.filter(t =>
          ['vital_signs', 'position_change', 'skin_care'].includes(t.taskType) &&
          t.priority !== 'critical'
        );

      case 'doctor':
      case 'anp':
        // Medical staff see medication reviews and critical items
        return tasks.filter(t =>
          t.taskType === 'medication' ||
          t.priority === 'critical' ||
          t.flags?.includes('needs_two_nurses')
        );

      case 'unit_manager':
        // Managers see high-level summary (overdue, critical)
        return tasks.filter(t =>
          t.status === 'overdue' ||
          t.priority === 'critical' ||
          t.priority === 'urgent'
        );

      default:
        return tasks;
    }
  }

  /**
   * Pre-generate tasks for upcoming shifts (batch operation)
   * Call this at midnight or shift change to prepare next 24-48 hours
   */
  preGenerateUpcomingShifts(
    babies: Baby[],
    carePlans: EnhancedCarePlan[],
    prescriptions: MedicationPrescription[],
    generatedBy: string,
    hoursAhead: number = 48
  ): ShiftTaskBundle[] {
    const bundles: ShiftTaskBundle[] = [];
    const now = new Date();

    // Generate for each shift in the window
    const shiftsToGenerate: Array<{ date: Date; type: ShiftType }> = [];

    let currentDate = new Date(now);
    let hoursGenerated = 0;

    while (hoursGenerated < hoursAhead) {
      const currentHour = currentDate.getHours();

      if (currentHour >= 8 && currentHour < 20) {
        // Currently in day shift
        shiftsToGenerate.push({ date: new Date(currentDate), type: 'day' });
        currentDate.setHours(20, 0, 0, 0);
        hoursGenerated += 12;
      } else {
        // Currently in night shift
        shiftsToGenerate.push({ date: new Date(currentDate), type: 'night' });
        if (currentHour >= 20) {
          currentDate.setDate(currentDate.getDate() + 1);
        }
        currentDate.setHours(8, 0, 0, 0);
        hoursGenerated += 12;
      }
    }

    // Generate bundle for each shift
    shiftsToGenerate.forEach(({ date, type }) => {
      const bundle = this.generateShiftTasks(
        babies,
        carePlans,
        prescriptions,
        type,
        date,
        generatedBy
      );
      bundles.push(bundle);
    });

    return bundles;
  }
}

// Export singleton instance for convenience
export const shiftTaskService = new ShiftTaskService();
