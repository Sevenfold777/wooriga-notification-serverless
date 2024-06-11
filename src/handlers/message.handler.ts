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
    const users = await this.redisFamilyMemberService.getFamilyMembersByIds(
      familyIds
    );

    const notifPayload = MessageNotifTemplates.MESSAGE_TODAY();

    await sendNotification({
      tokens: users.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   TODO: screen: MESSAGE_HOME,
      //   param: {}
    });
  }

  @CustomValidate(MessageBirthdayParam)
  async messageBirthday({ familyIds }: MessageBirthdayParam) {
    const users = await this.redisFamilyMemberService.getFamilyMembersByIds(
      familyIds
    );

    const notifPayload = MessageNotifTemplates.MESSAGE_BIRTHDAY();

    await sendNotification({
      tokens: users.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   TODO: screen: MESSAGE_HOME,
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
    const familyMembers = await this.redisFamilyMemberService.getFamily(
      familyId
    );

    let author: FamilyMember;
    const restOfFamily = familyMembers.filter((user) => {
      const condition = user.userId !== authorId;
      if (!condition) {
        author = user;
      }

      return condition;
    });

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
      // TODO: screen: MESSAGE_FAMILY,
      // param: {messageFamId}
    });

    // 3. TODO: handle save notification
  }
}
