import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { MessageNotifTemplates } from "src/templates/message.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { sendNotification } from "src/utils/firebase-admin";
import { FamilyMember } from "src/utils/redis/family-member.entity";

export class MessageHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;

  constructor(redisFamilyMemberService: RedisFamilyMemberService) {
    this.redisFamilyMemberService = redisFamilyMemberService;
  }

  @CustomValidate(MessageTodayParam)
  async messageToday({ familyIds }: MessageTodayParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];

    // 2. FCM request with info

    const notifPayload = MessageNotifTemplates.MESSAGE_TODAY();

    await sendNotification({
      tokens: tempResult.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   screen: MESSAGE_HOME,
      //   param: {}
    });
  }

  @CustomValidate(MessageBirthdayParam)
  async messageBirthday({ familyIds }: MessageBirthdayParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];

    // 2. FCM request with info

    const notifPayload = MessageNotifTemplates.MESSAGE_BIRTHDAY();

    await sendNotification({
      tokens: tempResult.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   screen: MESSAGE_HOME,
      //   param: {}
    });
  }

  @CustomValidate(CommentMessageParam)
  async commentMessage({
    messageFamId,
    familyId,
    authorId,
    commentPreview,
  }: CommentMessageParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];
    let author: FamilyMember;
    const restOfFamily = tempResult.filter((user) => {
      const condition = user.userId !== authorId;
      if (!condition) {
        author = user;
      }

      return condition;
    });

    // 2. FCM request with info
    if (restOfFamily.length === 0) {
      return;
    }

    const notifPayload = MessageNotifTemplates.COMMENT_MESSAGE(
      author.userName,
      commentPreview
    );

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      // screen: MESSAGE_FAMILY,
      // param: {messageFamId}
    });

    // 3. TODO: handle save notification
  }
}
