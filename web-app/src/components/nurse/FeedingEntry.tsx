import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  ButtonGroup,
  IconButton,
} from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { mockDataStore, DEMO_MEDICATIONS, DEMO_FEEDS } from '../../data';
import type { Baby, FeedingRecord } from '../../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { QuickNumberInput, NGRemovalTracker } from '../shared';
import { FeedComplianceService } from '../../services';

interface Props {
  baby: Baby;
}

export default function FeedingEntry({ baby }: Props) {
  const [feedType, setFeedType] = useState('fortified_EBM');
  const [volumePrescribed, setVolumePrescribed] = useState('');
  const [volumeActual, setVolumeActual] = useState('');
  const [route, setRoute] = useState('NG_tube');
  const [tolerance, setTolerance] = useState('good');
  const [residual, setResidual] = useState('');
  const [vomiting, setVomiting] = useState(false);
  const [notes, setNotes] = useState('');
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [currentWeight, setCurrentWeight] = useState(baby.latestWeight?.weight || 0);
  const [isWeighDay, setIsWeighDay] = useState(false);

  // Get care plan to prefill volume
  const carePlan = mockDataStore.carePlans.find((cp) => cp.babyId === baby.id && cp.type === 'feeding');

  // Calculate auto-feed volume from weight
  useEffect(() => {
    const feedFrequency = carePlan?.feedingSchedule?.frequency || 3;
    const autoVolume = FeedComplianceService.calculateFeedVolume(currentWeight, feedFrequency);
    setVolumePrescribed(autoVolume.toString());
    setVolumeActual(autoVolume.toString());
  }, [currentWeight, carePlan]);

  // Check if today is a weigh day
  useEffect(() => {
    setIsWeighDay(FeedComplianceService.isWeighDay());
  }, []);

  // Calculate 24hr compliance and NG removal readiness
  const recentFeeds = DEMO_FEEDS.filter((f) => f.babyId === baby.id);
  const compliance = FeedComplianceService.calculate24HrCompliance(
    baby.id,
    recentFeeds,
    carePlan as any,
    Timestamp.now()
  );

  // Calculate oral percentage
  const oralPercentage =
    volumePrescribed && volumeActual
      ? ((parseFloat(volumeActual) / parseFloat(volumePrescribed)) * 100).toFixed(1)
      : '0.0';

  // Get pending medications that can be given in feed
  const pendingMeds = DEMO_MEDICATIONS.filter(
    (med) =>
      med.babyId === baby.id &&
      med.status === 'pending' &&
      med.administrationMethod === 'in_feed'
  );

  const toggleMedication = (medId: string) => {
    setSelectedMedications((prev) =>
      prev.includes(medId) ? prev.filter((id) => id !== medId) : [...prev, medId]
    );
  };

  const handleSubmit = () => {
    // Create feed record
    const newFeed: FeedingRecord = {
      id: `feed-${Date.now()}`,
      babyId: baby.id,
      feedTime: Timestamp.now(),
      recordedBy: 'sarah-nurse',
      feedType: feedType as any,
      volume: {
        prescribed: parseInt(volumePrescribed),
        actual: parseInt(volumeActual),
      },
      route: route as any,
      medicationsIncluded: selectedMedications.map((medId) => {
        const med = DEMO_MEDICATIONS.find((m) => m.id === medId);
        return {
          medicationAdministrationId: medId,
          medicationName: med?.medicationName || '',
          confirmed: true,
        };
      }),
      tolerance: tolerance as any,
      residual: residual ? parseInt(residual) : undefined,
      vomiting: vomiting ? { occurred: true } : undefined,
      notes,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    // Add feed to mock data
    DEMO_FEEDS.push(newFeed);

    // Update medications to "given" status
    selectedMedications.forEach((medId) => {
      const index = DEMO_MEDICATIONS.findIndex((m) => m.id === medId);
      if (index !== -1) {
        DEMO_MEDICATIONS[index] = {
          ...DEMO_MEDICATIONS[index],
          status: 'given',
          administeredTime: Timestamp.now(),
          administeredBy: 'sarah-nurse',
          feedRecordId: newFeed.id,
        };
      }
    });

    // Show success and reset form
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
  };

  const resetForm = () => {
    const feedFrequency = carePlan?.feedingSchedule?.frequency || 3;
    const autoVolume = FeedComplianceService.calculateFeedVolume(currentWeight, feedFrequency);
    setVolumeActual(autoVolume.toString());
    setTolerance('good');
    setResidual('');
    setVomiting(false);
    setNotes('');
    setSelectedMedications([]);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Record Feed - {baby.firstName} {baby.lastName}
      </Typography>

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Feed recorded successfully! Medications marked as given.
        </Alert>
      )}

      {isWeighDay && (
        <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
          <strong>Weigh Day Today!</strong> Remember to weigh baby before feeds. Feed volumes will auto-recalculate.
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* NG Removal Tracker */}
        <Grid item xs={12}>
          <NGRemovalTracker compliance={compliance} />
        </Grid>

        {/* Feed Entry Form */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Feed Details
            </Typography>

            <Grid container spacing={2}>
              {/* Weight & Auto-calc */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Current Weight: {(currentWeight / 1000).toFixed(2)} kg
                  </Typography>
                  <Typography variant="caption">
                    Auto-calculated volume: {volumePrescribed}ml (150ml/kg/day ÷{' '}
                    {24 / (carePlan?.feedingSchedule?.frequency || 3)} feeds)
                  </Typography>
                </Alert>
              </Grid>

              {/* Route Quick-Toggle */}
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                  Feed Route
                </Typography>
                <ButtonGroup fullWidth variant="outlined">
                  <Button
                    variant={route === 'oral_bottle' || route === 'oral_breast' ? 'contained' : 'outlined'}
                    onClick={() => setRoute('oral_bottle')}
                  >
                    Oral
                  </Button>
                  <Button
                    variant={route === 'NG_tube' || route === 'OG_tube' ? 'contained' : 'outlined'}
                    onClick={() => setRoute('NG_tube')}
                  >
                    NG/OG Tube
                  </Button>
                </ButtonGroup>
              </Grid>

              {/* Detailed Route Selection */}
              {(route === 'oral_bottle' || route === 'oral_breast') && (
                <Grid item xs={12}>
                  <ButtonGroup fullWidth size="small">
                    <Button
                      variant={route === 'oral_bottle' ? 'contained' : 'outlined'}
                      onClick={() => setRoute('oral_bottle')}
                    >
                      Bottle
                    </Button>
                    <Button
                      variant={route === 'oral_breast' ? 'contained' : 'outlined'}
                      onClick={() => setRoute('oral_breast')}
                    >
                      Breast
                    </Button>
                  </ButtonGroup>
                </Grid>
              )}

              {(route === 'NG_tube' || route === 'OG_tube') && (
                <Grid item xs={12}>
                  <ButtonGroup fullWidth size="small">
                    <Button
                      variant={route === 'NG_tube' ? 'contained' : 'outlined'}
                      onClick={() => setRoute('NG_tube')}
                    >
                      NG Tube
                    </Button>
                    <Button
                      variant={route === 'OG_tube' ? 'contained' : 'outlined'}
                      onClick={() => setRoute('OG_tube')}
                    >
                      OG Tube
                    </Button>
                  </ButtonGroup>
                </Grid>
              )}

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Feed Type</InputLabel>
                  <Select value={feedType} onChange={(e) => setFeedType(e.target.value)} label="Feed Type">
                    <MenuItem value="EBM">EBM</MenuItem>
                    <MenuItem value="formula">Formula</MenuItem>
                    <MenuItem value="fortified_EBM">Fortified EBM</MenuItem>
                    <MenuItem value="fortified_formula">Fortified Formula</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Tolerance</InputLabel>
                  <Select value={tolerance} onChange={(e) => setTolerance(e.target.value)} label="Tolerance">
                    <MenuItem value="good">Good</MenuItem>
                    <MenuItem value="moderate">Moderate</MenuItem>
                    <MenuItem value="poor">Poor</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Volume with Quick Input */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    Prescribed:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setVolumePrescribed((prev) => Math.max(0, parseInt(prev || '0') - 5).toString())}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    size="small"
                    type="number"
                    value={volumePrescribed}
                    onChange={(e) => setVolumePrescribed(e.target.value)}
                    sx={{ width: 80, textAlign: 'center' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setVolumePrescribed((prev) => (parseInt(prev || '0') + 5).toString())}
                  >
                    <AddIcon />
                  </IconButton>
                  <Typography variant="body2">ml</Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ minWidth: 120 }}>
                    Actual Given:
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setVolumeActual((prev) => Math.max(0, parseInt(prev || '0') - 5).toString())}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <TextField
                    size="small"
                    type="number"
                    value={volumeActual}
                    onChange={(e) => setVolumeActual(e.target.value)}
                    sx={{ width: 80, textAlign: 'center' }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => setVolumeActual((prev) => (parseInt(prev || '0') + 5).toString())}
                  >
                    <AddIcon />
                  </IconButton>
                  <Typography variant="body2">ml</Typography>
                </Box>

                <Alert severity="info" sx={{ mt: 1 }}>
                  Oral %: <strong>{oralPercentage}%</strong> (actual / prescribed)
                </Alert>
              </Grid>

              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Residual (ml)"
                  type="number"
                  value={residual}
                  onChange={(e) => setResidual(e.target.value)}
                />
              </Grid>

              <Grid item xs={6}>
                <FormControlLabel
                  control={<Checkbox checked={vomiting} onChange={(e) => setVomiting(e.target.checked)} />}
                  label="Vomiting"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any observations..."
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pending Medications */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Medications Due
            </Typography>

            {pendingMeds.length > 0 ? (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Select medications to include in this feed
                </Alert>

                {pendingMeds.map((med) => (
                  <Box
                    key={med.id}
                    sx={{
                      p: 2,
                      mb: 1,
                      border: '1px solid #ddd',
                      borderRadius: 1,
                      bgcolor: selectedMedications.includes(med.id) ? '#e3f2fd' : 'white',
                    }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedMedications.includes(med.id)}
                          onChange={() => toggleMedication(med.id)}
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {med.medicationName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {med.dose.amount} {med.dose.unit} - {med.route}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Scheduled: {format(med.scheduledTime.toDate(), 'HH:mm')}
                          </Typography>
                        </Box>
                      }
                    />
                  </Box>
                ))}
              </>
            ) : (
              <Alert severity="success">
                <CheckCircleIcon sx={{ mr: 1 }} />
                No pending medications for this feed time
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button variant="outlined" onClick={resetForm}>
          Reset
        </Button>
        <Button
          variant="contained"
          size="large"
          onClick={handleSubmit}
          disabled={!volumeActual || !volumePrescribed}
        >
          Record Feed
        </Button>
      </Box>

      {/* Recent Feeds */}
      <Paper sx={{ mt: 4, p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Feeds (24 hours)
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Time</strong>
                </TableCell>
                <TableCell>
                  <strong>Route</strong>
                </TableCell>
                <TableCell>
                  <strong>Volume</strong>
                </TableCell>
                <TableCell>
                  <strong>Oral %</strong>
                </TableCell>
                <TableCell>
                  <strong>Tolerance</strong>
                </TableCell>
                <TableCell>
                  <strong>Medications</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentFeeds
                .slice(-12)
                .reverse()
                .map((feed) => {
                  const feedOralPct = ((feed.volume.actual / feed.volume.prescribed) * 100).toFixed(0);
                  const isOralRoute = feed.route === 'oral_bottle' || feed.route === 'oral_breast';
                  return (
                    <TableRow key={feed.id}>
                      <TableCell>{format(feed.feedTime.toDate(), 'HH:mm')}</TableCell>
                      <TableCell>
                        <Chip
                          label={feed.route.replace('_', ' ')}
                          size="small"
                          color={isOralRoute ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{feed.volume.actual}ml</TableCell>
                      <TableCell>
                        <Chip
                          label={`${feedOralPct}%`}
                          size="small"
                          color={parseInt(feedOralPct) >= 95 ? 'success' : parseInt(feedOralPct) >= 80 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={feed.tolerance}
                          size="small"
                          color={feed.tolerance === 'good' ? 'success' : 'warning'}
                        />
                      </TableCell>
                      <TableCell>
                        {feed.medicationsIncluded.length > 0 ? (
                          <Box>
                            {feed.medicationsIncluded.map((med) => (
                              <Chip
                                key={med.medicationAdministrationId}
                                label={med.medicationName}
                                size="small"
                                sx={{ mr: 0.5 }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            None
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
