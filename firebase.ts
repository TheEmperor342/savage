import firebase from "firebase/compat/app";
import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { config } from "dotenv";
config();

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = firebase.initializeApp(firebaseConfig);
export const storage = getStorage();
export const storageRef = ref(storage);

export async function getText(item: string): Promise<string | null> {
  item = `${item}.svg`;
  try {
    const images: string[] = [];
    await (
      await listAll(storageRef)
    ).items.forEach((item_, index) => {
      images.push(item_.name);
    });
    if (!images.includes(item)) return null;

    const url = await getDownloadURL(ref(storage, item));
    const blob = await (await fetch(url)).blob();
    return blob.text();
  } catch (e) {
    return null;
  }
}
