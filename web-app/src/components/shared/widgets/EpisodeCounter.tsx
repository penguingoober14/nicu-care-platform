import React from 'react';
import { Box, Typography, Card, CardContent } from '@mui/material';
import type { EpisodeCounterState } from '../../../types/episodes.types';

interface EpisodeCounterProps {
  state: EpisodeCounterState;
}

export const EpisodeCounter: React.FC<EpisodeCounterProps> = ({ state }) => {
  return (
    <Card elevation={2}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Episode Counter - {state.currentShift}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-around' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="error">
              {state.apnoeaCount}
            </Typography>
            <Typography variant="caption">Apnoeas</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main">
              {state.bradycardiaCount}
            </Typography>
            <Typography variant="caption">Bradys</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main">
              {state.desaturationCount}
            </Typography>
            <Typography variant="caption">Desats</Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          {state.selfResolvedPercentage}% self-resolved
        </Typography>
      </CardContent>
    </Card>
  );
};
