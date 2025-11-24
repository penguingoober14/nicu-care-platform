import { Timestamp } from 'firebase/firestore';

// Blood Gas & Biochemistry
export interface BloodGasResult {
  id: string;
  babyId: string;

  // Timing
  sampleDate: Timestamp;
  sampleTime: string;

  // Sample Details
  sampleType: 'arterial' | 'venous' | 'capillary';
  sampleSite?: string;

  // Blood Gas Values
  pH?: number;
  pCO2?: number;        // kPa or mmHg
  pO2?: number;         // kPa or mmHg
  baseExcess?: number;  // BE
  HCO3?: number;        // Bicarbonate
  lactate?: number;     // mmol/L

  // Biochemistry
  hemoglobin?: number;  // Hb g/dL
  sodium?: number;      // Na mmol/L
  potassium?: number;   // K mmol/L
  calcium?: number;     // Ca mmol/L
  bilirubin?: number;   // μmol/L
  glucose?: number;     // mmol/L

  // Ventilator Settings at Time of Sample
  ventilatorSettings?: {
    mode: string;
    fiO2: number;       // %
    peep?: number;      // cmH2O
    pip?: number;       // cmH2O
    rate?: number;      // breaths/min
    tidalVolume?: number;
  };

  // Clinical Context
  clinicalIndication?: string;

  // Staff
  takenBy: string;
  checkedBy?: string;
  authorizedBy?: string;

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Fluid Balance Chart
export interface FluidBalanceRecord {
  id: string;
  babyId: string;

  // Time Period
  date: Timestamp;
  timeSlot: string;     // e.g., "00:00-04:00", "04:00-08:00"

  // Intake
  intake: {
    iv?: number;          // IV fluids ml
    enteral?: number;     // Enteral feeds ml
    medications?: number; // Medication volume ml
    bloodProducts?: number;
    other?: number;
    total: number;
  };

  // Output
  output: {
    urine?: number;       // ml
    stool?: number;       // ml (if measurable)
    aspirates?: number;   // NG/gastric ml
    drainLosses?: number; // Surgical drains ml
    other?: number;
    total: number;
  };

  // Calculated
  netBalance: number;     // intake - output
  cumulativeBalance: number;  // Running total

  // Insensible Losses (calculated)
  insensibleLosses?: number;

  // Staff
  recordedBy: string;

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 24-Hour Resume (Daily Rollover Summary)
export interface TwentyFourHourResume {
  id: string;
  babyId: string;

  // Time Period
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
      fiO2Range: string;      // e.g., "21-30%"
      pressureSupport?: string;
      peep?: number;
      pip?: number;
      rate?: number;
    };
    oxygenRange: string;        // e.g., "21-25%"
    spontaneousBreathing: boolean;
    extubationPlanned: boolean;
  };

  // Cardiovascular System
  cardiovascular: {
    heartRateRange: string;     // e.g., "130-150"
    bloodPressureRange: string; // e.g., "45-55/25-35"
    meanBP: number;
    perfusion: 'good' | 'adequate' | 'poor';
    capillaryRefillTime: number; // seconds
  };

  // Temperature
  temperatureRange: string;     // e.g., "36.5-37.2°C"

  // Events
  events: {
    apnoeas: number;
    bradycardias: number;
    desaturations: number;
  };

  // Saturations (First 24 hours for certain conditions)
  saturations?: {
    preDuctal: number;
    postDuctal: number;
  };

  // Urine Output
  urineOutput: {
    totalVolume: number;    // ml
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
    totalFluids: number;        // ml/kg/day
    enteralIntake: number;      // ml/kg/day
    parenteralIntake: number;   // ml/kg/day
    feedingMethod: 'MBM' | 'DBM' | 'formula' | 'fortified' | 'TPN' | 'mixed';
    feedVolume: number;         // ml per feed
    feedFrequency: string;      // e.g., "3-hourly"
    feedTolerance: 'good' | 'moderate' | 'poor';
    vomits: number;
    aspirates: string;
  };

  // Blood Products Given
  bloodProducts: {
    packedCells?: number;       // ml
    ffp?: number;               // ml
    platelets?: number;         // ml
    otherProducts?: string;
  };

  // Total Blood Taken
  totalBloodTaken: number;      // ml

  // Jaundice
  jaundice: {
    phototherapy: boolean;
    bilirubinLevel?: number;
    phototherapyHours?: number;
  };

  // Early Neonatal Care
  earlyNeonatal?: {
    colostrumGivenWithin48hrs: boolean;
  };

  // Medications (1-6 slots as per NHS form)
  medications: string[];

  // Investigations
  investigations: {
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

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Infection Record
export interface InfectionRecord {
  id: string;
  babyId: string;

  // Episode Details
  episodeStartDate: Timestamp;
  episodeEndDate?: Timestamp;

  // Classification
  infectionType: 'suspected' | 'confirmed' | 'ruled_out';
  infectionCategory: 'early_onset_sepsis' | 'late_onset_sepsis' | 'NEC' | 'pneumonia' | 'UTI' | 'line_infection' | 'other';

  // Clinical Signs
  clinicalSigns: string[];

  // Microbiology
  microbiology: {
    samplesTaken: {
      type: 'blood_culture' | 'urine' | 'CSF' | 'tracheal_aspirate' | 'surface_swabs';
      date: Timestamp;
      result?: string;
      organism?: string;
      sensitivities?: string[];
    }[];
  };

  // Infection Markers
  infectionMarkers: {
    crp?: number;         // mg/L
    wbc?: number;         // x10⁹/L
    neutrophils?: number;
    platelets?: number;
  }[];

  // Antibiotics
  antibiotics: {
    drug: string;
    startDate: Timestamp;
    stopDate?: Timestamp;
    durationDays?: number;
    indication: string;
  }[];

  // Line-Associated
  lineAssociated: boolean;
  lineType?: string;
  lineRemoved?: boolean;

  // Outcome
  outcome?: 'resolved' | 'ongoing' | 'died';

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Phototherapy Record
export interface PhototherapyRecord {
  id: string;
  babyId: string;

  // Episode
  startDateTime: Timestamp;
  stopDateTime?: Timestamp;

  // Bilirubin Levels
  bilirubinLevels: {
    date: Timestamp;
    level: number;        // μmol/L
    measurementMethod: 'serum' | 'transcutaneous';
  }[];

  // Phototherapy Type
  phototherapyType: 'single' | 'double' | 'intensive';

  // Eye Protection
  eyeProtectionConfirmed: boolean;

  // Rebound Check
  reboundBilirubinChecked: boolean;
  reboundBilirubinLevel?: number;
  reboundCheckDate?: Timestamp;

  // Exchange Transfusion
  exchangeTransfusionRequired: boolean;
  exchangeTransfusionDate?: Timestamp;

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Admission Assessment
export interface AdmissionAssessment {
  id: string;
  babyId: string;

  // Timing
  admissionDateTime: Timestamp;
  timeOfBirth: Timestamp;

  // Reason for Admission
  reasonForAdmission: string;
  admissionDiagnoses: string[];

  // Birth History
  birthDetails: {
    birthWeight: number;           // grams
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

  // Maternal History
  maternalHistory?: {
    age?: number;
    parity?: string;
    pregnancyComplications?: string[];
    medications?: string[];
    groupBStrep?: boolean;
    membranesRuptured?: string;
  };

  // Initial Vital Signs
  initialVitals: {
    heartRate: number;
    respiratoryRate: number;
    bloodPressure?: { systolic: number; diastolic: number };
    temperature: number;
    bloodGlucose?: number;
    oxygenSaturation?: number;
  };

  // Initial Measurements
  measurements: {
    weight: number;
    headCircumference?: number;
    length?: number;
  };

  // Vitamin K
  vitaminK: {
    given: boolean;
    dose?: number;
    route?: string;
    dateTime?: Timestamp;
  };

  // Initial Monitoring
  monitoring: {
    cardiacMonitoring: boolean;
    saturationMonitoring: boolean;
    bloodGlucoseMonitoring: boolean;
  };

  // Feeding Plan
  feedingPlan: {
    chosenMethod: 'breast' | 'bottle' | 'mixed' | 'tube' | 'TPN';
    motherIntention?: 'breast' | 'formula' | 'mixed';
    colostrum?: boolean;
  };

  // Screening
  screening: {
    nbsScreeningDate?: Timestamp;
    hearingScreeningDate?: Timestamp;
    preDischargeScreeningRequired: boolean;
  };

  // Welcome Pack
  welcomePackGiven: boolean;

  // Parent/Carer Details
  parentDetails: {
    name: string;
    contactNumber: string;
    relationship: string;
  };

  // Risk Assessments
  riskAssessments?: {
    infectionRisk: 'low' | 'moderate' | 'high';
    safeguardingConcerns: boolean;
    socialServicesinvolved: boolean;
  };

  // Initial Plan
  initialPlan: string;

  // Staff
  admittedBy: string;
  assessedBy: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
