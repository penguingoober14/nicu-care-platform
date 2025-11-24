import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockDataStore } from '../../data';
import type { Baby, BloodGasResult } from '../../types';

interface RespiratorySupportProps {
  baby: Baby;
}

export const RespiratorySupport: React.FC<RespiratorySupportProps> = ({ baby }) => {
  const [addBloodGasOpen, setAddBloodGasOpen] = useState(false);

  // Get blood gas results for this baby
  const bloodGasResults = mockDataStore.bloodGas
    .filter((bg) => bg.babyId === baby.id)
    .sort((a, b) => b.sampleDate.toMillis() - a.sampleDate.toMillis());

  // Get latest 24hr resume for respiratory status
  const latest24hrResume = mockDataStore.twentyFourHrResume
    .filter((resume) => resume.babyId === baby.id)
    .sort((a, b) => b.resumeDate.toMillis() - a.resumeDate.toMillis())[0];

  // Prepare chart data
  const chartData = bloodGasResults
    .slice()
    .reverse()
    .map((bg) => ({
      date: new Date(bg.sampleDate.toMillis()).toLocaleDateString(),
      pH: bg.pH,
      pCO2: bg.pCO2,
      pO2: bg.pO2,
      lactate: bg.lactate,
    }));

  return (
    <Box>
      {/* Current Respiratory Status */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Respiratory Status
          </Typography>
          {latest24hrResume ? (
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Respiratory Support
                </Typography>
                <Typography variant="h6">
                  {latest24hrResume.respiratory.mode.replace(/_/g, ' ').toUpperCase()}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Oxygen Requirement
                </Typography>
                <Typography variant="h6">{latest24hrResume.respiratory.oxygenRange}</Typography>
              </Grid>
              {latest24hrResume.respiratory.settings && (
                <>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      FiO₂ Range
                    </Typography>
                    <Typography variant="body1">
                      {latest24hrResume.respiratory.settings.fiO2Range || 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      PEEP
                    </Typography>
                    <Typography variant="body1">
                      {latest24hrResume.respiratory.settings.peep
                        ? `${latest24hrResume.respiratory.settings.peep} cmH₂O`
                        : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      PIP
                    </Typography>
                    <Typography variant="body1">
                      {latest24hrResume.respiratory.settings.pip
                        ? `${latest24hrResume.respiratory.settings.pip} cmH₂O`
                        : 'N/A'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Rate
                    </Typography>
                    <Typography variant="body1">
                      {latest24hrResume.respiratory.settings.rate
                        ? `${latest24hrResume.respiratory.settings.rate} bpm`
                        : 'N/A'}
                    </Typography>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Spontaneous Breathing
                </Typography>
                <Chip
                  label={latest24hrResume.respiratory.spontaneousBreathing ? 'Yes' : 'No'}
                  color={latest24hrResume.respiratory.spontaneousBreathing ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">No recent respiratory assessment available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Blood Gas Trends */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Blood Gas Trends</Typography>
            <Button variant="outlined" size="small" onClick={() => setAddBloodGasOpen(true)}>
              Add Blood Gas
            </Button>
          </Box>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="pH" stroke="#8884d8" name="pH" />
                <Line yAxisId="right" type="monotone" dataKey="pCO2" stroke="#82ca9d" name="pCO₂ (kPa)" />
                <Line yAxisId="right" type="monotone" dataKey="pO2" stroke="#ffc658" name="pO₂ (kPa)" />
                <Line yAxisId="right" type="monotone" dataKey="lactate" stroke="#ff7c7c" name="Lactate (mmol/L)" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Alert severity="info">No blood gas results available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Blood Gas Results Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Blood Gas Results History
          </Typography>
          {bloodGasResults.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date/Time</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>pH</TableCell>
                    <TableCell>pCO₂</TableCell>
                    <TableCell>pO₂</TableCell>
                    <TableCell>BE</TableCell>
                    <TableCell>HCO₃</TableCell>
                    <TableCell>Lactate</TableCell>
                    <TableCell>Hb</TableCell>
                    <TableCell>Glucose</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {bloodGasResults.map((bg) => (
                    <TableRow key={bg.id}>
                      <TableCell>
                        {new Date(bg.sampleDate.toMillis()).toLocaleDateString()}
                        <br />
                        <Typography variant="caption" color="text.secondary">
                          {bg.sampleTime}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={bg.sampleType}
                          size="small"
                          color={bg.sampleType === 'arterial' ? 'error' : 'default'}
                        />
                      </TableCell>
                      <TableCell
                        sx={{
                          color: bg.pH && (bg.pH < 7.3 || bg.pH > 7.45) ? 'error.main' : 'text.primary',
                          fontWeight: bg.pH && (bg.pH < 7.3 || bg.pH > 7.45) ? 'bold' : 'normal',
                        }}
                      >
                        {bg.pH?.toFixed(2) || '-'}
                      </TableCell>
                      <TableCell>{bg.pCO2?.toFixed(1) || '-'}</TableCell>
                      <TableCell>{bg.pO2?.toFixed(1) || '-'}</TableCell>
                      <TableCell>{bg.baseExcess?.toFixed(1) || '-'}</TableCell>
                      <TableCell>{bg.HCO3?.toFixed(1) || '-'}</TableCell>
                      <TableCell
                        sx={{
                          color: bg.lactate && bg.lactate > 2.0 ? 'error.main' : 'text.primary',
                          fontWeight: bg.lactate && bg.lactate > 2.0 ? 'bold' : 'normal',
                        }}
                      >
                        {bg.lactate?.toFixed(1) || '-'}
                      </TableCell>
                      <TableCell>{bg.hemoglobin || '-'}</TableCell>
                      <TableCell>{bg.glucose?.toFixed(1) || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No blood gas results recorded</Alert>
          )}
        </CardContent>
      </Card>

      {/* Add Blood Gas Dialog (placeholder) */}
      <Dialog open={addBloodGasOpen} onClose={() => setAddBloodGasOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Blood Gas Result</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            This is a demo interface. In production, this would allow adding new blood gas results.
          </Alert>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Sample Type</InputLabel>
                <Select label="Sample Type" defaultValue="capillary">
                  <MenuItem value="arterial">Arterial</MenuItem>
                  <MenuItem value="venous">Venous</MenuItem>
                  <MenuItem value="capillary">Capillary</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Sample Site" placeholder="e.g., Right heel" />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="pH" type="number" inputProps={{ step: 0.01 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="pCO₂ (kPa)" type="number" inputProps={{ step: 0.1 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="pO₂ (kPa)" type="number" inputProps={{ step: 0.1 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Base Excess" type="number" inputProps={{ step: 0.1 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="HCO₃ (mmol/L)" type="number" inputProps={{ step: 0.1 }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Lactate (mmol/L)" type="number" inputProps={{ step: 0.1 }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddBloodGasOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={() => setAddBloodGasOpen(false)}>
            Save (Demo)
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
