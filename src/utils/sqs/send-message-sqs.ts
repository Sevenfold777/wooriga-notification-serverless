import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { CreateNotificationReqDTO } from 'src/dto/create-notification-req.dto';

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
    });

    await client.send(command);

    return true;
  } catch (e) {
    console.error(e);
    return false;
  }
}
