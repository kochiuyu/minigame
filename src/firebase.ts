import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const app = initializeApp({
  apiKey: 'AIzaSyDpZy8gOHPWCyLGYWgUzeTKHHPffywuPUI',
  authDomain: 'minigame-c8e7d.firebaseapp.com',
  databaseURL: 'https://minigame-c8e7d-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'minigame-c8e7d',
  messagingSenderId: '161192517254',
  appId: '1:161192517254:web:015d8f24fdcf1e21eb7b07',
});

export const auth = getAuth(app);
export const db = getDatabase(app);

