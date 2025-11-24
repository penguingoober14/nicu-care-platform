import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';

interface TwentyFourHrResumeProps {
  baby: Baby;
}

export const TwentyFourHrResume: React.FC<TwentyFourHrResumeProps> = ({ baby }) => {
  // Get latest 24hr resume for this baby
  const resume = mockDataStore.twentyFourHrResume
    .filter((r) => r.babyId === baby.id)
    .sort((a, b) => b.resumeDate.toMillis() - a.resumeDate.toMillis())[0];

  if (!resume) {
    return (
      <Alert severity="info">
        No 24-hour resume available. Create a new resume to document the baby's condition over the past 24 hours.
      </Alert>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" gutterBottom>
                24-Hour Resume
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(resume.resumeDate.toMillis()).toLocaleDateString()} | Age: {resume.ageInDays} days |
                Corrected GA: {resume.correctedGestationalAge.weeks}+{resume.correctedGestationalAge.days}
              </Typography>
            </Box>
            <Button variant="outlined">Edit Resume</Button>
          </Box>
        </CardContent>
      </Card>

      {/* System-by-System Review */}
      <Grid container spacing={3}>
        {/* Respiratory System */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="primary">
                Respiratory System
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Mode"
                    secondary={resume.respiratory.mode.replace(/_/g, ' ').toUpperCase()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Oxygen Range" secondary={resume.respiratory.oxygenRange} />
                </ListItem>
                {resume.respiratory.settings && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Settings"
                        secondary={
                          <Box component="span">
                            {resume.respiratory.settings.fiO2Range && `FiO₂: ${resume.respiratory.settings.fiO2Range}`}
                            {resume.respiratory.settings.peep && ` | PEEP: ${resume.respiratory.settings.peep}`}
                            {resume.respiratory.settings.pip && ` | PIP: ${resume.respiratory.settings.pip}`}
                            {resume.respiratory.settings.rate && ` | Rate: ${resume.respiratory.settings.rate}`}
                          </Box>
                        }
                      />
                    </ListItem>
                  </>
                )}
                <ListItem>
                  <ListItemText
                    primary="Spontaneous Breathing"
                    secondary={
                      <Chip
                        label={resume.respiratory.spontaneousBreathing ? 'Yes' : 'No'}
                        color={resume.respiratory.spontaneousBreathing ? 'success' : 'default'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                {resume.respiratory.extubationPlanned && (
                  <ListItem>
                    <Alert severity="warning" sx={{ width: '100%' }}>
                      Extubation planned
                    </Alert>
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Cardiovascular System */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="error">
                Cardiovascular System
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Heart Rate" secondary={resume.cardiovascular.heartRateRange} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Blood Pressure" secondary={resume.cardiovascular.bloodPressureRange} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Mean BP" secondary={`${resume.cardiovascular.meanBP} mmHg`} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Perfusion"
                    secondary={
                      <Chip
                        label={resume.cardiovascular.perfusion}
                        color={resume.cardiovascular.perfusion === 'good' ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="CRT" secondary={`${resume.cardiovascular.capillaryRefillTime} seconds`} />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Temperature & Events */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temperature & Events
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Temperature Range" secondary={resume.temperatureRange} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Apnoeas"
                    secondary={
                      <Chip
                        label={resume.events.apnoeas}
                        color={resume.events.apnoeas > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Bradycardias"
                    secondary={
                      <Chip
                        label={resume.events.bradycardias}
                        color={resume.events.bradycardias > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Desaturations"
                    secondary={
                      <Chip
                        label={resume.events.desaturations}
                        color={resume.events.desaturations > 0 ? 'warning' : 'success'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Urine & Bowel */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Urine & Bowel Function
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="Urine Output (24hr)"
                    secondary={`${resume.urineOutput.totalVolume}ml (${resume.urineOutput.mlPerKgPerHour} ml/kg/hr)`}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Bowel Action"
                    secondary={
                      <Chip
                        label={resume.bowelAction.passed ? 'Passed' : 'Not passed'}
                        color={resume.bowelAction.passed ? 'success' : 'warning'}
                        size="small"
                      />
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Frequency" secondary={`${resume.bowelAction.frequency} times`} />
                </ListItem>
                {resume.bowelAction.description && (
                  <ListItem>
                    <ListItemText primary="Description" secondary={resume.bowelAction.description} />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Fluids & Nutrition */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom color="success.main">
                Fluids & Nutrition
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
                    <Typography variant="body2" color="text.secondary">
                      Total Fluids
                    </Typography>
                    <Typography variant="h5">{resume.fluidsAndNutrition.totalFluids} ml/kg/day</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
                    <Typography variant="body2" color="text.secondary">
                      Enteral
                    </Typography>
                    <Typography variant="h5">{resume.fluidsAndNutrition.enteralIntake} ml/kg/day</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
                    <Typography variant="body2" color="text.secondary">
                      Parenteral
                    </Typography>
                    <Typography variant="h5">{resume.fluidsAndNutrition.parenteralIntake} ml/kg/day</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }} variant="outlined">
                    <Typography variant="body2" color="text.secondary">
                      Feed Volume
                    </Typography>
                    <Typography variant="h5">{resume.fluidsAndNutrition.feedVolume} ml</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12}>
                  <List dense>
                    <ListItem>
                      <ListItemText primary="Feeding Method" secondary={resume.fluidsAndNutrition.feedingMethod} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Frequency" secondary={resume.fluidsAndNutrition.feedFrequency} />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Tolerance"
                        secondary={
                          <Chip
                            label={resume.fluidsAndNutrition.feedTolerance}
                            color={resume.fluidsAndNutrition.feedTolerance === 'good' ? 'success' : 'warning'}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Vomits" secondary={resume.fluidsAndNutrition.vomits} />
                    </ListItem>
                    <ListItem>
                      <ListItemText primary="Aspirates" secondary={resume.fluidsAndNutrition.aspirates} />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Jaundice */}
        {resume.jaundice.phototherapy && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="warning.main">
                  Jaundice
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Phototherapy"
                      secondary={<Chip label="Active" color="warning" size="small" />}
                    />
                  </ListItem>
                  {resume.jaundice.bilirubinLevel && (
                    <ListItem>
                      <ListItemText primary="Bilirubin" secondary={`${resume.jaundice.bilirubinLevel} μmol/L`} />
                    </ListItem>
                  )}
                  {resume.jaundice.phototherapyHours && (
                    <ListItem>
                      <ListItemText primary="Hours on Phototherapy" secondary={resume.jaundice.phototherapyHours} />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Medications */}
        <Grid item xs={12} md={resume.jaundice.phototherapy ? 6 : 12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Medications
              </Typography>
              <List dense>
                {resume.medications.map((med, idx) => (
                  <ListItem key={idx}>
                    <ListItemText primary={med} />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Investigations */}
        {resume.investigations && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Investigations
                </Typography>
                <Grid container spacing={2}>
                  {resume.investigations.xray && (
                    <Grid item>
                      <Chip label="X-ray" color="info" />
                    </Grid>
                  )}
                  {resume.investigations.ultrasound && (
                    <Grid item>
                      <Chip label="Ultrasound" color="info" />
                    </Grid>
                  )}
                  {resume.investigations.echo && (
                    <Grid item>
                      <Chip label="Echo" color="info" />
                    </Grid>
                  )}
                  {resume.investigations.bloodTests?.map((test, idx) => (
                    <Grid item key={idx}>
                      <Chip label={test} color="default" />
                    </Grid>
                  ))}
                  {resume.investigations.chromosomes && (
                    <Grid item>
                      <Chip label="Chromosomes" color="secondary" />
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Plan */}
        <Grid item xs={12}>
          <Card sx={{ bgcolor: 'info.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom color="info.main">
                Plan for Next 24 Hours
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {resume.plan}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Concerns & Actions */}
        {((resume.concerns && resume.concerns.length > 0) || (resume.actions && resume.actions.length > 0)) && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  {resume.concerns && resume.concerns.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom color="warning.main">
                        Concerns
                      </Typography>
                      <List dense>
                        {resume.concerns.map((concern, idx) => (
                          <ListItem key={idx}>
                            <Alert severity="warning" sx={{ width: '100%' }}>
                              {concern}
                            </Alert>
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                  {resume.actions && resume.actions.length > 0 && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" gutterBottom color="success.main">
                        Actions
                      </Typography>
                      <List dense>
                        {resume.actions.map((action, idx) => (
                          <ListItem key={idx}>
                            <ListItemText primary={`• ${action}`} />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Footer */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography variant="caption" color="text.secondary">
              Completed by: {resume.completedBy} | Reviewed by: {resume.reviewedBy || 'Pending'}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
