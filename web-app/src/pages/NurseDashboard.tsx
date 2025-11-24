import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Button,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockDataStore } from '../config/mockData';
import MedicationSchedule from '../components/nurse/MedicationSchedule';
import FeedingEntry from '../components/nurse/FeedingEntry';
import VitalSignsEntry from '../components/nurse/VitalSignsEntry';
import CarePlanView from '../components/nurse/CarePlanView';
import { RespiratorySupport } from '../components/nurse/RespiratorySupport';
import { LinesTubes } from '../components/nurse/LinesTubes';
import { FluidBalance } from '../components/nurse/FluidBalance';
import { TwentyFourHrResume } from '../components/nurse/TwentyFourHrResume';
import { GrowthTracking } from '../components/nurse/GrowthTracking';
import { DischargePlanning } from '../components/nurse/DischargePlanning';
import { InfectionLabs } from '../components/nurse/InfectionLabs';
import { ProceduresLog } from '../components/nurse/ProceduresLog';
import LogoutIcon from '@mui/icons-material/Logout';
import type { Baby } from '../types';

export default function NurseDashboard() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedBaby, setSelectedBaby] = useState<Baby>(mockDataStore.babies[0]);
  const [activeTab, setActiveTab] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const babies = mockDataStore.babies.filter((b) => b.isActive);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            NICU Care Platform - Bedside Nurse
          </Typography>
          <Typography variant="body1" sx={{ mr: 2 }}>
            {currentUser?.firstName} {currentUser?.lastName}
          </Typography>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Change Role
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Baby Selection */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              Select Patient
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {babies.map((baby) => (
                <Card
                  key={baby.id}
                  sx={{
                    minWidth: 200,
                    cursor: 'pointer',
                    border: selectedBaby.id === baby.id ? '3px solid #1976d2' : '1px solid #ddd',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => setSelectedBaby(baby)}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {baby.firstName} {baby.lastName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {baby.bedNumber}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {baby.hospitalNumber}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      <Chip
                        label={`${baby.gestationalAgeAtBirth.weeks}+${baby.gestationalAgeAtBirth.days} weeks`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Card>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Medications" />
            <Tab label="Feeding" />
            <Tab label="Vital Signs" />
            <Tab label="Care Plan" />
            <Tab label="Respiratory" />
            <Tab label="Lines & Tubes" />
            <Tab label="Fluid Balance" />
            <Tab label="24hr Resume" />
            <Tab label="Growth" />
            <Tab label="Discharge" />
            <Tab label="Infection & Labs" />
            <Tab label="Procedures" />
          </Tabs>

          <CardContent sx={{ minHeight: '60vh' }}>
            {activeTab === 0 && <MedicationSchedule baby={selectedBaby} />}
            {activeTab === 1 && <FeedingEntry baby={selectedBaby} />}
            {activeTab === 2 && <VitalSignsEntry baby={selectedBaby} />}
            {activeTab === 3 && <CarePlanView baby={selectedBaby} />}
            {activeTab === 4 && <RespiratorySupport baby={selectedBaby} />}
            {activeTab === 5 && <LinesTubes baby={selectedBaby} />}
            {activeTab === 6 && <FluidBalance baby={selectedBaby} />}
            {activeTab === 7 && <TwentyFourHrResume baby={selectedBaby} />}
            {activeTab === 8 && <GrowthTracking baby={selectedBaby} />}
            {activeTab === 9 && <DischargePlanning baby={selectedBaby} />}
            {activeTab === 10 && <InfectionLabs baby={selectedBaby} />}
            {activeTab === 11 && <ProceduresLog baby={selectedBaby} />}
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
