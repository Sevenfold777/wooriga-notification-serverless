import { messaging as FCM } from "firebase-admin";

export class FirebaseAdmin {
  constructor() {}

  async sendNotification(tokens: string[]) {
    await FCM().sendEachForMulticast({
      tokens: [],
    });
  }
}
