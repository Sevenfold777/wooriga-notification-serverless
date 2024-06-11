import "reflect-metadata";
import { Context, APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { NotificationHandler } from "src/handlers/notification.handler";
import * as firebaseAdmin from "firebase-admin";
import * as serviceAccount from "./wooriga-firebase-adminsdk.json";
import { Redis } from "ioredis";

// firebase
firebaseAdmin.initializeApp({
  credential: firebaseAdmin.credential.cert(
    <firebaseAdmin.ServiceAccount>serviceAccount
  ),
});

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const notifList = event.Records.map((record) => JSON.parse(record.body));

  const redis = new Redis();
  const notificationHandler = new NotificationHandler(redis);

  for (const notif of notifList) {
    notificationHandler.handleNotification(notif);
  }

  await redis.quit();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "notifications handled",
    }),
  };
};
