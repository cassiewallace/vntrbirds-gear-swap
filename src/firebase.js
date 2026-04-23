import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  projectId: 'vntrbirds-gear-swap',
  appId: '1:117197210955:web:d9798074ef173af7fe54ce',
  storageBucket: 'vntrbirds-gear-swap.firebasestorage.app',
  apiKey: 'AIzaSyAOKq4pqFEkBmdkm0qZ3aqpriWo1CP8Wbw',
  authDomain: 'vntrbirds-gear-swap.firebaseapp.com',
  messagingSenderId: '117197210955',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
