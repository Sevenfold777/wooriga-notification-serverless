import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenedParam,
} from "src/constants/letter-notification";
import { LetterNotifTemplates } from "src/templates/letter.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { sendNotification } from "src/utils/firebase-admin";
import { FamilyMember } from "src/utils/redis/family-member.entity";

export class LetterHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;

  constructor(redisFamilyMemberService: RedisFamilyMemberService) {
    this.redisFamilyMemberService = redisFamilyMemberService;
  }

  @CustomValidate(LetterSendParam)
  async letterSend({
    letterId,
    receiverId,
    familyId,
    isTimeCapsule,
  }: LetterSendParam) {
    const receiver = await this.redisFamilyMemberService.getUser(
      familyId,
      receiverId
    );

    const notifPayload = LetterNotifTemplates.LETTER_SEND(
      receiver.userName,
      isTimeCapsule
    );

    await sendNotification({
      tokens: [receiver.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      //   TODO: screen: LETTER_SEND,
      //   param: {letterId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(TimeCapsulesOpenedParam)
  async timeCapsuleOpened({ timaCapsules }: TimeCapsulesOpenedParam) {
    for (const tc of timaCapsules) {
      const { receiverId, senderId, letterId, familyId } = tc;

      const familyMembers = await this.redisFamilyMemberService.getFamily(
        familyId
      );

      let receiver: FamilyMember;
      let sender: FamilyMember;

      familyMembers.forEach((user) => {
        switch (user.userId) {
          case receiverId:
            receiver = user;
            break;
          case senderId:
            sender = user;
            break;
          default:
            break;
        }
      });

      const receiverNotifPayload =
        LetterNotifTemplates.TIMECAPSULE_OPENED.receiverTemplate();
      const senderNotifPayload =
        LetterNotifTemplates.TIMECAPSULE_OPENED.senderTemplate(
          receiver.userName
        );

      await Promise.all([
        sendNotification({
          tokens: [receiver.fcmToken],
          title: receiverNotifPayload.title,
          body: receiverNotifPayload.body,
          // TODO: screen: LETTER_RECEIVED,
          // param: {letterId}
        }),
        sendNotification({
          tokens: [sender.fcmToken],
          title: senderNotifPayload.title,
          body: senderNotifPayload.body,
          // TODO: screen: LETTER_SENT,
          // param: {letterId}
        }),
      ]);

      // 3. TODO: handle save notification
    }
  }

  @CustomValidate(NotifyBirthdayParam)
  async notifyBirthDay({ familyIdsWithUserId }: NotifyBirthdayParam) {
    for (const familyMemberId of familyIdsWithUserId) {
      const { familyId, birthdayUserId } = familyMemberId;

      const familyMembers = await this.redisFamilyMemberService.getFamily(
        familyId
      );

      let birthUser: FamilyMember;
      const restOfFamily = familyMembers.filter((user) => {
        const condition = user.userId !== birthdayUserId;
        if (!condition) {
          birthUser = user;
        }

        return condition;
      });

      if (restOfFamily.length === 0) {
        return;
      }

      const notifPayload = LetterNotifTemplates.NOTIFY_BIRTHDAY(
        birthUser.userName
      );

      await sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: LETTER_SEND,
        // param: {receiverId: birthUserId}
      });

      // 3. TODO: handle save notification
    }
  }
}
