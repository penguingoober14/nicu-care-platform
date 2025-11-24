import type {
  ConsentRecord,
  PeripheralCentralLineRecord,
  NasoOrogastricTubeInsertion,
  SampleCollectionMetadata,
  AdmissionAssessment,
} from '../types';
import { now, daysAgo } from './generators';

// ============================================================================
// CONSENT RECORDS
// ============================================================================

export const DEMO_CONSENTS: ConsentRecord[] = [
  {
    id: 'consent-daisy-treatment',
    babyId: 'daisy',
    consentType: 'treatment',
    specificProcedure: 'NICU admission and standard care',
    consentedBy: {
      personId: 'parent-rachel-smith',
      name: 'Rachel Smith',
      relationship: 'mother',
    },
    dateObtained: daysAgo(5),
    obtainedBy: 'emma-consultant',
    validFrom: daysAgo(5),
    withdrawn: false,
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'consent-elsa-treatment',
    babyId: 'elsa',
    consentType: 'treatment',
    specificProcedure: 'NICU admission, ventilation and standard care',
    consentedBy: {
      personId: 'parent-sophie-brown',
      name: 'Sophie Brown',
      relationship: 'mother',
    },
    dateObtained: daysAgo(12),
    obtainedBy: 'emma-consultant',
    validFrom: daysAgo(12),
    withdrawn: false,
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
];

// ============================================================================
// IV LINES & CENTRAL LINES
// ============================================================================

export const DEMO_IV_LINES: PeripheralCentralLineRecord[] = [
  {
    id: 'line-daisy-peripheral',
    babyId: 'daisy',
    lineType: 'peripheral_IV',
    insertionDate: daysAgo(3),
    insertionTime: '14:30',
    insertionSite: 'Right hand dorsum',
    insertedBy: 'sarah-nurse',
    gaugeSize: '24G',
    length: 2.5,
    positionVerified: true,
    verificationMethod: 'blood_gas',
    securingMethod: 'Transparent dressing with Tegaderm',
    cleaningSolutionUsed: 'Chlorhexidine 0.5%',
    dressingChanges: [
      {
        date: daysAgo(1),
        performedBy: 'sarah-nurse',
        performedAt: daysAgo(1),
        siteAppearance: 'clean',
        notes: 'No signs of inflammation',
      },
    ],
    patencyChecks: [
      { date: daysAgo(2), performedBy: 'sarah-nurse', performedAt: daysAgo(2), patent: true, flushedWith: 'Normal saline 0.5ml' },
      { date: daysAgo(1), performedBy: 'sarah-nurse', performedAt: daysAgo(1), patent: true, flushedWith: 'Normal saline 0.5ml' },
      { date: now(), performedBy: 'sarah-nurse', performedAt: now(), patent: true, flushedWith: 'Normal saline 0.5ml' },
    ],
    complications: [],
    isActive: true,
    createdAt: daysAgo(3),
    updatedAt: now(),
  },
  {
    id: 'line-elsa-picc',
    babyId: 'elsa',
    lineType: 'PICC',
    insertionDate: daysAgo(10),
    insertionTime: '10:15',
    insertionSite: 'Right arm - basilic vein',
    insertedBy: 'emma-consultant',
    gaugeSize: '1Fr',
    length: 8,
    tipPosition: 'IVC/RA junction',
    positionVerified: true,
    verificationMethod: 'xray',
    verificationDate: daysAgo(10),
    securingMethod: 'Sutures and transparent dressing',
    cleaningSolutionUsed: 'Chlorhexidine 0.5%',
    dressingChanges: [
      {
        date: daysAgo(7),
        performedBy: 'sarah-nurse',
        performedAt: daysAgo(7),
        siteAppearance: 'clean',
      },
      {
        date: daysAgo(3),
        performedBy: 'sarah-nurse',
        performedAt: daysAgo(3),
        siteAppearance: 'clean',
      },
    ],
    patencyChecks: [
      { date: daysAgo(5), performedBy: 'sarah-nurse', performedAt: daysAgo(5), patent: true },
      { date: daysAgo(2), performedBy: 'sarah-nurse', performedAt: daysAgo(2), patent: true },
      { date: now(), performedBy: 'sarah-nurse', performedAt: now(), patent: true },
    ],
    complications: [],
    isActive: true,
    createdAt: daysAgo(10),
    updatedAt: now(),
  },
];

// ============================================================================
// NG/OG TUBES
// ============================================================================

export const DEMO_NG_TUBES: NasoOrogastricTubeInsertion[] = [
  {
    id: 'tube-daisy-ng',
    babyId: 'daisy',
    tubeType: 'NG',
    insertionDateTime: daysAgo(5),
    tubeSize: '6Fr',
    lengthInserted: 12,
    nostrilSide: 'right',
    nexMeasurement: 12,
    positionVerified: true,
    verificationMethod: 'pH',
    aspiratepH: 4.5,
    securingMethod: 'Tegaderm to right cheek',
    externalLength: 4,
    tubeChecks: [
      { date: daysAgo(4), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.2, checkedBy: 'sarah-nurse' },
      { date: daysAgo(3), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.8, checkedBy: 'sarah-nurse' },
      { date: daysAgo(2), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.5, checkedBy: 'sarah-nurse' },
      { date: daysAgo(1), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.3, checkedBy: 'sarah-nurse' },
    ],
    complications: [],
    isActive: true,
    insertedBy: 'sarah-nurse',
    createdAt: daysAgo(5),
    updatedAt: now(),
  },
  {
    id: 'tube-elsa-ng',
    babyId: 'elsa',
    tubeType: 'NG',
    insertionDateTime: daysAgo(12),
    tubeSize: '5Fr',
    lengthInserted: 10,
    nostrilSide: 'left',
    nexMeasurement: 10,
    positionVerified: true,
    verificationMethod: 'xray',
    xrayDate: daysAgo(12),
    securingMethod: 'Tegaderm to left cheek',
    externalLength: 3,
    tubeChecks: [
      { date: daysAgo(10), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.1, checkedBy: 'sarah-nurse' },
      { date: daysAgo(7), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.6, checkedBy: 'sarah-nurse' },
      { date: daysAgo(4), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.3, checkedBy: 'sarah-nurse' },
      { date: daysAgo(1), time: '08:00', positionConfirmed: true, method: 'pH', pH: 4.4, checkedBy: 'sarah-nurse' },
    ],
    complications: [],
    isActive: true,
    insertedBy: 'sarah-nurse',
    createdAt: daysAgo(12),
    updatedAt: now(),
  },
];

// ============================================================================
// SAMPLE COLLECTIONS
// ============================================================================

export const DEMO_SAMPLES: SampleCollectionMetadata[] = [
  {
    id: 'sample-daisy-blood-culture',
    babyId: 'daisy',
    sampleType: 'blood_culture',
    collectionDateTime: daysAgo(5),
    collectedBy: 'sarah-nurse',
    collectionMethod: 'Peripheral venepuncture',
    barcodeNumber: 'BC123456',
    volume: 0.5,
    clinicalIndication: 'Rule out early onset sepsis',
    requestingDoctor: 'james-doctor',
    laboratory: 'microbiology',
    testsRequested: ['Blood culture', 'Sensitivity'],
    sentToLabDateTime: daysAgo(5),
    sentBy: 'sarah-nurse',
    resultsReceived: true,
    resultsDateTime: daysAgo(3),
    resultsLocation: 'EPR system',
    criticalResult: false,
    notes: 'No growth after 48 hours',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
  },
  {
    id: 'sample-elsa-blood-culture',
    babyId: 'elsa',
    sampleType: 'blood_culture',
    collectionDateTime: daysAgo(12),
    collectedBy: 'sarah-nurse',
    collectionMethod: 'UAC',
    barcodeNumber: 'BC234567',
    volume: 0.5,
    clinicalIndication: 'Rule out early onset sepsis',
    requestingDoctor: 'emma-consultant',
    laboratory: 'microbiology',
    testsRequested: ['Blood culture', 'Sensitivity'],
    sentToLabDateTime: daysAgo(12),
    sentBy: 'sarah-nurse',
    resultsReceived: true,
    resultsDateTime: daysAgo(10),
    resultsLocation: 'EPR system',
    criticalResult: false,
    notes: 'No growth after 48 hours',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(10),
  },
];

// ============================================================================
// ADMISSION ASSESSMENTS
// ============================================================================

export const DEMO_ADMISSION_ASSESSMENTS: AdmissionAssessment[] = [
  {
    id: 'admission-daisy',
    babyId: 'daisy',
    admissionDateTime: daysAgo(5),
    timeOfBirth: daysAgo(5),
    reasonForAdmission: 'Prematurity at 32+4 weeks gestation',
    admissionDiagnoses: ['Prematurity', 'Respiratory distress syndrome', 'Rule out sepsis'],
    birthDetails: {
      birthWeight: 1850,
      gestation: { weeks: 32, days: 4 },
      deliveryMethod: 'emergency_CS',
      apgarScores: { oneMin: 7, fiveMin: 9, tenMin: 9 },
      resuscitation: true,
      resuscitationDetails: 'Facial oxygen and stimulation for 2 minutes',
    },
    maternalHistory: {
      age: 34,
      parity: 'Para 1+1',
      pregnancyComplications: ['Gestational diabetes'],
      groupBStrep: false,
      membranesRuptured: '2 hours before delivery',
    },
    initialVitals: {
      heartRate: 148,
      respiratoryRate: 58,
      bloodPressure: { systolic: 52, diastolic: 32 },
      temperature: 36.5,
      bloodGlucose: 3.8,
      oxygenSaturation: 94,
    },
    measurements: {
      weight: 1850,
      headCircumference: 29.5,
      length: 42,
    },
    vitaminK: {
      given: true,
      dose: 1,
      route: 'IM',
      dateTime: daysAgo(5),
    },
    monitoring: {
      cardiacMonitoring: true,
      saturationMonitoring: true,
      bloodGlucoseMonitoring: true,
    },
    feedingPlan: {
      chosenMethod: 'tube',
      motherIntention: 'breast',
      colostrum: true,
    },
    screening: {
      nbsScreeningDate: daysAgo(2),
      preDischargeScreeningRequired: true,
    },
    welcomePackGiven: true,
    parentDetails: {
      name: 'Rachel Smith',
      contactNumber: '07700 900123',
      relationship: 'Mother',
    },
    riskAssessments: {
      infectionRisk: 'moderate',
      safeguardingConcerns: false,
      socialServicesinvolved: false,
    },
    initialPlan: 'Admit to NICU. Monitor respiratory status. Start feeding when stable. Blood cultures and antibiotics if indicated.',
    admittedBy: 'james-doctor',
    assessedBy: 'emma-consultant',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'admission-elsa',
    babyId: 'elsa',
    admissionDateTime: daysAgo(12),
    timeOfBirth: daysAgo(12),
    reasonForAdmission: 'Extreme prematurity at 28+2 weeks gestation, twin pregnancy',
    admissionDiagnoses: ['Extreme prematurity', 'RDS requiring ventilation', 'Rule out sepsis', 'Twin-twin transfusion syndrome'],
    birthDetails: {
      birthWeight: 1120,
      gestation: { weeks: 28, days: 2 },
      deliveryMethod: 'emergency_CS',
      apgarScores: { oneMin: 4, fiveMin: 7, tenMin: 8 },
      resuscitation: true,
      resuscitationDetails: 'Intubation and ventilation for 5 minutes, surfactant given',
    },
    maternalHistory: {
      age: 36,
      parity: 'Para 0+0',
      pregnancyComplications: ['Twin-twin transfusion syndrome', 'Preeclampsia'],
      medications: ['Labetalol'],
      groupBStrep: false,
      membranesRuptured: 'At delivery',
    },
    initialVitals: {
      heartRate: 165,
      respiratoryRate: 0,
      bloodPressure: { systolic: 38, diastolic: 22 },
      temperature: 35.8,
      bloodGlucose: 2.8,
      oxygenSaturation: 85,
    },
    measurements: {
      weight: 1120,
      headCircumference: 25.5,
      length: 36,
    },
    vitaminK: {
      given: true,
      dose: 0.5,
      route: 'IM',
      dateTime: daysAgo(12),
    },
    monitoring: {
      cardiacMonitoring: true,
      saturationMonitoring: true,
      bloodGlucoseMonitoring: true,
    },
    feedingPlan: {
      chosenMethod: 'TPN',
      motherIntention: 'breast',
    },
    screening: {
      preDischargeScreeningRequired: true,
    },
    welcomePackGiven: true,
    parentDetails: {
      name: 'Sophie Brown',
      contactNumber: '07700 900456',
      relationship: 'Mother',
    },
    riskAssessments: {
      infectionRisk: 'high',
      safeguardingConcerns: false,
      socialServicesinvolved: false,
    },
    initialPlan: 'Admit to NICU. Continue ventilation. Start TPN. Blood cultures and antibiotics. Monitor for complications of prematurity.',
    admittedBy: 'emma-consultant',
    assessedBy: 'emma-consultant',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
];
