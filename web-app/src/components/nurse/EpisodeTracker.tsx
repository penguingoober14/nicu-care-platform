import React, { useState } from 'react';
import { Box, Typography, Grid, Card, CardContent, Divider } from '@mui/material';
import type { Baby } from '../../types';
import type { Episode } from '../../types/episodes.types';
import { Timestamp } from 'firebase/firestore';
import { EpisodeQuickLogger, EpisodeCounter } from '../shared';
import { EpisodeCounterService } from '../../services';
import { useAuth } from '../../context/AuthContext';

interface EpisodeTrackerProps {
  baby: Baby;
}

export default function EpisodeTracker({ baby }: EpisodeTrackerProps) {
  const { currentUser } = useAuth();
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const shift: 'day' | 'night' | 'long_day' = 'day'; // TODO: Calculate from time

  // Calculate counter state
  const counterState = EpisodeCounterService.calculateCounterState(baby.id, shift, episodes);

  const handleLogEpisode = (episode: Episode) => {
    setEpisodes((prev) => [...prev, episode]);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Episode Tracker - {baby.firstName} {baby.lastName}
      </Typography>

      <Grid container spacing={3}>
        {/* Counter Widget */}
        <Grid item xs={12} md={6}>
          <EpisodeCounter state={counterState} />
        </Grid>

        {/* Quick Logger */}
        <Grid item xs={12} md={6}>
          <EpisodeQuickLogger
            babyId={baby.id}
            onLog={handleLogEpisode}
            recordedBy={currentUser?.id || 'unknown'}
          />
        </Grid>

        {/* Recent Episodes */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Recent Episodes ({episodes.length})
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {episodes.length === 0 ? (
                <Typography color="text.secondary">No episodes logged this shift</Typography>
              ) : (
                <Box>
                  {episodes
                    .sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis())
                    .slice(0, 10)
                    .map((episode) => (
                      <Box
                        key={episode.id}
                        sx={{
                          p: 2,
                          mb: 1,
                          bgcolor: '#f9f9f9',
                          borderRadius: 1,
                          border: '1px solid #ddd',
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" fontWeight="bold">
                            {episode.type.toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {episode.timestamp.toDate().toLocaleTimeString()}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {episode.selfResolved ? (
                            <span style={{ color: 'green' }}>✓ Self-resolved</span>
                          ) : (
                            <span style={{ color: 'orange' }}>
                              ⚠ Intervention: {episode.interventions.join(', ')}
                            </span>
                          )}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
