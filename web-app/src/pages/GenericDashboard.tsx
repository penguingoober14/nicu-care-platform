import React from 'react';
import {
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  Button,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDataStore } from '../config/mockData';
import LogoutIcon from '@mui/icons-material/Logout';
import { ROLE_DISPLAY_NAMES } from '../types';

export default function GenericDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const babies = mockDataStore.babies;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#7b1fa2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            NICU Care Platform - {currentUser && ROLE_DISPLAY_NAMES[currentUser.role]}
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {currentUser?.firstName} {currentUser?.lastName}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Change Role
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" sx={{ mb: 4 }}>
          Welcome, {currentUser?.firstName}
        </Typography>

        <Grid container spacing={3}>
          {babies.map((baby) => (
            <Grid item xs={12} md={6} key={baby.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {baby.firstName} {baby.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Room: {baby.bedNumber}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Gestational Age: {baby.gestationalAgeAtBirth.weeks}+{baby.gestationalAgeAtBirth.days} weeks
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Birth Weight: {baby.birthWeight}g
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 2 }}>
                    <strong>Diagnoses:</strong>
                  </Typography>
                  {baby.diagnoses.map((diagnosis, idx) => (
                    <Typography key={idx} variant="body2" color="text.secondary">
                      • {diagnosis}
                    </Typography>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Card sx={{ mt: 4, p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            {currentUser?.role === 'consultant' && 'Consultant Dashboard'}
            {currentUser?.role === 'junior_doctor' && 'Junior Doctor Dashboard'}
            {currentUser?.role === 'ward_manager' && 'Ward Manager Dashboard'}
            {currentUser?.role === 'physiotherapist' && 'Physiotherapist Dashboard'}
            {currentUser?.role === 'parent' && 'Parent Dashboard'}
          </Typography>
          <Typography color="text.secondary">
            Full interface coming soon. The Bedside Nurse interface is fully functional with medication management,
            feeding records, vital signs, and care plans.
          </Typography>
        </Card>
      </Container>
    </Box>
  );
}
