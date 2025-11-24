import { Timestamp } from 'firebase/firestore';

// Peripheral/Central Line Record
export interface PeripheralCentralLineRecord {
  id: string;
  babyId: string;

  // Line Details
  lineType: 'peripheral_IV' | 'PICC' | 'UAC' | 'UVC' | 'long_line' | 'femoral_line';

  // Insertion
  insertionDate: Timestamp;
  insertionTime: string;
  insertionSite: string;           // e.g., "Right hand", "Umbilical"
  insertedBy: string;              // Staff ID

  // Line Specifications
  gaugeSize?: string;              // e.g., "24G", "22G"
  length?: number;                 // cm

  // Position Verification (for central lines)
  tipPosition?: string;            // e.g., "IVC/RA junction"
  positionVerified: boolean;
  verificationMethod?: 'xray' | 'ultrasound' | 'ECG' | 'blood_gas';
  verificationDate?: Timestamp;

  // Securing/Dressing
  securingMethod: string;          // e.g., "Transparent dressing", "Sutures"
  cleaningSolutionUsed: string;    // e.g., "Chlorhexidine 0.5%"

  // Maintenance
  dressingChanges: {
    date: Timestamp;
    performedBy: string;
    siteAppearance: 'clean' | 'red' | 'swollen' | 'discharge';
    notes?: string;
  }[];

  // Patency Checks
  patencyChecks: {
    date: Timestamp;
    patent: boolean;
    flushedWith?: string;
    notes?: string;
  }[];

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

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Nasogastric/Orogastric Tube Insertion
export interface NasoOrogastricTubeInsertion {
  id: string;
  babyId: string;

  // Tube Details
  tubeType: 'NG' | 'OG';

  // Insertion
  insertionDateTime: Timestamp;
  tubeSize: string;                // e.g., "5Fr", "6Fr", "8Fr"
  lengthInserted: number;          // cm
  nostrilSide?: 'left' | 'right';  // for NG tubes

  // NEX Measurement
  nexMeasurement?: number;         // Nose-Ear-Xiphoid in cm

  // Position Verification
  positionVerified: boolean;
  verificationMethod: 'pH' | 'aspirate_appearance' | 'xray';
  aspiratepH?: number;
  xrayDate?: Timestamp;

  // Securing
  securingMethod: string;          // e.g., "Tape to cheek", "Tegaderm"
  externalLength: number;          // cm visible outside nose/mouth

  // Change Schedule
  changeDuringDate?: Timestamp;

  // Tube Checks
  tubeChecks: {
    date: Timestamp;
    time: string;
    positionConfirmed: boolean;
    method: 'pH' | 'aspirate' | 'external_length_check';
    pH?: number;
    externalLengthCm?: number;
    checkedBy: string;
  }[];

  // Complications
  complications: {
    type: 'displacement' | 'blockage' | 'nasal_trauma' | 'aspiration';
    date: Timestamp;
    action: string;
  }[];

  // Removal/Replacement
  removalDate?: Timestamp;
  removalReason?: 'no_longer_needed' | 'displacement' | 'blockage' | 'scheduled_change';
  replacedWith?: string;           // New tube ID

  // Status
  isActive: boolean;

  // Inserted By
  insertedBy: string;

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Blood Transfusion Record
export interface TransfusionRecord {
  id: string;
  babyId: string;

  // Transfusion Details
  productType: 'packed_red_cells' | 'platelets' | 'FFP' | 'cryoprecipitate' | 'whole_blood';

  // Pre-Transfusion
  indication: string;
  consentDocumented: boolean;
  consentedBy?: string;            // Parent ID
  consentDate?: Timestamp;

  // Pre-Transfusion Values
  preTransfusion: {
    hemoglobin?: number;           // g/dL
    hematocrit?: number;           // %
    platelets?: number;            // x10⁹/L
    weight: number;                // for volume calculation
  };

  // Product Details
  productDetails: {
    donationNumber: string;
    expiryDate: Timestamp;
    volume: number;                // ml
    bloodGroup?: string;
    rhesus?: string;
  };

  // Administration
  startDateTime: Timestamp;
  endDateTime?: Timestamp;
  administeredBy: string;
  checkedBy: string;               // Double-check requirement

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

  // Outcome
  outcome: 'completed' | 'stopped_early' | 'reaction_occurred';

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Sample Collection Metadata
export interface SampleCollectionMetadata {
  id: string;
  babyId: string;

  // Sample Details
  sampleType: 'blood_culture' | 'EDTA_blood' | 'urine' | 'CSF' | 'tracheal_aspirate' | 'surface_swab' | 'stool' | 'other';

  // Collection
  collectionDateTime: Timestamp;
  collectedBy: string;
  collectionMethod?: string;       // e.g., "Clean catch", "Catheter", "SPA"

  // Sample Identification
  barcodeNumber?: string;
  labNumber?: string;

  // Volume/Quantity
  volume?: number;                 // ml
  quantity?: string;

  // Clinical Context
  clinicalIndication: string;
  requestingDoctor: string;

  // Laboratory Destination
  laboratory: 'microbiology' | 'biochemistry' | 'haematology' | 'genetics' | 'other';
  labLocation?: string;

  // Tests Requested
  testsRequested: string[];

  // Sample Handling
  sentToLabDateTime?: Timestamp;
  sentBy?: string;

  // Results
  resultsReceived: boolean;
  resultsDateTime?: Timestamp;
  resultsLocation?: string;        // e.g., "EPR system", "Paper in notes"
  criticalResult: boolean;

  // Packaging (for GenOMICC/Research)
  packagingRequirements?: {
    barcodeApplied: boolean;
    sealedCorrectly: boolean;
    placedInSamplingBox: boolean;
  };

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Consent Record
export interface ConsentRecord {
  id: string;
  babyId: string;

  // Consent Type
  consentType: 'treatment' | 'research' | 'genomics' | 'photography' | 'teaching' | 'procedure' | 'blood_products' | 'post_mortem';

  // Specific Details
  specificProcedure?: string;
  studyName?: string;              // For research
  formVersion?: string;

  // Consenting Party
  consentedBy: {
    personId: string;              // Parent/Guardian ID
    name: string;
    relationship: 'mother' | 'father' | 'guardian' | 'person_with_parental_responsibility';
  };

  // Consent Process
  dateObtained: Timestamp;
  obtainedBy: string;              // Staff ID
  witnessedBy?: string;

  // Consent Statements Acknowledged (for research/genomics)
  statementsAcknowledged?: {
    dnaCollectionPermission: boolean;
    longTermDataUsePermission: boolean;
    withdrawalRightsUnderstood: boolean;
    dataAccessConditionsUnderstood: boolean;
    recontactAt16Understood: boolean;
    ethicsApprovalUnderstood: boolean;
  };

  // Validity
  validFrom: Timestamp;
  validUntil?: Timestamp;

  // Withdrawal
  withdrawn: boolean;
  withdrawnDate?: Timestamp;
  withdrawnBy?: string;
  withdrawalReason?: string;

  // Document Reference
  physicalFormLocation?: string;
  scannedDocument?: string;        // URL/path to scanned consent

  // Notes
  notes?: string;

  // Chief/Principal Investigator (for research)
  chiefInvestigator?: string;
  principalInvestigator?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Safety Check / Handover Checklist
export interface SafetyCheck {
  id: string;
  babyId: string;

  // Timing
  checkDate: Timestamp;
  checkTime: string;
  shift: 'day' | 'night' | 'long_day';

  // Type
  checkType: 'shift_handover' | 'equipment_check' | 'safety_round';

  // Patient Identification
  patientID: {
    nameChecked: boolean;
    wristbandChecked: boolean;
    hospitalNumberVerified: boolean;
  };

  // Equipment Checks
  equipmentChecks: {
    // Incubator/Cot
    incubatorStatus?: 'functioning' | 'issue';
    temperatureSettings?: {
      set: number;
      actual: number;
    };

    // Ventilator
    ventilatorStatus?: 'functioning' | 'issue' | 'not_in_use';
    ventilatorSettings?: {
      mode: string;
      rate: number;
      pressures: string;
      fiO2: number;
    };

    // Oxygen/Air
    oxygenFlow?: number;
    airFlow?: number;

    // Humidifier
    humidifierTemperature?: number;

    // Monitors
    monitorsStatus: 'functioning' | 'issue';
    alarmSettingsAppropriate: boolean;
    alarmVolumeAudible: boolean;
  };

  // IV Lines
  ivLineChecks: {
    lineId: string;
    siteChecked: boolean;
    siteAppearance: 'clean' | 'red' | 'swollen' | 'discharge';
    infusionRateCorrect: boolean;
    lineSecure: boolean;
  }[];

  // Medications
  medicationChecks: {
    prescriptionChart: boolean;
    infusionsCorrect: boolean;
    controlledDrugsChecked?: boolean;
  };

  // Nutrition
  nutritionChecks: {
    feedingPlanFollowed: boolean;
    ngTubePositionChecked?: boolean;
    enteralFeedRunningCorrectly?: boolean;
    tpnRunningCorrectly?: boolean;
  };

  // Observations Frequency
  observationsFrequency: string;   // e.g., "Hourly", "4-hourly"
  lastObservationTime?: string;

  // Concerns Raised
  concerns: {
    concern: string;
    severity: 'low' | 'medium' | 'high';
    actionTaken: string;
    escalated: boolean;
  }[];

  // Handover Items
  handoverNotes?: string;

  // Staff
  checkedBy: string;
  handedOverTo?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
