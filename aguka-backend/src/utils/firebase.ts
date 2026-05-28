import admin from "firebase-admin";
import { config } from "../config/index.js";
import { logger } from "./logger.js";

const firebaseConfig = {
  projectId: config.firebase.projectId,
  clientEmail: config.firebase.clientEmail,
  privateKey: config.firebase.privateKey?.replace(/\\n/g, "\n"),
};

if (
  firebaseConfig.projectId &&
  firebaseConfig.clientEmail &&
  firebaseConfig.privateKey
) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as any),
  });
  logger.info("✅ Firebase Admin initialized");
} else {
  logger.warn("⚠️ Firebase Admin not initialized: Missing configuration");
}

export const firebaseAdmin = admin;
