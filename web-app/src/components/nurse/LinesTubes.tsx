import React, { useState } from 'react';
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
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { mockDataStore } from '../../data';
import type { Baby } from '../../types';

interface LinesTubesProps {
  baby: Baby;
}

export const LinesTubes: React.FC<LinesTubesProps> = ({ baby }) => {
  // Get IV lines for this baby
  const ivLines = mockDataStore.ivLines
    .filter((line) => line.babyId === baby.id)
    .sort((a, b) => b.insertionDate.toMillis() - a.insertionDate.toMillis());

  // Get NG tubes for this baby
  const ngTubes = mockDataStore.ngTubes
    .filter((tube) => tube.babyId === baby.id)
    .sort((a, b) => b.insertionDateTime.toMillis() - a.insertionDateTime.toMillis());

  const activeIVLines = ivLines.filter((line) => line.isActive);
  const activeNGTubes = ngTubes.filter((tube) => tube.isActive);

  const getLineTypeColor = (lineType: string) => {
    switch (lineType) {
      case 'PICC':
      case 'UAC':
      case 'UVC':
        return 'error';
      case 'peripheral_IV':
        return 'primary';
      case 'long_line':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      {/* Active Lines Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Active Lines & Tubes
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                IV/Central Lines
              </Typography>
              <Typography variant="h4" color="primary">
                {activeIVLines.length}
              </Typography>
              {activeIVLines.map((line) => (
                <Chip
                  key={line.id}
                  label={line.lineType.replace(/_/g, ' ')}
                  color={getLineTypeColor(line.lineType)}
                  size="small"
                  sx={{ mr: 1, mt: 1 }}
                />
              ))}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary">
                NG/OG Tubes
              </Typography>
              <Typography variant="h4" color="secondary">
                {activeNGTubes.length}
              </Typography>
              {activeNGTubes.map((tube) => (
                <Chip
                  key={tube.id}
                  label={`${tube.tubeType} ${tube.tubeSize}`}
                  color="secondary"
                  size="small"
                  sx={{ mr: 1, mt: 1 }}
                />
              ))}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* IV/Central Lines Details */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">IV/Central Lines</Typography>
            <Button variant="outlined" size="small">
              Add New Line
            </Button>
          </Box>
          {ivLines.length > 0 ? (
            ivLines.map((line) => (
              <Accordion key={line.id} defaultExpanded={line.isActive}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {line.lineType.replace(/_/g, ' ')} - {line.insertionSite}
                    </Typography>
                    <Chip
                      label={line.isActive ? 'Active' : 'Removed'}
                      color={line.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Inserted: {new Date(line.insertionDate.toMillis()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Line Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Insertion Date/Time"
                            secondary={`${new Date(line.insertionDate.toMillis()).toLocaleDateString()} ${
                              line.insertionTime
                            }`}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Site" secondary={line.insertionSite} />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Size/Length"
                            secondary={`${line.gaugeSize || 'N/A'} / ${line.length}cm`}
                          />
                        </ListItem>
                        {line.tipPosition && (
                          <ListItem>
                            <ListItemText primary="Tip Position" secondary={line.tipPosition} />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText
                            primary="Position Verified"
                            secondary={
                              line.positionVerified ? (
                                <Chip label={`Yes - ${line.verificationMethod}`} color="success" size="small" />
                              ) : (
                                <Chip label="Not verified" color="warning" size="small" />
                              )
                            }
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Securing Method" secondary={line.securingMethod} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Maintenance History
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Dressing Changes ({line.dressingChanges.length})
                      </Typography>
                      {line.dressingChanges.slice(0, 3).map((change, idx) => (
                        <Box key={idx} sx={{ mb: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                          <Typography variant="caption">
                            {new Date(change.date.toMillis()).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            Site: {change.siteAppearance}
                            {change.notes && ` - ${change.notes}`}
                          </Typography>
                        </Box>
                      ))}
                      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                        Patency Checks ({line.patencyChecks.length})
                      </Typography>
                      {line.patencyChecks.slice(0, 3).map((check, idx) => (
                        <Box key={idx} sx={{ mb: 1, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
                          <Typography variant="caption">
                            {new Date(check.date.toMillis()).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2">
                            {check.patent ? '✓ Patent' : '✗ Not patent'}
                            {check.flushedWith && ` - Flushed with ${check.flushedWith}`}
                          </Typography>
                        </Box>
                      ))}
                      {line.complications.length > 0 && (
                        <>
                          <Typography variant="body2" color="error" gutterBottom sx={{ mt: 2 }}>
                            Complications ({line.complications.length})
                          </Typography>
                          {line.complications.map((complication, idx) => (
                            <Alert key={idx} severity="error" sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                {complication.type} - {new Date(complication.date.toMillis()).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption">{complication.action}</Typography>
                            </Alert>
                          ))}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Alert severity="info">No IV/central lines recorded</Alert>
          )}
        </CardContent>
      </Card>

      {/* NG/OG Tubes Details */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">NG/OG Tubes</Typography>
            <Button variant="outlined" size="small">
              Add New Tube
            </Button>
          </Box>
          {ngTubes.length > 0 ? (
            ngTubes.map((tube) => (
              <Accordion key={tube.id} defaultExpanded={tube.isActive}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    <Typography sx={{ flexGrow: 1 }}>
                      {tube.tubeType} Tube ({tube.tubeSize})
                      {tube.nostrilSide && ` - ${tube.nostrilSide} nostril`}
                    </Typography>
                    <Chip
                      label={tube.isActive ? 'Active' : 'Removed'}
                      color={tube.isActive ? 'success' : 'default'}
                      size="small"
                      sx={{ mr: 2 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Inserted: {new Date(tube.insertionDateTime.toMillis()).toLocaleDateString()}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tube Details
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText
                            primary="Insertion Date/Time"
                            secondary={new Date(tube.insertionDateTime.toMillis()).toLocaleString()}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Tube Size" secondary={tube.tubeSize} />
                        </ListItem>
                        <ListItem>
                          <ListItemText primary="Length Inserted" secondary={`${tube.lengthInserted}cm`} />
                        </ListItem>
                        {tube.nexMeasurement && (
                          <ListItem>
                            <ListItemText primary="NEX Measurement" secondary={`${tube.nexMeasurement}cm`} />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText primary="External Length" secondary={`${tube.externalLength}cm`} />
                        </ListItem>
                        <ListItem>
                          <ListItemText
                            primary="Position Verified"
                            secondary={
                              tube.positionVerified ? (
                                <Chip label={`Yes - ${tube.verificationMethod}`} color="success" size="small" />
                              ) : (
                                <Chip label="Not verified" color="warning" size="small" />
                              )
                            }
                          />
                        </ListItem>
                        {tube.aspiratepH && (
                          <ListItem>
                            <ListItemText primary="Aspirate pH" secondary={tube.aspiratepH} />
                          </ListItem>
                        )}
                        <ListItem>
                          <ListItemText primary="Securing Method" secondary={tube.securingMethod} />
                        </ListItem>
                      </List>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" gutterBottom>
                        Tube Checks ({tube.tubeChecks.length})
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date/Time</TableCell>
                              <TableCell>Method</TableCell>
                              <TableCell>pH</TableCell>
                              <TableCell>Status</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {tube.tubeChecks.slice(0, 5).map((check, idx) => (
                              <TableRow key={idx}>
                                <TableCell>
                                  {new Date(check.date.toMillis()).toLocaleDateString()}
                                  <br />
                                  <Typography variant="caption">{check.time}</Typography>
                                </TableCell>
                                <TableCell>{check.method}</TableCell>
                                <TableCell>{check.pH?.toFixed(1) || '-'}</TableCell>
                                <TableCell>
                                  <Chip
                                    label={check.positionConfirmed ? '✓ Confirmed' : '✗ Not confirmed'}
                                    color={check.positionConfirmed ? 'success' : 'error'}
                                    size="small"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      {tube.complications.length > 0 && (
                        <>
                          <Typography variant="body2" color="error" gutterBottom sx={{ mt: 2 }}>
                            Complications ({tube.complications.length})
                          </Typography>
                          {tube.complications.map((complication, idx) => (
                            <Alert key={idx} severity="error" sx={{ mb: 1 }}>
                              <Typography variant="body2">
                                {complication.type} - {new Date(complication.date.toMillis()).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption">{complication.action}</Typography>
                            </Alert>
                          ))}
                        </>
                      )}
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            ))
          ) : (
            <Alert severity="info">No NG/OG tubes recorded</Alert>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};
