import MockRedis from "ioredis-mock";
import { NotificationHandler } from "../notification.handler";
import { sendNotification } from "src/utils/fcm/send-notification";
import { NotificationType } from "src/constants/notification-type";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";

describe("notification handler unit test", () => {
  let notificationHandler: NotificationHandler;

  beforeAll(() => {
    notificationHandler = new NotificationHandler(
      new MockRedis(),
      sendNotification
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
