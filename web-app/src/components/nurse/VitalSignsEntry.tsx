import React, { useState } from 'react';
import { Box, TextField, Button, Grid, Alert } from '@mui/material';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { mockDataStore } from '../../data';
import type { Baby, VitalSign } from '../../types';
import { PageHeader, SectionCard, DataTable, Column } from '../shared';

interface Props {
  baby: Baby;
}

export default function VitalSignsEntry({ baby }: Props) {
  const [weight, setWeight] = useState('');
  const [temperature, setTemperature] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [respiratoryRate, setRespiratoryRate] = useState('');
  const [oxygenSat, setOxygenSat] = useState('');
  const [bpSystolic, setBpSystolic] = useState('');
  const [bpDiastolic, setBpDiastolic] = useState('');
  const [notes, setNotes] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    const newVitalSign: VitalSign = {
      id: `vs-${Date.now()}`,
      babyId: baby.id,
      recordedAt: Timestamp.now(),
      recordedBy: 'sarah-nurse',
      weight: weight ? { value: parseFloat(weight) } : undefined,
      temperature: temperature ? { value: parseFloat(temperature), site: 'axillary' } : undefined,
      heartRate: heartRate ? { value: parseInt(heartRate) } : undefined,
      respiratoryRate: respiratoryRate ? { value: parseInt(respiratoryRate) } : undefined,
      oxygenSaturation: oxygenSat ? { value: parseInt(oxygenSat) } : undefined,
      bloodPressure:
        bpSystolic && bpDiastolic
          ? { systolic: parseInt(bpSystolic), diastolic: parseInt(bpDiastolic) }
          : undefined,
      notes,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    mockDataStore.vitalSigns.push(newVitalSign);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    resetForm();
  };

  const resetForm = () => {
    setWeight('');
    setTemperature('');
    setHeartRate('');
    setRespiratoryRate('');
    setOxygenSat('');
    setBpSystolic('');
    setBpDiastolic('');
    setNotes('');
  };

  const recentVitals = mockDataStore.vitalSigns.filter((v) => v.babyId === baby.id).slice(-10).reverse();

  const columns: Column<VitalSign>[] = [
    {
      id: 'recordedAt',
      label: 'Time',
      format: (value) => format(value.toDate(), 'MMM dd HH:mm'),
    },
    {
      id: 'weight',
      label: 'Weight (g)',
      format: (value) => value?.value || '-',
    },
    {
      id: 'temperature',
      label: 'Temp (°C)',
      format: (value) => value?.value || '-',
    },
    {
      id: 'heartRate',
      label: 'HR',
      format: (value) => value?.value || '-',
    },
    {
      id: 'respiratoryRate',
      label: 'RR',
      format: (value) => value?.value || '-',
    },
    {
      id: 'oxygenSaturation',
      label: 'SpO2',
      format: (value) => (value?.value ? `${value.value}%` : '-'),
    },
  ];

  return (
    <Box>
      <PageHeader title={`Record Vital Signs - ${baby.firstName} ${baby.lastName}`} />

      {showSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Vital signs recorded successfully!
        </Alert>
      )}

      <SectionCard sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Weight (g)"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Temperature (°C)"
              type="number"
              inputProps={{ step: '0.1' }}
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Heart Rate (bpm)"
              type="number"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Respiratory Rate"
              type="number"
              value={respiratoryRate}
              onChange={(e) => setRespiratoryRate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="O2 Saturation (%)"
              type="number"
              value={oxygenSat}
              onChange={(e) => setOxygenSat(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="BP Systolic"
              type="number"
              value={bpSystolic}
              onChange={(e) => setBpSystolic(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="BP Diastolic"
              type="number"
              value={bpDiastolic}
              onChange={(e) => setBpDiastolic(e.target.value)}
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
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={resetForm}>
            Reset
          </Button>
          <Button variant="contained" onClick={handleSubmit}>
            Record Vital Signs
          </Button>
        </Box>
      </SectionCard>

      <SectionCard title="Recent Vital Signs">
        <DataTable
          columns={columns}
          data={recentVitals}
          getRowId={(row) => row.id}
          emptyMessage="No vital signs recorded"
        />
      </SectionCard>
    </Box>
  );
}
