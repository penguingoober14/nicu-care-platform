import { Timestamp } from 'firebase/firestore';
import type { NursingTask, TaskCompletionSummary } from '../types';
import { generateAllTasks } from '../utils/taskGenerator';
import { DEMO_ENHANCED_CARE_PLANS } from './clinical.data';
import { DEMO_PRESCRIPTIONS } from './clinical.data';
import { now, daysAgo } from './generators';

// ============================================================================
// TASK GENERATION (LAZY LOADED)
// ============================================================================

let _cachedTasks: NursingTask[] | null = null;

/**
 * Lazily generate nursing tasks for all babies
 * Tasks are generated once and cached to avoid blocking on import
 */
function generateNursingTasks(): NursingTask[] {
  if (_cachedTasks !== null) {
    return _cachedTasks;
  }

  const generateTasksForBaby = (babyId: string): NursingTask[] => {
    const carePlan = DEMO_ENHANCED_CARE_PLANS.find(
      (cp) => cp.babyId === babyId && cp.status === 'active'
    );
    if (!carePlan) return [];

    const prescriptions = DEMO_PRESCRIPTIONS.filter(
      (p) => p.babyId === babyId && p.status === 'approved'
    );

    return generateAllTasks(carePlan, prescriptions, now(), 24);
  };

  let allGeneratedTasks = [
    ...generateTasksForBaby('daisy'),
    ...generateTasksForBaby('elsa'),
  ];

  // Mark some tasks as completed (simulate past completions)
  allGeneratedTasks = allGeneratedTasks.map((task, index) => {
    const scheduledMillis = task.scheduledDateTime.toMillis();
    const nowMillis = now().toMillis();

    // Mark tasks from more than 2 hours ago as completed
    if (scheduledMillis < nowMillis - 2 * 60 * 60 * 1000) {
      return {
        ...task,
        status: 'completed' as const,
        completedAt: Timestamp.fromMillis(scheduledMillis + 10 * 60 * 1000),
        completedBy: 'sarah-nurse',
        completionRecordId: `${task.taskType}-record-${task.id}`,
        completionRecordType:
          task.taskType === 'feeding'
            ? ('FeedingRecord' as const)
            : task.taskType === 'medication'
            ? ('MedicationAdministration' as const)
            : task.taskType === 'vital_signs'
            ? ('VitalSign' as const)
            : ('ProcedureRecord' as const),
      };
    }

    // Mark one task as overdue for demo
    if (index === 5 && scheduledMillis < nowMillis) {
      return { ...task, status: 'overdue' as const };
    }

    // Mark tasks within 30 min window as 'due'
    if (
      scheduledMillis >= nowMillis - 30 * 60 * 1000 &&
      scheduledMillis <= nowMillis
    ) {
      return { ...task, status: 'due' as const };
    }

    return task;
  });

  _cachedTasks = allGeneratedTasks;
  return _cachedTasks;
}

/**
 * Get nursing tasks (lazy loaded)
 */
export function getDemoNursingTasks(): NursingTask[] {
  return generateNursingTasks();
}

/**
 * Export as getter to ensure lazy loading
 */
export const DEMO_NURSING_TASKS = getDemoNursingTasks();

// ============================================================================
// TASK COMPLETION SUMMARIES
// ============================================================================

export const DEMO_TASK_COMPLETION_SUMMARIES: TaskCompletionSummary[] = [
  {
    id: 'task-summary-daisy-yesterday',
    babyId: 'daisy',
    date: daysAgo(1),
    shift: 'day',
    totalTasksScheduled: 22,
    tasksCompleted: 21,
    tasksDeferred: 1,
    tasksMissed: 0,
    tasksCancelled: 0,
    variances: [
      {
        taskId: 'feed-daisy-15:00',
        taskType: 'feeding',
        scheduledTime: Timestamp.fromDate(
          new Date(Date.now() - 24 * 60 * 60 * 1000 + 15 * 60 * 60 * 1000)
        ),
        actualTime: Timestamp.fromDate(
          new Date(Date.now() - 24 * 60 * 60 * 1000 + 15.5 * 60 * 60 * 1000)
        ),
        varianceMinutes: 30,
        reason: 'Baby sleeping - deferred to allow rest',
      },
    ],
    clinicallySignificantVariances: false,
    escalatedToMedicalTeam: false,
    compiledBy: 'sarah-nurse',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
  {
    id: 'task-summary-elsa-yesterday',
    babyId: 'elsa',
    date: daysAgo(1),
    shift: 'day',
    totalTasksScheduled: 35,
    tasksCompleted: 34,
    tasksDeferred: 0,
    tasksMissed: 1,
    tasksCancelled: 0,
    variances: [
      {
        taskId: 'feed-elsa-12:00',
        taskType: 'feeding',
        scheduledTime: Timestamp.fromDate(
          new Date(Date.now() - 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000)
        ),
        reason: 'Feed held due to high aspirates - medical team informed',
      },
    ],
    clinicallySignificantVariances: true,
    escalatedToMedicalTeam: true,
    compiledBy: 'sarah-nurse',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
  },
];
