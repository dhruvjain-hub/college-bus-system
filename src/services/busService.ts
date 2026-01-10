import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export const subscribeBus = (busId: string, cb: any) => {
  return onSnapshot(doc(db, "buses", busId), snap => cb(snap.data()));
};
