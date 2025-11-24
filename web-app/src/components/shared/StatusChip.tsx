import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';

type StatusType = 'pending' | 'completed' | 'given' | 'missed' | 'cancelled' | 'active' | 'inactive';

interface StatusChipProps extends Omit<ChipProps, 'color'> {
  status: StatusType | string;
  customLabel?: string;
}

/**
 * Reusable status chip with consistent colors and icons
 * Maps common status types to appropriate MUI colors
 */
export const StatusChip: React.FC<StatusChipProps> = ({ status, customLabel, ...chipProps }) => {
  const getStatusConfig = (status: string) => {
    const normalized = status.toLowerCase();

    switch (normalized) {
      case 'pending':
        return { color: 'warning' as const, icon: <PendingIcon />, label: 'Pending' };
      case 'completed':
      case 'given':
        return { color: 'success' as const, icon: <CheckCircleIcon />, label: 'Completed' };
      case 'missed':
        return { color: 'error' as const, icon: <ErrorIcon />, label: 'Missed' };
      case 'cancelled':
        return { color: 'default' as const, icon: <CancelIcon />, label: 'Cancelled' };
      case 'active':
        return { color: 'success' as const, label: 'Active' };
      case 'inactive':
        return { color: 'default' as const, label: 'Inactive' };
      default:
        return { color: 'default' as const, label: status };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      label={customLabel || config.label}
      color={config.color}
      icon={config.icon}
      size="small"
      {...chipProps}
    />
  );
};
