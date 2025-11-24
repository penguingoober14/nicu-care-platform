# NICU Care Platform

## Vision

A holistic, paperless digital platform for Neonatal Intensive Care Units (NICU) that revolutionises care delivery for preterm babies whilst empowering parents through transparency, communication, and education.

## Problem Statement

Current NICU care relies heavily on:
- **Paper-based documentation** - leading to inefficiency, errors, and lost data
- **Fragmented communication** - parents struggle to understand their baby's progress
- **Limited parent engagement** - parents feel disconnected from care decisions
- **Inconsistent data capture** - missing vital trend data for long-term outcomes
- **Poor care continuity** - information silos between nurses, doctors, therapists, and parents

## Solution Overview

A comprehensive platform with three interconnected personas:

### 1. **Clinical Staff Portal** (Web/Tablet)
Paperless digital documentation for:
- Real-time vital signs logging (weight, temperature, O₂ saturation, heart rate, respiratory rate, blood pressure)
- Medication administration records
- Feeding records (type, volume, frequency)
- Care assessments and observations
- Procedure documentation
- Lab results integration
- Growth tracking with corrected age calculations
- Automated alerts and warnings

### 2. **Parent Mobile App** (iOS/Android)
Empowering parents with:
- Real-time updates on baby's condition
- Secure messaging with care team
- Educational resources tailored to baby's gestational age and conditions
- Physio/OT therapy notes and exercises
- Developmental milestone tracking (using corrected age)
- Photo diary and memory keeping
- Preparation for discharge (checklists, training videos)
- Growth charts visualisation
- Expected care pathway timeline

### 3. **Therapist Portal** (Web/Mobile)
Supporting allied health professionals:
- Assessment documentation (physio, OT, speech therapy)
- Treatment plans and progress notes
- Parent education materials sharing
- Exercise videos and instruction sheets
- Discharge planning collaboration

## Key Features

### Core Clinical Data Capture

#### Vital Signs Monitoring
- **Frequency-based logging**: Every 3-4 hours or as ordered
- **Parameters tracked**:
  - Weight (g/kg) with automatic growth chart plotting
  - Temperature (°C) - axillary or skin probe
  - Heart rate (bpm)
  - Respiratory rate (breaths/min)
  - Oxygen saturation (SpO₂ %)
  - Blood pressure (systolic/diastolic/MAP mmHg)
  - Pain score (neonatal pain scale)
- **Corrected age calculations** for appropriate reference ranges
- **Trend visualisation** with alerts for deviations

#### Growth Tracking
- **Measurements**: Weight, length/height, head circumference, abdominal circumference
- **Growth charts**: Fenton charts for preterm (22-50 weeks), UK-WHO charts
- **Corrected age** calculations automatic
- **Daily weight gain** targets and tracking
- **Feeding volume** calculations (ml/kg/day)

### Parent Engagement Features

#### Daily Updates Dashboard
- Baby's current status (stable/improving/concerns)
- Today's weight and comparison to yesterday
- Feeding progress
- Respiratory support changes
- Any procedures or tests planned/completed
- Photos (taken by nursing staff or parents)

#### Education Hub
- **Gestational age-specific content**
  - What to expect at 24 weeks, 28 weeks, 32 weeks, etc.
  - Normal development for baby's corrected age
- **Condition-specific information**
  - RDS, BPD, NEC, IVH, ROP, PDA explanations
  - Treatment options explained in plain English
- **Care technique videos**
  - Nappy changing, feeding, bathing
  - Kangaroo care instructions
  - Using breast pump
- **Discharge preparation**
  - CPR training
  - Medication administration
  - Special equipment (oxygen, NG tube) training

#### Communication Tools
- **Secure messaging** with care team
- **Virtual rounds** participation
- **Question bank** - suggested questions to ask doctors
- **Daily notes** from nurses and doctors
- **Alerts** for significant events (extubation, first bottle feed, etc.)

#### Memory Keeping
- **Photo diary** with dates and milestones
- **Firsts tracker**: first cuddle, first bottle, first bath, etc.
- **Growth progress** visualisations
- **Printed discharge book** option

### Care Pathway Tracking

#### Typical Preterm Journey Milestones
- **Respiratory**: Ventilator → CPAP → High-flow → Room air
- **Feeding**: TPN → NG tube → Combination → Full oral feeds
- **Temperature regulation**: Incubator → Open cot
- **Discharge criteria**: Stable temperature, feeding well, gaining weight, no apnoeas

#### Predictive Timeline
- Based on gestational age at birth
- Adjusted for individual baby's progress
- "Babies like yours typically..."
- Visual timeline showing current position and next milestones

## Technology Stack

### Backend
- **Framework**: Node.js with TypeScript / .NET Core (C#)
- **Database**: PostgreSQL (relational data) + MongoDB (documents/notes)
- **API**: REST + GraphQL
- **Authentication**: OAuth 2.0 + NHS CIS2 integration
- **Real-time**: WebSockets for live updates

### Frontend Web Portal
- **Framework**: React with TypeScript
- **UI Library**: NHS Design System components
- **State Management**: Redux Toolkit / Zustand
- **Charts**: Recharts / D3.js for growth charts

### Mobile Apps
- **Framework**: React Native (iOS + Android from single codebase)
- **Offline-first**: Redux Persist for offline capability
- **Push notifications**: Firebase Cloud Messaging

### Infrastructure
- **Cloud**: Azure (NHS-preferred) or AWS
- **Hosting**: Containerised with Docker + Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Application Insights / CloudWatch

## Security & Compliance

### UK Regulatory Requirements
- **GDPR compliance**: Full data protection framework
- **UK GDPR Article 9**: Special category data (health) lawful basis
- **MHRA**: Medical device registration (if providing clinical decision support)
- **NHS Digital Standards**: DTAC assessment
- **Data Security and Protection Toolkit (DSPT)**: Annual compliance
- **Clinical safety**: DCB0129 and DCB0160 compliance
- **ISO 27001**: Information security management

### Data Protection
- **Encryption**: AES-256 at rest, TLS 1.3 in transit
- **Access controls**: Role-based (RBAC) with audit logging
- **Data residency**: UK-only data centres
- **Backup**: Automated daily backups, 30-day retention
- **Anonymisation**: Research data stripped of identifiers
- **Right to erasure**: GDPR Article 17 compliance

### Clinical Safety
- **Clinical Safety Officer** appointed
- **Hazard log** maintained
- **Safety case** documentation
- **Incident reporting** integration with MHRA Yellow Card

### Integration Requirements

#### NHS Systems
- **NHS Spine**: Patient identification (PDS lookup)
- **Summary Care Record (SCR)**: Read access
- **National Record Locator (NRL)**: Record location sharing
- **GP Connect**: Discharge summary transmission
- **SNOMED CT**: Clinical terminology
- **HL7 FHIR**: Interoperability standard

#### Hospital Systems
- **Electronic Patient Records (EPR)**: Cerner, EPIC, Meditech integration
- **Laboratory systems**: Automated results import
- **Pharmacy systems**: Medication orders sync
- **Picture Archiving (PACS)**: X-ray, ultrasound image viewing

## Implementation Phases

### Phase 1: MVP Core (3-4 months)
**Goal**: Basic paperless vital signs and parent viewing

- [ ] Baby registration and profiles
- [ ] Vital signs logging (weight, temp, HR, RR, SpO₂, BP)
- [ ] Basic growth charts (weight over time)
- [ ] Staff authentication and role management
- [ ] Parent mobile app with read-only dashboard
- [ ] Daily updates posting by nurses
- [ ] Secure photo sharing
- [ ] Basic security and GDPR compliance framework

### Phase 2: Enhanced Clinical (2-3 months)
**Goal**: Complete clinical documentation

- [ ] Feeding records comprehensive tracking
- [ ] Medication administration (EMAR)
- [ ] Care assessments and shift handovers
- [ ] Corrected age calculations
- [ ] Multiple growth chart types (Fenton, UK-WHO)
- [ ] Lab results integration
- [ ] Respiratory support detailed tracking
- [ ] Alerts and warnings system

### Phase 3: Parent Engagement (2-3 months)
**Goal**: Two-way communication and education

- [ ] Secure messaging between parents and team
- [ ] Educational content library
- [ ] Gestational age-specific information
- [ ] Therapy notes from physio/OT
- [ ] Exercise videos and leaflets
- [ ] Milestone tracking with corrected age
- [ ] Discharge preparation checklists
- [ ] Memory book / photo diary

### Phase 4: Integration & Advanced (3-4 months)
**Goal**: NHS systems integration and advanced analytics

- [ ] NHS Spine integration (PDS)
- [ ] EPR system integration
- [ ] Bedside monitor automatic data capture
- [ ] Predictive care pathway timelines
- [ ] Analytics dashboard for clinical governance
- [ ] Research data export (anonymised)
- [ ] Multi-site deployment capabilities

### Phase 5: Regulatory Approval (3-6 months)
**Goal**: NHS adoption readiness

- [ ] MHRA medical device registration
- [ ] DTAC assessment completion
- [ ] DSPT compliance certification
- [ ] Clinical safety case approval (DCB0129/0160)
- [ ] Information governance assessment
- [ ] Pilot with NHS trust
- [ ] User acceptance testing
- [ ] Training materials and documentation

## Success Metrics

### Clinical Outcomes
- Reduction in documentation time for nurses (target: 30% reduction)
- Medication error reduction
- Improved discharge readiness scores
- Earlier parent confidence in care

### Parent Experience
- Parent satisfaction scores (target: >90%)
- Parent engagement metrics (daily app opens)
- Reduction in parent anxiety scores
- Improved understanding of baby's condition

### Operational Efficiency
- Time saved per nurse per shift
- Reduction in paper forms used
- Improved data completeness (target: >95%)
- Audit compliance scores

## Research Foundation

This platform is informed by extensive research into:
- NICU clinical workflows and documentation requirements
- Existing NICU parent apps (MyPreemie, NICU2Home, PreeMe+You)
- NHS digital health standards and regulations
- UK GDPR and medical device regulations
- Growth chart standards (Fenton, UK-WHO)
- Corrected age calculations for developmental assessment
- Parent communication needs and preferences
- Physiotherapy and occupational therapy practices
- Discharge planning best practices

### Key Insights from Research
1. **Most NICU babies** (~70%) are admitted for feeding and growing (as opposed to complex medical conditions)
2. **Parents want**: Real-time information, trend data, educational content at appropriate level
3. **Clinical staff need**: Faster documentation, integrated systems, decision support
4. **Current apps lack**: Two-way communication, clinical integration, therapist notes
5. **Regulatory complexity**: MHRA device registration, DTAC assessment, GDPR Article 9 compliance essential
6. **Corrected age critical**: Must be used for growth charts and milestones until 2-3 years

## 🚀 Demo App - Quick Start

The MVP Phase 1 demo app is ready!

### Run the Demo

**Windows:**
```bash
START_DEMO.bat
```

**Mac/Linux:**
```bash
./START_DEMO.sh
```

**Or manually:**
```bash
cd web-app
npm install  # Only needed first time
npm run dev
```

Open **http://localhost:3000** in your browser.

### What You'll See

1. **Role Selection Screen** - Click any role card to view as that persona
2. **Bedside Nurse Interface** (fully functional) with:
   - ⚕️ **Medication Schedule** - View and administer medications
   - 🍼 **Feeding Entry** - Record feeds with automatic medication integration
   - 📊 **Vital Signs** - Record weight, temp, HR, RR, SpO2, BP
   - 📋 **Care Plan** - View active feeding plans

### Key Feature: Medication-Feed Integration

**The nurse can:**
1. Go to "Feeding" tab
2. Enter feed details
3. **Check boxes for pending medications** to include in the feed
4. Click "Record Feed"
5. Medications are automatically marked as "Given" and linked to the feed! ✅

### Demo Patients
- **Daisy Smith** (Room 1) - 32+4 weeks gestation
- **Elsa Brown** (Room 2) - 28+2 weeks gestation

See **DEPLOYMENT_GUIDE.md** for full instructions and deployment to Firebase.

---

## Next Steps

1. **Validate with stakeholders**:
   - NICU nurses and doctors
   - Neonatal consultants
   - Parents who've experienced NICU
   - Physiotherapists and OTs
   - Information governance teams

2. **Technical architecture design**:
   - Database schema design
   - API specification
   - Security architecture
   - Integration points

3. **Prototype development**:
   - Wireframes for all personas
   - Interactive prototypes
   - User testing

4. **Pilot planning**:
   - Identify NHS trust partner
   - Clinical safety registration
   - Ethics approval (if research component)

## Contributing

This is a personal project currently. Contributions will be welcomed once the MVP is established.

## Licence

To be determined - likely open source with NHS-friendly licensing.

## Contact

Project maintained by penguingoober14

**GitHub Repository:** https://github.com/penguingoober14/nicu-care-platform

---

**Note**: This platform is designed for the NHS and UK healthcare context. All development will prioritise:
1. Patient safety
2. Data protection
3. Clinical quality
4. User experience for stressed, sleep-deprived parents
5. Accessibility (WCAG 2.1 AA compliance)

**Personal Note**: This project was inspired by the experience of my twins born at 30+5 weeks in October 2025. Every feature has been considered through the lens of what would have helped us as parents and what would have made the clinical team's work easier.
