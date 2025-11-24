import React from 'react';
import { SvgIconProps } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MedicationIcon from '@mui/icons-material/Medication';
import FavoriteIcon from '@mui/icons-material/Favorite';
import BuildIcon from '@mui/icons-material/Build';
import AssessmentIcon from '@mui/icons-material/Assessment';
import RotateRightIcon from '@mui/icons-material/RotateRight';
import SpaIcon from '@mui/icons-material/Spa';
import CableIcon from '@mui/icons-material/Cable';
import type { NursingTask } from '../../types/tasks';

interface TaskTypeIconProps extends Omit<SvgIconProps, 'component'> {
  taskType: NursingTask['taskType'];
}

export const TaskTypeIcon: React.FC<TaskTypeIconProps> = ({ taskType, ...iconProps }) => {
  switch (taskType) {
    case 'feeding':
      return <RestaurantIcon {...iconProps} />;
    case 'medication':
      return <MedicationIcon {...iconProps} />;
    case 'vital_signs':
      return <FavoriteIcon {...iconProps} />;
    case 'procedure':
      return <BuildIcon {...iconProps} />;
    case 'assessment':
      return <AssessmentIcon {...iconProps} />;
    case 'position_change':
      return <RotateRightIcon {...iconProps} />;
    case 'skin_care':
      return <SpaIcon {...iconProps} />;
    case 'line_care':
      return <CableIcon {...iconProps} />;
    default:
      return <BuildIcon {...iconProps} />;
  }
};

export const getTaskTypeLabel = (taskType: NursingTask['taskType']): string => {
  switch (taskType) {
    case 'feeding':
      return 'Feeding';
    case 'medication':
      return 'Medication';
    case 'vital_signs':
      return 'Vital Signs';
    case 'procedure':
      return 'Procedure';
    case 'assessment':
      return 'Assessment';
    case 'position_change':
      return 'Position Change';
    case 'skin_care':
      return 'Skin Care';
    case 'line_care':
      return 'Line Care';
    default:
      return taskType;
  }
};

export const getTaskTypeColor = (taskType: NursingTask['taskType']): string => {
  switch (taskType) {
    case 'feeding':
      return '#4caf50'; // green
    case 'medication':
      return '#2196f3'; // blue
    case 'vital_signs':
      return '#f44336'; // red
    case 'procedure':
      return '#ff9800'; // orange
    case 'assessment':
      return '#9c27b0'; // purple
    case 'position_change':
      return '#00bcd4'; // cyan
    case 'skin_care':
      return '#e91e63'; // pink
    case 'line_care':
      return '#607d8b'; // blue-grey
    default:
      return '#757575'; // grey
  }
};
