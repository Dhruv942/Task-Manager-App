import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // 🔥 Add Firestore

const firebaseConfig = {
  apiKey: "AIzaSyBndPQyl97Pe6MAG5pfxPu4zldWv_GfEzY",
  authDomain: "task-manager-698ba.firebaseapp.com",
  projectId: "task-manager-698ba",
  storageBucket: "task-manager-698ba.firebasestorage.app",
  messagingSenderId: "415159620270",
  appId: "1:415159620270:android:c6fec0565c4975af47d33f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // 🔥 Initialize Firestore

export { auth, db }; // ✅ Export both
