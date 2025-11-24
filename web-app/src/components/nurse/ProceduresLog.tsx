import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockDataStore } from '../../config/mockData';
import type { Baby } from '../../types';

interface ProceduresLogProps {
  baby: Baby;
}

export const ProceduresLog: React.FC<ProceduresLogProps> = ({ baby }) => {
  // Get admission assessment
  const admissionAssessment = mockDataStore.admissionAssessments.find((a) => a.babyId === baby.id);

  // Get consents
  const consents = mockDataStore.consents
    .filter((c) => c.babyId === baby.id)
    .sort((a, b) => b.dateObtained.toMillis() - a.dateObtained.toMillis());

  return (
    <Box>
      {/* Admission Assessment */}
      {admissionAssessment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary">
              Admission Assessment
            </Typography>
            <Typography variant="caption" color="text.secondary" gutterBottom>
              Admitted: {new Date(admissionAssessment.admissionDateTime.toMillis()).toLocaleString()}
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Reason for Admission
                </Typography>
                <Typography variant="body2">{admissionAssessment.reasonForAdmission}</Typography>
                <Box sx={{ mt: 1 }}>
                  {admissionAssessment.admissionDiagnoses.map((dx, idx) => (
                    <Chip key={idx} label={dx} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Birth Details
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Birth Weight"
                      secondary={`${admissionAssessment.birthDetails.birthWeight}g`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Gestation"
                      secondary={`${admissionAssessment.birthDetails.gestation.weeks}+${admissionAssessment.birthDetails.gestation.days}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Delivery Method"
                      secondary={admissionAssessment.birthDetails.deliveryMethod.replace(/_/g, ' ')}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Apgar Scores"
                      secondary={`1min: ${admissionAssessment.birthDetails.apgarScores.oneMin} | 5min: ${admissionAssessment.birthDetails.apgarScores.fiveMin}${
                        admissionAssessment.birthDetails.apgarScores.tenMin
                          ? ` | 10min: ${admissionAssessment.birthDetails.apgarScores.tenMin}`
                          : ''
                      }`}
                    />
                  </ListItem>
                  {admissionAssessment.birthDetails.resuscitation && (
                    <ListItem>
                      <Alert severity="warning" sx={{ width: '100%' }}>
                        <Typography variant="body2">
                          Resuscitation: {admissionAssessment.birthDetails.resuscitationDetails}
                        </Typography>
                      </Alert>
                    </ListItem>
                  )}
                </List>
              </Grid>
              {admissionAssessment.maternalHistory && (
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Maternal History
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Age" secondary={admissionAssessment.maternalHistory.age || 'N/A'} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Parity" secondary={admissionAssessment.maternalHistory.parity || 'N/A'} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={8}>
                      {admissionAssessment.maternalHistory.pregnancyComplications &&
                        admissionAssessment.maternalHistory.pregnancyComplications.length > 0 && (
                          <>
                            <Typography variant="caption" color="text.secondary">
                              Pregnancy Complications
                            </Typography>
                            <Box sx={{ mt: 0.5 }}>
                              {admissionAssessment.maternalHistory.pregnancyComplications.map((comp, idx) => (
                                <Chip key={idx} label={comp} size="small" color="warning" sx={{ mr: 0.5, mb: 0.5 }} />
                              ))}
                            </Box>
                          </>
                        )}
                    </Grid>
                  </Grid>
                </Grid>
              )}
              <Grid item xs={12}>
                <Paper sx={{ p: 2, bgcolor: 'info.50' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Initial Plan
                  </Typography>
                  <Typography variant="body2">{admissionAssessment.initialPlan}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Admitted by: {admissionAssessment.admittedBy} | Assessed by: {admissionAssessment.assessedBy}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Consent Records */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Consent Records</Typography>
            <Button variant="outlined" size="small">
              Add Consent
            </Button>
          </Box>
          {consents.length > 0 ? (
            consents.map((consent) => (
              <Accordion key={consent.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Chip label={consent.consentType} color="primary" size="small" />
                    <Typography sx={{ flexGrow: 1 }}>{consent.specificProcedure || consent.studyName}</Typography>
                    <Chip
                      label={consent.withdrawn ? 'Withdrawn' : 'Valid'}
                      color={consent.withdrawn ? 'error' : 'success'}
                      size="small"
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Consent Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Date Obtained"
                            secondary={new Date(consent.dateObtained.toMillis()).toLocaleDateString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Obtained By" secondary={consent.obtainedBy} />
                        </ListItem>
                        {consent.witnessedBy && (
                          <ListItem>
                            <ListItemText primary="Witnessed By" secondary={consent.witnessedBy} />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText
                            primary="Valid From"
                            secondary={new Date(consent.validFrom.toMillis()).toLocaleDateString()}
                          />
                        </ListItem>
                        {consent.validUntil && (
                          <ListItem>
                            <ListItemText
                              primary="Valid Until"
                              secondary={new Date(consent.validUntil.toMillis()).toLocaleDateString()}
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Consenting Party
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText primary="Name" secondary={consent.consentedBy.name} />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Relationship"
                            secondary={consent.consentedBy.relationship.replace(/_/g, ' ')}
                          />
                        </ListItem>
                      </List>
                    </Grid>
                    {consent.statementsAcknowledged && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="body2" gutterBottom>
                            <strong>Research/Genomics Consent Statements:</strong>
                          </Typography>
                          <List dense>
                            <ListItem>
                              <ListItemText
                                primary="DNA Collection Permission"
                                secondary={consent.statementsAcknowledged.dnaCollectionPermission ? 'Yes' : 'No'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Long-term Data Use"
                                secondary={consent.statementsAcknowledged.longTermDataUsePermission ? 'Yes' : 'No'}
                              />
                            </ListItem>
                            <ListItem>
                              <ListItemText
                                primary="Withdrawal Rights Understood"
                                secondary={consent.statementsAcknowledged.withdrawalRightsUnderstood ? 'Yes' : 'No'}
                              />
                            </ListItem>
                          </List>
                        </Alert>
                      </Grid>
                    )}
                    {consent.withdrawn && (
                      <Grid item xs={12}>
                        <Alert severity="error">
                          <Typography variant="body2">
                            <strong>Consent Withdrawn:</strong>{' '}
                            {consent.withdrawnDate && new Date(consent.withdrawnDate.toMillis()).toLocaleDateString()}
                            {consent.withdrawalReason && (
                              <>
                                <br />
                                Reason: {consent.withdrawalReason}
                              </>
                            )}
                          </Typography>
                        </Alert>
                      </Grid>
                    )}
                    {consent.notes && (
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          Notes: {consent.notes}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Alert severity="info">No consent records available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Procedures Summary */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Procedures Summary
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography variant="subtitle2" gutterBottom>
                  Active Lines
                </Typography>
                <Typography variant="h4" color="primary">
                  {mockDataStore.ivLines.filter((line) => line.babyId === baby.id && line.isActive).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  IV/Central lines currently in place
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Typography variant="subtitle2" gutterBottom>
                  Active Tubes
                </Typography>
                <Typography variant="h4" color="secondary">
                  {mockDataStore.ngTubes.filter((tube) => tube.babyId === baby.id && tube.isActive).length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  NG/OG tubes currently in place
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Alert severity="info" sx={{ mt: 2 }}>
            View full procedural details including transfusions, phototherapy, and safety checks in their respective tabs.
          </Alert>
        </CardContent>
      </Card>
    </Box>
  );
};
