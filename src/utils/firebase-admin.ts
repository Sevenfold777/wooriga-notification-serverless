import {
  messaging as FCM,
  initializeApp,
  credential,
  ServiceAccount,
} from "firebase-admin";

export class FirebaseAdmin {
  constructor(serviceAccountJSON: any) {
    initializeApp({
      credential: credential.cert(<ServiceAccount>serviceAccountJSON),
    });
  }

  async sendNotification(tokens: string[]) {
    await FCM().sendEachForMulticast({
      tokens: [],
    });
  }
}
