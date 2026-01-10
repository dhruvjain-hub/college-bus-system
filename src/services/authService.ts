import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const loginUser = async (email: string, password: string) => {
  const res = await signInWithEmailAndPassword(auth, email, password);
  const snap = await getDoc(doc(db, "users", res.user.uid));
  return snap.data(); // gives role: student / driver / admin
};
