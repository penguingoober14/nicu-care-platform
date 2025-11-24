# NICU Care Platform - Demo Application

## Quick Start

### Run Locally

```bash
# Install dependencies (only needed once)
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
# Build the app
npm run build

# Preview the production build
npm run preview
```

## How to Use the Demo

1. **Select a Role**: When you first load the app, you'll see 6 role cards:
   - Bedside Nurse (fully functional)
   - Consultant (basic view)
   - Junior Doctor (basic view)
   - Ward Manager (basic view)
   - Physiotherapist (basic view)
   - Parent (basic view)

2. **Bedside Nurse Interface** (Recommended to try first):
   - Select "Bedside Nurse" role
   - Choose a patient (Daisy in Room 1 or Elsa in Room 2)
   - Explore the 4 tabs:
     - **Medications**: View schedule, mark as given separately or in feed
     - **Feeding**: Record feeds with automatic medication integration
     - **Vital Signs**: Record weight, temperature, HR, RR, SpO2, BP
     - **Care Plan**: View active feeding plans and instructions

3. **Key Features to Try**:

   **Medication Administration**:
   - Go to "Medications" tab
   - Click "Administer" on a pending medication
   - Choose "Given separately" or "Given in feed"
   - Confirm administration

   **Record a Feed with Medications**:
   - Go to "Feeding" tab
   - Enter feed details (volume, type, route, tolerance)
   - Check the boxes for medications to include in this feed
   - Click "Record Feed"
   - Medications are automatically marked as given!

   **Record Vital Signs**:
   - Go to "Vital Signs" tab
   - Enter any vital signs (weight, temp, HR, etc.)
   - Click "Record Vital Signs"
   - View recent history in the table

4. **Switch Roles**: Click "Change Role" button at top right to try other personas

## Demo Data

### Patients
- **Daisy Smith** (Room 1)
  - 32+4 weeks gestation
  - Day 5 of admission
  - Medications: Caffeine Citrate, Vitamin D

- **Elsa Brown** (Room 2)
  - 28+2 weeks gestation
  - Day 12 of admission
  - Medications: Caffeine Citrate, Dexamethasone (IV), Vitamin D

### Demo Users
- Sarah Johnson - Bedside Nurse
- Dr. Emma Williams - Consultant
- Dr. James Chen - Junior Doctor
- Maria Garcia - Ward Manager
- Tom Andrews - Physiotherapist
- Rachel Smith - Parent (Daisy's Mum)

## Architecture

- **Frontend**: React + TypeScript + Vite
- **UI Library**: Material-UI (MUI)
- **State**: React Context API
- **Data**: Mock data store (simulates Firebase)
- **Routing**: React Router

## Project Structure

```
src/
├── config/
│   ├── firebase.ts          # Firebase config
│   └── mockData.ts          # Demo data
├── context/
│   └── AuthContext.tsx      # Role selection state
├── types/
│   ├── index.ts             # Type definitions
│   └── user.ts              # User types
├── components/
│   └── nurse/
│       ├── MedicationSchedule.tsx
│       ├── FeedingEntry.tsx
│       ├── VitalSignsEntry.tsx
│       └── CarePlanView.tsx
├── pages/
│   ├── RoleSelection.tsx    # Landing page
│   ├── NurseDashboard.tsx   # Nurse interface
│   └── GenericDashboard.tsx # Other roles
├── App.tsx                  # Main app + routing
└── main.tsx                 # Entry point
```

## Features Implemented

### ✅ Bedside Nurse Interface
- [x] Medication schedule view
- [x] Medication administration (separately OR in feed)
- [x] Feed recording with medication integration
- [x] Pending medications shown during feeding
- [x] Automatic medication marking when included in feed
- [x] Vital signs entry
- [x] Care plan viewing
- [x] Recent history for feeds and vital signs
- [x] Multi-patient support

### 🚧 Other Roles
- Basic dashboard showing patient information
- Full interfaces to be implemented in future phases

## Next Steps for Full Implementation

1. Connect to real Firebase (currently using mock data)
2. Implement Consultant interface (prescriptions, clinical reviews)
3. Implement Junior Doctor interface (ward rounds, assessments)
4. Implement Ward Manager interface (bed management, audits)
5. Implement Physiotherapist interface (respiratory assessments)
6. Build React Native parent mobile app
7. Add authentication
8. Deploy to Firebase Hosting

## Technical Notes

- All data is stored in memory and resets on page refresh
- No backend required for demo
- Fully client-side application
- Works offline
- Responsive design (works on mobile/tablet/desktop)

## Support

For issues or questions, see the main project README or GitHub repository:
https://github.com/penguingoober14/nicu-care-platform
