import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_DISPLAY_NAMES, type UserRole } from '../types';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import PersonIcon from '@mui/icons-material/Person';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';

const roleIcons: Record<UserRole, React.ReactNode> = {
  bedside_nurse: <LocalHospitalIcon sx={{ fontSize: 60 }} />,
  consultant: <MedicalServicesIcon sx={{ fontSize: 60 }} />,
  junior_doctor: <PersonIcon sx={{ fontSize: 60 }} />,
  ward_manager: <ManageAccountsIcon sx={{ fontSize: 60 }} />,
  physiotherapist: <FitnessCenterIcon sx={{ fontSize: 60 }} />,
  parent: <FamilyRestroomIcon sx={{ fontSize: 60 }} />,
};

const roleColors: Record<UserRole, string> = {
  bedside_nurse: '#1976d2',
  consultant: '#7b1fa2',
  junior_doctor: '#0288d1',
  ward_manager: '#d32f2f',
  physiotherapist: '#388e3c',
  parent: '#f57c00',
};

export default function RoleSelection() {
  const { selectRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSelect = (role: UserRole) => {
    selectRole(role);
    navigate('/dashboard');
  };

  const roles: UserRole[] = [
    'bedside_nurse',
    'consultant',
    'junior_doctor',
    'ward_manager',
    'physiotherapist',
    'parent',
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', mb: 2 }}>
            NICU Care Platform
          </Typography>
          <Typography variant="h5" sx={{ color: 'rgba(255,255,255,0.9)' }}>
            Demo - Select Your Role
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {roles.map((role) => (
            <Grid item xs={12} sm={6} md={4} key={role}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleRoleSelect(role)}
              >
                <CardContent
                  sx={{
                    textAlign: 'center',
                    py: 4,
                  }}
                >
                  <Box
                    sx={{
                      color: roleColors[role],
                      mb: 2,
                    }}
                  >
                    {roleIcons[role]}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {ROLE_DISPLAY_NAMES[role]}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      mt: 2,
                      backgroundColor: roleColors[role],
                      '&:hover': {
                        backgroundColor: roleColors[role],
                        opacity: 0.9,
                      },
                    }}
                  >
                    View as {ROLE_DISPLAY_NAMES[role]}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Demo patients: Daisy (Room 1) and Elsa (Room 2)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
