# Quick Reference - Code Snippets

This is your copy-paste cheat sheet for common Firebase operations in the NICU Care Platform.

## Project Links

**GitHub Repository:** https://github.com/penguingoober14/nicu-care-platform

**Firebase Project ID:** `nicu-app-9e772`
**Firebase Console:** https://console.firebase.google.com/project/nicu-app-9e772/overview

---

## Table of Contents

1. [Firebase Setup](#firebase-setup)
2. [Authentication](#authentication)
3. [Firestore Operations](#firestore-operations)
4. [File Uploads](#file-uploads)
5. [Real-time Listeners](#real-time-listeners)
6. [React Hooks](#react-hooks)
7. [React Native Examples](#react-native-examples)
8. [Cloud Functions](#cloud-functions)
9. [Security Rules](#security-rules)

---

## Firebase Setup

### Initialize Firebase (React Web)

```typescript
// src/config/firebase.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

### Initialize Firebase (React Native)

```typescript
// src/config/firebase.ts
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

export const db = firestore();
export const authService = auth();
export const storageService = storage();
```

---

## Authentication

### Sign In

```typescript
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebase';

const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('Signed in:', userCredential.user.email);
  } catch (error) {
    console.error('Sign in error:', error);
  }
};
```

### Sign Out

```typescript
import { signOut } from 'firebase/auth';
import { auth } from './config/firebase';

const logout = async () => {
  await signOut(auth);
};
```

### Listen for Auth State

```typescript
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './config/firebase';

onAuthStateChanged(auth, (user: User | null) => {
  if (user) {
    console.log('User signed in:', user.email);
  } else {
    console.log('User signed out');
  }
});
```

### Create User

```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from './config/firebase';

const createUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log('User created:', userCredential.user.uid);
  } catch (error) {
    console.error('Error creating user:', error);
  }
};
```

---

## Firestore Operations

### Add Document

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config/firebase';

const addBaby = async (babyData: any) => {
  const docRef = await addDoc(collection(db, 'babies'), {
    ...babyData,
    createdAt: Timestamp.now()
  });
  console.log('Baby added with ID:', docRef.id);
  return docRef.id;
};
```

### Add Document to Subcollection

```typescript
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from './config/firebase';

const addVitalSigns = async (babyId: string, vitalSignsData: any) => {
  const docRef = await addDoc(
    collection(db, 'babies', babyId, 'vitalSigns'),
    {
      ...vitalSignsData,
      recordedAt: Timestamp.now()
    }
  );
  return docRef.id;
};
```

### Get Document

```typescript
import { doc, getDoc } from 'firebase/firestore';
import { db } from './config/firebase';

const getBaby = async (babyId: string) => {
  const docRef = doc(db, 'babies', babyId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    console.log('Baby data:', docSnap.data());
    return { id: docSnap.id, ...docSnap.data() };
  } else {
    console.log('No such document!');
    return null;
  }
};
```

### Get Collection

```typescript
import { collection, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';

const getAllBabies = async () => {
  const querySnapshot = await getDocs(collection(db, 'babies'));
  const babies: any[] = [];
  
  querySnapshot.forEach((doc) => {
    babies.push({ id: doc.id, ...doc.data() });
  });
  
  return babies;
};
```

### Query Collection

```typescript
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './config/firebase';

const getActiveBabies = async () => {
  const q = query(
    collection(db, 'babies'),
    where('isActive', '==', true),
    orderBy('admissionDate', 'desc'),
    limit(10)
  );
  
  const querySnapshot = await getDocs(q);
  const babies: any[] = [];
  
  querySnapshot.forEach((doc) => {
    babies.push({ id: doc.id, ...doc.data() });
  });
  
  return babies;
};
```

### Update Document

```typescript
import { doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from './config/firebase';

const updateBaby = async (babyId: string, updates: any) => {
  const docRef = doc(db, 'babies', babyId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: Timestamp.now()
  });
};
```

### Delete Document

```typescript
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from './config/firebase';

const deleteBaby = async (babyId: string) => {
  const docRef = doc(db, 'babies', babyId);
  await deleteDoc(docRef);
};
```

### Soft Delete (Recommended)

```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config/firebase';

const softDeleteBaby = async (babyId: string) => {
  const docRef = doc(db, 'babies', babyId);
  await updateDoc(docRef, {
    isActive: false,
    deletedAt: Timestamp.now()
  });
};
```

---

## File Uploads

### Upload Photo

```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';

const uploadPhoto = async (babyId: string, file: File) => {
  const photoId = Date.now().toString();
  const storageRef = ref(storage, `photos/${babyId}/${photoId}`);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  return url;
};
```

### Upload with Progress (React)

```typescript
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';

const uploadPhotoWithProgress = (
  babyId: string,
  file: File,
  onProgress: (progress: number) => void
) => {
  return new Promise<string>((resolve, reject) => {
    const photoId = Date.now().toString();
    const storageRef = ref(storage, `photos/${babyId}/${photoId}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress(progress);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(url);
      }
    );
  });
};
```

### Download File

```typescript
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from './config/firebase';

const getPhotoUrl = async (photoPath: string) => {
  const storageRef = ref(storage, photoPath);
  const url = await getDownloadURL(storageRef);
  return url;
};
```

---

## Real-time Listeners

### Listen to Document

```typescript
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';

const listenToBaby = (babyId: string, callback: (baby: any) => void) => {
  const docRef = doc(db, 'babies', babyId);
  
  const unsubscribe = onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() });
    }
  });
  
  // Call unsubscribe() when you want to stop listening
  return unsubscribe;
};
```

### Listen to Collection

```typescript
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';

const listenToActiveBabies = (callback: (babies: any[]) => void) => {
  const q = query(
    collection(db, 'babies'),
    where('isActive', '==', true)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const babies: any[] = [];
    snapshot.forEach((doc) => {
      babies.push({ id: doc.id, ...doc.data() });
    });
    callback(babies);
  });
  
  return unsubscribe;
};
```

### Listen to Subcollection

```typescript
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';

const listenToRecentVitalSigns = (
  babyId: string,
  callback: (vitalSigns: any[]) => void
) => {
  const q = query(
    collection(db, 'babies', babyId, 'vitalSigns'),
    orderBy('recordedAt', 'desc'),
    limit(10)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const vitalSigns: any[] = [];
    snapshot.forEach((doc) => {
      vitalSigns.push({ id: doc.id, ...doc.data() });
    });
    callback(vitalSigns);
  });
  
  return unsubscribe;
};
```

---

## React Hooks

### useAuth Hook

```typescript
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
```

### useFirestoreDoc Hook

```typescript
import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './config/firebase';

export const useFirestoreDoc = <T,>(path: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const docRef = doc(db, path);
    
    const unsubscribe = onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          setData({ id: doc.id, ...doc.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [path]);

  return { data, loading, error };
};
```

### useFirestoreCollection Hook

```typescript
import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot,
  QueryConstraint 
} from 'firebase/firestore';
import { db } from './config/firebase';

export const useFirestoreCollection = <T,>(
  collectionPath: string,
  constraints: QueryConstraint[] = []
) => {
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
  }, [collectionPath, constraints]);

  return { data, loading, error };
};
```

### Usage Example

```typescript
import { useFirestoreCollection } from './hooks/useFirestore';
import { where, orderBy } from 'firebase/firestore';

const BabyList = () => {
  const { data: babies, loading, error } = useFirestoreCollection<Baby>(
    'babies',
    [where('isActive', '==', true), orderBy('admissionDate', 'desc')]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {babies.map(baby => (
        <li key={baby.id}>{baby.firstName} {baby.lastName}</li>
      ))}
    </ul>
  );
};
```

---

## React Native Examples

### Parent Dashboard Screen

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Paragraph } from 'react-native-paper';
import firestore from '@react-native-firebase/firestore';

export const ParentDashboard = ({ babyId }: { babyId: string }) => {
  const [baby, setBaby] = useState<any>(null);
  const [vitalSigns, setVitalSigns] = useState<any[]>([]);

  useEffect(() => {
    // Listen to baby data
    const unsubscribeBaby = firestore()
      .collection('babies')
      .doc(babyId)
      .onSnapshot((doc) => {
        if (doc.exists) {
          setBaby({ id: doc.id, ...doc.data() });
        }
      });

    // Listen to recent vital signs
    const unsubscribeVitals = firestore()
      .collection('babies')
      .doc(babyId)
      .collection('vitalSigns')
      .orderBy('recordedAt', 'desc')
      .limit(5)
      .onSnapshot((snapshot) => {
        const vitals: any[] = [];
        snapshot.forEach((doc) => {
          vitals.push({ id: doc.id, ...doc.data() });
        });
        setVitalSigns(vitals);
      });

    return () => {
      unsubscribeBaby();
      unsubscribeVitals();
    };
  }, [babyId]);

  if (!baby) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>{baby.firstName || 'Your Baby'}</Title>
          <Paragraph>Hospital Number: {baby.hospitalNumber}</Paragraph>
          <Paragraph>
            Born: {baby.dateOfBirth?.toDate().toLocaleDateString()}
          </Paragraph>
          <Paragraph>
            Gestational Age: {baby.gestationalAgeAtBirth.weeks}+
            {baby.gestationalAgeAtBirth.days} weeks
          </Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title>Latest Vital Signs</Title>
          {vitalSigns.map((vs) => (
            <View key={vs.id} style={styles.vitalSign}>
              <Text>
                {vs.recordedAt?.toDate().toLocaleString()}
              </Text>
              {vs.weight && <Text>Weight: {vs.weight.value}g</Text>}
              {vs.temperature && <Text>Temp: {vs.temperature.value}°C</Text>}
              {vs.heartRate && <Text>HR: {vs.heartRate.value} bpm</Text>}
              {vs.oxygenSaturation && <Text>SpO₂: {vs.oxygenSaturation.value}%</Text>}
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  vitalSign: {
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
});
```

### Photo Upload (React Native)

```typescript
import React from 'react';
import { Button } from 'react-native-paper';
import { launchImageLibrary } from 'react-native-image-picker';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';

export const PhotoUploader = ({ babyId }: { babyId: string }) => {
  const uploadPhoto = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
    });

    if (result.assets && result.assets[0].uri) {
      const photoId = Date.now().toString();
      const reference = storage().ref(`photos/${babyId}/${photoId}`);

      // Upload file
      await reference.putFile(result.assets[0].uri);

      // Get download URL
      const url = await reference.getDownloadURL();

      // Save metadata to Firestore
      await firestore()
        .collection('babies')
        .doc(babyId)
        .collection('photos')
        .add({
          imageUrl: url,
          uploadedAt: firestore.FieldValue.serverTimestamp(),
          caption: '',
        });

      alert('Photo uploaded successfully!');
    }
  };

  return <Button onPress={uploadPhoto}>Upload Photo</Button>;
};
```

### Push Notifications Setup (React Native)

```typescript
import messaging from '@react-native-firebase/messaging';
import { useEffect } from 'react';

export const usePushNotifications = () => {
  useEffect(() => {
    // Request permission (iOS)
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Notification permission granted');
        
        // Get FCM token
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Save token to Firestore (associate with user)
        // ...
      }
    };

    requestPermission();

    // Handle foreground notifications
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      console.log('Foreground notification:', remoteMessage);
      // Display notification to user
    });

    return unsubscribe;
  }, []);
};
```

---

## Cloud Functions

### Alert System (TypeScript)

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const checkVitalSignsAlerts = functions.firestore
  .document('babies/{babyId}/vitalSigns/{vitalSignId}')
  .onCreate(async (snap, context) => {
    const vitalSign = snap.data();
    const alerts: string[] = [];

    // Heart rate check
    if (vitalSign.heartRate) {
      if (vitalSign.heartRate.value < 100 || vitalSign.heartRate.value > 180) {
        alerts.push('Heart rate outside normal range');
      }
    }

    // Oxygen saturation check
    if (vitalSign.oxygenSaturation && vitalSign.oxygenSaturation.value < 90) {
      alerts.push('Low oxygen saturation');
    }

    // Temperature check
    if (vitalSign.temperature) {
      if (vitalSign.temperature.value < 36.5 || vitalSign.temperature.value > 37.5) {
        alerts.push('Temperature outside normal range');
      }
    }

    if (alerts.length > 0) {
      // Update document with alerts
      await snap.ref.update({ alerts });

      // Send notification to nurse
      const babyRef = admin.firestore().doc(`babies/${context.params.babyId}`);
      const baby = (await babyRef.get()).data();

      if (baby?.primaryNurseId) {
        const nurseRef = admin.firestore().doc(`users/${baby.primaryNurseId}`);
        const nurse = (await nurseRef.get()).data();

        if (nurse?.fcmToken) {
          await admin.messaging().send({
            token: nurse.fcmToken,
            notification: {
              title: `Alert: ${baby.firstName || 'Baby'} ${baby.lastName || ''}`,
              body: alerts.join(', '),
            },
          });
        }
      }
    }
  });
```

### Daily Parent Update

```typescript
export const sendDailyUpdates = functions.pubsub
  .schedule('every day 18:00')
  .timeZone('Europe/London')
  .onRun(async (context) => {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Get all active babies
    const babiesSnapshot = await admin.firestore()
      .collection('babies')
      .where('isActive', '==', true)
      .get();

    for (const babyDoc of babiesSnapshot.docs) {
      const baby = babyDoc.data();

      // Get today's vital signs
      const vitalSignsSnapshot = await babyDoc.ref
        .collection('vitalSigns')
        .where('recordedAt', '>=', startOfDay)
        .orderBy('recordedAt', 'desc')
        .get();

      if (vitalSignsSnapshot.empty) continue;

      const latestVitals = vitalSignsSnapshot.docs[0].data();

      // Send notification to each parent
      for (const parentId of baby.parentUserIds || []) {
        const parentRef = admin.firestore().doc(`users/${parentId}`);
        const parent = (await parentRef.get()).data();

        if (parent?.fcmToken) {
          await admin.messaging().send({
            token: parent.fcmToken,
            notification: {
              title: 'Daily Update',
              body: `${baby.firstName || 'Your baby'} is doing well. Latest weight: ${latestVitals.weight?.value || 'N/A'}g`,
            },
          });
        }
      }
    }
  });
```

---

## Security Rules

### Deploy Rules

```bash
# firestore.rules
firebase deploy --only firestore:rules

# storage.rules
firebase deploy --only storage
```

### Test Rules

```bash
firebase emulators:start --only firestore
```

---

## Common Patterns

### Pagination

```typescript
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

let lastVisible: any = null;

const loadMore = async () => {
  let q = query(
    collection(db, 'babies', babyId, 'vitalSigns'),
    orderBy('recordedAt', 'desc'),
    limit(20)
  );

  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }

  const snapshot = await getDocs(q);
  lastVisible = snapshot.docs[snapshot.docs.length - 1];

  const items: any[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });

  return items;
};
```

### Batch Writes

```typescript
import { writeBatch, doc } from 'firebase/firestore';

const batchUpdate = async () => {
  const batch = writeBatch(db);

  // Update multiple documents
  batch.update(doc(db, 'babies', 'baby1'), { isActive: false });
  batch.update(doc(db, 'babies', 'baby2'), { isActive: false });
  batch.update(doc(db, 'babies', 'baby3'), { isActive: false });

  await batch.commit();
};
```

### Transactions

```typescript
import { runTransaction, doc } from 'firebase/firestore';

const transferBaby = async (babyId: string, newUnitId: string) => {
  await runTransaction(db, async (transaction) => {
    const babyRef = doc(db, 'babies', babyId);
    const babyDoc = await transaction.get(babyRef);

    if (!babyDoc.exists()) {
      throw new Error('Baby does not exist');
    }

    transaction.update(babyRef, {
      unitId: newUnitId,
      updatedAt: Timestamp.now(),
    });
  });
};
```

---

## Debugging Tips

### Enable Firestore Logging

```typescript
import { setLogLevel } from 'firebase/firestore';

setLogLevel('debug'); // 'debug' | 'error' | 'silent'
```

### Check Security Rules

```typescript
// In browser console
firebase.auth().currentUser.getIdTokenResult().then(token => {
  console.log('Claims:', token.claims);
});
```

---

This quick reference covers 90% of what you'll need. For more details, see the [Firebase documentation](https://firebase.google.com/docs).
