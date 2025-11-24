import React, { useState } from 'react';
import { Box, Button, ButtonGroup, Typography, Chip, TextField } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import type { EpisodeType, InterventionType } from '../../../types/episodes.types';
import { EpisodeCounterService } from '../../../services';

interface EpisodeQuickLoggerProps {
  babyId: string;
  onLog: (episode: any) => void;
  recordedBy: string;
}

export const EpisodeQuickLogger: React.FC<EpisodeQuickLoggerProps> = ({
  babyId,
  onLog,
  recordedBy,
}) => {
  const [type, setType] = useState<EpisodeType>('apnoea');
  const [selfResolved, setSelfResolved] = useState(true);
  const [interventions, setInterventions] = useState<InterventionType[]>([]);
  const [notes, setNotes] = useState('');

  const handleLog = () => {
    const episode = EpisodeCounterService.logEpisode(babyId, type, Timestamp.now(), {
      selfResolved,
      interventions: selfResolved ? ['none_self_resolved'] : interventions,
      recordedBy,
      notes: notes || undefined,
    });
    onLog(episode);
    // Reset
    setSelfResolved(true);
    setInterventions([]);
    setNotes('');
  };

  const toggleIntervention = (intervention: InterventionType) => {
    setInterventions((prev) =>
      prev.includes(intervention)
        ? prev.filter((i) => i !== intervention)
        : [...prev, intervention]
    );
  };

  return (
    <Box sx={{ p: 2, border: '1px solid #ddd', borderRadius: 2, bgcolor: '#f9f9f9' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Log Episode
      </Typography>

      {/* Episode Type */}
      <ButtonGroup fullWidth sx={{ mb: 2 }}>
        <Button
          variant={type === 'apnoea' ? 'contained' : 'outlined'}
          onClick={() => setType('apnoea')}
        >
          Apnoea
        </Button>
        <Button
          variant={type === 'bradycardia' ? 'contained' : 'outlined'}
          onClick={() => setType('bradycardia')}
        >
          Brady
        </Button>
        <Button
          variant={type === 'desaturation' ? 'contained' : 'outlined'}
          onClick={() => setType('desaturation')}
        >
          Desat
        </Button>
      </ButtonGroup>

      {/* Self-Resolved */}
      <ButtonGroup fullWidth sx={{ mb: 2 }}>
        <Button
          variant={selfResolved ? 'contained' : 'outlined'}
          onClick={() => {
            setSelfResolved(true);
            setInterventions([]);
          }}
          color="success"
        >
          Self-Resolved
        </Button>
        <Button
          variant={!selfResolved ? 'contained' : 'outlined'}
          onClick={() => setSelfResolved(false)}
          color="warning"
        >
          Intervention Required
        </Button>
      </ButtonGroup>

      {/* Interventions (if not self-resolved) */}
      {!selfResolved && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            Interventions:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {[
              'gentle_stimulation',
              'vigorous_stimulation',
              'suction',
              'repositioning',
              'increased_oxygen',
              'bag_mask_ventilation',
            ].map((intervention) => (
              <Chip
                key={intervention}
                label={intervention.replace(/_/g, ' ')}
                onClick={() => toggleIntervention(intervention as InterventionType)}
                color={interventions.includes(intervention as InterventionType) ? 'primary' : 'default'}
                variant={interventions.includes(intervention as InterventionType) ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Notes */}
      <TextField
        fullWidth
        size="small"
        label="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Log Button */}
      <Button fullWidth variant="contained" size="large" onClick={handleLog}>
        Log {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    </Box>
  );
};
