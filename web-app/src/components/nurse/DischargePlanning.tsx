import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  LinearProgress,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';

interface DischargePlanningProps {
  baby: Baby;
}

export const DischargePlanning: React.FC<DischargePlanningProps> = ({ baby }) => {
  const dischargeChecklist = mockDataStore.dischargeChecklists.find((dc) => dc.babyId === baby.id);

  if (!dischargeChecklist) {
    return (
      <Alert severity="info">
        No discharge checklist created yet. Start discharge planning by creating a new checklist.
      </Alert>
    );
  }

  // Calculate progress
  const calculateProgress = () => {
    const items = [
      ...Object.values(dischargeChecklist.communityReferrals),
      ...Object.values(dischargeChecklist.hospitalReferrals).filter((v) => typeof v === 'boolean'),
      ...Object.values(dischargeChecklist.infantServicesRequired)
        .filter((v) => !Array.isArray(v) && typeof v === 'object')
        .map((v: any) => v.required && (v.completed || v.arranged)),
      ...Object.values(dischargeChecklist.parentEducation),
      dischargeChecklist.redBookCompleted,
      dischargeChecklist.dischargeSummary.completed,
    ];
    const completed = items.filter((v) => v === true).length;
    return (completed / items.length) * 100;
  };

  const progress = calculateProgress();

  return (
    <Box>
      {/* Discharge Progress */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Discharge Readiness</Typography>
            <Button variant="outlined">Edit Checklist</Button>
          </Box>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">Overall Progress</Typography>
              <Typography variant="body2" fontWeight="bold">
                {progress.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 5 }} />
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Planned Discharge Date
              </Typography>
              <Typography variant="h6">
                {dischargeChecklist.plannedDischargeDate
                  ? new Date(dischargeChecklist.plannedDischargeDate.toMillis()).toLocaleDateString()
                  : 'Not set'}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Discharge Destination
              </Typography>
              <Chip label={dischargeChecklist.dischargeDestination} color="primary" />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Family Details */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Family Details</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Parents
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Mother" secondary={dischargeChecklist.motherName} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Father" secondary={dischargeChecklist.fatherName || 'N/A'} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Relationship Status" secondary={dischargeChecklist.parentalRelationshipStatus} />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                GP Details
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemText primary="Practice" secondary={dischargeChecklist.gpDetails.practiceName} />
                </ListItem>
                {dischargeChecklist.gpDetails.gpName && (
                  <ListItem>
                    <ListItemText primary="GP Name" secondary={dischargeChecklist.gpDetails.gpName} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.gpDetails.registered ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon color="error" />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Registered" secondary={dischargeChecklist.gpDetails.registered ? 'Yes' : 'No'} />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Community Referrals */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Community Referrals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {Object.entries(dischargeChecklist.communityReferrals).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {value ? <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : <RadioButtonUncheckedIcon sx={{ mr: 1 }} />}
                  <Typography variant="body2">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Hospital Referrals */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Hospital Referrals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {Object.entries(dischargeChecklist.hospitalReferrals)
              .filter(([key]) => !key.includes('Date'))
              .map(([key, value]) => {
                const dateKey = `${key}Date` as keyof typeof dischargeChecklist.hospitalReferrals;
                const appointmentDate = dischargeChecklist.hospitalReferrals[dateKey];
                return (
                  <Grid item xs={12} key={key}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {value ? <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : <RadioButtonUncheckedIcon sx={{ mr: 1 }} />}
                        <Typography variant="body2">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                      </Box>
                      {appointmentDate && typeof appointmentDate !== 'boolean' && !Array.isArray(appointmentDate) && typeof appointmentDate === 'object' && 'toMillis' in appointmentDate && (
                        <Chip
                          label={new Date(appointmentDate.toMillis()).toLocaleDateString()}
                          size="small"
                          color="info"
                        />
                      )}
                    </Box>
                  </Grid>
                );
              })}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Parent Education */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Parent Education</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {Object.entries(dischargeChecklist.parentEducation).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {value ? <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : <RadioButtonUncheckedIcon sx={{ mr: 1 }} />}
                  <Typography variant="body2">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Medications Going Home */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Medications Going Home</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {dischargeChecklist.medicationsGoingHome.length > 0 ? (
            <List>
              {dischargeChecklist.medicationsGoingHome.map((med, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={med.medication}
                      secondary={`${med.dose} - ${med.frequency} ${med.duration ? `(${med.duration})` : ''}`}
                    />
                    <Chip
                      label={med.prescriptionProvided ? 'Prescription provided' : 'Prescription pending'}
                      color={med.prescriptionProvided ? 'success' : 'warning'}
                      size="small"
                    />
                  </ListItem>
                  {idx < dischargeChecklist.medicationsGoingHome.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">No medications required at discharge</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Equipment Going Home */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Equipment Going Home</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            {Object.entries(dischargeChecklist.equipmentGoingHome).map(([key, value]) => (
              <Grid item xs={12} sm={6} md={4} key={key}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {value ? <CheckCircleIcon color="success" sx={{ mr: 1 }} /> : <RadioButtonUncheckedIcon sx={{ mr: 1 }} />}
                  <Typography variant="body2">{key.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {!Object.values(dischargeChecklist.equipmentGoingHome).some((v) => v) && (
            <Alert severity="info">No special equipment required</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Follow-up Appointments */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Follow-up Appointments</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {dischargeChecklist.followUpAppointments.length > 0 ? (
            <List>
              {dischargeChecklist.followUpAppointments.map((appt, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={appt.service}
                      secondary={
                        <>
                          {appt.location && `${appt.location} | `}
                          {appt.date ? new Date(appt.date.toMillis()).toLocaleDateString() : 'Date TBC'}
                        </>
                      }
                    />
                    <Chip label={appt.booked ? 'Booked' : 'Pending'} color={appt.booked ? 'success' : 'warning'} size="small" />
                  </ListItem>
                  {idx < dischargeChecklist.followUpAppointments.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Alert severity="info">No follow-up appointments scheduled</Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Discharge Documentation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Discharge Documentation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Discharge Summary
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.dischargeSummary.completed ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Completed" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.dischargeSummary.sentToGP ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Sent to GP" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.dischargeSummary.sentToHealthVisitor ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Sent to Health Visitor" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.dischargeSummary.copyToParents ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Copy to Parents" />
                </ListItem>
              </List>
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Red Book (Personal Child Health Record)
              </Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.redBookCompleted ? <CheckCircleIcon color="success" /> : <RadioButtonUncheckedIcon />}
                  </ListItemIcon>
                  <ListItemText primary="Completed" />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    {dischargeChecklist.redBookGivenToParents ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <RadioButtonUncheckedIcon />
                    )}
                  </ListItemIcon>
                  <ListItemText primary="Given to Parents" />
                </ListItem>
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Transport & Car Seat */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transport Arrangements
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Transport Method
              </Typography>
              <Chip label={dischargeChecklist.transportHome} color="primary" />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                Car Seat
              </Typography>
              <Chip
                label={dischargeChecklist.carSeatAvailable ? 'Available' : 'Not available'}
                color={dischargeChecklist.carSeatAvailable ? 'success' : 'error'}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};
