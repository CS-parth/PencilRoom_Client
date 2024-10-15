import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: 'AIzaSyDVj57bxEkjpkggkzzqwU4A7iAQn7WcOOM',
  authDomain: 'words-run.firebaseapp.com',
  projectId: 'words-run',
  storageBucket: 'words-run.appspot.com',
  messagingSenderId: '482029790499',
  appId: '1:482029790499:web:719fff011aa6aa9f7b5896',
};


const app = initializeApp(firebaseConfig);


const db = getFirestore(app);

const provider = new GoogleAuthProvider();
export { provider, auth, app, db };