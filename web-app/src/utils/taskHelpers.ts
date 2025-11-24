import { Timestamp } from 'firebase/firestore';
import type { NursingTask, TaskDetails, FeedingTaskDetails, MedicationTaskDetails } from '../types/tasks';

/**
 * Gets all tasks for a specific baby
 */
export function getTasksForBaby(babyId: string, tasks: NursingTask[]): NursingTask[] {
  return tasks.filter((task) => task.babyId === babyId);
}

/**
 * Gets pending tasks (not yet completed)
 */
export function getPendingTasks(tasks: NursingTask[]): NursingTask[] {
  return tasks.filter((task) => task.status === 'pending' || task.status === 'due' || task.status === 'overdue');
}

/**
 * Gets completed tasks
 */
export function getCompletedTasks(tasks: NursingTask[]): NursingTask[] {
  return tasks.filter((task) => task.status === 'completed');
}

/**
 * Gets overdue tasks
 */
export function getOverdueTasks(tasks: NursingTask[]): NursingTask[] {
  return tasks.filter((task) => task.status === 'overdue');
}

/**
 * Gets tasks due within a specific time window
 */
export function getTasksDueInWindow(
  tasks: NursingTask[],
  startTime: Timestamp,
  endTime: Timestamp
): NursingTask[] {
  const startMillis = startTime.toMillis();
  const endMillis = endTime.toMillis();

  return tasks.filter((task) => {
    const taskMillis = task.scheduledDateTime.toMillis();
    return taskMillis >= startMillis && taskMillis <= endMillis;
  });
}

/**
 * Calculates task completion rate as a percentage
 */
export function calculateCompletionRate(tasks: NursingTask[]): number {
  if (tasks.length === 0) return 0;

  const completed = tasks.filter((task) => task.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Calculates the current status of a task based on current time
 */
export function calculateTaskStatus(
  task: NursingTask,
  currentTime: Timestamp = Timestamp.now()
): NursingTask['status'] {
  const currentMillis = currentTime.toMillis();
  const scheduledMillis = task.scheduledDateTime.toMillis();
  const minutesDifference = (currentMillis - scheduledMillis) / (1000 * 60);

  // If already completed, missed, cancelled, etc., keep that status
  if (['completed', 'missed', 'cancelled', 'deferred'].includes(task.status)) {
    return task.status;
  }

  // Within 30 minutes before scheduled time
  if (minutesDifference >= -30 && minutesDifference <= 0) {
    return 'due';
  }

  // More than 15 minutes late
  if (minutesDifference > 15) {
    return 'overdue';
  }

  // More than 30 minutes early or slightly late (< 15 min)
  return 'pending';
}

/**
 * Gets variance between scheduled and actual completion time in minutes
 */
export function getTaskVariance(task: NursingTask): number | null {
  if (!task.completedAt) return null;

  const scheduledMillis = task.scheduledDateTime.toMillis();
  const completedMillis = task.completedAt.toMillis();

  return Math.round((completedMillis - scheduledMillis) / (1000 * 60));
}

/**
 * Formats task time relative to now
 */
export function formatTaskTime(scheduledDateTime: Timestamp, currentTime: Timestamp = Timestamp.now()): string {
  const scheduledMillis = scheduledDateTime.toMillis();
  const currentMillis = currentTime.toMillis();
  const diffMinutes = Math.round((scheduledMillis - currentMillis) / (1000 * 60));

  if (diffMinutes < -60) {
    const hours = Math.round(Math.abs(diffMinutes) / 60);
    return `Overdue by ${hours} hr${hours > 1 ? 's' : ''}`;
  }

  if (diffMinutes < 0) {
    return `Overdue by ${Math.abs(diffMinutes)} min`;
  }

  if (diffMinutes === 0) {
    return 'Due now';
  }

  if (diffMinutes < 60) {
    return `Due in ${diffMinutes} min`;
  }

  const hours = Math.round(diffMinutes / 60);
  return `Due in ${hours} hr${hours > 1 ? 's' : ''}`;
}

/**
 * Groups tasks by time window (e.g., for clustered care)
 */
export interface TaskCluster {
  timeWindow: string;
  startTime: Timestamp;
  endTime: Timestamp;
  tasks: NursingTask[];
  clusterPriority: NursingTask['priority'];
  canBeCombined: boolean;
}

export function groupTasksByTimeWindow(tasks: NursingTask[], windowMinutes: number = 30): TaskCluster[] {
  if (tasks.length === 0) return [];

  // Sort tasks by scheduled time
  const sortedTasks = [...tasks].sort(
    (a, b) => a.scheduledDateTime.toMillis() - b.scheduledDateTime.toMillis()
  );

  const clusters: TaskCluster[] = [];
  let currentCluster: NursingTask[] = [sortedTasks[0]];
  let clusterStart = sortedTasks[0].scheduledDateTime.toMillis();

  for (let i = 1; i < sortedTasks.length; i++) {
    const task = sortedTasks[i];
    const taskTime = task.scheduledDateTime.toMillis();

    // If within window of cluster start, add to current cluster
    if (taskTime - clusterStart <= windowMinutes * 60 * 1000) {
      currentCluster.push(task);
    } else {
      // Finalize current cluster
      const clusterEnd = currentCluster[currentCluster.length - 1].scheduledDateTime.toMillis();
      clusters.push(createCluster(currentCluster, Timestamp.fromMillis(clusterStart), Timestamp.fromMillis(clusterEnd)));

      // Start new cluster
      currentCluster = [task];
      clusterStart = taskTime;
    }
  }

  // Add final cluster
  if (currentCluster.length > 0) {
    const clusterEnd = currentCluster[currentCluster.length - 1].scheduledDateTime.toMillis();
    clusters.push(createCluster(currentCluster, Timestamp.fromMillis(clusterStart), Timestamp.fromMillis(clusterEnd)));
  }

  return clusters;
}

function createCluster(tasks: NursingTask[], startTime: Timestamp, endTime: Timestamp): TaskCluster {
  const startTimeStr = new Date(startTime.toMillis()).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const endTimeStr = new Date(endTime.toMillis()).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine highest priority in cluster
  const priorities: NursingTask['priority'][] = ['routine', 'important', 'urgent', 'critical'];
  const highestPriority = tasks.reduce((highest, task) => {
    const taskPriorityIndex = priorities.indexOf(task.priority);
    const highestPriorityIndex = priorities.indexOf(highest);
    return taskPriorityIndex > highestPriorityIndex ? task.priority : highest;
  }, 'routine' as NursingTask['priority']);

  // Determine if tasks can be combined (developmental care principle)
  const canBeCombined = tasks.every((task) => {
    return ['feeding', 'medication', 'vital_signs'].includes(task.taskType);
  });

  return {
    timeWindow: startTimeStr === endTimeStr ? startTimeStr : `${startTimeStr}-${endTimeStr}`,
    startTime,
    endTime,
    tasks,
    clusterPriority: highestPriority,
    canBeCombined,
  };
}

/**
 * Gets task summary counts
 */
export interface TaskSummary {
  total: number;
  pending: number;
  due: number;
  overdue: number;
  completed: number;
  missed: number;
  deferred: number;
  completionRate: number;
}

export function getTaskSummary(tasks: NursingTask[]): TaskSummary {
  const summary: TaskSummary = {
    total: tasks.length,
    pending: 0,
    due: 0,
    overdue: 0,
    completed: 0,
    missed: 0,
    deferred: 0,
    completionRate: 0,
  };

  tasks.forEach((task) => {
    switch (task.status) {
      case 'pending':
        summary.pending++;
        break;
      case 'due':
        summary.due++;
        break;
      case 'overdue':
        summary.overdue++;
        break;
      case 'completed':
        summary.completed++;
        break;
      case 'missed':
        summary.missed++;
        break;
      case 'deferred':
        summary.deferred++;
        break;
    }
  });

  summary.completionRate = calculateCompletionRate(tasks);

  return summary;
}

/**
 * Filters tasks by type
 */
export function filterTasksByType(tasks: NursingTask[], taskType: NursingTask['taskType']): NursingTask[] {
  return tasks.filter((task) => task.taskType === taskType);
}

/**
 * Gets next upcoming task for a baby
 */
export function getNextTask(tasks: NursingTask[], currentTime: Timestamp = Timestamp.now()): NursingTask | null {
  const pendingTasks = getPendingTasks(tasks);
  const futureTasks = pendingTasks.filter(
    (task) => task.scheduledDateTime.toMillis() >= currentTime.toMillis()
  );

  if (futureTasks.length === 0) return null;

  // Sort by scheduled time and return earliest
  futureTasks.sort((a, b) => a.scheduledDateTime.toMillis() - b.scheduledDateTime.toMillis());
  return futureTasks[0];
}

/**
 * Type guard to check if task details are FeedingTaskDetails
 */
export function isFeedingTask(task: NursingTask): task is NursingTask & { taskDetails: FeedingTaskDetails } {
  return task.taskType === 'feeding';
}

/**
 * Type guard to check if task details are MedicationTaskDetails
 */
export function isMedicationTask(task: NursingTask): task is NursingTask & { taskDetails: MedicationTaskDetails } {
  return task.taskType === 'medication';
}

/**
 * Gets tasks that should show "due soon" warning (within next 2 hours)
 */
export function getDueSoonTasks(tasks: NursingTask[], currentTime: Timestamp = Timestamp.now()): NursingTask[] {
  const twoHoursFromNow = Timestamp.fromMillis(currentTime.toMillis() + 2 * 60 * 60 * 1000);
  return getTasksDueInWindow(tasks, currentTime, twoHoursFromNow);
}
