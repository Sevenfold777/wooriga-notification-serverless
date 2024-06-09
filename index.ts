import "reflect-metadata";
import { Context, APIGatewayProxyResult, SQSEvent } from "aws-lambda";
import { NotificationHandler } from "src/handlers/notification.handler";
import * as firebaseAdmin from "firebase-admin";
import * as serviceAccount from "./wooriga-firebase-adminsdk.json";

export const handler = async (
  event: SQSEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      <firebaseAdmin.ServiceAccount>serviceAccount
    ),
  });

  const notifList = event.Records.map((record) => JSON.parse(record.body));

  const notificationHandler = new NotificationHandler();

  for (const notif of notifList) {
    notificationHandler.handleNotification(notif);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "hello world",
    }),
  };
};
