# NICU Care Platform - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         NICU Care Platform                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Nurse      │  │   Parent     │  │  Therapist   │          │
│  │   Portal     │  │  Mobile App  │  │   Portal     │          │
│  │   (React)    │  │(React Native)│  │   (React)    │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                  │
│                           │                                     │
│                    ┌──────▼────────┐                            │
│                    │   Firebase    │                            │
│                    │               │                            │
│                    │ • Firestore   │                            │
│                    │ • Auth        │                            │
│                    │ • Storage     │                            │
│                    │ • Functions   │                            │
│                    │ • Messaging   │                            │
│                    └───────────────┘                            │
│                                                                  │
│         External Integrations (via Cloud Functions):            │
│         ┌────────────┐  ┌────────────┐  ┌────────────┐         │
│         │  NHS Spine │  │  EPR       │  │  Devices   │         │
│         └────────────┘  └────────────┘  └────────────┘         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Database Schema (Firestore)

### Collection Structure

```
firestore/
├── trusts/                          # NHS Trust configurations
├── units/                           # NICU units
├── babies/                          # Baby profiles
│   ├── {babyId}/
│   │   ├── vitalSigns/             # Subcollection
│   │   ├── growth/                 # Subcollection
│   │   ├── feeding/                # Subcollection
│   │   ├── medications/            # Subcollection
│   │   ├── observations/           # Subcollection
│   │   ├── photos/                 # Subcollection
│   │   └── milestones/             # Subcollection
├── users/                           # Staff, parents, therapists
├── messages/                        # Parent-staff messaging
├── resources/                       # Educational content
└── auditLog/                        # Compliance audit trail
```

### Data Models

#### 1. Baby Profile

```typescript
interface Baby {
  id: string;
  
  // Identity
  hospitalNumber: string;           // NHS number or temp identifier
  firstName?: string;                // Optional until named
  lastName?: string;
  dateOfBirth: Timestamp;
  
  // Clinical Information
  gestationalAgeAtBirth: {
    weeks: number;                   // e.g., 30
    days: number;                    // e.g., 5
  };
  birthWeight: number;               // grams
  birthLength?: number;              // cm
  birthHeadCircumference?: number;   // cm
  sex: 'male' | 'female' | 'unknown';
  
  // Admission Details
  unitId: string;                    // Reference to units collection
  trustId: string;                   // Reference to trusts collection
  bedNumber?: string;
  admissionDate: Timestamp;
  expectedDischargeDate?: Timestamp;
  dischargeDate?: Timestamp;
  
  // Medical Conditions
  diagnoses: string[];
  complications?: string[];
  
  // Access Control
  parentUserIds: string[];           // Array of parent user IDs
  primaryNurseId?: string;
  consultantId?: string;
  
  // Status
  isActive: boolean;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  createdBy: string;
}
```

#### 2. Vital Signs

```typescript
interface VitalSign {
  id: string;
  babyId: string;
  
  // Timestamp
  recordedAt: Timestamp;
  recordedBy: string;                // User ID of nurse
  
  // Vital Parameters
  weight?: {
    value: number;                   // grams
    method: 'scale' | 'estimated';
  };
  
  temperature?: {
    value: number;                   // °C
    site: 'axillary' | 'skin' | 'rectal';
  };
  
  heartRate?: {
    value: number;                   // bpm
    rhythm: 'regular' | 'irregular';
  };
  
  respiratoryRate?: {
    value: number;                   // breaths per minute
  };
  
  oxygenSaturation?: {
    value: number;                   // percentage
    oxygenSupport?: {
      type: 'room air' | 'nasal cannula' | 'CPAP' | 'ventilator';
      fiO2?: number;                 // percentage
      flow?: number;                 // L/min
    };
  };
  
  bloodPressure?: {
    systolic: number;                // mmHg
    diastolic: number;               // mmHg
    mean?: number;                   // MAP
    method: 'cuff' | 'arterial line';
  };
  
  painScore?: {
    value: number;                   // 0-10
    scale: 'NIPS' | 'CRIES' | 'N-PASS';
  };
  
  // Notes
  notes?: string;
  alerts?: string[];                 // Auto-generated alerts
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 3. Growth Measurements

```typescript
interface GrowthMeasurement {
  id: string;
  babyId: string;
  
  // Timestamp
  measuredAt: Timestamp;
  measuredBy: string;
  
  // Measurements
  weight?: {
    value: number;                   // grams
    percentile?: number;             // Calculated
    zScore?: number;
  };
  
  length?: {
    value: number;                   // cm
    percentile?: number;
    zScore?: number;
  };
  
  headCircumference?: {
    value: number;                   // cm
    percentile?: number;
    zScore?: number;
  };
  
  abdominalCircumference?: {
    value: number;                   // cm
  };
  
  // Calculated Fields
  correctedAge?: {
    weeks: number;
    days: number;
  };
  
  // Growth Charts Used
  chartType: 'Fenton' | 'UK-WHO' | 'Intergrowth-21st';
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 4. Feeding Record

```typescript
interface FeedingRecord {
  id: string;
  babyId: string;
  
  // Timestamp
  feedTime: Timestamp;
  recordedBy: string;
  
  // Feed Details
  feedType: 'breast milk' | 'formula' | 'fortified breast milk' | 'TPN' | 'mixed';
  
  volume?: {
    prescribed: number;              // ml
    actual: number;                  // ml actually given
  };
  
  route: 'oral' | 'NG tube' | 'OG tube' | 'IV';
  
  breastfeeding?: {
    duration: number;                // minutes
    breast: 'left' | 'right' | 'both';
  };
  
  tolerance: 'good' | 'moderate' | 'poor';
  residual?: number;                 // ml (for tube feeding)
  vomiting?: boolean;
  
  // Fortification
  fortifier?: {
    type: string;
    amount: number;                  // scoops or ml
  };
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 5. Medication Administration

```typescript
interface MedicationRecord {
  id: string;
  babyId: string;
  
  // Medication Details
  medicationName: string;
  dose: {
    amount: number;
    unit: 'mg' | 'ml' | 'mcg' | 'units' | 'drops';
  };
  route: 'IV' | 'oral' | 'IM' | 'topical' | 'inhalation';
  
  // Timing
  prescribedTime: Timestamp;
  administeredTime?: Timestamp;
  administeredBy?: string;
  
  // Status
  status: 'scheduled' | 'given' | 'missed' | 'refused' | 'held';
  reasonNotGiven?: string;
  
  // Prescription Reference
  prescriptionId: string;
  prescribedBy: string;              // Consultant/doctor user ID
  
  // Notes
  notes?: string;
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 6. Clinical Observation

```typescript
interface ClinicalObservation {
  id: string;
  babyId: string;
  
  // Timestamp
  observedAt: Timestamp;
  observedBy: string;
  
  // Observation Type
  type: 'general' | 'respiratory' | 'cardiovascular' | 'neurological' | 
        'skin' | 'feeding' | 'elimination' | 'behavioral';
  
  // Assessment
  findings: string;
  concerns?: string[];
  actionsTaken?: string;
  
  // Severity
  severity?: 'normal' | 'minor' | 'moderate' | 'severe';
  
  // Follow-up
  requiresFollowUp: boolean;
  followUpBy?: string;
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 7. Photo/Memory

```typescript
interface Photo {
  id: string;
  babyId: string;
  
  // Image Details
  imageUrl: string;                  // Firebase Storage URL
  thumbnailUrl?: string;
  caption?: string;
  
  // Timing
  takenAt: Timestamp;
  uploadedBy: string;
  
  // Visibility
  visibleToParents: boolean;
  
  // Metadata
  fileSize: number;
  mimeType: string;
  createdAt: Timestamp;
}
```

#### 8. Developmental Milestone

```typescript
interface Milestone {
  id: string;
  babyId: string;
  
  // Milestone Details
  category: 'motor' | 'cognitive' | 'social' | 'language' | 'feeding';
  milestone: string;
  description?: string;
  
  // Timing
  achievedAt: Timestamp;
  correctedAge: {
    weeks: number;
    days: number;
  };
  
  // Assessment
  assessedBy: string;
  notes?: string;
  
  // Expected vs Actual
  expectedAge?: {
    weeks: number;
    days: number;
  };
  
  // Metadata
  createdAt: Timestamp;
}
```

#### 9. User (Staff/Parent/Therapist)

```typescript
interface User {
  id: string;
  
  // Identity
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  
  // Role
  role: 'nurse' | 'doctor' | 'parent' | 'physio' | 'ot' | 
        'speech_therapist' | 'admin';
  
  // Organisation
  trustId?: string;
  unitId?: string;
  profession?: string;
  registrationNumber?: string;       // NMC/GMC number
  
  // For Parents
  relationshipToBaby?: 'mother' | 'father' | 'guardian';
  babyIds?: string[];                // Babies they have access to
  
  // Permissions
  permissions: string[];
  
  // Preferences
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  
  // Status
  isActive: boolean;
  lastLoginAt?: Timestamp;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 10. Message (Parent-Staff Communication)

```typescript
interface Message {
  id: string;
  
  // Participants
  babyId: string;
  senderId: string;
  senderRole: string;
  recipientIds: string[];            // Can message multiple staff
  
  // Content
  subject?: string;
  body: string;
  attachments?: {
    url: string;
    name: string;
    type: string;
  }[];
  
  // Thread
  threadId?: string;                 // For grouped conversations
  replyToId?: string;                // For direct replies
  
  // Status
  isRead: boolean;
  readAt?: Timestamp;
  readBy?: string[];
  
  // Metadata
  sentAt: Timestamp;
  createdAt: Timestamp;
}
```

#### 11. Educational Resource

```typescript
interface Resource {
  id: string;
  
  // Content
  title: string;
  description: string;
  content: string;                   // HTML or markdown
  type: 'article' | 'video' | 'pdf' | 'checklist' | 'exercise';
  
  // Categorisation
  category: 'feeding' | 'development' | 'medical' | 'discharge' | 
            'therapy' | 'general';
  tags: string[];
  
  // Targeting
  relevantForGestationalAge?: {
    min: number;                     // weeks
    max: number;
  };
  relevantForConditions?: string[];
  
  // Media
  thumbnailUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  
  // Ownership
  createdBy: string;
  trustId?: string;                  // Trust-specific or global
  
  // Status
  isPublished: boolean;
  version: number;
  
  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

#### 12. Audit Log

```typescript
interface AuditLog {
  id: string;
  
  // What happened
  action: string;                    // e.g., 'create', 'update', 'delete', 'view'
  resource: string;                  // e.g., 'baby', 'vitalSign', 'medication'
  resourceId: string;
  
  // Who did it
  userId: string;
  userRole: string;
  userEmail: string;
  
  // When
  timestamp: Timestamp;
  
  // Context
  babyId?: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Changes (for updates)
  changesBefore?: any;
  changesAfter?: any;
  
  // Metadata
  createdAt: Timestamp;
}
```

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isStaff() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in 
        ['nurse', 'doctor', 'admin', 'physio', 'ot', 'speech_therapist'];
    }
    
    function isNurse() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'nurse';
    }
    
    function isDoctor() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
    }
    
    function isParent() {
      return isAuthenticated() && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'parent';
    }
    
    function canAccessBaby(babyId) {
      let baby = get(/databases/$(database)/documents/babies/$(babyId)).data;
      let user = get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
      
      return isStaff() || 
             (isParent() && request.auth.uid in baby.parentUserIds);
    }
    
    // Babies collection
    match /babies/{babyId} {
      allow read: if canAccessBaby(babyId);
      allow create: if isStaff();
      allow update: if isStaff();
      allow delete: if false; // Never allow deletion, only soft delete
      
      // Vital signs subcollection
      match /vitalSigns/{vitalSignId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isNurse() || isDoctor();
        allow update: if isNurse() || isDoctor();
        allow delete: if false;
      }
      
      // Growth measurements subcollection
      match /growth/{growthId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isNurse() || isDoctor();
        allow update: if isNurse() || isDoctor();
        allow delete: if false;
      }
      
      // Feeding records subcollection
      match /feeding/{feedingId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isNurse();
        allow update: if isNurse();
        allow delete: if false;
      }
      
      // Medications subcollection
      match /medications/{medicationId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isNurse() || isDoctor();
        allow update: if isNurse() || isDoctor();
        allow delete: if false;
      }
      
      // Photos subcollection
      match /photos/{photoId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isStaff();
        allow update: if isStaff();
        allow delete: if isStaff();
      }
      
      // Milestones subcollection
      match /milestones/{milestoneId} {
        allow read: if canAccessBaby(babyId);
        allow create: if isStaff();
        allow update: if isStaff();
        allow delete: if false;
      }
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || isStaff());
      allow create: if isAuthenticated();
      allow update: if request.auth.uid == userId || isStaff();
      allow delete: if false;
    }
    
    // Messages collection
    match /messages/{messageId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == resource.data.senderId || 
                      request.auth.uid in resource.data.recipientIds);
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() && 
                       request.auth.uid in resource.data.recipientIds; // Mark as read
      allow delete: if false;
    }
    
    // Resources collection
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow create: if isStaff();
      allow update: if isStaff();
      allow delete: if isStaff();
    }
    
    // Audit logs - write only
    match /auditLog/{logId} {
      allow read: if isStaff(); // Only staff can read logs
      allow create: if true; // System writes logs
      allow update, delete: if false; // Logs are immutable
    }
  }
}
```

### Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Helper function
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isStaff() {
      return isAuthenticated(); // Add Firestore check if needed
    }
    
    // Photos uploaded by staff
    match /photos/{babyId}/{photoId} {
      allow read: if isAuthenticated();
      allow write: if isStaff() && 
                      request.resource.size < 10 * 1024 * 1024 && // Max 10MB
                      request.resource.contentType.matches('image/.*');
    }
    
    // PDF resources
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow write: if isStaff() && 
                      request.resource.size < 50 * 1024 * 1024 && // Max 50MB
                      request.resource.contentType == 'application/pdf';
    }
    
    // Video resources
    match /videos/{videoId} {
      allow read: if isAuthenticated();
      allow write: if isStaff() && 
                      request.resource.size < 200 * 1024 * 1024; // Max 200MB
    }
  }
}
```

## Cloud Functions (Serverless APIs)

### 1. Corrected Age Calculator

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const calculateCorrectedAge = functions.firestore
  .document('babies/{babyId}/growth/{growthId}')
  .onCreate(async (snap, context) => {
    const growth = snap.data();
    const babyRef = admin.firestore().doc(`babies/${context.params.babyId}`);
    const baby = (await babyRef.get()).data();
    
    if (!baby) return;
    
    // Calculate corrected age
    const birthDate = baby.dateOfBirth.toDate();
    const measurementDate = growth.measuredAt.toDate();
    const gestationalAgeInDays = (baby.gestationalAgeAtBirth.weeks * 7) + 
                                  baby.gestationalAgeAtBirth.days;
    
    // Full term is 40 weeks = 280 days
    const daysFromFullTerm = 280 - gestationalAgeInDays;
    const chronologicalAgeDays = Math.floor((measurementDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    const correctedAgeDays = chronologicalAgeDays - daysFromFullTerm;
    
    const correctedAge = {
      weeks: Math.floor(correctedAgeDays / 7),
      days: correctedAgeDays % 7
    };
    
    // Update the growth document
    await snap.ref.update({ correctedAge });
  });
```

### 2. Vital Signs Alert System

```typescript
export const checkVitalSignsAlerts = functions.firestore
  .document('babies/{babyId}/vitalSigns/{vitalSignId}')
  .onCreate(async (snap, context) => {
    const vitalSign = snap.data();
    const alerts: string[] = [];
    
    // Get baby info for age-appropriate thresholds
    const babyRef = admin.firestore().doc(`babies/${context.params.babyId}`);
    const baby = (await babyRef.get()).data();
    
    if (!baby) return;
    
    // Calculate age in days
    const ageInDays = Math.floor(
      (Date.now() - baby.dateOfBirth.toDate().getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Heart rate alerts
    if (vitalSign.heartRate) {
      if (ageInDays < 7) { // First week
        if (vitalSign.heartRate.value < 100 || vitalSign.heartRate.value > 180) {
          alerts.push('Heart rate outside normal range');
        }
      } else {
        if (vitalSign.heartRate.value < 110 || vitalSign.heartRate.value > 170) {
          alerts.push('Heart rate outside normal range');
        }
      }
    }
    
    // Oxygen saturation alerts
    if (vitalSign.oxygenSaturation && vitalSign.oxygenSaturation.value < 90) {
      alerts.push('Low oxygen saturation');
    }
    
    // Temperature alerts
    if (vitalSign.temperature) {
      if (vitalSign.temperature.value < 36.5 || vitalSign.temperature.value > 37.5) {
        alerts.push('Temperature outside normal range');
      }
    }
    
    // Weight alert - significant drop
    const recentWeights = await admin.firestore()
      .collection(`babies/${context.params.babyId}/vitalSigns`)
      .where('weight', '!=', null)
      .orderBy('recordedAt', 'desc')
      .limit(2)
      .get();
    
    if (recentWeights.size === 2) {
      const [current, previous] = recentWeights.docs;
      const weightDrop = ((previous.data().weight.value - current.data().weight.value) / 
                          previous.data().weight.value) * 100;
      
      if (weightDrop > 10) {
        alerts.push('Significant weight loss (>10%)');
      }
    }
    
    // Update document with alerts
    if (alerts.length > 0) {
      await snap.ref.update({ alerts });
      
      // Send notification to assigned nurse
      await sendAlertNotification(baby, alerts);
    }
  });

async function sendAlertNotification(baby: any, alerts: string[]) {
  if (!baby.primaryNurseId) return;
  
  const nurseRef = admin.firestore().doc(`users/${baby.primaryNurseId}`);
  const nurse = (await nurseRef.get()).data();
  
  if (nurse?.notificationPreferences?.push) {
    // Send push notification via FCM
    const message = {
      notification: {
        title: `Alert: ${baby.firstName || 'Baby'} ${baby.lastName || ''}`,
        body: alerts.join(', ')
      },
      token: nurse.fcmToken
    };
    
    await admin.messaging().send(message);
  }
}
```

### 3. Parent Daily Update Generator

```typescript
export const generateDailyUpdate = functions.pubsub
  .schedule('every day 18:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));
    
    // Get all active babies
    const babiesSnapshot = await admin.firestore()
      .collection('babies')
      .where('isActive', '==', true)
      .get();
    
    for (const babyDoc of babiesSnapshot.docs) {
      const baby = babyDoc.data();
      
      // Get today's data
      const vitalSigns = await babyDoc.ref
        .collection('vitalSigns')
        .where('recordedAt', '>=', startOfDay)
        .where('recordedAt', '<=', endOfDay)
        .get();
      
      const feeding = await babyDoc.ref
        .collection('feeding')
        .where('feedTime', '>=', startOfDay)
        .where('feedTime', '<=', endOfDay)
        .get();
      
      // Generate summary
      const summary = generateSummary(vitalSigns, feeding);
      
      // Send to parents
      for (const parentId of baby.parentUserIds) {
        await sendDailyUpdateToParent(parentId, baby, summary);
      }
    }
  });

function generateSummary(vitalSigns: any, feeding: any): string {
  // Calculate averages, trends, etc.
  const latestWeight = vitalSigns.docs
    .filter((doc: any) => doc.data().weight)
    .sort((a: any, b: any) => b.data().recordedAt - a.data().recordedAt)[0];
  
  const totalFeeds = feeding.size;
  const totalVolume = feeding.docs.reduce(
    (sum: number, doc: any) => sum + (doc.data().volume?.actual || 0), 
    0
  );
  
  return `Today: ${totalFeeds} feeds (${totalVolume}ml total). Current weight: ${latestWeight?.data().weight.value}g`;
}
```

### 4. Audit Logging Function

```typescript
export const logDataAccess = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }
  
  const { action, resource, resourceId, babyId } = data;
  
  const auditLog = {
    action,
    resource,
    resourceId,
    userId: context.auth.uid,
    userEmail: context.auth.token.email || '',
    userRole: context.auth.token.role || '',
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
    babyId: babyId || null,
    ipAddress: context.rawRequest.ip,
    userAgent: context.rawRequest.headers['user-agent'],
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  };
  
  await admin.firestore().collection('auditLog').add(auditLog);
  
  return { success: true };
});
```

### 5. NHS Spine Integration (FHIR)

```typescript
import axios from 'axios';

export const syncWithNHSSpine = functions.https.onCall(async (data, context) => {
  // This would integrate with NHS Spine using FHIR APIs
  // Requires NHS authentication credentials
  
  const { babyId, nhsNumber } = data;
  
  try {
    // Example: Fetch patient demographics from NHS PDS
    const response = await axios.get(
      `https://api.nhs.uk/personal-demographics/FHIR/R4/Patient/${nhsNumber}`,
      {
        headers: {
          'Authorization': `Bearer ${functions.config().nhs.api_key}`,
          'X-Request-ID': context.auth?.uid
        }
      }
    );
    
    // Update baby record with NHS data
    await admin.firestore().doc(`babies/${babyId}`).update({
      nhsNumber,
      verifiedAgainstSpine: true,
      lastSpineSync: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('NHS Spine sync error:', error);
    throw new functions.https.HttpsError('internal', 'Failed to sync with NHS Spine');
  }
});
```

## Real-time Data Flow

### Scenario: Nurse Enters Vital Signs

```
1. Nurse opens web portal
   ├─> Firebase Auth validates session
   └─> Loads baby data from Firestore

2. Nurse enters vital signs (weight, temp, HR, etc.)
   └─> Form validation in React

3. Nurse clicks "Save"
   ├─> Data sent to Firestore
   ├─> Security rules check permissions
   └─> Document created in vitalSigns subcollection

4. Cloud Function triggers (onCreate)
   ├─> Calculates alerts if out of range
   ├─> Updates document with alerts
   └─> Sends push notification if needed

5. Real-time update to parent app
   ├─> Firestore listener detects new document
   ├─> React Native updates UI instantly
   └─> Parent sees new vital signs in dashboard

6. Audit log created
   └─> Background Cloud Function logs the action
```

### Scenario: Parent Views Growth Chart

```
1. Parent opens mobile app
   ├─> Firebase Auth validates session
   └─> Loads baby profile

2. Parent navigates to "Growth" tab
   ├─> Query: babies/{babyId}/growth (last 30 days)
   └─> Firestore returns growth measurements

3. App calculates corrected age
   └─> Using baby's gestational age at birth

4. Chart library plots data
   ├─> Weight over corrected age
   ├─> Percentile curves (Fenton chart)
   └─> Interactive tooltips

5. Audit log created
   └─> Cloud Function logs "view" action
```

## Offline Support

### React Native Persistence

```typescript
import firestore from '@react-native-firebase/firestore';

// Enable offline persistence (automatic)
firestore().settings({
  persistence: true,
  cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
});

// Data syncs automatically when online
```

### Handling Conflicts

```typescript
// Firestore handles conflicts automatically with "last write wins"
// For critical data, use transactions:

const updateVitalSigns = async (babyId: string, vitalSign: VitalSign) => {
  const vitalSignRef = firestore()
    .collection('babies')
    .doc(babyId)
    .collection('vitalSigns')
    .doc();
  
  await firestore().runTransaction(async (transaction) => {
    const baby = await transaction.get(firestore().collection('babies').doc(babyId));
    
    if (!baby.exists) {
      throw new Error('Baby not found');
    }
    
    transaction.set(vitalSignRef, {
      ...vitalSign,
      createdAt: firestore.FieldValue.serverTimestamp()
    });
  });
};
```

## Performance Optimisation

### Indexing Strategy

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "vitalSigns",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "babyId", "order": "ASCENDING" },
        { "fieldPath": "recordedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "feeding",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "babyId", "order": "ASCENDING" },
        { "fieldPath": "feedTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "growth",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "babyId", "order": "ASCENDING" },
        { "fieldPath": "measuredAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

### Pagination

```typescript
// Load 20 vital signs at a time
const loadVitalSigns = async (babyId: string, lastDoc?: any) => {
  let query = firestore()
    .collection('babies')
    .doc(babyId)
    .collection('vitalSigns')
    .orderBy('recordedAt', 'desc')
    .limit(20);
  
  if (lastDoc) {
    query = query.startAfter(lastDoc);
  }
  
  const snapshot = await query.get();
  return snapshot.docs;
};
```

## Monitoring & Analytics

### Firebase Performance Monitoring

```typescript
import perf from '@react-native-firebase/perf';

// Track screen load time
const trace = await perf().startTrace('baby_dashboard_load');
// ... load data
await trace.stop();

// Track network requests automatically
// Firebase monitors all Firestore and Storage requests
```

### Application Insights (Optional)

```typescript
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const appInsights = new ApplicationInsights({
  config: {
    connectionString: 'YOUR_CONNECTION_STRING'
  }
});

appInsights.loadAppInsights();
appInsights.trackPageView();
```

## Cost Optimisation

### Best Practices

1. **Use subcollections** for frequently accessed data
2. **Paginate** large datasets
3. **Cache** static data (e.g., educational resources)
4. **Minimise reads** with real-time listeners (not polling)
5. **Use Cloud Functions** judiciously (only for server-side logic)

### Estimated Monthly Costs (10-bed NICU)

```
Firebase Firestore:
- 10 babies × 24 vital signs/day × 30 days = 7,200 writes/month
- 10 parents × 50 reads/day × 30 days = 15,000 reads/month
- Total: ~£0.20/month

Firebase Storage:
- 10 babies × 10 photos = 100 photos × 2MB = 200MB
- Total: ~£0.01/month

Firebase Cloud Functions:
- Alert checks: 7,200 invocations = £0.00
- Daily updates: 300 invocations = £0.00
- Total: ~£0.00/month (within free tier)

Firebase Hosting:
- Static React app hosting = £0.00 (within free tier)

Total: ~£0.25/month for 10-bed NICU
```

For 60-bed NICU: ~£1.50/month

## Next Steps

1. Set up Firebase project (see GETTING_STARTED.md)
2. Deploy security rules
3. Create initial database structure
4. Build nurse portal (React)
5. Build parent app (React Native)
6. Deploy Cloud Functions
7. Test end-to-end workflow
8. Prepare for NHS DTAC assessment

---

**Remember**: This architecture prioritises:
- ✅ Patient safety (audit logs, alerts)
- ✅ Data protection (encryption, GDPR)
- ✅ Real-time updates (parent engagement)
- ✅ Offline capability (rural hospitals)
- ✅ Cost efficiency (£1-2/month per unit)
- ✅ Scalability (multi-trust deployment)
