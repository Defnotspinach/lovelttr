import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB8k4A7ln2bOjC-m3IWE7pLfHYRTaAh_HA",
  authDomain: "justbecause-96bdc.firebaseapp.com",
  projectId: "justbecause-96bdc",
  storageBucket: "justbecause-96bdc.firebasestorage.app",
  messagingSenderId: "363891303226",
  appId: "1:363891303226:web:9729cfddae03363ffb6603",
  measurementId: "G-5HFSZGBZQY"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
