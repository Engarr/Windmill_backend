import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.VITE_API_KEY,
  authDomain: process.env.VITE_AUTH_DOMAIN,
  projectId: process.env.VITE_PROJECTID,
  storageBucket: 'windmill-a70dd.appspot.com',
  messagingSenderId: process.env.VITE_MESSAGINGSENDERID,
  appId: process.env.VITE_APPID,
  measurementId: process.env.VITE_MEASUREMENTID,
};

const app = initializeApp(firebaseConfig);

export const storage = getStorage(app);
