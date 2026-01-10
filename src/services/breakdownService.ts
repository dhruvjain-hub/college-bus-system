import { addDoc, collection } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

export const reportBreakdown = async (busId: string, file: File, description: string) => {
  const imgRef = ref(storage, `breakdowns/${Date.now()}.jpg`);
  await uploadBytes(imgRef, file);
  const url = await getDownloadURL(imgRef);

  await addDoc(collection(db, "breakdown_reports"), {
    busId,
    imageUrl: url,
    description,
    status: "open",
    time: new Date()
  });
};
