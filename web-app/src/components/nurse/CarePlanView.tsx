import React from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Grid,
} from '@mui/material';
import { format } from 'date-fns';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

interface Props {
  baby: Baby;
}

export default function CarePlanView({ baby }: Props) {
  const carePlans = mockDataStore.carePlans.filter((cp) => cp.babyId === baby.id && cp.status === 'active');

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Care Plan - {baby.firstName} {baby.lastName}
      </Typography>

      <Grid container spacing={3}>
        {carePlans.map((plan) => (
          <Grid item xs={12} md={6} key={plan.id}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {plan.title}
                </Typography>
                <Chip label={plan.type} color="primary" size="small" />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {plan.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {plan.feedingSchedule && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Feeding Schedule
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Frequency"
                        secondary={`Every ${plan.feedingSchedule.frequency} hours`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Volume per Feed"
                        secondary={`${plan.feedingSchedule.volumePerFeed}ml`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Feed Type" secondary={plan.feedingSchedule.feedType} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Route" secondary={plan.feedingSchedule.route} />
                    </ListItem>
                  </List>
                </Box>
              )}

              {plan.instructions && plan.instructions.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Instructions
                  </Typography>
                  <List dense>
                    {plan.instructions.map((instruction, index) => (
                      <ListItem key={index}>
                        <CheckCircleOutlineIcon sx={{ mr: 1, color: 'success.main' }} />
                        <ListItemText primary={instruction} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="caption" color="text.secondary">
                Effective from: {format(plan.effectiveFrom.toDate(), 'MMM dd, yyyy')}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {carePlans.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">No active care plans</Typography>
        </Paper>
      )}
    </Box>
  );
}
