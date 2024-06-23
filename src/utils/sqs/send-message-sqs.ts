import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateNotificationReqDTO } from 'src/dto/create-notification-req.dto';
import { v4 as uuidv4 } from 'uuid';

export async function sendMessageSQS(
  client: SQSClient,
  queueUrl: string,
  reqDtos: CreateNotificationReqDTO[],
): Promise<boolean> {
  try {
    const command = new SendMessageCommand({
      DelaySeconds: 0,
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(reqDtos),
      MessageGroupId: process.env.AWS_SQS_NOTIFICATION_STORE_NAME,
      MessageDeduplicationId: uuidv4(),
    });

    await client.send(command);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
