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
  Button,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';

interface GrowthTrackingProps {
  baby: Baby;
}

export const GrowthTracking: React.FC<GrowthTrackingProps> = ({ baby }) => {
  // Get weight chart for this baby
  const weightChart = mockDataStore.weightCharts.find((chart) => chart.babyId === baby.id);

  if (!weightChart) {
    return <Alert severity="info">No growth data available for this baby</Alert>;
  }

  // Prepare chart data
  const chartData = weightChart.weights.map((w) => ({
    day: w.ageInDays,
    weightKg: w.weightKg,
    percentile: w.percentile,
  }));

  const latestWeight = weightChart.weights[weightChart.weights.length - 1];
  const growthAssessment = weightChart.growthAssessment;

  const getGrowthVelocityColor = (velocity: string) => {
    switch (velocity) {
      case 'good':
      case 'adequate':
        return 'success';
      case 'poor':
        return 'error';
      case 'excessive':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Current Weight Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Current Weight Status
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
                <Typography variant="body2" color="text.secondary">
                  Current Weight
                </Typography>
                <Typography variant="h4" color="primary">
                  {latestWeight.weightGrams}g
                </Typography>
                <Typography variant="caption">{latestWeight.weightKg}kg</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Birth Weight
                </Typography>
                <Typography variant="h4">{baby.birthWeight}g</Typography>
                {growthAssessment && (
                  <Chip
                    label={growthAssessment.backToBirthWeight ? 'Back to BW' : 'Below BW'}
                    color={growthAssessment.backToBirthWeight ? 'success' : 'warning'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Weight Gain
                </Typography>
                <Typography variant="h4">
                  {growthAssessment ? `${growthAssessment.weightGain}g` : '-'}
                </Typography>
                <Typography variant="caption">
                  {growthAssessment ? `${growthAssessment.averageDailyGain.toFixed(1)}g/day` : ''}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Percentile
                </Typography>
                <Typography variant="h4">{latestWeight.percentile || '-'}</Typography>
                <Typography variant="caption">{weightChart.chartType}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Growth Assessment */}
      {growthAssessment && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Growth Assessment
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Growth Velocity"
                      secondary={
                        <Chip
                          label={growthAssessment.growthVelocity}
                          color={getGrowthVelocityColor(growthAssessment.growthVelocity)}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Average Daily Gain"
                      secondary={`${growthAssessment.averageDailyGain.toFixed(1)}g/day`}
                    />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Back to Birth Weight"
                      secondary={
                        growthAssessment.backToBirthWeight
                          ? `Yes (Day ${
                              weightChart.weights.findIndex(
                                (w) => w.weightGrams >= baby.birthWeight
                              )
                            })`
                          : 'Not yet'
                      }
                    />
                  </ListItem>
                  {growthAssessment.percentWeightLoss && (
                    <ListItem>
                      <ListItemText
                        primary="Max Weight Loss"
                        secondary={`${growthAssessment.percentWeightLoss.toFixed(1)}%`}
                      />
                    </ListItem>
                  )}
                </List>
              </Grid>
              <Grid item xs={12} md={4}>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Nutritional Concerns"
                      secondary={
                        <Chip
                          label={growthAssessment.nutritionalConcerns ? 'Yes' : 'No'}
                          color={growthAssessment.nutritionalConcerns ? 'warning' : 'success'}
                          size="small"
                        />
                      }
                    />
                  </ListItem>
                  {growthAssessment.nutritionalPlan && (
                    <ListItem>
                      <ListItemText primary="Plan" secondary={growthAssessment.nutritionalPlan} />
                    </ListItem>
                  )}
                </List>
              </Grid>
              {growthAssessment.nutritionalConcerns && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    Nutritional concerns identified. Dietitian review recommended.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Weight Growth Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Weight Growth Chart</Typography>
            <Button variant="outlined" size="small">
              Add Weight
            </Button>
          </Box>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" label={{ value: 'Age (days)', position: 'insideBottom', offset: -5 }} />
              <YAxis
                yAxisId="left"
                label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                domain={['dataMin - 0.1', 'dataMax + 0.1']}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                label={{ value: 'Percentile', angle: 90, position: 'insideRight' }}
                domain={[0, 100]}
              />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="weightKg"
                stroke="#8884d8"
                strokeWidth={2}
                name="Weight (kg)"
                dot={{ r: 4 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="percentile"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Percentile"
                dot={{ r: 3 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weight History Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Daily Weight History
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Age (Days)</TableCell>
                  <TableCell>Corrected GA</TableCell>
                  <TableCell>Weight (g)</TableCell>
                  <TableCell>Weight (kg)</TableCell>
                  <TableCell>Percentile</TableCell>
                  <TableCell>Z-Score</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Measured By</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weightChart.weights
                  .slice()
                  .reverse()
                  .map((weight, idx) => {
                    const prevWeight = idx < weightChart.weights.length - 1 ? weightChart.weights[weightChart.weights.length - 2 - idx] : null;
                    const dailyChange = prevWeight ? weight.weightGrams - prevWeight.weightGrams : 0;

                    return (
                      <TableRow key={idx}>
                        <TableCell>{new Date(weight.date.toMillis()).toLocaleDateString()}</TableCell>
                        <TableCell>{weight.ageInDays}</TableCell>
                        <TableCell>
                          {weight.correctedGestationalAge.weeks}+{weight.correctedGestationalAge.days}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {weight.weightGrams}
                            {prevWeight && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: dailyChange > 0 ? 'success.main' : dailyChange < 0 ? 'error.main' : 'text.secondary',
                                }}
                              >
                                ({dailyChange > 0 ? '+' : ''}
                                {dailyChange}g)
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{weight.weightKg}</TableCell>
                        <TableCell>{weight.percentile || '-'}</TableCell>
                        <TableCell>{weight.zScore?.toFixed(2) || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={weight.measurementMethod}
                            size="small"
                            color={weight.measurementMethod === 'scale' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption">{weight.measuredBy}</Typography>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Expected Weight Gain:</strong> Preterm infants should gain 15-20g/kg/day once feeding is
                established. Target weight for discharge is typically 1800-2000g depending on gestational age and
                clinical condition.
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
