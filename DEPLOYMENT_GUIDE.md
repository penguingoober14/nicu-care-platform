# NICU Care Platform - Deployment & Usage Guide

## 🚀 Your Demo App is Ready!

The application has been built and is ready to use. You have two options:

---

## Option 1: Run Locally (Recommended for Development)

### Quick Start

```bash
cd web-app
npm run dev
```

The app will open at **http://localhost:3000**

### What You'll See

1. **Role Selection Screen** with 6 colored cards
2. Click any role to view as that persona
3. **Bedside Nurse interface is fully functional** with:
   - Medication schedule
   - Feeding records with medication integration
   - Vital signs entry
   - Care plan viewing

---

## Option 2: Deploy to Firebase Hosting

### Prerequisites

1. Install Firebase CLI (if not already installed):
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

### Deploy Steps

```bash
# From project root directory
cd web-app
npm run build
cd ..
firebase deploy --only hosting
```

After deployment, Firebase will provide a URL like:
`https://nicu-app-9e772.web.app`

---

## 🎯 How to Use the Demo

### 1. Select Bedside Nurse Role

Click the **"Bedside Nurse"** card on the landing page.

### 2. Select a Patient

Choose either:
- **Daisy Smith** (Room 1) - 32+4 weeks gestation
- **Elsa Brown** (Room 2) - 28+2 weeks gestation

### 3. Explore the Interface

#### **Medications Tab** ⚕️

**What you'll see:**
- Daily medication schedule with pending medications
- Medications marked as "Can be in feed" or "Must be separate"
- Status indicators (Pending/Given)

**Try this workflow:**
1. Click **"Administer"** on a pending medication
2. Choose "Given separately" checkbox
3. Click **"Confirm Administration"**
4. Watch the status change to "Given" with timestamp

#### **Feeding Tab** 🍼

**What you'll see:**
- Feed entry form (type, volume, route, tolerance)
- **Pending medications list** with checkboxes
- Recent feeds table showing which medications were included

**Try this workflow (THE KEY FEATURE!):**
1. Enter feed details:
   - Volume: 35ml (pre-filled from care plan)
   - Type: Fortified EBM
   - Route: NG tube
   - Tolerance: Good

2. **Check the boxes** for pending medications to include in this feed

3. Click **"Record Feed"**

4. **Magic!**
   - Feed is recorded
   - Checked medications automatically marked as "Given"
   - Status shows "In Feed" instead of "Separately"
   - Recent feeds table shows which meds were included

5. Go back to **Medications tab** to see the medications are now marked as "Given"

#### **Vital Signs Tab** 📊

**What you'll see:**
- Entry form for all vital signs
- Recent vital signs history table

**Try this:**
1. Enter vital signs:
   - Weight: 1875g
   - Temperature: 36.8°C
   - Heart Rate: 145 bpm
   - Respiratory Rate: 48
   - O2 Saturation: 97%

2. Click **"Record Vital Signs"**

3. See the entry appear in recent history

#### **Care Plan Tab** 📋

**What you'll see:**
- Active feeding plan with schedule
- Instructions for care
- Frequency and volume targets

**This is read-only** - shows what the consultant has prescribed.

---

## 👥 Try Other Roles

Click **"Change Role"** button (top right) to go back and try:
- Consultant
- Junior Doctor
- Ward Manager
- Physiotherapist
- Parent

*Note: Other roles have basic dashboards. Full interfaces will be built in future phases.*

---

## 🎨 Features Demonstrated

### ✅ Fully Implemented (Bedside Nurse)

1. **Medication Management**
   - View daily medication schedule
   - Administer medications separately
   - Mark medications as included in feeds
   - Automatic status updates
   - Audit trail (who, when, how)

2. **Medication-Feed Integration** ⭐ **KEY FEATURE**
   - Pending medications shown during feed entry
   - Checkbox system for including meds in feed
   - Automatic linking of medications to feed records
   - Feed history shows which medications were given with each feed
   - Medication history shows whether given separately or in feed

3. **Feed Recording**
   - Comprehensive feed details
   - Tolerance assessment
   - Residual and vomiting tracking
   - Notes field
   - Recent feed history

4. **Vital Signs**
   - All standard NICU parameters
   - History tracking
   - Simple, clean entry form

5. **Care Plan Viewing**
   - Feeding schedule
   - Instructions and guidelines
   - Effective dates

### 🚧 Basic Implementation (Other Roles)

- Patient list view
- Basic information display
- Navigation structure

---

## 📊 Demo Data

### Patients

**Daisy Smith** (Room 1)
- Gestational age: 32+4 weeks
- Day 5 of admission
- Diagnoses: Prematurity, RDS
- Medications:
  - Caffeine Citrate (can be in feed)
  - Vitamin D (can be in feed)

**Elsa Brown** (Room 2)
- Gestational age: 28+2 weeks
- Day 12 of admission
- Diagnoses: Extreme prematurity, BPD, PDA
- Medications:
  - Caffeine Citrate (can be in feed)
  - Dexamethasone (MUST be separate - IV)
  - Vitamin D (can be in feed)

### Users

- Sarah Johnson - Bedside Nurse
- Dr. Emma Williams - Consultant
- Dr. James Chen - Junior Doctor
- Maria Garcia - Ward Manager
- Tom Andrews - Physiotherapist
- Rachel Smith - Parent

---

## 🔧 Technical Details

### Tech Stack
- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI v5
- **Routing**: React Router v6
- **Date Handling**: date-fns
- **State Management**: React Context API
- **Data**: Mock data store (simulates Firestore)

### Project Structure
```
web-app/
├── src/
│   ├── config/           # Firebase & mock data
│   ├── context/          # Auth/role context
│   ├── types/            # TypeScript types
│   ├── components/
│   │   └── nurse/        # Nurse interface components
│   ├── pages/            # Main pages
│   ├── App.tsx           # Router & theme
│   └── main.tsx          # Entry point
├── public/
├── dist/                 # Built files (after npm run build)
└── package.json
```

### Data Persistence
- **Current**: In-memory (resets on refresh)
- **Future**: Firebase Firestore

### Responsive Design
- Works on desktop, tablet, and mobile
- Material-UI provides responsive components
- Tested on Chrome, Firefox, Safari

---

## 🐛 Troubleshooting

### Dev Server Won't Start

```bash
# Clean install
cd web-app
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Build Fails

```bash
# Check TypeScript errors
npm run build

# If errors, check:
# 1. tsconfig.json is correct
# 2. All imports are valid
# 3. No syntax errors
```

### Port 3000 Already in Use

```bash
# Kill existing process
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Or change port in vite.config.ts
```

### Deployment Issues

```bash
# Ensure you're logged in
firebase login

# Ensure project is selected
firebase use nicu-app-9e772

# Check firebase.json is in project root
# Check dist folder exists in web-app/
```

---

## 📝 Next Steps for Full Production

1. **Connect Real Firebase**
   - Set up Firestore database
   - Deploy security rules
   - Add authentication

2. **Build Remaining Interfaces**
   - Consultant: Prescriptions, clinical reviews, care plans
   - Junior Doctor: Ward rounds, assessments
   - Ward Manager: Bed management, audits, incidents
   - Physiotherapist: Respiratory assessments, treatments
   - Parent: Mobile app with real-time updates

3. **Add Advanced Features**
   - Real-time synchronization
   - Push notifications
   - Offline support
   - Growth charts
   - Trend visualization

4. **Security & Compliance**
   - NHS authentication (CIS2)
   - Audit logging
   - GDPR compliance
   - Clinical safety case

5. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests
   - User acceptance testing

---

## 🎉 Success!

You now have a fully functional demo of the NICU Care Platform's bedside nurse interface, showcasing the innovative medication-feeding integration workflow.

**Key Achievement**: Nurses can now record feeds and medications in a single workflow, with automatic linking and status updates - exactly as specified in your MVP Phase 1 requirements!

### What Works Now

✅ Role selection
✅ Patient selection
✅ Medication schedule viewing
✅ Medication administration (separately OR in feeds)
✅ Feed recording with medication integration
✅ Automatic medication marking when included in feed
✅ Vital signs entry
✅ Care plan viewing
✅ Recent history for all data types
✅ Multi-patient support
✅ Responsive design

### Demo URL (after deployment)

Once deployed to Firebase Hosting, share this URL:
**https://nicu-app-9e772.web.app**

---

## 📞 Support

GitHub: https://github.com/penguingoober14/nicu-care-platform
Firebase Console: https://console.firebase.google.com/project/nicu-app-9e772

---

**Built for the NHS | Improving NICU Care | Empowering Parents**
