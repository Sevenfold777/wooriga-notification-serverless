import { SQSRecord } from 'aws-lambda';
import { NotificationType } from 'src/constants/notification-type';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';

export function mockEventRecordGenerator(
  body: SqsNotificationReqDTO<NotificationType>,
): SQSRecord {
  '{"type":"EMOTION_CHOSEN","param":{"familyId":3, "userId": 4},"save":false}';

  return {
    messageId: '19dd0b57-b21e-4ac1-bd88-01bbb068cb78',
    receiptHandle: 'MessageReceiptHandle',
    body: JSON.stringify(body),
    attributes: {
      ApproximateReceiveCount: '1',
      SentTimestamp: '1523232000000',
      SenderId: '123456789012',
      ApproximateFirstReceiveTimestamp: '1523232000001',
    },
    messageAttributes: {},
    md5OfBody: '{{{md5_of_body}}}',
    eventSource: 'aws:sqs',
    eventSourceARN: 'arn:aws:sqs:us-east-1:123456789012:MyQueue',
    awsRegion: 'us-east-1',
  };
}
