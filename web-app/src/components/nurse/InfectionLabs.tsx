import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockDataStore } from '../../config/mockData';
import type { Baby } from '../../types';

interface InfectionLabsProps {
  baby: Baby;
}

export const InfectionLabs: React.FC<InfectionLabsProps> = ({ baby }) => {
  // Get infection records
  const infections = mockDataStore.infections
    .filter((inf) => inf.babyId === baby.id)
    .sort((a, b) => b.episodeStartDate.toMillis() - a.episodeStartDate.toMillis());

  // Get sample collections
  const samples = mockDataStore.samples
    .filter((s) => s.babyId === baby.id)
    .sort((a, b) => b.collectionDateTime.toMillis() - a.collectionDateTime.toMillis());

  const getInfectionTypeColor = (type: string) => {
    switch (type) {
      case 'confirmed':
        return 'error';
      case 'suspected':
        return 'warning';
      case 'ruled_out':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Active Infections Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Infection Status</Typography>
            <Button variant="outlined" size="small">
              New Infection Episode
            </Button>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'error.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Confirmed
                </Typography>
                <Typography variant="h4" color="error">
                  {infections.filter((i) => i.infectionType === 'confirmed').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Suspected
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {infections.filter((i) => i.infectionType === 'suspected').length}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Ruled Out
                </Typography>
                <Typography variant="h4" color="success.main">
                  {infections.filter((i) => i.infectionType === 'ruled_out').length}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Infection Episodes */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Infection Episodes
          </Typography>
          {infections.length > 0 ? (
            infections.map((infection) => (
              <Accordion key={infection.id}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                    <Chip
                      label={infection.infectionType.replace(/_/g, ' ')}
                      color={getInfectionTypeColor(infection.infectionType)}
                      size="small"
                    />
                    <Typography sx={{ flexGrow: 1 }}>{infection.infectionCategory.replace(/_/g, ' ')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(infection.episodeStartDate.toMillis()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Episode Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Start Date"
                            secondary={new Date(infection.episodeStartDate.toMillis()).toLocaleDateString()}
                          />
                        </ListItem>
                        {infection.episodeEndDate && (
                          <ListItem>
                            <ListItemText
                              primary="End Date"
                              secondary={new Date(infection.episodeEndDate.toMillis()).toLocaleDateString()}
                            />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText primary="Clinical Signs" secondary={infection.clinicalSigns.join(', ')} />
                        </ListItem>
                        {infection.lineAssociated && (
                          <ListItem>
                            <Alert severity="warning" sx={{ width: '100%' }}>
                              Line-associated infection
                              {infection.lineType && ` (${infection.lineType})`}
                            </Alert>
                          </ListItem>
                        )}
                        {infection.outcome && (
                          <ListItem>
                            <ListItemText
                              primary="Outcome"
                              secondary={
                                <Chip
                                  label={infection.outcome}
                                  color={infection.outcome === 'resolved' ? 'success' : 'warning'}
                                  size="small"
                                />
                              }
                            />
                          </ListItem>
                        )}
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Microbiology
                      </Typography>
                      <List dense>
                        {infection.microbiology.samplesTaken.map((sample, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={sample.type.replace(/_/g, ' ')}
                              secondary={
                                <>
                                  {new Date(sample.date.toMillis()).toLocaleDateString()}
                                  <br />
                                  Result: {sample.result || 'Pending'}
                                  {sample.organism && (
                                    <>
                                      <br />
                                      Organism: {sample.organism}
                                    </>
                                  )}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    {infection.infectionMarkers.length > 0 && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Infection Markers
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>CRP (mg/L)</TableCell>
                                <TableCell>WBC (x10⁹/L)</TableCell>
                                <TableCell>Neutrophils</TableCell>
                                <TableCell>Platelets</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {infection.infectionMarkers.map((marker, idx) => (
                                <TableRow key={idx}>
                                  <TableCell>{marker.crp || '-'}</TableCell>
                                  <TableCell>{marker.wbc || '-'}</TableCell>
                                  <TableCell>{marker.neutrophils || '-'}</TableCell>
                                  <TableCell>{marker.platelets || '-'}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Grid>
                    )}
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Antibiotics
                      </Typography>
                      <List dense>
                        {infection.antibiotics.map((abx, idx) => (
                          <ListItem key={idx}>
                            <ListItemText
                              primary={abx.drug}
                              secondary={
                                <>
                                  Started: {new Date(abx.startDate.toMillis()).toLocaleDateString()}
                                  {abx.stopDate && ` | Stopped: ${new Date(abx.stopDate.toMillis()).toLocaleDateString()}`}
                                  {abx.durationDays && ` | Duration: ${abx.durationDays} days`}
                                  <br />
                                  Indication: {abx.indication}
                                </>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Grid>
                    {infection.notes && (
                      <Grid item xs={12}>
                        <Alert severity="info">
                          <Typography variant="body2">{infection.notes}</Typography>
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Alert severity="success">No infection episodes recorded</Alert>
          )}
        </CardContent>
      </Card>

      {/* Laboratory Samples */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Laboratory Samples</Typography>
            <Button variant="outlined" size="small">
              Record Sample
            </Button>
          </Box>
          {samples.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Collection Date</TableCell>
                    <TableCell>Sample Type</TableCell>
                    <TableCell>Laboratory</TableCell>
                    <TableCell>Tests Requested</TableCell>
                    <TableCell>Barcode/Lab #</TableCell>
                    <TableCell>Results</TableCell>
                    <TableCell>Critical</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {samples.map((sample) => (
                    <TableRow key={sample.id}>
                      <TableCell>
                        {new Date(sample.collectionDateTime.toMillis()).toLocaleDateString()}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {new Date(sample.collectionDateTime.toMillis()).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={sample.sampleType.replace(/_/g, ' ')} size="small" />
                      </TableCell>
                      <TableCell>{sample.laboratory}</TableCell>
                      <TableCell>{sample.testsRequested.join(', ')}</TableCell>
                      <TableCell>
                        <Typography variant="caption">{sample.barcodeNumber || sample.labNumber || '-'}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={sample.resultsReceived ? 'Received' : 'Pending'}
                          color={sample.resultsReceived ? 'success' : 'warning'}
                          size="small"
                        />
                        {sample.resultsDateTime && (
                          <>
                            <br />
                            <Typography variant="caption">
                              {new Date(sample.resultsDateTime.toMillis()).toLocaleDateString()}
                            </Typography>
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {sample.criticalResult ? <Chip label="CRITICAL" color="error" size="small" /> : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No laboratory samples recorded</Alert>
          )}
          {samples.length > 0 && samples[0].notes && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Latest Sample Note:</strong> {samples[0].notes}
                </Typography>
              </Alert>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
