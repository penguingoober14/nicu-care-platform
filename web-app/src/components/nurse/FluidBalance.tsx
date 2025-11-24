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
  Alert,
  Button,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';

interface FluidBalanceProps {
  baby: Baby;
}

export const FluidBalance: React.FC<FluidBalanceProps> = ({ baby }) => {
  // Get fluid balance records for this baby
  const fluidBalanceRecords = mockDataStore.fluidBalance
    .filter((fb) => fb.babyId === baby.id)
    .sort((a, b) => b.date.toMillis() - a.date.toMillis());

  // Calculate 24hr totals
  const last24hrRecords = fluidBalanceRecords.filter((fb) => {
    const recordDate = new Date(fb.date.toMillis());
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return recordDate >= yesterday;
  });

  const totals24hr = last24hrRecords.reduce(
    (acc, fb) => ({
      intake: acc.intake + fb.intake.total,
      output: acc.output + fb.output.total,
      balance: acc.balance + fb.netBalance,
    }),
    { intake: 0, output: 0, balance: 0 }
  );

  // Prepare chart data
  const chartData = fluidBalanceRecords.slice().reverse().map((fb) => ({
    timeSlot: fb.timeSlot,
    intake: fb.intake.total,
    output: fb.output.total,
    balance: fb.netBalance,
  }));

  return (
    <Box>
      {/* 24-Hour Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            24-Hour Fluid Balance Summary
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Intake
                </Typography>
                <Typography variant="h4" color="primary">
                  {totals24hr.intake} ml
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: 'warning.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Total Output
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {totals24hr.output} ml
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  p: 2,
                  border: '2px solid',
                  borderColor: totals24hr.balance >= 0 ? 'success.main' : 'error.main',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Net Balance
                </Typography>
                <Typography variant="h4" color={totals24hr.balance >= 0 ? 'success.main' : 'error.main'}>
                  {totals24hr.balance > 0 ? '+' : ''}
                  {totals24hr.balance} ml
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Fluid Balance Chart */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Fluid Balance Chart</Typography>
            <Button variant="outlined" size="small">
              Add Entry
            </Button>
          </Box>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="timeSlot" />
                <YAxis label={{ value: 'Volume (ml)', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="intake" fill="#4caf50" name="Intake (ml)" />
                <Bar dataKey="output" fill="#ff9800" name="Output (ml)" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Alert severity="info">No fluid balance data available</Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Fluid Balance Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Fluid Balance Records
          </Typography>
          {fluidBalanceRecords.length > 0 ? (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Time Slot</TableCell>
                    <TableCell colSpan={5} align="center" sx={{ bgcolor: 'primary.light', color: 'white' }}>
                      Intake (ml)
                    </TableCell>
                    <TableCell colSpan={5} align="center" sx={{ bgcolor: 'warning.light', color: 'white' }}>
                      Output (ml)
                    </TableCell>
                    <TableCell colSpan={2} align="center" sx={{ bgcolor: 'grey.300' }}>
                      Balance
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell></TableCell>
                    <TableCell></TableCell>
                    <TableCell>IV</TableCell>
                    <TableCell>Enteral</TableCell>
                    <TableCell>Meds</TableCell>
                    <TableCell>Blood</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Urine</TableCell>
                    <TableCell>Stool</TableCell>
                    <TableCell>Aspirates</TableCell>
                    <TableCell>Drains</TableCell>
                    <TableCell>Total</TableCell>
                    <TableCell>Net</TableCell>
                    <TableCell>Cumulative</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fluidBalanceRecords.map((fb) => (
                    <TableRow key={fb.id}>
                      <TableCell>{new Date(fb.date.toMillis()).toLocaleDateString()}</TableCell>
                      <TableCell>{fb.timeSlot}</TableCell>
                      <TableCell>{fb.intake.iv || '-'}</TableCell>
                      <TableCell>{fb.intake.enteral || '-'}</TableCell>
                      <TableCell>{fb.intake.medications || '-'}</TableCell>
                      <TableCell>{fb.intake.bloodProducts || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.50' }}>{fb.intake.total}</TableCell>
                      <TableCell>{fb.output.urine || '-'}</TableCell>
                      <TableCell>{fb.output.stool || '-'}</TableCell>
                      <TableCell>{fb.output.aspirates || '-'}</TableCell>
                      <TableCell>{fb.output.drainLosses || '-'}</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', bgcolor: 'warning.50' }}>{fb.output.total}</TableCell>
                      <TableCell
                        sx={{
                          fontWeight: 'bold',
                          color: fb.netBalance >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {fb.netBalance > 0 ? '+' : ''}
                        {fb.netBalance}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>{fb.cumulativeBalance}</TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell colSpan={2} sx={{ fontWeight: 'bold' }}>
                      24hr TOTAL
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.intake.iv || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.intake.enteral || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.intake.medications || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.intake.bloodProducts || 0), 0) || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'primary.100' }}>{totals24hr.intake}</TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.output.urine || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.output.stool || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.output.aspirates || 0), 0) || '-'}
                    </TableCell>
                    <TableCell>
                      {last24hrRecords.reduce((sum, fb) => sum + (fb.output.drainLosses || 0), 0) || '-'}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: 'warning.100' }}>{totals24hr.output}</TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        color: totals24hr.balance >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {totals24hr.balance > 0 ? '+' : ''}
                      {totals24hr.balance}
                    </TableCell>
                    <TableCell>-</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="info">No fluid balance records available</Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Urine Output:</strong> Target 1-3 ml/kg/hr for neonates
                <br />
                <strong>Weight:</strong> {baby.birthWeight}g (use current weight for accurate ml/kg/hr calculations)
              </Typography>
            </Alert>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
