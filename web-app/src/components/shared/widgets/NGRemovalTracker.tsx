import React from 'react';
import { Box, Card, CardContent, Typography, LinearProgress, Chip, Alert } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import type { FeedingCompliance } from '../../../types';

interface NGRemovalTrackerProps {
  compliance: FeedingCompliance;
}

export const NGRemovalTracker: React.FC<NGRemovalTrackerProps> = ({ compliance }) => {
  const readiness = compliance.ngRemovalReadiness;

  if (!readiness) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            NG Removal Readiness
          </Typography>
          <Alert severity="info">Tracking not yet started</Alert>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (readiness.ready) return 'success';
    if (readiness.oralThresholdMet && readiness.currentConsecutiveStreak >= 12) return 'warning';
    return 'info';
  };

  const getProgressValue = () => {
    if (readiness.ready) return 100;
    return (readiness.currentConsecutiveStreak / 24) * 100;
  };

  return (
    <Card sx={{ border: readiness.ready ? '2px solid #4caf50' : undefined }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">NG Removal Readiness</Typography>
          {readiness.ready ? (
            <Chip
              label="READY TO REMOVE"
              color="success"
              icon={<CheckCircleIcon />}
              sx={{ fontWeight: 'bold' }}
            />
          ) : (
            <Chip
              label="MONITORING"
              color={getStatusColor()}
              icon={<WarningIcon />}
            />
          )}
        </Box>

        {readiness.ready ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            <strong>NG tube can be removed!</strong>
            <br />
            Baby has achieved ≥95% oral intake for 24 consecutive hours with zero NG top-ups.
          </Alert>
        ) : (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Requires ≥95% oral intake for 24 consecutive hours
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2">Progress</Typography>
                <Typography variant="body2" fontWeight="bold">
                  {readiness.currentConsecutiveStreak}h / 24h
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={getProgressValue()}
                color={getStatusColor()}
                sx={{ height: 8, borderRadius: 1 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {readiness.oralThresholdMet ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
                <Typography variant="body2">
                  Oral intake ≥95%: {readiness.oralThresholdMet ? 'Yes' : 'No'} (
                  {compliance.oralPercentage.toFixed(1)}%)
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {readiness.consecutiveHoursMet ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
                <Typography variant="body2">
                  24 consecutive hours: {readiness.consecutiveHoursMet ? 'Yes' : 'No'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {readiness.zeroTopUpsMet ? (
                  <CheckCircleIcon color="success" fontSize="small" />
                ) : (
                  <WarningIcon color="warning" fontSize="small" />
                )}
                <Typography variant="body2">
                  Zero NG top-ups: {readiness.zeroTopUpsMet ? 'Yes' : 'No'}
                </Typography>
              </Box>
            </Box>

            {readiness.feedsUntilReady !== undefined && readiness.feedsUntilReady > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Approximately {readiness.feedsUntilReady} more feeds at ≥95% oral needed
              </Alert>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
