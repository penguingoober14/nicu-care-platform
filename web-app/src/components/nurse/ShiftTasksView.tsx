import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Chip,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Checkbox,
  Badge,
  Alert,
  LinearProgress,
  Divider,
  Paper,
  Grid,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Collapse,
  Snackbar,
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  LocalDining as FeedIcon,
  MedicalServices as MedIcon,
  MonitorHeart as VitalsIcon,
  Healing as ProcedureIcon,
  Notifications as ReminderIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
  PlayArrow as StartIcon,
  Done as DoneIcon,
  Group as ClusterIcon,
  Assignment as ScreeningIcon,
} from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore';
import { mockDataStore } from '../../data';
import {
  shiftTaskService,
  ShiftTaskBundle,
  TaskReminder,
  ScreeningReminder,
  ShiftType,
  RoleType,
} from '../../services/ShiftTaskService';
import type { NursingTask } from '../../types/tasks';
import type { Baby } from '../../types';

// Task type icons and colors
const TASK_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  feeding: { icon: <FeedIcon />, color: '#4caf50', label: 'Feed' },
  medication: { icon: <MedIcon />, color: '#f44336', label: 'Medication' },
  vital_signs: { icon: <VitalsIcon />, color: '#2196f3', label: 'Vitals' },
  procedure: { icon: <ProcedureIcon />, color: '#ff9800', label: 'Procedure' },
  line_care: { icon: <ProcedureIcon />, color: '#9c27b0', label: 'Line Care' },
  position_change: { icon: <ProcedureIcon />, color: '#00bcd4', label: 'Position' },
  skin_care: { icon: <ProcedureIcon />, color: '#e91e63', label: 'Skin Care' },
  assessment: { icon: <VitalsIcon />, color: '#607d8b', label: 'Assessment' },
};

const PRIORITY_COLORS: Record<string, string> = {
  routine: '#9e9e9e',
  important: '#2196f3',
  urgent: '#ff9800',
  critical: '#f44336',
};

interface ShiftTasksViewProps {
  babies: Baby[];
  selectedBaby?: Baby;
  onSelectBaby?: (baby: Baby) => void;
}

export const ShiftTasksView: React.FC<ShiftTasksViewProps> = ({
  babies,
  selectedBaby,
  onSelectBaby,
}) => {
  // State
  const [shiftType, setShiftType] = useState<ShiftType>(() => {
    const hour = new Date().getHours();
    return hour >= 8 && hour < 20 ? 'day' : 'night';
  });
  const [roleFilter, setRoleFilter] = useState<RoleType>('nurse');
  const [taskBundle, setTaskBundle] = useState<ShiftTaskBundle | null>(null);
  const [screeningReminders, setScreeningReminders] = useState<ScreeningReminder[]>([]);
  const [activeSubTab, setActiveSubTab] = useState(0);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [inProgressTasks, setInProgressTasks] = useState<Set<string>>(new Set());
  const [dismissedReminders, setDismissedReminders] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);

  // Generate tasks on mount and when shift changes
  useEffect(() => {
    generateTasks();
  }, [shiftType, babies]);

  const generateTasks = () => {
    const bundle = shiftTaskService.generateShiftTasks(
      babies,
      mockDataStore.enhancedCarePlans,
      mockDataStore.prescriptions,
      shiftType,
      new Date(),
      'demo-nurse'
    );
    setTaskBundle(bundle);

    const screenings = shiftTaskService.generateScreeningReminders(babies);
    setScreeningReminders(screenings);

    setSnackbar({ open: true, message: `Generated ${bundle.stats.totalTasks} tasks for ${shiftType} shift` });
  };

  // Filter tasks based on role and type
  const filteredTasks = useMemo(() => {
    if (!taskBundle) return [];

    let tasks = shiftTaskService.filterTasksForRole(taskBundle.allTasks, roleFilter);

    // Filter by baby if selected
    if (selectedBaby) {
      tasks = tasks.filter(t => t.babyId === selectedBaby.id);
    }

    // Filter by type
    if (typeFilter.length > 0) {
      tasks = tasks.filter(t => typeFilter.includes(t.taskType));
    }

    return tasks;
  }, [taskBundle, roleFilter, selectedBaby, typeFilter]);

  // Get upcoming and overdue tasks
  const upcomingTasks = useMemo(() => {
    if (!taskBundle) return [];
    return shiftTaskService.getUpcomingTasks(filteredTasks, 60);
  }, [filteredTasks, taskBundle]);

  const overdueTasks = useMemo(() => {
    if (!taskBundle) return [];
    return shiftTaskService.getOverdueTasks(filteredTasks);
  }, [filteredTasks, taskBundle]);

  // Cluster tasks for care rounds
  const taskClusters = useMemo(() => {
    if (!taskBundle) return new Map();
    return shiftTaskService.clusterTasks(filteredTasks, 30);
  }, [filteredTasks, taskBundle]);

  // Active reminders (not dismissed)
  const activeReminders = useMemo(() => {
    if (!taskBundle) return [];
    return taskBundle.reminders.filter(r => !dismissedReminders.has(r.id));
  }, [taskBundle, dismissedReminders]);

  // Task completion handlers
  const handleStartTask = (taskId: string) => {
    setInProgressTasks(prev => new Set([...prev, taskId]));
    setSnackbar({ open: true, message: 'Task started' });
  };

  const handleCompleteTask = (taskId: string) => {
    setInProgressTasks(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
    setCompletedTasks(prev => new Set([...prev, taskId]));
    setSnackbar({ open: true, message: 'Task completed!' });
  };

  const handleDismissReminder = (reminderId: string) => {
    setDismissedReminders(prev => new Set([...prev, reminderId]));
  };

  const toggleCluster = (clusterId: string) => {
    setExpandedClusters(prev => {
      const next = new Set(prev);
      if (next.has(clusterId)) {
        next.delete(clusterId);
      } else {
        next.add(clusterId);
      }
      return next;
    });
  };

  // Get task status
  const getTaskStatus = (task: NursingTask): 'pending' | 'in_progress' | 'completed' | 'overdue' => {
    if (completedTasks.has(task.id)) return 'completed';
    if (inProgressTasks.has(task.id)) return 'in_progress';
    const now = Date.now();
    const windowEnd = task.windowEnd?.toMillis() || task.scheduledDateTime.toMillis();
    if (windowEnd < now) return 'overdue';
    return 'pending';
  };

  // Format time
  const formatTime = (timestamp: Timestamp) => {
    return new Date(timestamp.toMillis()).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Get baby name
  const getBabyName = (babyId: string) => {
    const baby = babies.find(b => b.id === babyId);
    return baby ? `${baby.firstName} ${baby.lastName}` : babyId;
  };

  // Render task item
  const renderTaskItem = (task: NursingTask, showBaby: boolean = true) => {
    const config = TASK_CONFIG[task.taskType] || { icon: <ScheduleIcon />, color: '#9e9e9e', label: task.taskType };
    const status = getTaskStatus(task);
    const details = task.taskDetails as any;

    return (
      <ListItem
        key={task.id}
        sx={{
          borderLeft: `4px solid ${config.color}`,
          mb: 1,
          bgcolor: status === 'completed' ? 'action.selected' : status === 'overdue' ? 'error.lighter' : 'background.paper',
          borderRadius: 1,
          opacity: status === 'completed' ? 0.7 : 1,
        }}
      >
        <ListItemIcon sx={{ color: config.color }}>
          {status === 'completed' ? <CheckIcon color="success" /> : config.icon}
        </ListItemIcon>
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                {config.label}
                {details.volumeML && ` - ${details.volumeML}ml`}
                {details.medicationName && ` - ${details.medicationName}`}
                {details.procedureType && ` - ${details.procedureType.replace(/_/g, ' ')}`}
              </Typography>
              <Chip
                label={task.priority}
                size="small"
                sx={{ bgcolor: PRIORITY_COLORS[task.priority], color: 'white', height: 20 }}
              />
              {status === 'overdue' && (
                <Chip label="OVERDUE" size="small" color="error" />
              )}
            </Box>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TimeIcon fontSize="small" />
                <Typography variant="caption">
                  {formatTime(task.scheduledDateTime)}
                  {task.windowStart && task.windowEnd && (
                    ` (${formatTime(task.windowStart)} - ${formatTime(task.windowEnd)})`
                  )}
                </Typography>
              </Box>
              {showBaby && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <PersonIcon fontSize="small" />
                  <Typography variant="caption">{getBabyName(task.babyId)}</Typography>
                </Box>
              )}
            </Box>
          }
        />
        <ListItemSecondaryAction>
          {status === 'pending' && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<StartIcon />}
              onClick={() => handleStartTask(task.id)}
            >
              Start
            </Button>
          )}
          {status === 'in_progress' && (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<DoneIcon />}
              onClick={() => handleCompleteTask(task.id)}
            >
              Done
            </Button>
          )}
          {status === 'completed' && (
            <CheckIcon color="success" />
          )}
        </ListItemSecondaryAction>
      </ListItem>
    );
  };

  // Stats summary
  const stats = taskBundle?.stats || { totalTasks: 0, byType: {}, byPriority: {}, byBaby: {} };
  const completedCount = completedTasks.size;
  const progressPercent = stats.totalTasks > 0 ? (completedCount / stats.totalTasks) * 100 : 0;

  return (
    <Box>
      {/* Header Controls */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Shift</InputLabel>
                <Select
                  value={shiftType}
                  label="Shift"
                  onChange={(e) => setShiftType(e.target.value as ShiftType)}
                >
                  <MenuItem value="day">Day Shift (08:00-20:00)</MenuItem>
                  <MenuItem value="night">Night Shift (20:00-08:00)</MenuItem>
                  <MenuItem value="long_day">Long Day (07:00-21:00)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Role View</InputLabel>
                <Select
                  value={roleFilter}
                  label="Role View"
                  onChange={(e) => setRoleFilter(e.target.value as RoleType)}
                >
                  <MenuItem value="nurse">Nurse (All Tasks)</MenuItem>
                  <MenuItem value="hca">HCA (Basic Care)</MenuItem>
                  <MenuItem value="doctor">Doctor (Meds/Critical)</MenuItem>
                  <MenuItem value="unit_manager">Manager (Overdue/Urgent)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={() => setFilterDialogOpen(true)}
                fullWidth
              >
                Filter Types {typeFilter.length > 0 && `(${typeFilter.length})`}
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={generateTasks}
                fullWidth
              >
                Regenerate Tasks
              </Button>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2">
                Shift Progress: {completedCount} / {stats.totalTasks} tasks completed
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                {progressPercent.toFixed(0)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercent}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>

          {/* Quick Stats */}
          <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
            {Object.entries(stats.byType).map(([type, count]) => {
              const config = TASK_CONFIG[type] || { color: '#9e9e9e', label: type };
              return (
                <Chip
                  key={type}
                  label={`${config.label}: ${count}`}
                  sx={{ bgcolor: config.color, color: 'white' }}
                  size="small"
                />
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Alerts */}
      {overdueTasks.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <strong>{overdueTasks.length} overdue task(s)!</strong> Immediate attention required.
        </Alert>
      )}

      {activeReminders.length > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 2 }}
          action={
            <Button size="small" onClick={() => setActiveSubTab(3)}>
              View All
            </Button>
          }
        >
          <strong>{activeReminders.length} upcoming reminder(s)</strong>
        </Alert>
      )}

      {/* Sub-tabs */}
      <Tabs
        value={activeSubTab}
        onChange={(_, v) => setActiveSubTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab
          label={
            <Badge badgeContent={filteredTasks.length} color="primary">
              All Tasks
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={upcomingTasks.length} color="warning">
              Due Soon
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={taskClusters.size} color="info">
              Care Rounds
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={activeReminders.length} color="secondary">
              Reminders
            </Badge>
          }
        />
        <Tab
          label={
            <Badge badgeContent={screeningReminders.length} color="error">
              Screenings
            </Badge>
          }
        />
      </Tabs>

      {/* Tab Content */}
      <Card>
        <CardContent>
          {/* All Tasks */}
          {activeSubTab === 0 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                All Tasks ({filteredTasks.length})
              </Typography>
              {filteredTasks.length === 0 ? (
                <Alert severity="info">No tasks for selected filters</Alert>
              ) : (
                <List>
                  {filteredTasks.map(task => renderTaskItem(task, !selectedBaby))}
                </List>
              )}
            </Box>
          )}

          {/* Due Soon */}
          {activeSubTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Due in Next 60 Minutes ({upcomingTasks.length})
              </Typography>
              {upcomingTasks.length === 0 ? (
                <Alert severity="success">No tasks due soon - you're ahead!</Alert>
              ) : (
                <List>
                  {upcomingTasks.map(task => renderTaskItem(task, !selectedBaby))}
                </List>
              )}

              {overdueTasks.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" color="error" gutterBottom>
                    Overdue ({overdueTasks.length})
                  </Typography>
                  <List>
                    {overdueTasks.map(task => renderTaskItem(task, !selectedBaby))}
                  </List>
                </>
              )}
            </Box>
          )}

          {/* Care Rounds (Clustered) */}
          {activeSubTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Care Rounds - Grouped Tasks ({taskClusters.size} clusters)
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Tasks grouped within 30-minute windows for efficient bundled care
              </Typography>

              {Array.from(taskClusters.entries()).map(([clusterId, clusterTasks]) => {
                const firstTask = clusterTasks[0];
                const baby = babies.find(b => b.id === firstTask.babyId);
                const isExpanded = expandedClusters.has(clusterId);
                const clusterCompleted = clusterTasks.every(t => completedTasks.has(t.id));

                return (
                  <Paper key={clusterId} sx={{ mb: 2, p: 2 }} variant="outlined">
                    <Box
                      sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                      onClick={() => toggleCluster(clusterId)}
                    >
                      <ClusterIcon sx={{ mr: 1, color: clusterCompleted ? 'success.main' : 'primary.main' }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {baby?.firstName} {baby?.lastName} - {baby?.bedNumber}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(firstTask.scheduledDateTime)} • {clusterTasks.length} tasks
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {clusterTasks.map(t => {
                          const config = TASK_CONFIG[t.taskType];
                          return (
                            <Tooltip key={t.id} title={config?.label || t.taskType}>
                              <Chip
                                size="small"
                                sx={{
                                  bgcolor: config?.color || '#9e9e9e',
                                  color: 'white',
                                  opacity: completedTasks.has(t.id) ? 0.5 : 1,
                                }}
                                label={completedTasks.has(t.id) ? '✓' : ''}
                              />
                            </Tooltip>
                          );
                        })}
                      </Box>
                      <IconButton>
                        {isExpanded ? <CollapseIcon /> : <ExpandIcon />}
                      </IconButton>
                    </Box>
                    <Collapse in={isExpanded}>
                      <List sx={{ mt: 1 }}>
                        {clusterTasks.map(task => renderTaskItem(task, false))}
                      </List>
                    </Collapse>
                  </Paper>
                );
              })}
            </Box>
          )}

          {/* Reminders */}
          {activeSubTab === 3 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Task Reminders ({activeReminders.length})
              </Typography>
              {activeReminders.length === 0 ? (
                <Alert severity="success">All reminders dismissed</Alert>
              ) : (
                <List>
                  {activeReminders.map(reminder => (
                    <ListItem
                      key={reminder.id}
                      sx={{
                        bgcolor: reminder.priority === 'critical' ? 'error.lighter' :
                                 reminder.priority === 'high' ? 'warning.lighter' : 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemIcon>
                        <ReminderIcon color={
                          reminder.priority === 'critical' ? 'error' :
                          reminder.priority === 'high' ? 'warning' : 'info'
                        } />
                      </ListItemIcon>
                      <ListItemText
                        primary={reminder.message}
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" />
                            {getBabyName(reminder.babyId)}
                            <TimeIcon fontSize="small" sx={{ ml: 1 }} />
                            {formatTime(reminder.scheduledFor)}
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button
                          size="small"
                          onClick={() => handleDismissReminder(reminder.id)}
                        >
                          Dismiss
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Screenings */}
          {activeSubTab === 4 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Screening Reminders ({screeningReminders.length})
              </Typography>
              {screeningReminders.length === 0 ? (
                <Alert severity="info">No screenings due</Alert>
              ) : (
                <List>
                  {screeningReminders.map(screening => (
                    <ListItem
                      key={screening.id}
                      sx={{
                        bgcolor: screening.status === 'overdue' ? 'error.lighter' :
                                 screening.status === 'due' ? 'warning.lighter' : 'background.paper',
                        mb: 1,
                        borderRadius: 1,
                        borderLeft: `4px solid ${
                          screening.status === 'overdue' ? '#f44336' :
                          screening.status === 'due' ? '#ff9800' : '#4caf50'
                        }`,
                      }}
                    >
                      <ListItemIcon>
                        <ScreeningIcon color={
                          screening.status === 'overdue' ? 'error' :
                          screening.status === 'due' ? 'warning' : 'success'
                        } />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {screening.description}
                            </Typography>
                            <Chip
                              label={screening.status.toUpperCase()}
                              size="small"
                              color={
                                screening.status === 'overdue' ? 'error' :
                                screening.status === 'due' ? 'warning' : 'success'
                              }
                            />
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <PersonIcon fontSize="small" />
                            {getBabyName(screening.babyId)}
                            <Typography variant="caption" sx={{ ml: 1 }}>
                              Type: {screening.screeningType.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Button size="small" variant="outlined">
                          Mark Complete
                        </Button>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Filter Dialog */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Filter by Task Type</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pt: 1 }}>
            {Object.entries(TASK_CONFIG).map(([type, config]) => (
              <Button
                key={type}
                variant={typeFilter.includes(type) ? 'contained' : 'outlined'}
                startIcon={config.icon}
                onClick={() => {
                  setTypeFilter(prev =>
                    prev.includes(type)
                      ? prev.filter(t => t !== type)
                      : [...prev, type]
                  );
                }}
                sx={{
                  justifyContent: 'flex-start',
                  bgcolor: typeFilter.includes(type) ? config.color : undefined,
                  '&:hover': {
                    bgcolor: typeFilter.includes(type) ? config.color : undefined,
                  },
                }}
              >
                {config.label}
              </Button>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTypeFilter([])}>Clear All</Button>
          <Button onClick={() => setFilterDialogOpen(false)} variant="contained">
            Done
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Box>
  );
};

export default ShiftTasksView;
