# MVP Phase 1 Implementation Plan
## Demo App with Daisy & Elsa

**Project:** NICU Care Platform
**Firebase Project ID:** `nicu-app-9e772`
**GitHub:** https://github.com/penguingoober14/nicu-care-platform

---

## Demo Scenario

### Test Babies
- **Daisy** - Room 1, 32+4 weeks gestation, day 5 of admission
- **Elsa** - Room 2, 28+2 weeks gestation, day 12 of admission

### Demo Users
- **Bedside Nurse:** Sarah Johnson (sarah.nurse@demo.nicu)
- **Consultant:** Dr. Emma Williams (emma.consultant@demo.nicu)
- **Junior Doctor:** Dr. James Chen (james.doctor@demo.nicu)
- **Ward Manager:** Maria Garcia (maria.manager@demo.nicu)
- **Physiotherapist:** Tom Andrews (tom.physio@demo.nicu)
- **Parent (Daisy's Mum):** Rachel Smith (rachel.parent@demo.nicu)
- **Parent (Elsa's Mum):** Sophie Brown (sophie.parent@demo.nicu)

---

## Extended Database Schema for MVP Phase 1

### New/Updated Collections

#### 1. Care Plans

```typescript
interface CarePlan {
  id: string;
  babyId: string;

  // Type
  type: 'feeding' | 'respiratory' | 'medication' | 'developmental' | 'general';

  // Plan Details
  title: string;
  description: string;
  instructions: string[];

  // Feeding Plan Specific
  feedingSchedule?: {
    frequency: number;              // hours between feeds
    volumePerFeed: number;          // ml
    feedType: string;
    route: 'oral' | 'NG tube' | 'OG tube' | 'mixed';
    fortification?: {
      type: string;
      amount: number;
    };
  };

  // Medication Plan
  medications?: {
    name: string;
    dose: string;
    route: string;
    frequency: string;
    timing: string[];               // e.g., ["08:00", "14:00", "20:00"]
  }[];

  // Care Activities
  careActivities?: {
    activity: string;
    frequency: string;
    instructions: string;
    completed?: boolean;
  }[];

  // Escalation Parameters
  escalationParameters?: {
    parameter: string;
    threshold: string;
    action: string;
  }[];

  // Status
  status: 'active' | 'inactive' | 'archived';
  effectiveFrom: Timestamp;
  effectiveTo?: Timestamp;

  // Authors
  createdBy: string;
  approvedBy?: string;
  lastReviewedBy?: string;
  lastReviewedAt?: Timestamp;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 2. Medication Prescriptions

```typescript
interface MedicationPrescription {
  id: string;
  babyId: string;

  // Medication Details
  medicationName: string;
  genericName?: string;
  dose: {
    amount: number;
    unit: 'mg' | 'ml' | 'mcg' | 'units' | 'drops' | 'mg/kg';
  };
  route: 'IV' | 'oral' | 'IM' | 'topical' | 'inhalation' | 'NG tube';
  frequency: string;                // e.g., "TDS", "QDS", "PRN"
  timings: string[];                // e.g., ["08:00", "14:00", "20:00"]

  // Schedule
  startDate: Timestamp;
  endDate?: Timestamp;
  duration?: number;                // days

  // Clinical Info
  indication: string;
  specialInstructions?: string;

  // Medication in Feeds
  canBeGivenInFeed: boolean;
  mustBeGivenSeparately: boolean;

  // Approval Flow
  status: 'draft' | 'pending_approval' | 'approved' | 'discontinued';
  recommendedBy?: string;           // Nurse user ID
  recommendedAt?: Timestamp;
  prescribedBy: string;             // Doctor/Consultant user ID
  prescribedAt: Timestamp;
  approvedBy?: string;              // Consultant user ID
  approvedAt?: Timestamp;
  discontinuedBy?: string;
  discontinuedAt?: Timestamp;
  discontinuationReason?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 3. Medication Administration Records (Updated)

```typescript
interface MedicationAdministration {
  id: string;
  babyId: string;
  prescriptionId: string;

  // Medication Details (copied from prescription)
  medicationName: string;
  dose: {
    amount: number;
    unit: string;
  };
  route: string;

  // Timing
  scheduledTime: Timestamp;
  administeredTime?: Timestamp;

  // Administration Method
  administrationMethod: 'separately' | 'in_feed';
  feedRecordId?: string;            // Link to feed if given in feed

  // Status
  status: 'pending' | 'given' | 'missed' | 'refused' | 'held';
  administeredBy?: string;          // Nurse user ID

  // Clinical Info
  reasonNotGiven?: string;
  adverseReaction?: {
    occurred: boolean;
    description?: string;
    severity?: 'mild' | 'moderate' | 'severe';
    actionTaken?: string;
  };

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 4. Feeding Records (Updated)

```typescript
interface FeedingRecord {
  id: string;
  babyId: string;

  // Timestamp
  feedTime: Timestamp;
  recordedBy: string;
  secondNurseSignOff?: {
    userId: string;
    timestamp: Timestamp;
    reason: 'volume_change' | 'fortification_change';
  };

  // Feed Details
  feedType: 'EBM' | 'formula' | 'fortified_EBM' | 'fortified_formula' | 'TPN' | 'mixed';

  volume: {
    prescribed: number;              // ml
    actual: number;                  // ml actually given
    changeFromPrevious?: number;     // ml difference
  };

  route: 'oral_bottle' | 'oral_breast' | 'NG_tube' | 'OG_tube' | 'IV' | 'mixed';

  breastfeeding?: {
    duration: number;                // minutes
    breast: 'left' | 'right' | 'both';
  };

  // Medications Given in Feed
  medicationsIncluded: {
    medicationAdministrationId: string;
    medicationName: string;
    confirmed: boolean;
  }[];

  // Tolerance
  tolerance: 'good' | 'moderate' | 'poor';
  residual?: number;                 // ml (for tube feeding)
  aspirates?: {
    present: boolean;
    amount?: number;                 // ml
    description?: string;
  };
  vomiting?: {
    occurred: boolean;
    amount?: string;
    timing?: string;
  };

  // Fortification
  fortifier?: {
    type: string;
    amount: number;                  // scoops or ml
  };

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 5. Clinical Reviews

```typescript
interface ClinicalReview {
  id: string;
  babyId: string;

  // Review Type
  reviewType: 'daily_ward_round' | 'weekly_review' | 'discharge_assessment' | 'acute_review';
  reviewDate: Timestamp;
  reviewedBy: string;               // Doctor/Consultant user ID
  reviewedByRole: 'consultant' | 'registrar' | 'junior_doctor';

  // Assessment
  clinicalSummary: string;
  systemsReview: {
    system: 'respiratory' | 'cardiovascular' | 'gastrointestinal' | 'neurological' | 'renal' | 'haematology';
    assessment: string;
    plan?: string;
  }[];

  // Problems
  problemList: {
    problem: string;
    status: 'active' | 'resolving' | 'resolved';
    plan: string;
  }[];

  // Overnight Events (for morning rounds)
  overnightEvents?: string[];

  // Investigations Reviewed
  investigationsReviewed?: {
    investigation: string;
    date: Timestamp;
    result: string;
    interpretation: string;
  }[];

  // Treatment Plan Updates
  treatmentPlanUpdates?: string[];

  // Discharge Planning
  dischargePlanning?: {
    targetDischargeDate?: Timestamp;
    criteria: {
      criterion: string;
      met: boolean;
    }[];
    actions: string[];
  };

  // Handover Notes
  handoverNotes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 6. Ward Operations

```typescript
interface WardBedStatus {
  id: string;
  unitId: string;

  // Bed Info
  roomNumber: string;
  bedNumber: string;
  bedType: 'intensive_care' | 'high_dependency' | 'special_care';

  // Occupancy
  isOccupied: boolean;
  babyId?: string;

  // Baby Acuity
  acuityLevel?: 1 | 2 | 3 | 4 | 5;  // 1=most dependent, 5=nearly ready for discharge

  // Staff Assignment
  assignedNurseId?: string;
  nurseRatio?: string;               // e.g., "1:1", "1:2"

  // Equipment
  equipmentInUse?: string[];

  // Metadata
  updatedAt: Timestamp;
}

interface StaffAssignment {
  id: string;
  unitId: string;
  shiftDate: Timestamp;

  // Shift Info
  shift: 'day' | 'night' | 'long_day';
  shiftStart: string;                // e.g., "07:30"
  shiftEnd: string;                  // e.g., "19:30"

  // Staff
  staffId: string;
  staffRole: string;

  // Assignments
  assignedBabies: {
    babyId: string;
    roomNumber: string;
    bedNumber: string;
    isPrimary: boolean;
  }[];

  // Status
  status: 'scheduled' | 'confirmed' | 'completed';

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface IncidentLog {
  id: string;

  // Incident Details
  incidentType: 'medication_error' | 'equipment_failure' | 'clinical_deterioration' |
                'communication_issue' | 'documentation_error' | 'other';
  severity: 'low' | 'moderate' | 'high' | 'critical';

  // Context
  babyId?: string;
  unitId: string;
  location: string;

  // Description
  incidentDescription: string;
  immediateActionTaken: string;

  // People Involved
  reportedBy: string;
  involvedStaff?: string[];

  // Investigation
  investigationRequired: boolean;
  investigationStatus?: 'pending' | 'in_progress' | 'completed';
  investigationFindings?: string;
  preventativeActions?: string[];

  // Status
  status: 'reported' | 'reviewed' | 'closed';

  // Timestamps
  incidentDateTime: Timestamp;
  reportedAt: Timestamp;
  closedAt?: Timestamp;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 7. Physiotherapy Assessments

```typescript
interface PhysiotherapyAssessment {
  id: string;
  babyId: string;

  // Assessment Type
  assessmentType: 'respiratory' | 'developmental' | 'positioning' | 'discharge';
  assessmentDate: Timestamp;
  assessedBy: string;               // Physio user ID

  // Respiratory Assessment
  respiratoryAssessment?: {
    respiratorySupport: {
      type: 'none' | 'room_air' | 'nasal_cannula' | 'CPAP' | 'BiPAP' | 'ventilator';
      settings?: {
        fiO2?: number;               // %
        flow?: number;               // L/min
        peep?: number;               // cmH2O
        pip?: number;                // cmH2O
        rate?: number;               // breaths/min
      };
    };
    chestAssessment: {
      airEntry: 'equal_bilateral' | 'reduced_left' | 'reduced_right' | 'poor_bilateral';
      chestMovement: 'symmetrical' | 'asymmetrical';
      secretions: 'none' | 'minimal' | 'moderate' | 'copious';
      workOfBreathing: 'none' | 'mild' | 'moderate' | 'severe';
    };
    findings: string;
  };

  // Positioning Assessment
  positioningAssessment?: {
    currentPositioning: string;
    recommendations: string[];
    equipmentNeeded?: string[];
  };

  // Developmental Assessment
  developmentalAssessment?: {
    correctedAge: {
      weeks: number;
      days: number;
    };
    motorSkills: string;
    tone: 'normal' | 'increased' | 'decreased';
    reflexes: string;
    concerns?: string[];
  };

  // Treatment Plan
  treatmentPlan: {
    treatments: {
      treatment: string;
      frequency: string;
      duration?: number;             // minutes
      instructions: string;
    }[];
    goals: string[];
    reviewDate: Timestamp;
  };

  // Weaning Targets (for respiratory)
  weaningTargets?: {
    targetSupport: string;
    targetFiO2?: number;
    targetTimeline: string;
    requiresConsultantApproval: boolean;
    approvedBy?: string;
    approvedAt?: Timestamp;
  };

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface PhysiotherapyIntervention {
  id: string;
  babyId: string;
  assessmentId?: string;

  // Intervention Details
  interventionType: 'chest_physiotherapy' | 'positioning' | 'developmental_play' |
                    'suctioning' | 'passive_movements' | 'other';
  interventionDate: Timestamp;
  startTime: string;
  duration: number;                  // minutes
  performedBy: string;               // Physio user ID

  // Method
  method: string;
  technique?: string;

  // Response
  babyResponse: 'tolerated_well' | 'some_distress' | 'poorly_tolerated';
  clinicalOutcome: string;

  // Observations
  preTreatmentObservations?: {
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };
  postTreatmentObservations?: {
    heartRate?: number;
    respiratoryRate?: number;
    oxygenSaturation?: number;
  };

  // Notes
  notes?: string;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Application Architecture

### 1. Web Portal (React + Vite + TypeScript)

```
nicu-web-portal/
├── src/
│   ├── config/
│   │   └── firebase.ts
│   ├── types/
│   │   ├── baby.ts
│   │   ├── medication.ts
│   │   ├── feeding.ts
│   │   ├── carePlan.ts
│   │   ├── clinicalReview.ts
│   │   ├── physiotherapy.ts
│   │   └── user.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBaby.ts
│   │   ├── useMedications.ts
│   │   ├── useFeeding.ts
│   │   ├── useCarePlan.ts
│   │   └── useFirestore.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── nurse/
│   │   │   ├── MedicationSchedule.tsx
│   │   │   ├── MedicationAdministration.tsx
│   │   │   ├── FeedingEntry.tsx
│   │   │   ├── VitalSignsEntry.tsx
│   │   │   ├── CarePlanView.tsx
│   │   │   └── HandoverNotes.tsx
│   │   ├── consultant/
│   │   │   ├── ClinicalReview.tsx
│   │   │   ├── CarePlanManagement.tsx
│   │   │   ├── PrescriptionManagement.tsx
│   │   │   ├── VitalSignsTrends.tsx
│   │   │   └── DischargePlanning.tsx
│   │   ├── junior-doctor/
│   │   │   ├── WardRound.tsx
│   │   │   ├── DailyAssessment.tsx
│   │   │   └── PrescriptionRecommendation.tsx
│   │   ├── ward-manager/
│   │   │   ├── BedManagement.tsx
│   │   │   ├── StaffAssignment.tsx
│   │   │   ├── AuditReports.tsx
│   │   │   └── IncidentManagement.tsx
│   │   └── physiotherapist/
│   │       ├── RespiratoryAssessment.tsx
│   │       ├── DevelopmentalAssessment.tsx
│   │       ├── TreatmentLog.tsx
│   │       └── WeaningPlan.tsx
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Dashboard.tsx
│   │   ├── BabyProfile.tsx
│   │   ├── Medications.tsx
│   │   ├── Feeding.tsx
│   │   ├── ClinicalData.tsx
│   │   └── Reports.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   ├── babyService.ts
│   │   ├── medicationService.ts
│   │   ├── feedingService.ts
│   │   ├── carePlanService.ts
│   │   ├── clinicalReviewService.ts
│   │   └── auditService.ts
│   ├── utils/
│   │   ├── dateHelpers.ts
│   │   ├── correctedAge.ts
│   │   ├── validators.ts
│   │   └── formatters.ts
│   ├── App.tsx
│   └── main.tsx
├── public/
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### 2. Parent Mobile App (React Native + TypeScript)

```
nicu-parent-app/
├── src/
│   ├── config/
│   │   └── firebase.ts
│   ├── types/
│   │   └── [same as web]
│   ├── hooks/
│   │   └── [same as web]
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── VitalSignsScreen.tsx
│   │   ├── FeedingScreen.tsx
│   │   ├── MedicationsScreen.tsx
│   │   ├── CarePlanScreen.tsx
│   │   ├── PhotosScreen.tsx
│   │   ├── MessagingScreen.tsx
│   │   └── ResourcesScreen.tsx
│   ├── components/
│   │   ├── VitalSignsCard.tsx
│   │   ├── FeedingCard.tsx
│   │   ├── MedicationStatus.tsx
│   │   ├── ProgressNotes.tsx
│   │   └── PhotoGallery.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── services/
│   │   └── [same as web]
│   ├── utils/
│   │   └── [same as web]
│   └── App.tsx
├── android/
├── ios/
├── package.json
└── tsconfig.json
```

---

## Implementation Roadmap

### Phase 1A: Foundation (Week 1-2)

#### Sprint 1.1: Firebase Setup & Authentication
**Duration:** 3 days

**Tasks:**
1. ✅ Firebase project already created (`nicu-app-9e772`)
2. Initialize Firestore with production security rules
3. Set up Firebase Authentication
4. Create demo user accounts for all personas
5. Implement authentication service
6. Build login screens (web + mobile)

**Deliverables:**
- Working login for all user types
- Protected routes based on user role
- Session persistence

#### Sprint 1.2: Baby Profiles & Demo Data
**Duration:** 4 days

**Tasks:**
1. Create Firestore collections structure
2. Seed demo data for Daisy and Elsa
3. Build baby profile views (web + mobile)
4. Implement baby selection/switching
5. Display basic baby information

**Deliverables:**
- Daisy and Elsa profiles visible to staff
- Parents can view their respective baby
- Room/bed information displayed

### Phase 1B: Medications Module (Week 3-4)

#### Sprint 1.3: Medication Prescriptions
**Duration:** 3 days

**Tasks:**
1. Build prescription management interface (Consultant)
2. Implement prescription approval workflow
3. Create medication schedule generator
4. Build nurse recommendation interface
5. Test prescription creation and approval

**Deliverables:**
- Consultants can create/approve prescriptions
- Nurses can recommend prescriptions
- Junior doctors can view prescriptions

#### Sprint 1.4: Medication Administration
**Duration:** 4 days

**Tasks:**
1. Build daily medication schedule view (Nurse)
2. Implement medication administration flow
   - Given separately
   - Given in feed (integrated with feeding)
3. Build adverse reaction documentation
4. Create medication history view
5. Implement audit trail

**Deliverables:**
- Nurses can mark medications as given
- Clear audit trail showing "given separately" vs "in feed #X"
- Parents see medication completion status

#### Sprint 1.5: Medication-Feed Integration
**Duration:** 3 days

**Tasks:**
1. Modify feeding entry to show pending medications
2. Implement checkbox system for medications in feeds
3. Auto-link medications to feed records
4. Build combined medication-feed history view
5. Test complete workflow

**Deliverables:**
- When recording feed, nurse sees pending meds
- Can check "yes/no" for each medication
- Medications auto-marked as administered
- Feed record shows which meds were included

### Phase 1C: Feeding Module (Week 5)

#### Sprint 1.6: Feed Recording
**Duration:** 4 days

**Tasks:**
1. Build feed entry form (Nurse)
2. Implement tolerance documentation
3. Add second nurse sign-off for volume changes
4. Create feeding schedule view from care plan
5. Build feeding history with medication linkage

**Deliverables:**
- Nurses can record feeds with all details
- Volume changes require second nurse sign-off
- Feed records show which medications were included
- Feeding schedule visible from care plan

### Phase 1D: Care Plans & Clinical Reviews (Week 6)

#### Sprint 1.7: Care Plans
**Duration:** 3 days

**Tasks:**
1. Build care plan creation interface (Consultant)
2. Implement care plan viewing (Nurse, Junior Doctor)
3. Create feeding schedule display
4. Build medication schedule display
5. Implement care activity checklist

**Deliverables:**
- Consultants can create/update care plans
- Nurses see feeding schedule and medication schedule
- Care activities can be marked as completed
- Escalation parameters visible

#### Sprint 1.8: Clinical Reviews
**Duration:** 4 days

**Tasks:**
1. Build clinical review interface (Consultant, Junior Doctor)
2. Implement review type selection
3. Create vital signs trend charts
4. Build medication history view with feed linkage
5. Implement retrospective documentation (date selector)

**Deliverables:**
- Consultants can document ward rounds
- Junior doctors can document daily assessments
- Vital signs displayed with trend charts
- Medication history shows administration method

### Phase 1E: Ward Management & Physiotherapy (Week 7)

#### Sprint 1.9: Ward Manager Functions
**Duration:** 3 days

**Tasks:**
1. Build bed occupancy dashboard
2. Implement staff assignment view
3. Create audit reports
4. Build incident logging interface

**Deliverables:**
- Ward managers see bed status with acuity
- Staff assignments visible
- Basic audit reports (medication completion, documentation)

#### Sprint 1.10: Physiotherapy Module
**Duration:** 4 days

**Tasks:**
1. Build respiratory assessment form
2. Create treatment logging interface
3. Implement care plan integration
4. Build weaning target approval workflow

**Deliverables:**
- Physios can document assessments
- Treatment interventions logged
- Respiratory care plan visible to nurses
- Consultant approval for weaning targets

### Phase 1F: Parent App (Week 8)

#### Sprint 1.11: Parent Dashboard
**Duration:** 4 days

**Tasks:**
1. Build parent dashboard (React Native)
2. Display current vital signs
3. Show today's feeds
4. Display medication status ("All given" or "X pending")
5. Show care plan in plain language
6. Display progress notes

**Deliverables:**
- Parents see real-time baby status
- Clear, plain language summaries
- No clinical jargon
- Updates appear instantly when staff enter data

#### Sprint 1.12: Parent Engagement Features
**Duration:** 3 days

**Tasks:**
1. Implement visit time logging
2. Create callback request feature
3. Build discharge checklist view
4. Add educational content viewing

**Deliverables:**
- Parents can log visit times
- Can request callback from nurse/consultant
- See discharge preparation progress

### Phase 1G: Testing & Polish (Week 9)

#### Sprint 1.13: End-to-End Testing
**Duration:** 4 days

**Tasks:**
1. Test complete medication workflow
2. Test complete feeding workflow
3. Test care plan workflow
4. Test clinical review workflow
5. Test parent app real-time updates
6. Fix bugs and edge cases

**Deliverables:**
- All workflows tested with Daisy and Elsa
- No critical bugs
- Smooth user experience

#### Sprint 1.14: Demo Preparation
**Duration:** 3 days

**Tasks:**
1. Create demo script
2. Seed realistic demo data
3. Prepare demo accounts
4. Create demo video/screenshots
5. Write demo documentation

**Deliverables:**
- Ready-to-demo application
- Demo script for stakeholders
- Screenshots and documentation

---

## Technical Implementation Details

### Authentication & Authorization

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: "nicu-app-9e772.firebaseapp.com",
  projectId: "nicu-app-9e772",
  storageBucket: "nicu-app-9e772.appspot.com",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Role-Based Access Control

```typescript
// src/types/user.ts
export type UserRole =
  | 'bedside_nurse'
  | 'consultant'
  | 'junior_doctor'
  | 'ward_manager'
  | 'physiotherapist'
  | 'parent';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions: Permission[];
  unitId?: string;
  trustId?: string;
  babyIds?: string[];  // For parents
}

export type Permission =
  | 'view_babies'
  | 'create_baby'
  | 'view_vitals'
  | 'create_vitals'
  | 'view_medications'
  | 'administer_medications'
  | 'prescribe_medications'
  | 'approve_prescriptions'
  | 'view_feeds'
  | 'record_feeds'
  | 'view_care_plans'
  | 'create_care_plans'
  | 'view_clinical_reviews'
  | 'create_clinical_reviews'
  | 'manage_ward'
  | 'view_audit_logs';

// Permission mapping
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  bedside_nurse: [
    'view_babies',
    'view_vitals',
    'create_vitals',
    'view_medications',
    'administer_medications',
    'view_feeds',
    'record_feeds',
    'view_care_plans',
  ],
  consultant: [
    'view_babies',
    'create_baby',
    'view_vitals',
    'create_vitals',
    'view_medications',
    'prescribe_medications',
    'approve_prescriptions',
    'view_feeds',
    'view_care_plans',
    'create_care_plans',
    'view_clinical_reviews',
    'create_clinical_reviews',
  ],
  junior_doctor: [
    'view_babies',
    'view_vitals',
    'view_medications',
    'view_feeds',
    'view_care_plans',
    'view_clinical_reviews',
    'create_clinical_reviews',
  ],
  ward_manager: [
    'view_babies',
    'view_vitals',
    'view_medications',
    'view_feeds',
    'manage_ward',
    'view_audit_logs',
  ],
  physiotherapist: [
    'view_babies',
    'view_vitals',
    'view_care_plans',
  ],
  parent: [
    'view_babies',  // Only their own
    'view_vitals',
    'view_medications',
    'view_feeds',
    'view_care_plans',
  ],
};
```

### Demo Data Seeding

```typescript
// scripts/seedDemoData.ts
import { db } from '../src/config/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

async function seedDemoData() {
  // Create Daisy
  const daisyRef = await addDoc(collection(db, 'babies'), {
    hospitalNumber: 'NH001234',
    firstName: 'Daisy',
    lastName: 'Smith',
    dateOfBirth: Timestamp.fromDate(new Date('2025-11-15')),
    gestationalAgeAtBirth: { weeks: 32, days: 4 },
    birthWeight: 1850,
    sex: 'female',
    unitId: 'demo-unit-1',
    trustId: 'demo-trust-1',
    bedNumber: 'Room 1',
    admissionDate: Timestamp.fromDate(new Date('2025-11-15')),
    diagnoses: ['Prematurity', 'Respiratory distress syndrome'],
    parentUserIds: ['rachel-parent-id'],
    primaryNurseId: 'sarah-nurse-id',
    consultantId: 'emma-consultant-id',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'system',
  });

  // Create Elsa
  const elsaRef = await addDoc(collection(db, 'babies'), {
    hospitalNumber: 'NH001235',
    firstName: 'Elsa',
    lastName: 'Brown',
    dateOfBirth: Timestamp.fromDate(new Date('2025-11-08')),
    gestationalAgeAtBirth: { weeks: 28, days: 2 },
    birthWeight: 1120,
    sex: 'female',
    unitId: 'demo-unit-1',
    trustId: 'demo-trust-1',
    bedNumber: 'Room 2',
    admissionDate: Timestamp.fromDate(new Date('2025-11-08')),
    diagnoses: ['Extreme prematurity', 'Bronchopulmonary dysplasia', 'Patent ductus arteriosus'],
    parentUserIds: ['sophie-parent-id'],
    primaryNurseId: 'sarah-nurse-id',
    consultantId: 'emma-consultant-id',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    createdBy: 'system',
  });

  // Create Care Plans for Daisy
  await addDoc(collection(db, 'carePlans'), {
    babyId: daisyRef.id,
    type: 'feeding',
    title: 'Feeding Plan',
    description: 'Progressive feeding plan for premature infant',
    instructions: [
      'Feed every 3 hours',
      'Monitor tolerance',
      'Fortify with 2 scoops per 100ml',
    ],
    feedingSchedule: {
      frequency: 3,
      volumePerFeed: 35,
      feedType: 'fortified_EBM',
      route: 'NG_tube',
      fortification: {
        type: 'Nutriprem Breast Milk Fortifier',
        amount: 2,
      },
    },
    status: 'active',
    effectiveFrom: Timestamp.now(),
    createdBy: 'emma-consultant-id',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Create Medication Prescriptions for Daisy
  const daisyCaffeinePrescription = await addDoc(collection(db, 'medicationPrescriptions'), {
    babyId: daisyRef.id,
    medicationName: 'Caffeine Citrate',
    dose: { amount: 5, unit: 'mg/kg' },
    route: 'oral',
    frequency: 'OD',
    timings: ['08:00'],
    startDate: Timestamp.fromDate(new Date('2025-11-15')),
    indication: 'Apnoea of prematurity',
    canBeGivenInFeed: true,
    mustBeGivenSeparately: false,
    status: 'approved',
    prescribedBy: 'emma-consultant-id',
    prescribedAt: Timestamp.fromDate(new Date('2025-11-15')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  const daisyVitaminDPrescription = await addDoc(collection(db, 'medicationPrescriptions'), {
    babyId: daisyRef.id,
    medicationName: 'Vitamin D',
    dose: { amount: 400, unit: 'units' },
    route: 'oral',
    frequency: 'OD',
    timings: ['08:00'],
    startDate: Timestamp.fromDate(new Date('2025-11-15')),
    indication: 'Prematurity supplementation',
    canBeGivenInFeed: true,
    mustBeGivenSeparately: false,
    status: 'approved',
    prescribedBy: 'emma-consultant-id',
    prescribedAt: Timestamp.fromDate(new Date('2025-11-15')),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // Create today's medication administrations for Daisy
  const today8am = new Date();
  today8am.setHours(8, 0, 0, 0);

  await addDoc(collection(db, 'medicationAdministrations'), {
    babyId: daisyRef.id,
    prescriptionId: daisyCaffeinePrescription.id,
    medicationName: 'Caffeine Citrate',
    dose: { amount: 5, unit: 'mg/kg' },
    route: 'oral',
    scheduledTime: Timestamp.fromDate(today8am),
    administrationMethod: 'in_feed',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  await addDoc(collection(db, 'medicationAdministrations'), {
    babyId: daisyRef.id,
    prescriptionId: daisyVitaminDPrescription.id,
    medicationName: 'Vitamin D',
    dose: { amount: 400, unit: 'units' },
    route: 'oral',
    scheduledTime: Timestamp.fromDate(today8am),
    administrationMethod: 'in_feed',
    status: 'pending',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  });

  // ... Similar for Elsa with more complex medications

  console.log('Demo data seeded successfully!');
}

seedDemoData();
```

---

## Key User Workflows

### Workflow 1: Nurse Administers Medication in Feed

1. Nurse navigates to "Record Feed" for Daisy at 08:00
2. Enters feed details:
   - Volume: 35ml
   - Type: Fortified EBM
   - Route: NG tube
3. System displays pending medications:
   - ☐ Caffeine Citrate 5mg/kg
   - ☐ Vitamin D 400 units
4. Nurse checks both boxes
5. Nurse completes tolerance assessment
6. Clicks "Save Feed"
7. System:
   - Creates feed record with medications linked
   - Marks both medications as "given" with administrationMethod: "in_feed"
   - Sets feedRecordId on medication administrations
   - Updates parent app in real-time

### Workflow 2: Consultant Reviews Vital Signs Trends

1. Consultant logs in
2. Selects "Clinical Review"
3. Selects review type: "Daily Ward Round"
4. Selects date: Today
5. Views vital signs with trend charts:
   - Weight over last 7 days
   - Temperature trends
   - Oxygen saturation
6. Reviews medication history:
   - 08:00 - Caffeine Citrate - Given in feed #123
   - 08:00 - Vitamin D - Given in feed #123
7. Documents clinical review
8. Updates treatment plan if needed

### Workflow 3: Junior Doctor Documents Ward Round

1. Junior doctor selects ward round type: "Consultant-led"
2. Selects date selector for retrospective entry
3. Reviews overnight events
4. Documents assessment per baby
5. Updates problem list
6. Writes handover notes for night team
7. Can recommend prescriptions for consultant approval

### Workflow 4: Ward Manager Reviews Operations

1. Ward manager views bed occupancy dashboard
2. Sees acuity levels for each baby
3. Reviews staff assignments
4. Runs audit report:
   - Medication completion rate: 98%
   - Documentation completion: 95%
   - Feed volume sign-offs: 100%
5. Reviews incident logs

### Workflow 5: Physiotherapist Documents Treatment

1. Physio selects baby
2. Creates respiratory assessment
3. Documents current ventilator settings
4. Records chest assessment findings
5. Logs treatment intervention:
   - Type: Chest physiotherapy
   - Duration: 15 minutes
   - Baby response: Tolerated well
6. Updates respiratory care plan
7. Sets weaning targets (requires consultant approval)

### Workflow 6: Parent Views Baby Status

1. Parent opens mobile app
2. Dashboard shows:
   - Current vital signs: "Last recorded 30 minutes ago"
     - Weight: 1875g
     - Temperature: 36.8°C
     - Heart rate: 145 bpm
     - Oxygen saturation: 97%
   - Today's feeds: "5 feeds completed, next due in 1 hour"
   - Medications: "All medications given today ✓"
   - Care plan: "Your baby is on a 3-hourly feeding schedule..."
   - Progress note: "Daisy is doing well today. She has been more alert and is showing good feeding tolerance."
3. Parent can:
   - Log visit time
   - Request callback from nurse
   - View discharge checklist progress

---

## Success Metrics

### Technical Metrics
- ✅ All 6 user personas can log in
- ✅ Real-time updates < 2 seconds
- ✅ No critical security vulnerabilities
- ✅ 100% audit trail for medication administration
- ✅ Mobile app works offline

### Functional Metrics
- ✅ Medications can be administered separately OR in feeds
- ✅ Feed volume changes require second nurse sign-off
- ✅ Parents see medication status in plain language
- ✅ Clinical reviews show vital signs trends
- ✅ Consultant approval workflow for prescriptions works
- ✅ Ward manager can view audit reports
- ✅ Physiotherapy assessments integrate with care plans

### User Experience Metrics
- ✅ Nurse can record feed + medications in < 2 minutes
- ✅ Consultant can review baby's status in < 3 minutes
- ✅ Parent app is intuitive (no training required)
- ✅ All workflows feel natural and efficient

---

## Next Steps After Demo

1. **Stakeholder Feedback**
   - Demo to NICU nurses
   - Demo to consultants
   - Demo to parents with NICU experience
   - Gather feedback and iterate

2. **Enhanced Features**
   - Growth charts with percentiles
   - Predictive care pathways
   - Advanced analytics
   - NHS Spine integration

3. **Regulatory Compliance**
   - Clinical safety case (DCB0129/0160)
   - MHRA medical device registration
   - DSPT compliance
   - DTAC assessment

4. **Pilot Deployment**
   - Identify NHS trust partner
   - Ethics approval
   - User training
   - Phased rollout

---

## Development Environment Setup

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI
- Git
- VS Code (recommended)

### Setup Steps

```bash
# 1. Clone repository
git clone https://github.com/penguingoober14/nicu-care-platform.git
cd nicu-care-platform

# 2. Install Firebase CLI
npm install -g firebase-tools

# 3. Login to Firebase
firebase login

# 4. Select Firebase project
firebase use nicu-app-9e772

# 5. Set up web portal
cd web-portal
npm install
cp .env.example .env
# Add Firebase config to .env

# 6. Set up parent app
cd ../parent-app
npm install
cp .env.example .env
# Add Firebase config to .env

# 7. Deploy security rules
cd ..
firebase deploy --only firestore:rules
firebase deploy --only storage

# 8. Seed demo data
cd web-portal
npm run seed-demo-data

# 9. Run web portal locally
npm run dev

# 10. Run parent app locally
cd ../parent-app
npm run android  # or npm run ios
```

---

**End of Implementation Plan**

This plan provides a complete roadmap for building the MVP Phase 1 demo app with all required features for Bedside Nurses, Consultants, Junior Doctors, Ward Managers, Physiotherapists, and Parents, using Daisy and Elsa as demo patients.
