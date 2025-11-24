import React, { useState } from 'react';
import {
  Box,
  Typography,
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
  FormControlLabel,
  Checkbox,
  Alert,
} from '@mui/material';
import { format } from 'date-fns';
import { mockDataStore, DEMO_MEDICATIONS } from '../../config/mockData';
import type { Baby, MedicationAdministration } from '../../types';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import { Timestamp } from 'firebase/firestore';

interface Props {
  baby: Baby;
}

export default function MedicationSchedule({ baby }: Props) {
  const [selectedMed, setSelectedMed] = useState<MedicationAdministration | null>(null);
  const [administerDialog, setAdministerDialog] = useState(false);
  const [administrationMethod, setAdministrationMethod] = useState<'separately' | 'in_feed'>('separately');
  const [notes, setNotes] = useState('');

  // Get today's medications for this baby
  const todaysMeds = DEMO_MEDICATIONS.filter((med) => med.babyId === baby.id);

  const handleAdminister = (med: MedicationAdministration) => {
    setSelectedMed(med);
    setAdministrationMethod(med.administrationMethod);
    setAdministerDialog(true);
  };

  const confirmAdministration = () => {
    if (!selectedMed) return;

    // Update the medication status
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

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Pending" color="warning" size="small" icon={<PendingIcon />} />;
      case 'given':
        return <Chip label="Given" color="success" size="small" icon={<CheckCircleIcon />} />;
      case 'missed':
        return <Chip label="Missed" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  // Get prescription details
  const getPrescription = (prescriptionId: string) => {
    return mockDataStore.prescriptions.find((p) => p.id === prescriptionId);
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold' }}>
        Medication Schedule - {baby.firstName} {baby.lastName}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Tip:</strong> Medications marked with "Can be given in feed" can be administered during feeding.
        IV medications must be given separately.
      </Alert>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: '#f5f5f5' }}>
              <TableCell><strong>Time</strong></TableCell>
              <TableCell><strong>Medication</strong></TableCell>
              <TableCell><strong>Dose</strong></TableCell>
              <TableCell><strong>Route</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Method</strong></TableCell>
              <TableCell><strong>Action</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {todaysMeds.map((med) => {
              const prescription = getPrescription(med.prescriptionId);
              return (
                <TableRow key={med.id} sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {format(med.scheduledTime.toDate(), 'HH:mm')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{med.medicationName}</Typography>
                    {prescription?.canBeGivenInFeed && (
                      <Chip label="Can be in feed" size="small" color="info" sx={{ mt: 0.5 }} />
                    )}
                    {prescription?.mustBeGivenSeparately && (
                      <Chip label="Must be separate" size="small" color="warning" sx={{ mt: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell>
                    {med.dose.amount} {med.dose.unit}
                  </TableCell>
                  <TableCell>
                    <Chip label={med.route} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{getStatusChip(med.status)}</TableCell>
                  <TableCell>
                    {med.status === 'given' ? (
                      <Chip
                        label={med.administrationMethod === 'in_feed' ? 'In Feed' : 'Separately'}
                        size="small"
                        color={med.administrationMethod === 'in_feed' ? 'primary' : 'default'}
                      />
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {med.status === 'pending' && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleAdminister(med)}
                      >
                        Administer
                      </Button>
                    )}
                    {med.status === 'given' && med.administeredTime && (
                      <Typography variant="caption" color="text.secondary">
                        Given at {format(med.administeredTime.toDate(), 'HH:mm')}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {todaysMeds.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No medications scheduled for today</Typography>
        </Box>
      )}

      {/* Administer Medication Dialog */}
      <Dialog open={administerDialog} onClose={() => setAdministerDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Administer Medication</DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAdministerDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={confirmAdministration}>
            Confirm Administration
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
