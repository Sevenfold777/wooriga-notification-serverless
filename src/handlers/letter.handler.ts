import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenParam,
} from "src/constants/letter-notification";
import { LetterNotifTemplates } from "src/templates/letter.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { FamilyMember } from "src/utils/redis/family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";

export class LetterHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;
  private sendNotification: (
    args: SendNotifcationParamType
  ) => Promise<boolean>;

  constructor(
    redisFamilyMemberService: RedisFamilyMemberService,
    sendNotification: (args: SendNotifcationParamType) => Promise<boolean>
  ) {
    this.redisFamilyMemberService = redisFamilyMemberService;
    this.sendNotification = sendNotification;
  }

  @CustomValidate(LetterSendParam)
  async letterSend({
    letterId,
    receiverId,
    familyId,
    isTimeCapsule,
  }: LetterSendParam): Promise<HandlerReturnType> {
    try {
      const receiver = await this.redisFamilyMemberService.getUser(
        familyId,
        receiverId
      );

      const notifPayload = LetterNotifTemplates.LETTER_SEND(
        receiver.userName,
        isTimeCapsule
      );

      await this.sendNotification({
        tokens: [receiver.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        //   TODO: screen: LETTER_SEND,
        //   param: {letterId}
      });

      // 3. TODO: handle save notification
      return { result: true, usersNotified: [receiver] };
    } catch (error) {
      console.error(error.message);
      return { result: false };
    }
  }

  @CustomValidate(TimeCapsulesOpenParam)
  async timeCapsuleOpen({
    timaCapsules,
  }: TimeCapsulesOpenParam): Promise<HandlerReturnType> {
    try {
      const usersNotified: FamilyMember[] = [];

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
          LetterNotifTemplates.TIMECAPSULE_OPEN.receiverTemplate();
        const senderNotifPayload =
          LetterNotifTemplates.TIMECAPSULE_OPEN.senderTemplate(
            receiver.userName
          );

        await Promise.all([
          this.sendNotification({
            tokens: [receiver.fcmToken],
            title: receiverNotifPayload.title,
            body: receiverNotifPayload.body,
            // TODO: screen: LETTER_RECEIVED,
            // param: {letterId}
          }),
          this.sendNotification({
            tokens: [sender.fcmToken],
            title: senderNotifPayload.title,
            body: senderNotifPayload.body,
            // TODO: screen: LETTER_SENT,
            // param: {letterId}
          }),
        ]);

        // 3. TODO: handle save notification

        // for test, 운영 상에는 관여하지 않음
        usersNotified.push(receiver);
        usersNotified.push(sender);
      }
      return { result: true, usersNotified };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(NotifyBirthdayParam)
  async notifyBirthDay({
    familyIdsWithBirthdayUserId,
  }: NotifyBirthdayParam): Promise<HandlerReturnType> {
    try {
      const usersNotified: FamilyMember[] = [];

      for (const familyMemberId of familyIdsWithBirthdayUserId) {
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

        await this.sendNotification({
          tokens: restOfFamily.map((res) => res.fcmToken),
          title: notifPayload.title,
          body: notifPayload.body,
          // TODO: screen: LETTER_SEND,
          // param: {receiverId: birthUserId}
        });

        // 3. TODO: handle save notification

        usersNotified.push(...restOfFamily);
      }
      return { result: true, usersNotified };
    } catch (error) {
      return { result: false };
    }
  }
}
