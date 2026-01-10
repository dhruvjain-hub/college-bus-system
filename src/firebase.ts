import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAtSJWHsEWjqqkjzlIfwqZ68BBELhpBKlI",
  authDomain: "college-bus-tracker-770bb.firebaseapp.com",
  projectId: "college-bus-tracker-770bb",
  storageBucket: "college-bus-tracker-770bb.firebasestorage.app",
  messagingSenderId: "47573011226",
  appId: "1:47573011226:web:2bb61a1bf6855f98adfaa3",
  measurementId: "G-XL4XDYLF9S"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
