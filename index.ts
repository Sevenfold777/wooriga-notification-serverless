import 'reflect-metadata';
import { Context, APIGatewayProxyResult, SQSEvent } from 'aws-lambda';
import { NotificationHandler } from 'src/notification.handler';
import * as firebaseAdmin from 'firebase-admin';
import * as serviceAccount from './wooriga-firebase-adminsdk.json';
import { Redis } from 'ioredis';
import { sendNotification } from 'src/utils/fcm/send-notification';
import 'dotenv/config';
import { SQSClient } from '@aws-sdk/client-sqs';

export const handler = async (
  event: SQSEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  // firebase
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(
      serviceAccount as firebaseAdmin.ServiceAccount,
    ),
  });

  const notifList = event.Records.map((record) => JSON.parse(record.body));

  const redis = new Redis({
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT),
  });

  const sqsClient = new SQSClient();
  // for credential needed environment
  // const sqsClient = new SQSClient({
  //   credentials: {
  //     accessKeyId: process.env.AWS_ACCESS_KEY,
  //     secretAccessKey: process.env.AWS_SECRET_KEY,
  //   },
  //   region: process.env.DEFAULT_REGION,
  // });

  const notificationHandler = new NotificationHandler(
    redis,
    sendNotification,
    sqsClient,
  );

  // try catch를 타이트하게 구현해서 allSettled는 예외적인 상황이 아니면 fulfillled
  // 예외적인 사유로 실패한 경우는 sqs 배치 항목 실패 보고를 통해 확인
  await Promise.allSettled(
    notifList.map((notif) => notificationHandler.handleNotification(notif)),
  );

  await redis.quit();

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'notifications handled',
    }),
  };
};
