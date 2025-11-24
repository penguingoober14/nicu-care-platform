import React from 'react';
import { Chip } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import type { NursingTask } from '../../types/tasks';
import { formatTaskTime } from '../../utils/taskHelpers';

interface TaskStatusBadgeProps {
  task: NursingTask;
  showTimeRelative?: boolean;
  currentTime?: Timestamp;
}

export const TaskStatusBadge: React.FC<TaskStatusBadgeProps> = ({
  task,
  showTimeRelative = false,
  currentTime = Timestamp.now(),
}) => {
  const getStatusColor = (status: NursingTask['status']): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'due':
        return 'info';
      case 'overdue':
        return 'warning';
      case 'completed':
        return 'success';
      case 'missed':
        return 'error';
      case 'deferred':
        return 'secondary';
      case 'cancelled':
        return 'default';
      case 'in_progress':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: NursingTask['status']): string => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'due':
        return 'Due Now';
      case 'overdue':
        return 'Overdue';
      case 'completed':
        return 'Completed';
      case 'missed':
        return 'Missed';
      case 'deferred':
        return 'Deferred';
      case 'cancelled':
        return 'Cancelled';
      case 'in_progress':
        return 'In Progress';
      default:
        return status;
    }
  };

  const label = showTimeRelative
    ? formatTaskTime(task.scheduledDateTime, currentTime)
    : getStatusLabel(task.status);

  return (
    <Chip
      label={label}
      color={getStatusColor(task.status)}
      size="small"
      sx={{
        fontWeight: task.status === 'overdue' ? 'bold' : 'normal',
      }}
    />
  );
};
