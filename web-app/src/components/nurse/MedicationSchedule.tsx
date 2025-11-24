import React, { useState } from 'react';
import { Box, Typography, Button, TextField, FormControlLabel, Checkbox, Alert, Chip } from '@mui/material';
import { format } from 'date-fns';
import { mockDataStore, DEMO_MEDICATIONS } from '../../data';
import type { Baby, MedicationAdministration } from '../../types';
import { Timestamp } from 'firebase/firestore';
import { PageHeader, DataTable, StatusChip, FormDialog, Column } from '../shared';

interface Props {
  baby: Baby;
}

export default function MedicationSchedule({ baby }: Props) {
  const [selectedMed, setSelectedMed] = useState<MedicationAdministration | null>(null);
  const [administerDialog, setAdministerDialog] = useState(false);
  const [administrationMethod, setAdministrationMethod] = useState<'separately' | 'in_feed'>('separately');
  const [notes, setNotes] = useState('');

  const todaysMeds = DEMO_MEDICATIONS.filter((med) => med.babyId === baby.id);

  const handleAdminister = (med: MedicationAdministration) => {
    setSelectedMed(med);
    setAdministrationMethod(med.administrationMethod);
    setAdministerDialog(true);
  };

  const confirmAdministration = () => {
    if (!selectedMed) return;

    const index = DEMO_MEDICATIONS.findIndex((m) => m.id === selectedMed.id);
    if (index !== -1) {
      DEMO_MEDICATIONS[index] = {
        ...DEMO_MEDICATIONS[index],
        status: 'given',
        administeredTime: Timestamp.now(),
        administeredBy: 'sarah-nurse',
        administrationMethod,
        notes,
      };
    }

    setAdministerDialog(false);
    setSelectedMed(null);
    setNotes('');
  };

  const getPrescription = (prescriptionId: string) => {
    return mockDataStore.prescriptions.find((p) => p.id === prescriptionId);
  };

  const columns: Column<MedicationAdministration>[] = [
    {
      id: 'scheduledTime',
      label: 'Time',
      format: (value) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {format(value.toDate(), 'HH:mm')}
        </Typography>
      ),
    },
    {
      id: 'medicationName',
      label: 'Medication',
      format: (value, row) => {
        const prescription = getPrescription(row.prescriptionId);
        return (
          <Box>
            <Typography variant="body2">{value}</Typography>
            {prescription?.canBeGivenInFeed && (
              <Chip label="Can be in feed" size="small" color="info" sx={{ mt: 0.5 }} />
            )}
            {prescription?.mustBeGivenSeparately && (
              <Chip label="Must be separate" size="small" color="warning" sx={{ mt: 0.5 }} />
            )}
          </Box>
        );
      },
    },
    {
      id: 'dose',
      label: 'Dose',
      format: (dose) => `${dose.amount} ${dose.unit}`,
    },
    {
      id: 'route',
      label: 'Route',
      format: (route) => <Chip label={route} size="small" variant="outlined" />,
    },
    {
      id: 'status',
      label: 'Status',
      format: (status) => <StatusChip status={status} />,
    },
    {
      id: 'administrationMethod',
      label: 'Method',
      format: (method, row) =>
        row.status === 'given' ? (
          <Chip
            label={method === 'in_feed' ? 'In Feed' : 'Separately'}
            size="small"
            color={method === 'in_feed' ? 'primary' : 'default'}
          />
        ) : (
          '-'
        ),
    },
    {
      id: 'id',
      label: 'Action',
      format: (_, row) => {
        if (row.status === 'pending') {
          return (
            <Button variant="contained" size="small" onClick={() => handleAdminister(row)}>
              Administer
            </Button>
          );
        }
        if (row.status === 'given' && row.administeredTime) {
          return (
            <Typography variant="caption" color="text.secondary">
              Given at {format(row.administeredTime.toDate(), 'HH:mm')}
            </Typography>
          );
        }
        return null;
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title={`Medication Schedule - ${baby.firstName} ${baby.lastName}`}
      />

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tip:</strong> Medications marked with "Can be given in feed" can be administered during feeding.
        IV medications must be given separately.
      </Alert>

      <DataTable
        columns={columns}
        data={todaysMeds}
        getRowId={(row) => row.id}
        emptyMessage="No medications scheduled for today"
      />

      <FormDialog
        open={administerDialog}
        onClose={() => setAdministerDialog(false)}
        title="Administer Medication"
        onSubmit={confirmAdministration}
        submitLabel="Confirm Administration"
      >
        {selectedMed && (
          <Box sx={{ pt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              {selectedMed.medicationName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Dose: {selectedMed.dose.amount} {selectedMed.dose.unit} | Route: {selectedMed.route}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Administration Method:
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={administrationMethod === 'separately'}
                    onChange={() => setAdministrationMethod('separately')}
                  />
                }
                label="Given separately"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={administrationMethod === 'in_feed'}
                    onChange={() => setAdministrationMethod('in_feed')}
                    disabled={getPrescription(selectedMed.prescriptionId)?.mustBeGivenSeparately}
                  />
                }
                label="Given in feed (will be recorded with feed)"
              />
            </Box>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any observations or comments..."
            />
          </Box>
        )}
      </FormDialog>
    </Box>
  );
}
