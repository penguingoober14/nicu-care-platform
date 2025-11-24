# Getting Started - NICU Care Platform

## 6-Week MVP Development Plan

This guide will take you from zero to a working NICU care platform in 6 weeks.

---

## Week 1: Firebase Setup & Baby Registration

### Day 1-2: Firebase Project Setup

#### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Project name: `nicu-care-platform`
4. Enable Google Analytics: No (optional)
5. Click "Create project"

#### Step 2: Configure Firebase for Web

1. In Firebase Console, click the **Web** icon (`</>`)
2. App nickname: `NICU Nurse Portal`
3. Enable Firebase Hosting: Yes
4. Click "Register app"
5. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "nicu-care-platform.firebaseapp.com",
  projectId: "nicu-care-platform",
  storageBucket: "nicu-care-platform.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### Step 3: Enable Firebase Services

1. **Firestore Database**:
   - Go to "Build" → "Firestore Database"
   - Click "Create database"
   - Start in **test mode** (we'll add security rules later)
   - Location: `europe-west2 (London)` for GDPR compliance
   - Click "Enable"

2. **Authentication**:
   - Go to "Build" → "Authentication"
   - Click "Get started"
   - Enable "Email/Password" provider
   - Click "Save"

3. **Storage**:
   - Go to "Build" → "Storage"
   - Click "Get started"
   - Start in **test mode**
   - Click "Done"

4. **Cloud Functions** (for later):
   - Go to "Build" → "Functions"
   - Click "Get started"
   - Upgrade to Blaze plan (pay-as-you-go, but free tier is generous)

#### Step 4: Set Up Local Development Environment

```bash
# Create project folder
mkdir nicu-nurse-portal
cd nicu-nurse-portal

# Initialize Node.js project
npm init -y

# Install Firebase and React dependencies
npm install firebase react react-dom react-router-dom
npm install -D vite @vitejs/plugin-react @types/react @types/react-dom typescript

# Install UI library (optional, but recommended)
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled

# Install date library for handling times
npm install date-fns

# Install chart library for growth charts
npm install recharts
```

#### Step 5: Create Project Structure

```bash
nicu-nurse-portal/
├── src/
│   ├── config/
│   │   └── firebase.ts          # Firebase configuration
│   ├── components/
│   │   ├── BabyRegistration.tsx
│   │   ├── VitalSignsEntry.tsx
│   │   └── BabyDashboard.tsx
│   ├── hooks/
│   │   └── useFirestore.ts
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   └── App.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

Create these files:

**vite.config.ts**:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

**tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**src/config/firebase.ts**:
```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

#### Step 6: Define TypeScript Types

**src/types/index.ts**:
```typescript
import { Timestamp } from 'firebase/firestore';

export interface Baby {
  id?: string;
  hospitalNumber: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth: Date | Timestamp;
  gestationalAgeAtBirth: {
    weeks: number;
    days: number;
  };
  birthWeight: number;
  birthLength?: number;
  birthHeadCircumference?: number;
  sex: 'male' | 'female' | 'unknown';
  unitId: string;
  trustId: string;
  bedNumber?: string;
  admissionDate: Date | Timestamp;
  parentUserIds: string[];
  isActive: boolean;
  createdAt: Date | Timestamp;
  updatedAt: Date | Timestamp;
  createdBy: string;
}

export interface VitalSign {
  id?: string;
  babyId: string;
  recordedAt: Date | Timestamp;
  recordedBy: string;
  weight?: {
    value: number;
    method: 'scale' | 'estimated';
  };
  temperature?: {
    value: number;
    site: 'axillary' | 'skin' | 'rectal';
  };
  heartRate?: {
    value: number;
    rhythm: 'regular' | 'irregular';
  };
  respiratoryRate?: {
    value: number;
  };
  oxygenSaturation?: {
    value: number;
    oxygenSupport?: {
      type: 'room air' | 'nasal cannula' | 'CPAP' | 'ventilator';
      fiO2?: number;
      flow?: number;
    };
  };
  bloodPressure?: {
    systolic: number;
    diastolic: number;
    mean?: number;
    method: 'cuff' | 'arterial line';
  };
  notes?: string;
  alerts?: string[];
  createdAt: Date | Timestamp;
}
```

### Day 3-4: Baby Registration Feature

**src/components/BabyRegistration.tsx**:
```typescript
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { Baby } from '../types';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Typography,
  Grid
} from '@mui/material';

export const BabyRegistration: React.FC = () => {
  const [formData, setFormData] = useState({
    hospitalNumber: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gestationalWeeks: '',
    gestationalDays: '',
    birthWeight: '',
    birthLength: '',
    birthHeadCircumference: '',
    sex: 'unknown' as 'male' | 'female' | 'unknown',
    bedNumber: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const baby: Omit<Baby, 'id'> = {
        hospitalNumber: formData.hospitalNumber,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        dateOfBirth: Timestamp.fromDate(new Date(formData.dateOfBirth)),
        gestationalAgeAtBirth: {
          weeks: parseInt(formData.gestationalWeeks),
          days: parseInt(formData.gestationalDays)
        },
        birthWeight: parseInt(formData.birthWeight),
        birthLength: formData.birthLength ? parseInt(formData.birthLength) : undefined,
        birthHeadCircumference: formData.birthHeadCircumference 
          ? parseInt(formData.birthHeadCircumference) 
          : undefined,
        sex: formData.sex,
        unitId: 'unit-001', // TODO: Get from user's unit
        trustId: 'trust-001', // TODO: Get from user's trust
        bedNumber: formData.bedNumber || undefined,
        admissionDate: Timestamp.now(),
        parentUserIds: [],
        isActive: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy: auth.currentUser?.uid || ''
      };

      const docRef = await addDoc(collection(db, 'babies'), baby);
      
      alert(`Baby registered successfully! ID: ${docRef.id}`);
      
      // Reset form
      setFormData({
        hospitalNumber: '',
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gestationalWeeks: '',
        gestationalDays: '',
        birthWeight: '',
        birthLength: '',
        birthHeadCircumference: '',
        sex: 'unknown',
        bedNumber: ''
      });
    } catch (error) {
      console.error('Error registering baby:', error);
      alert('Error registering baby. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Register New Baby
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Hospital Number"
              value={formData.hospitalNumber}
              onChange={(e) => setFormData({ ...formData, hospitalNumber: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bed Number"
              value={formData.bedNumber}
              onChange={(e) => setFormData({ ...formData, bedNumber: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              helperText="Optional until named"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              type="datetime-local"
              label="Date and Time of Birth"
              InputLabelProps={{ shrink: true }}
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Gestational Age (weeks)"
              value={formData.gestationalWeeks}
              onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
              inputProps={{ min: 22, max: 42 }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              required
              type="number"
              label="Days"
              value={formData.gestationalDays}
              onChange={(e) => setFormData({ ...formData, gestationalDays: e.target.value })}
              inputProps={{ min: 0, max: 6 }}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              required
              type="number"
              label="Birth Weight (g)"
              value={formData.birthWeight}
              onChange={(e) => setFormData({ ...formData, birthWeight: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Birth Length (cm)"
              value={formData.birthLength}
              onChange={(e) => setFormData({ ...formData, birthLength: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              type="number"
              label="Head Circumference (cm)"
              value={formData.birthHeadCircumference}
              onChange={(e) => setFormData({ ...formData, birthHeadCircumference: e.target.value })}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>Sex</InputLabel>
              <Select
                value={formData.sex}
                onChange={(e) => setFormData({ ...formData, sex: e.target.value as any })}
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="unknown">Unknown</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Registering...' : 'Register Baby'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
```

### Day 5: Test Baby Registration

**src/App.tsx**:
```typescript
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase';
import { BabyRegistration } from './components/BabyRegistration';
import { Box, Container, TextField, Button, Typography } from '@mui/material';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, p: 4, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            NICU Nurse Portal - Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <BabyRegistration />
    </Container>
  );
}

export default App;
```

**index.html**:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NICU Nurse Portal</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**src/main.tsx**:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

#### Test It

```bash
# Create a test user in Firebase Console:
# 1. Go to Authentication → Users → Add user
# 2. Email: nurse@test.com
# 3. Password: Test123!

# Run the app
npm run dev

# Open browser to http://localhost:5173
# Login with nurse@test.com / Test123!
# Register a baby
```

---

## Week 2: Vital Signs Entry

### Day 6-7: Vital Signs Component

**src/components/VitalSignsEntry.tsx**:
```typescript
import React, { useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { VitalSign } from '../types';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';

interface VitalSignsEntryProps {
  babyId: string;
}

export const VitalSignsEntry: React.FC<VitalSignsEntryProps> = ({ babyId }) => {
  const [formData, setFormData] = useState({
    weight: '',
    weightMethod: 'scale' as 'scale' | 'estimated',
    temperature: '',
    temperatureSite: 'axillary' as 'axillary' | 'skin' | 'rectal',
    heartRate: '',
    heartRhythm: 'regular' as 'regular' | 'irregular',
    respiratoryRate: '',
    oxygenSaturation: '',
    oxygenType: 'room air' as 'room air' | 'nasal cannula' | 'CPAP' | 'ventilator',
    fiO2: '',
    flow: '',
    systolic: '',
    diastolic: '',
    bpMethod: 'cuff' as 'cuff' | 'arterial line',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const vitalSign: Omit<VitalSign, 'id'> = {
        babyId,
        recordedAt: Timestamp.now(),
        recordedBy: auth.currentUser?.uid || '',
        weight: formData.weight ? {
          value: parseInt(formData.weight),
          method: formData.weightMethod
        } : undefined,
        temperature: formData.temperature ? {
          value: parseFloat(formData.temperature),
          site: formData.temperatureSite
        } : undefined,
        heartRate: formData.heartRate ? {
          value: parseInt(formData.heartRate),
          rhythm: formData.heartRhythm
        } : undefined,
        respiratoryRate: formData.respiratoryRate ? {
          value: parseInt(formData.respiratoryRate)
        } : undefined,
        oxygenSaturation: formData.oxygenSaturation ? {
          value: parseInt(formData.oxygenSaturation),
          oxygenSupport: {
            type: formData.oxygenType,
            fiO2: formData.fiO2 ? parseInt(formData.fiO2) : undefined,
            flow: formData.flow ? parseFloat(formData.flow) : undefined
          }
        } : undefined,
        bloodPressure: (formData.systolic && formData.diastolic) ? {
          systolic: parseInt(formData.systolic),
          diastolic: parseInt(formData.diastolic),
          mean: Math.round((parseInt(formData.systolic) + 2 * parseInt(formData.diastolic)) / 3),
          method: formData.bpMethod
        } : undefined,
        notes: formData.notes || undefined,
        createdAt: Timestamp.now()
      };

      await addDoc(
        collection(db, 'babies', babyId, 'vitalSigns'),
        vitalSign
      );

      alert('Vital signs recorded successfully!');

      // Reset form
      setFormData({
        weight: '',
        weightMethod: 'scale',
        temperature: '',
        temperatureSite: 'axillary',
        heartRate: '',
        heartRhythm: 'regular',
        respiratoryRate: '',
        oxygenSaturation: '',
        oxygenType: 'room air',
        fiO2: '',
        flow: '',
        systolic: '',
        diastolic: '',
        bpMethod: 'cuff',
        notes: ''
      });
    } catch (error) {
      console.error('Error recording vital signs:', error);
      alert('Error recording vital signs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Record Vital Signs
      </Typography>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Weight */}
          <Grid item xs={12}>
            <Divider>Weight</Divider>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Weight (g)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={formData.weightMethod}
                onChange={(e) => setFormData({ ...formData, weightMethod: e.target.value as any })}
              >
                <MenuItem value="scale">Scale</MenuItem>
                <MenuItem value="estimated">Estimated</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Temperature */}
          <Grid item xs={12}>
            <Divider>Temperature</Divider>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Temperature (°C)"
              type="number"
              inputProps={{ step: 0.1 }}
              value={formData.temperature}
              onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Site</InputLabel>
              <Select
                value={formData.temperatureSite}
                onChange={(e) => setFormData({ ...formData, temperatureSite: e.target.value as any })}
              >
                <MenuItem value="axillary">Axillary</MenuItem>
                <MenuItem value="skin">Skin</MenuItem>
                <MenuItem value="rectal">Rectal</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Heart Rate */}
          <Grid item xs={12}>
            <Divider>Heart Rate</Divider>
          </Grid>
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Heart Rate (bpm)"
              type="number"
              value={formData.heartRate}
              onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Rhythm</InputLabel>
              <Select
                value={formData.heartRhythm}
                onChange={(e) => setFormData({ ...formData, heartRhythm: e.target.value as any })}
              >
                <MenuItem value="regular">Regular</MenuItem>
                <MenuItem value="irregular">Irregular</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Respiratory Rate */}
          <Grid item xs={12}>
            <Divider>Respiratory Rate</Divider>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Respiratory Rate (breaths/min)"
              type="number"
              value={formData.respiratoryRate}
              onChange={(e) => setFormData({ ...formData, respiratoryRate: e.target.value })}
            />
          </Grid>

          {/* Oxygen Saturation */}
          <Grid item xs={12}>
            <Divider>Oxygen Saturation</Divider>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="SpO₂ (%)"
              type="number"
              value={formData.oxygenSaturation}
              onChange={(e) => setFormData({ ...formData, oxygenSaturation: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Support</InputLabel>
              <Select
                value={formData.oxygenType}
                onChange={(e) => setFormData({ ...formData, oxygenType: e.target.value as any })}
              >
                <MenuItem value="room air">Room Air</MenuItem>
                <MenuItem value="nasal cannula">Nasal Cannula</MenuItem>
                <MenuItem value="CPAP">CPAP</MenuItem>
                <MenuItem value="ventilator">Ventilator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="FiO₂ (%)"
              type="number"
              value={formData.fiO2}
              onChange={(e) => setFormData({ ...formData, fiO2: e.target.value })}
              disabled={formData.oxygenType === 'room air'}
            />
          </Grid>
          <Grid item xs={2}>
            <TextField
              fullWidth
              label="Flow (L/min)"
              type="number"
              inputProps={{ step: 0.1 }}
              value={formData.flow}
              onChange={(e) => setFormData({ ...formData, flow: e.target.value })}
              disabled={formData.oxygenType === 'room air'}
            />
          </Grid>

          {/* Blood Pressure */}
          <Grid item xs={12}>
            <Divider>Blood Pressure</Divider>
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Systolic (mmHg)"
              type="number"
              value={formData.systolic}
              onChange={(e) => setFormData({ ...formData, systolic: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Diastolic (mmHg)"
              type="number"
              value={formData.diastolic}
              onChange={(e) => setFormData({ ...formData, diastolic: e.target.value })}
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>Method</InputLabel>
              <Select
                value={formData.bpMethod}
                onChange={(e) => setFormData({ ...formData, bpMethod: e.target.value as any })}
              >
                <MenuItem value="cuff">Cuff</MenuItem>
                <MenuItem value="arterial line">Arterial Line</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Notes */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Recording...' : 'Record Vital Signs'}
            </Button>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};
```

### Day 8-10: Baby List & Dashboard

**src/hooks/useFirestore.ts**:
```typescript
import { useEffect, useState } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestoreCollection<T>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const q = query(collection(db, collectionPath), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as T);
        });
        setData(items);
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath]);

  return { data, loading, error };
}
```

**src/components/BabyDashboard.tsx**:
```typescript
import React, { useState } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { useFirestoreCollection } from '../hooks/useFirestore';
import { Baby, VitalSign } from '../types';
import { VitalSignsEntry } from './VitalSignsEntry';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { format } from 'date-fns';

export const BabyDashboard: React.FC = () => {
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);

  const { data: babies, loading } = useFirestoreCollection<Baby>('babies', [
    where('isActive', '==', true)
  ]);

  const { data: vitalSigns } = useFirestoreCollection<VitalSign>(
    selectedBabyId ? `babies/${selectedBabyId}/vitalSigns` : 'babies/none/vitalSigns',
    [orderBy('recordedAt', 'desc')]
  );

  const selectedBaby = babies.find(b => b.id === selectedBabyId);

  if (loading) {
    return <Typography>Loading babies...</Typography>;
  }

  return (
    <Grid container spacing={3}>
      {/* Baby List */}
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Active Babies ({babies.length})
            </Typography>
            <List>
              {babies.map((baby) => (
                <ListItem
                  key={baby.id}
                  button
                  selected={baby.id === selectedBabyId}
                  onClick={() => setSelectedBabyId(baby.id!)}
                >
                  <ListItemText
                    primary={baby.firstName || `Baby ${baby.hospitalNumber}`}
                    secondary={`Bed ${baby.bedNumber || 'N/A'}`}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Baby Details & Vital Signs */}
      <Grid item xs={12} md={8}>
        {selectedBaby ? (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h5">
                  {selectedBaby.firstName || 'Baby'} {selectedBaby.lastName || ''}
                </Typography>
                <Typography color="textSecondary">
                  Hospital Number: {selectedBaby.hospitalNumber}
                </Typography>
                <Typography color="textSecondary">
                  Gestational Age at Birth: {selectedBaby.gestationalAgeAtBirth.weeks}+
                  {selectedBaby.gestationalAgeAtBirth.days} weeks
                </Typography>
                <Typography color="textSecondary">
                  Birth Weight: {selectedBaby.birthWeight}g
                </Typography>
              </CardContent>
            </Card>

            <VitalSignsEntry babyId={selectedBaby.id!} />

            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Vital Signs
                </Typography>
                {vitalSigns.slice(0, 5).map((vs) => (
                  <Box key={vs.id} sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {vs.recordedAt instanceof Date 
                        ? format(vs.recordedAt, 'dd/MM/yyyy HH:mm')
                        : format(vs.recordedAt.toDate(), 'dd/MM/yyyy HH:mm')}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {vs.weight && <Chip label={`Weight: ${vs.weight.value}g`} size="small" sx={{ mr: 1 }} />}
                      {vs.temperature && <Chip label={`Temp: ${vs.temperature.value}°C`} size="small" sx={{ mr: 1 }} />}
                      {vs.heartRate && <Chip label={`HR: ${vs.heartRate.value} bpm`} size="small" sx={{ mr: 1 }} />}
                      {vs.oxygenSaturation && <Chip label={`SpO₂: ${vs.oxygenSaturation.value}%`} size="small" />}
                    </Box>
                  </Box>
                ))}
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent>
              <Typography variant="body1">
                Select a baby from the list to view details and record vital signs
              </Typography>
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  );
};
```

Update **src/App.tsx** to include the dashboard:

```typescript
import React, { useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase';
import { BabyRegistration } from './components/BabyRegistration';
import { BabyDashboard } from './components/BabyDashboard';
import { Box, Container, TextField, Button, Typography, AppBar, Toolbar, Tabs, Tab } from '@mui/material';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return unsubscribe;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (!user) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 8, p: 4, border: '1px solid #ccc', borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            NICU Nurse Portal - Login
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              margin="normal"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              margin="normal"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          </form>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            NICU Nurse Portal
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Dashboard" />
          <Tab label="Register Baby" />
        </Tabs>

        {tab === 0 && <BabyDashboard />}
        {tab === 1 && <BabyRegistration />}
      </Container>
    </>
  );
}

export default App;
```

---

## Week 3-4: Parent Mobile App

### Setup React Native

```bash
# Create React Native project
npx react-native init NICUParentApp --template react-native-template-typescript

cd NICUParentApp

# Install Firebase
npm install @react-native-firebase/app @react-native-firebase/firestore @react-native-firebase/auth @react-native-firebase/storage

# Install navigation
npm install @react-navigation/native @react-navigation/stack
npm install react-native-screens react-native-safe-area-context

# Install UI components
npm install react-native-paper react-native-vector-icons

# For iOS (on Mac only)
cd ios && pod install && cd ..
```

See `QUICK_REFERENCE.md` for complete React Native code examples.

---

## Week 5: Offline + Notifications

### Enable Offline Persistence

```typescript
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});
```

### Set Up Push Notifications

```bash
npm install @react-native-firebase/messaging
```

See `QUICK_REFERENCE.md` for notification code.

---

## Week 6: Testing + Refinement

1. Test with real nurses
2. Gather feedback
3. Fix bugs
4. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy
```

---

## Deployment Checklist

- [ ] Deploy Firestore security rules
- [ ] Deploy Storage security rules
- [ ] Configure Firebase Authentication
- [ ] Set up Cloud Functions (if needed)
- [ ] Deploy web app to Firebase Hosting
- [ ] Submit mobile apps to App Store/Play Store
- [ ] Train NICU staff
- [ ] Monitor usage and errors

---

## Cost Estimate (First Month)

Firebase Blaze Plan:
- Firestore: £0.10
- Storage: £0.05
- Cloud Functions: £0 (free tier)
- Hosting: £0 (free tier)

**Total: ~£0.15/month** for 10-bed NICU during testing

---

## Next Steps

1. **Read**: `QUICK_REFERENCE.md` for code snippets
2. **Build**: Follow this week-by-week plan
3. **Test**: With real NICU staff and parents
4. **Scale**: Deploy to multiple units

Happy coding! 🚀
