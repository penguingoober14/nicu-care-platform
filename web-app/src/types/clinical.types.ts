import { Timestamp } from 'firebase/firestore';
import type { BabyRecord, Timestamped, StaffPerformed, FeedType, FeedRoute } from './core.types';

// ============================================================================
// GENERIC MAINTENANCE CHECK PATTERN (DRY principle)
// ============================================================================

export interface MaintenanceCheck extends StaffPerformed {
  date: Timestamp;
  notes?: string;
}

export interface SiteAppearanceCheck extends MaintenanceCheck {
  siteAppearance: 'clean' | 'red' | 'swollen' | 'discharge';
}

// ============================================================================
// BLOOD GAS & BIOCHEMISTRY
// ============================================================================

export interface BloodGasResult extends BabyRecord {
  sampleDate: Timestamp;
  sampleTime: string;
  sampleType: 'arterial' | 'venous' | 'capillary';
  sampleSite?: string;

  // Blood Gas Values
  pH?: number;
  pCO2?: number; // kPa or mmHg
  pO2?: number;
  baseExcess?: number;
  HCO3?: number;
  lactate?: number; // mmol/L

  // Biochemistry
  hemoglobin?: number; // g/dL
  sodium?: number; // mmol/L
  potassium?: number;
  calcium?: number;
  bilirubin?: number; // μmol/L
  glucose?: number; // mmol/L

  // Context
  ventilatorSettings?: {
    mode: string;
    fiO2: number;
    peep?: number;
    pip?: number;
    rate?: number;
  };

  clinicalIndication?: string;
  takenBy: string;
  checkedBy?: string;
  notes?: string;
}

// ============================================================================
// FLUID BALANCE
// ============================================================================

export interface FluidBalanceRecord extends BabyRecord {
  date: Timestamp;
  timeSlot: string; // e.g., "00:00-04:00"

  intake: {
    iv?: number;
    enteral?: number;
    medications?: number;
    bloodProducts?: number;
    other?: number;
    total: number;
  };

  output: {
    urine?: number;
    stool?: number;
    aspirates?: number;
    drainLosses?: number;
    other?: number;
    total: number;
  };

  netBalance: number;
  cumulativeBalance: number;
  insensibleLosses?: number;
  recordedBy: string;
  notes?: string;
}

// ============================================================================
// 24-HOUR RESUME (COMPREHENSIVE DAILY SUMMARY)
// ============================================================================

export interface TwentyFourHourResume extends BabyRecord {
  resumeDate: Timestamp;
  ageInDays: number;
  correctedGestationalAge: {
    weeks: number;
    days: number;
  };

  // Respiratory System
  respiratory: {
    mode: 'IPPV' | 'SIMV' | 'SIPPV' | 'CPAP' | 'HFOV' | 'room_air' | 'nasal_cannula';
    settings?: {
      fiO2Range: string;
      pressureSupport?: string;
      peep?: number;
      pip?: number;
      rate?: number;
    };
    oxygenRange: string;
    spontaneousBreathing: boolean;
    extubationPlanned: boolean;
  };

  // Cardiovascular System
  cardiovascular: {
    heartRateRange: string;
    bloodPressureRange: string;
    meanBP: number;
    perfusion: 'good' | 'adequate' | 'poor';
    capillaryRefillTime: number; // seconds
  };

  // Temperature
  temperatureRange: string;

  // Events
  events: {
    apnoeas: number;
    bradycardias: number;
    desaturations: number;
  };

  // Saturations (First 24 hours)
  saturations?: {
    preDuctal: number;
    postDuctal: number;
  };

  // Urine Output
  urineOutput: {
    totalVolume: number; // ml
    mlPerKgPerHour: number;
  };

  // Bowel Action
  bowelAction: {
    passed: boolean;
    frequency: number;
    description?: string;
  };

  // Fluids & Nutrition
  fluidsAndNutrition: {
    totalFluids: number; // ml/kg/day
    enteralIntake: number;
    parenteralIntake: number;
    feedingMethod: 'MBM' | 'DBM' | 'formula' | 'fortified' | 'TPN' | 'mixed';
    feedVolume: number;
    feedFrequency: string;
    feedTolerance: 'good' | 'moderate' | 'poor';
    vomits: number;
    aspirates: string;
  };

  // Blood Products Given
  bloodProducts?: {
    packedCells?: number;
    ffp?: number;
    platelets?: number;
    otherProducts?: string;
  };

  // Total Blood Taken
  totalBloodTaken: number; // ml

  // Jaundice
  jaundice: {
    phototherapy: boolean;
    bilirubinLevel?: number;
    phototherapyHours?: number;
  };

  // Medications
  medications: string[];

  // Investigations
  investigations?: {
    xray?: boolean;
    ultrasound?: boolean;
    echo?: boolean;
    bloodTests?: string[];
    chromosomes?: boolean;
    other?: string;
  };

  // Plan for Next 24 Hours
  plan: string;

  // Concerns / Actions
  concerns?: string[];
  actions?: string[];

  // Staff
  completedBy: string;
  reviewedBy?: string;
}

// ============================================================================
// INFECTION TRACKING
// ============================================================================

export interface InfectionRecord extends BabyRecord {
  episodeStartDate: Timestamp;
  episodeEndDate?: Timestamp;

  infectionType: 'suspected' | 'confirmed' | 'ruled_out';
  infectionCategory: 'early_onset_sepsis' | 'late_onset_sepsis' | 'NEC' | 'pneumonia' | 'UTI' | 'line_infection' | 'other';

  clinicalSigns: string[];

  microbiology: {
    samplesTaken: {
      type: 'blood_culture' | 'urine' | 'CSF' | 'tracheal_aspirate' | 'surface_swabs';
      date: Timestamp;
      result?: string;
      organism?: string;
      sensitivities?: string[];
    }[];
  };

  infectionMarkers: {
    crp?: number; // mg/L
    wbc?: number; // x10⁹/L
    neutrophils?: number;
    platelets?: number;
  }[];

  antibiotics: {
    drug: string;
    startDate: Timestamp;
    stopDate?: Timestamp;
    durationDays?: number;
    indication: string;
  }[];

  lineAssociated: boolean;
  lineType?: string;
  lineRemoved?: boolean;

  outcome?: 'resolved' | 'ongoing' | 'died';
  notes?: string;
}

// ============================================================================
// PHOTOTHERAPY
// ============================================================================

export interface PhototherapyRecord extends BabyRecord {
  startDateTime: Timestamp;
  stopDateTime?: Timestamp;

  bilirubinLevels: {
    date: Timestamp;
    level: number; // μmol/L
    measurementMethod: 'serum' | 'transcutaneous';
  }[];

  phototherapyType: 'single' | 'double' | 'intensive';
  eyeProtectionConfirmed: boolean;
  reboundBilirubinChecked: boolean;
  reboundBilirubinLevel?: number;
  reboundCheckDate?: Timestamp;

  exchangeTransfusionRequired: boolean;
  exchangeTransfusionDate?: Timestamp;

  notes?: string;
}

// ============================================================================
// IV LINES & CENTRAL LINES
// ============================================================================

export type LineType = 'peripheral_IV' | 'PICC' | 'UAC' | 'UVC' | 'long_line' | 'femoral_line';

export interface PeripheralCentralLineRecord extends BabyRecord {
  lineType: LineType;

  // Insertion
  insertionDate: Timestamp;
  insertionTime: string;
  insertionSite: string;
  insertedBy: string;

  // Line Specifications
  gaugeSize?: string; // e.g., "24G", "22G"
  length?: number; // cm

  // Position Verification (for central lines)
  tipPosition?: string;
  positionVerified: boolean;
  verificationMethod?: 'xray' | 'ultrasound' | 'ECG' | 'blood_gas';
  verificationDate?: Timestamp;

  // Securing/Dressing
  securingMethod: string;
  cleaningSolutionUsed: string;

  // Maintenance
  dressingChanges: SiteAppearanceCheck[];
  patencyChecks: (MaintenanceCheck & {
    patent: boolean;
    flushedWith?: string;
  })[];

  // Complications
  complications: {
    type: 'extravasation' | 'phlebitis' | 'infection' | 'thrombosis' | 'displacement' | 'blockage';
    date: Timestamp;
    action: string;
  }[];

  // Removal
  removalDate?: Timestamp;
  removalTime?: string;
  removedBy?: string;
  removalReason?: 'no_longer_needed' | 'infection' | 'complication' | 'accidental' | 'blocked';
  tipSentForCulture?: boolean;
  cultureResult?: string;

  // Status
  isActive: boolean;
  notes?: string;
}

// ============================================================================
// NG/OG TUBES
// ============================================================================

export interface NasoOrogastricTubeInsertion extends BabyRecord {
  tubeType: 'NG' | 'OG';

  // Insertion
  insertionDateTime: Timestamp;
  tubeSize: string; // e.g., "5Fr", "6Fr"
  lengthInserted: number; // cm
  nostrilSide?: 'left' | 'right';
  nexMeasurement?: number; // Nose-Ear-Xiphoid in cm

  // Position Verification
  positionVerified: boolean;
  verificationMethod: 'pH' | 'aspirate_appearance' | 'xray';
  aspiratepH?: number;
  xrayDate?: Timestamp;

  // Securing
  securingMethod: string;
  externalLength: number; // cm visible

  // Change Schedule
  changeDuringDate?: Timestamp;

  // Tube Checks
  tubeChecks: (MaintenanceCheck & {
    time: string;
    positionConfirmed: boolean;
    method: 'pH' | 'aspirate' | 'external_length_check';
    pH?: number;
    externalLengthCm?: number;
    checkedBy: string;
  })[];

  // Complications
  complications: {
    type: 'displacement' | 'blockage' | 'nasal_trauma' | 'aspiration';
    date: Timestamp;
    action: string;
  }[];

  // Removal/Replacement
  removalDate?: Timestamp;
  removalReason?: 'no_longer_needed' | 'displacement' | 'blockage' | 'scheduled_change';
  replacedWith?: string;

  // Status
  isActive: boolean;
  insertedBy: string;
  notes?: string;
}

// ============================================================================
// BLOOD TRANSFUSION
// ============================================================================

export interface TransfusionRecord extends BabyRecord {
  productType: 'packed_red_cells' | 'platelets' | 'FFP' | 'cryoprecipitate' | 'whole_blood';

  // Pre-Transfusion
  indication: string;
  consentDocumented: boolean;
  consentedBy?: string;
  consentDate?: Timestamp;

  preTransfusion: {
    hemoglobin?: number; // g/dL
    hematocrit?: number; // %
    platelets?: number; // x10⁹/L
    weight: number;
  };

  // Product Details
  productDetails: {
    donationNumber: string;
    expiryDate: Timestamp;
    volume: number; // ml
    bloodGroup?: string;
    rhesus?: string;
  };

  // Administration
  startDateTime: Timestamp;
  endDateTime?: Timestamp;
  administeredBy: string;
  checkedBy: string;

  // Observations During Transfusion
  observations: {
    time: string;
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    bloodPressure?: { systolic: number; diastolic: number };
    oxygenSaturation?: number;
    clinicalStatus: 'stable' | 'concerns';
    notes?: string;
  }[];

  // Adverse Reactions
  adverseReaction: boolean;
  reactionDetails?: {
    type: 'allergic' | 'febrile' | 'hemolytic' | 'TACO' | 'TRALI' | 'other';
    severity: 'mild' | 'moderate' | 'severe';
    symptoms: string[];
    actionTaken: string;
    reportedToBloodBank: boolean;
  };

  // Post-Transfusion
  postTransfusion?: {
    hemoglobin?: number;
    hematocrit?: number;
    platelets?: number;
    checkDateTime: Timestamp;
  };

  outcome: 'completed' | 'stopped_early' | 'reaction_occurred';
  notes?: string;
}

// ============================================================================
// SAMPLE COLLECTION
// ============================================================================

export interface SampleCollectionMetadata extends BabyRecord {
  sampleType: 'blood_culture' | 'EDTA_blood' | 'urine' | 'CSF' | 'tracheal_aspirate' | 'surface_swab' | 'stool' | 'other';

  collectionDateTime: Timestamp;
  collectedBy: string;
  collectionMethod?: string;

  barcodeNumber?: string;
  labNumber?: string;

  volume?: number; // ml
  quantity?: string;

  clinicalIndication: string;
  requestingDoctor: string;

  laboratory: 'microbiology' | 'biochemistry' | 'haematology' | 'genetics' | 'other';
  labLocation?: string;

  testsRequested: string[];

  sentToLabDateTime?: Timestamp;
  sentBy?: string;

  resultsReceived: boolean;
  resultsDateTime?: Timestamp;
  resultsLocation?: string;
  criticalResult: boolean;

  packagingRequirements?: {
    barcodeApplied: boolean;
    sealedCorrectly: boolean;
    placedInSamplingBox: boolean;
  };

  notes?: string;
}

// ============================================================================
// CONSENT RECORDS
// ============================================================================

export interface ConsentRecord extends BabyRecord {
  consentType: 'treatment' | 'research' | 'genomics' | 'photography' | 'teaching' | 'procedure' | 'blood_products' | 'post_mortem';

  specificProcedure?: string;
  studyName?: string;
  formVersion?: string;

  consentedBy: {
    personId: string;
    name: string;
    relationship: 'mother' | 'father' | 'guardian' | 'person_with_parental_responsibility';
  };

  dateObtained: Timestamp;
  obtainedBy: string;
  witnessedBy?: string;

  statementsAcknowledged?: {
    dnaCollectionPermission: boolean;
    longTermDataUsePermission: boolean;
    withdrawalRightsUnderstood: boolean;
    dataAccessConditionsUnderstood: boolean;
    recontactAt16Understood: boolean;
    ethicsApprovalUnderstood: boolean;
  };

  validFrom: Timestamp;
  validUntil?: Timestamp;

  withdrawn: boolean;
  withdrawnDate?: Timestamp;
  withdrawnBy?: string;
  withdrawalReason?: string;

  physicalFormLocation?: string;
  scannedDocument?: string;

  chiefInvestigator?: string;
  principalInvestigator?: string;

  notes?: string;
}

// ============================================================================
// SAFETY CHECKS
// ============================================================================

export interface SafetyCheck extends BabyRecord {
  checkDate: Timestamp;
  checkTime: string;
  shift: 'day' | 'night' | 'long_day';
  checkType: 'shift_handover' | 'equipment_check' | 'safety_round';

  patientID: {
    nameChecked: boolean;
    wristbandChecked: boolean;
    hospitalNumberVerified: boolean;
  };

  equipmentChecks: {
    incubatorStatus?: 'functioning' | 'issue';
    temperatureSettings?: {
      set: number;
      actual: number;
    };
    ventilatorStatus?: 'functioning' | 'issue' | 'not_in_use';
    ventilatorSettings?: {
      mode: string;
      rate: number;
      pressures: string;
      fiO2: number;
    };
    oxygenFlow?: number;
    airFlow?: number;
    humidifierTemperature?: number;
    monitorsStatus: 'functioning' | 'issue';
    alarmSettingsAppropriate: boolean;
    alarmVolumeAudible: boolean;
  };

  ivLineChecks: {
    lineId: string;
    siteChecked: boolean;
    siteAppearance: 'clean' | 'red' | 'swollen' | 'discharge';
    infusionRateCorrect: boolean;
    lineSecure: boolean;
  }[];

  medicationChecks: {
    prescriptionChart: boolean;
    infusionsCorrect: boolean;
    controlledDrugsChecked?: boolean;
  };

  nutritionChecks: {
    feedingPlanFollowed: boolean;
    ngTubePositionChecked?: boolean;
    enteralFeedRunningCorrectly?: boolean;
    tpnRunningCorrectly?: boolean;
  };

  observationsFrequency: string;
  lastObservationTime?: string;

  concerns: {
    concern: string;
    severity: 'low' | 'medium' | 'high';
    actionTaken: string;
    escalated: boolean;
  }[];

  handoverNotes?: string;
  checkedBy: string;
  handedOverTo?: string;
}

// ============================================================================
// DISCHARGE PLANNING
// ============================================================================

export interface DischargeChecklist extends BabyRecord {
  motherName: string;
  fatherName?: string;
  parentalRelationshipStatus: 'single' | 'married' | 'stable_relationship' | 'separated';

  siblings: {
    name: string;
    age: number;
  }[];

  gpDetails: {
    practiceName: string;
    gpName?: string;
    address?: string;
    phone?: string;
    registered: boolean;
  };

  healthVisitor?: {
    name: string;
    contact: string;
    informed: boolean;
  };

  communityReferrals: {
    communityNurse: boolean;
    healthVisitor: boolean;
    communityPaediatrician: boolean;
    earlyInterventionTeam: boolean;
    physiotherapy: boolean;
    occupationalTherapy: boolean;
    speechAndLanguage: boolean;
    dietitian: boolean;
    other?: string[];
  };

  hospitalReferrals: {
    ophthalmology: boolean;
    ophthalmologyDate?: Timestamp;
    audiology: boolean;
    audiologyDate?: Timestamp;
    cardiology: boolean;
    cardiologyDate?: Timestamp;
    respiratory: boolean;
    respiratoryDate?: Timestamp;
    neurology: boolean;
    neurologyDate?: Timestamp;
    other?: { service: string; date?: Timestamp }[];
  };

  infantServicesRequired: {
    hearingScreening: { required: boolean; completed: boolean; date?: Timestamp };
    eyeScreening: { required: boolean; completed: boolean; date?: Timestamp };
    oxygenTeam: { required: boolean; arranged: boolean };
    nasogastricFeeding: { required: boolean; parentsTrained: boolean };
    medicationAdministration: { required: boolean; parentsTrained: boolean };
    apnoeaMonitor: { required: boolean; arranged: boolean };
    other?: { service: string; required: boolean; arranged: boolean }[];
  };

  parentEducation: {
    basicBabyCare: boolean;
    feedingSupport: boolean;
    medicationAdministration: boolean;
    cpRTraining: boolean;
    recognisingIllness: boolean;
    safeSleeping: boolean;
    carSeatSafetyCheck: boolean;
    smokingCessationAdvice: boolean;
    immunisationDiscussion: boolean;
  };

  medicationsGoingHome: {
    medication: string;
    dose: string;
    frequency: string;
    duration?: string;
    prescriptionProvided: boolean;
  }[];

  equipmentGoingHome: {
    oxygenConcentrator: boolean;
    apnoeaMonitor: boolean;
    feedingPump: boolean;
    nasogastricTubes: boolean;
    suction: boolean;
    other?: string[];
  };

  followUpAppointments: {
    service: string;
    date?: Timestamp;
    location?: string;
    booked: boolean;
  }[];

  dischargeSummary: {
    completed: boolean;
    sentToGP: boolean;
    sentToHealthVisitor: boolean;
    copyToParents: boolean;
  };

  redBookCompleted: boolean;
  redBookGivenToParents: boolean;

  plannedDischargeDate?: Timestamp;
  actualDischargeDate?: Timestamp;
  dischargeTime?: string;
  dischargedBy?: string;

  dischargeDestination: 'home' | 'foster_care' | 'other_hospital' | 'other';

  transportHome: 'own_car' | 'taxi' | 'ambulance' | 'other';
  carSeatAvailable: boolean;

  dischargeWeight?: number;
  notes?: string;
}

// ============================================================================
// WEIGHT CHART (GROWTH TRACKING)
// ============================================================================

export interface DailyWeightChart extends BabyRecord {
  weights: {
    date: Timestamp;
    ageInDays: number;
    correctedGestationalAge: { weeks: number; days: number };
    weightGrams: number;
    weightKg: number;
    percentile?: number;
    zScore?: number;
    measurementMethod: 'scale' | 'estimated';
    measuredBy: string;
  }[];

  growthAssessment?: {
    assessmentDate: Timestamp;
    birthWeight: number;
    currentWeight: number;
    weightGain: number;
    averageDailyGain: number;
    percentWeightLoss?: number;
    backToBirthWeight: boolean;
    backToBirthWeightDate?: Timestamp;
    growthVelocity: 'poor' | 'adequate' | 'good' | 'excessive';
    nutritionalConcerns: boolean;
    nutritionalPlan?: string;
  };

  chartType: 'Fenton' | 'UK-WHO' | 'Intergrowth-21st';

  targetWeight?: {
    date: Timestamp;
    targetGrams: number;
    achieved: boolean;
  };
}

// ============================================================================
// CLINICAL NOTES / EVALUATION SHEET
// ============================================================================

export interface EvaluationSheet extends BabyRecord {
  date: Timestamp;
  time: string;

  noteType: 'medical' | 'nursing' | 'physiotherapy' | 'occupational_therapy' | 'speech_therapy' | 'social_work' | 'other';

  authorId: string;
  authorName: string;
  authorDesignation: string;

  problemNumber?: number;
  problemDescription?: string;

  soap?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };

  freeText?: string;

  reviewType?: 'ward_round' | 'daily_review' | 'admission' | 'discharge' | 'emergency' | 'procedure' | 'routine';

  signed: boolean;
  signatureDateTime?: Timestamp;

  evaluationOutcome?: 'improving' | 'stable' | 'deteriorating' | 'discharged' | 'deceased';

  followUpRequired: boolean;
  followUpDate?: Timestamp;
  followUpBy?: string;
}

// ============================================================================
// ADMISSION ASSESSMENT
// ============================================================================

export interface AdmissionAssessment extends BabyRecord {
  admissionDateTime: Timestamp;
  timeOfBirth: Timestamp;

  reasonForAdmission: string;
  admissionDiagnoses: string[];

  birthDetails: {
    birthWeight: number;
    gestation: { weeks: number; days: number };
    deliveryMethod: 'SVD' | 'forceps' | 'ventouse' | 'elective_CS' | 'emergency_CS';
    apgarScores: {
      oneMin: number;
      fiveMin: number;
      tenMin?: number;
    };
    resuscitation: boolean;
    resuscitationDetails?: string;
  };

  maternalHistory?: {
    age?: number;
    parity?: string;
    pregnancyComplications?: string[];
    medications?: string[];
    groupBStrep?: boolean;
    membranesRuptured?: string;
  };

  initialVitals: {
    heartRate: number;
    respiratoryRate: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature: number;
    bloodGlucose?: number;
    oxygenSaturation?: number;
  };

  measurements: {
    weight: number;
    headCircumference?: number;
    length?: number;
  };

  vitaminK: {
    given: boolean;
    dose?: number;
    route?: string;
    dateTime?: Timestamp;
  };

  monitoring: {
    cardiacMonitoring: boolean;
    saturationMonitoring: boolean;
    bloodGlucoseMonitoring: boolean;
  };

  feedingPlan: {
    chosenMethod: 'breast' | 'bottle' | 'mixed' | 'tube' | 'TPN';
    motherIntention?: 'breast' | 'formula' | 'mixed';
    colostrum?: boolean;
  };

  screening: {
    nbsScreeningDate?: Timestamp;
    hearingScreeningDate?: Timestamp;
    preDischargeScreeningRequired: boolean;
  };

  welcomePackGiven: boolean;

  parentDetails: {
    name: string;
    contactNumber: string;
    relationship: string;
  };

  riskAssessments?: {
    infectionRisk: 'low' | 'moderate' | 'high';
    safeguardingConcerns: boolean;
    socialServicesinvolved: boolean;
  };

  initialPlan: string;

  admittedBy: string;
  assessedBy: string;
}

// ============================================================================
// TASK MANAGEMENT (NURSING TASKS)
// ============================================================================

export type TaskType = 'feeding' | 'medication' | 'vital_signs' | 'procedure' | 'assessment' | 'position_change' | 'skin_care' | 'line_care';
export type TaskStatus = 'pending' | 'due' | 'overdue' | 'in_progress' | 'completed' | 'missed' | 'cancelled' | 'deferred';
export type TaskPriority = 'routine' | 'important' | 'urgent' | 'critical';

export interface FeedingTaskDetails {
  volumeML: number;
  feedType: string;
  route: string;
  medicationsToInclude?: {
    medicationAdministrationId: string;
    medicationName: string;
  }[];
  aspirateRequired: boolean;
  fortification?: string;
}

export interface MedicationTaskDetails {
  prescriptionId: string;
  medicationName: string;
  dose: { amount: number; unit: string };
  route: string;
  canBeGivenInFeed: boolean;
  mustBeGivenSeparately: boolean;
}

export interface VitalSignsTaskDetails {
  parameters: ('weight' | 'temperature' | 'heartRate' | 'respiratoryRate' | 'oxygenSaturation' | 'bloodPressure')[];
  isRoutineCheck: boolean;
  specialInstructions?: string;
}

export interface ProcedureTaskDetails {
  procedureType: 'line_flush' | 'dressing_change' | 'tube_position_check' | 'position_change' | 'skin_assessment';
  specificInstructions?: string;
  equipmentRequired?: string[];
  targetLineOrTubeId?: string;
}

export type TaskDetails = FeedingTaskDetails | MedicationTaskDetails | VitalSignsTaskDetails | ProcedureTaskDetails;

export interface NursingTask extends BabyRecord {
  generatedFrom: {
    sourceType: 'care_plan' | 'medication_prescription' | 'manual';
    sourceId: string;
    version?: number;
  };

  taskType: TaskType;
  taskCategory: 'routine' | 'prn' | 'stat' | 'urgent';

  scheduledDateTime: Timestamp;
  scheduledTimeOfDay?: string;
  windowStart?: Timestamp;
  windowEnd?: Timestamp;

  recurrencePattern?: {
    frequency: 'once' | 'hourly' | '2-hourly' | '3-hourly' | '4-hourly' | 'daily';
    seriesId: string;
    instanceNumber: number;
  };

  taskDetails: TaskDetails;

  status: TaskStatus;

  assignedTo?: string;
  assignedBy?: string;

  completedAt?: Timestamp;
  completedBy?: string;
  completionRecordType?: 'FeedingRecord' | 'MedicationAdministration' | 'VitalSign' | 'ProcedureRecord';
  completionRecordId?: string;

  variance?: {
    type: 'time_delayed' | 'not_completed' | 'partial' | 'refused' | 'contraindicated';
    reason: string;
    alternativeAction?: string;
  };

  priority: TaskPriority;
  flags?: ('first_time' | 'needs_two_nurses' | 'parent_present' | 'sterile')[];

  reminderSent?: boolean;
  escalationRequired?: boolean;

  autoGenerated: boolean;
}

export interface TaskCompletionSummary extends BabyRecord {
  date: Timestamp;
  shift?: 'day' | 'night' | 'long_day';

  totalTasksScheduled: number;
  tasksCompleted: number;
  tasksDeferred: number;
  tasksMissed: number;
  tasksCancelled: number;

  variances: {
    taskId: string;
    taskType: string;
    scheduledTime: Timestamp;
    actualTime?: Timestamp;
    varianceMinutes?: number;
    reason: string;
  }[];

  clinicallySignificantVariances: boolean;
  escalatedToMedicalTeam: boolean;

  compiledBy: string;
}

export interface ShiftHandoverReport extends BabyRecord {
  shift: 'day' | 'night' | 'long_day';
  date: Timestamp;

  outstandingTasks: NursingTask[];
  upcomingTasks: NursingTask[];

  significantVariances: {
    task: NursingTask;
    variance: string;
    clinicalImplication: string;
  }[];

  carePlanUpdates: {
    plan: any; // EnhancedCarePlan
    changes: string;
    effectiveFrom: Timestamp;
  }[];

  handedOverBy: string;
  handedOverTo: string;
  handoverTime: Timestamp;
}

// ============================================================================
// ENHANCED CARE PLAN (WARD ROUND-DRIVEN)
// ============================================================================

export interface EnhancedCarePlan extends BabyRecord {
  version: number;
  wardRoundDate: Timestamp;
  supersedes?: string;

  category: 'comprehensive' | 'feeding' | 'respiratory' | 'medication' | 'observation' | 'procedural' | 'developmental';
  title: string;
  description: string;

  prescribedBy: string;
  approvedBy?: string;
  reviewDate?: Timestamp;

  status: 'active' | 'suspended' | 'completed' | 'superseded';
  effectiveFrom: Timestamp;
  effectiveUntil?: Timestamp;

  feedingPlan?: {
    frequency: number;
    volumePerFeed: number;
    feedType: FeedType;
    route: FeedRoute;
    fortification?: {
      type: string;
      scoopsPer100ml: number;
    };
    specialInstructions?: string[];
    aspirateBeforeFeed: boolean;
    minimumInterval?: number;
  };

  medicationPlan?: {
    prescriptionIds: string[];
    administrationGuidelines?: string;
  };

  observationPlan?: {
    frequency: 'continuous' | 'hourly' | '2-hourly' | '4-hourly' | '6-hourly';
    parameters: {
      weight?: { frequency: 'daily' | 'twice-daily' | 'weekly'; time?: string };
      temperature: boolean;
      heartRate: boolean;
      respiratoryRate: boolean;
      oxygenSaturation: boolean;
      bloodPressure: boolean;
    };
    escalationCriteria?: {
      parameter: string;
      threshold: string;
      action: string;
    }[];
  };

  respiratoryPlan?: {
    mode: 'IPPV' | 'SIMV' | 'CPAP' | 'HFOV' | 'nasal_cannula' | 'room_air';
    settings?: {
      fiO2Target: number;
      peep?: number;
      pip?: number;
      rate?: number;
    };
    weaningProtocol?: string;
    assessmentFrequency: string;
  };

  proceduralPlan?: {
    lineCare?: {
      lineIds: string[];
      flushFrequency: number;
      dressingChangeFrequency: number;
    };
    tubeCare?: {
      tubeIds: string[];
      positionCheckFrequency: number;
    };
    positionChanges?: {
      frequency: number;
      positions: string[];
    };
    skinAssessments?: {
      frequency: number;
    };
  };

  developmentalPlan?: {
    kangarooCare: boolean;
    minimumHandling: boolean;
    clusteredCare: boolean;
    lightReduction: boolean;
    noiseReduction: boolean;
  };

  additionalInstructions?: string[];

  changeHistory?: {
    date: Timestamp;
    changedBy: string;
    changes: string;
    reason: string;
  }[];

  createdBy: string;
}
