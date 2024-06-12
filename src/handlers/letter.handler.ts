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
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessageSQS } from "src/utils/sqs/send-message-sqs";

export class LetterHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;
  private sendNotification: (
    args: SendNotifcationParamType
  ) => Promise<boolean>;
  private sqsClient: SQSClient;
  private readonly AWS_SQS_NOTIFICATION_STORE_URL =
    process.env.AWS_SQS_NOTIFICATION_STORE_URL;

  constructor(
    redisFamilyMemberService: RedisFamilyMemberService,
    sendNotification: (args: SendNotifcationParamType) => Promise<boolean>,
    sqsClient: SQSClient
  ) {
    this.redisFamilyMemberService = redisFamilyMemberService;
    this.sendNotification = sendNotification;
    this.sqsClient = sqsClient;
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

      const pushResult = await this.sendNotification({
        tokens: [receiver.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        //   TODO: screen: LETTER_RECEIVED,
        //   param: {letterId}
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      // 3. TODO: handle save notification
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        [
          {
            receiverId: receiverId,
            title: notifPayload.title,
            body: notifPayload.body,
            // TODO: screen: LETTER_RECEIVED,
            // param: {letterId}
          },
        ]
      );

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

        const pushResult = await Promise.all([
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

        if (!pushResult[0]) {
          throw new Error("Push notification send failed.");
        }

        if (!pushResult[1]) {
          throw new Error("Push notification send failed.");
        }

        // 3. handle save notification
        await sendMessageSQS(
          this.sqsClient,
          this.AWS_SQS_NOTIFICATION_STORE_URL,
          [
            {
              receiverId: receiverId,
              title: receiverNotifPayload.title,
              body: receiverNotifPayload.body,
              // TODO: screen: LETTER_RECEIVED,
              // param: {letterId}
            },
            {
              receiverId: senderId,
              title: senderNotifPayload.title,
              body: senderNotifPayload.body,
              // TODO: screen: LETTER_RECEIVED,
              // param: {letterId}
            },
          ]
        );

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
      const pushNotifReqs: Promise<boolean>[] = [];

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

        pushNotifReqs.push(
          this.sendNotification({
            tokens: restOfFamily.map((res) => res.fcmToken),
            title: notifPayload.title,
            body: notifPayload.body,
            // TODO: screen: LETTER_SEND,
            // param: {receiverId: birthUserId}
          })
        );

        usersNotified.push(...restOfFamily);
      }

      const results = await Promise.all(pushNotifReqs);

      for (const result of results) {
        if (!result) {
          throw new Error("Push notification send failed.");
        }
      }

      return { result: true, usersNotified };
    } catch (error) {
      return { result: false };
    }
  }
}
