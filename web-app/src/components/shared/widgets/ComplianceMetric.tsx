import React from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface ComplianceMetricProps {
  label: string;
  value: number; // 0-100
  target?: number;
  unit?: string;
  color?: 'success' | 'warning' | 'error' | 'info';
}

export const ComplianceMetric: React.FC<ComplianceMetricProps> = ({
  label,
  value,
  target = 100,
  unit = '%',
  color = 'info',
}) => {
  const getColor = () => {
    if (color) return color;
    if (value >= target) return 'success';
    if (value >= target * 0.8) return 'warning';
    return 'error';
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2">{label}</Typography>
        <Typography variant="body2" fontWeight="bold">
          {value}{unit}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(value, 100)}
        color={getColor()}
        sx={{ height: 8, borderRadius: 4 }}
      />
      {target < 100 && (
        <Typography variant="caption" color="text.secondary">
          Target: {target}{unit}
        </Typography>
      )}
    </Box>
  );
};
