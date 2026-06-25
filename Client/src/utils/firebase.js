
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "yeinterview.firebaseapp.com",
  projectId: "yeinterview",
  storageBucket: "yeinterview.firebasestorage.app",
  messagingSenderId: "333998958191",
  appId: "1:333998958191:web:ddd3d50790c29c919c4f9a"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider();

export { auth, provider };