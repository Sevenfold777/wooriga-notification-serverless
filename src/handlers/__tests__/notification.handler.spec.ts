import MockRedis from "ioredis-mock";
import { NotificationHandler } from "../notification.handler";
import { sendNotification } from "src/utils/fcm/send-notification";
import { NotificationType } from "src/constants/notification-type";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";

describe("notification handler unit test", () => {
  let notificationHandler: NotificationHandler;

  beforeAll(() => {
    // mock sqs client
    const sqsClient = new SQSClient();
    const mockSQSClient = mockClient(sqsClient);
    mockSQSClient.on(SendMessageCommand).resolves({});

    notificationHandler = new NotificationHandler(
      new MockRedis(),
      sendNotification,
      sqsClient
    );
  });

  it("non existing type 에러", async () => {
    // given
    const invalidNotifcation = {
      type: "invalid type",
      param: {},
    } as unknown as SqsNotificationReqDTO<NotificationType>;

    // when
    notificationHandler.handleNotification(invalidNotifcation);

    // then --> TODO
  });

  it("type과 맞지 않는 param 에러", async () => {
    // given
    const invalidNotifcation = {
      type: NotificationType.COMMENT_MESSAGE,
      param: { titlePreview: "invalid param" },
    } as SqsNotificationReqDTO<NotificationType>;

    // when
    notificationHandler.handleNotification(invalidNotifcation);

    // then --> TODO
  });
});
