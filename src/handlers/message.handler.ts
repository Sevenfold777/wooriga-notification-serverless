import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { MessageNotifTemplates } from "src/templates/message.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessageSQS } from "src/utils/sqs/send-message-sqs";

export class MessageHandler {
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

  @CustomValidate(MessageTodayParam)
  async messageToday({
    familyIds,
  }: MessageTodayParam): Promise<HandlerReturnType> {
    try {
      const users = await this.redisFamilyMemberService.getFamilyMembersByIds(
        familyIds
      );

      const notifPayload = MessageNotifTemplates.MESSAGE_TODAY();

      const pushResult = await this.sendNotification({
        tokens: users.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        screen: "MessageHome",
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      return { result: true, usersNotified: users };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(MessageBirthdayParam)
  async messageBirthday({
    familyIds,
  }: MessageBirthdayParam): Promise<HandlerReturnType> {
    try {
      const users = await this.redisFamilyMemberService.getFamilyMembersByIds(
        familyIds
      );

      const notifPayload = MessageNotifTemplates.MESSAGE_BIRTHDAY();

      const pushResult = await this.sendNotification({
        tokens: users.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        screen: "MessageHome",
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      return { result: true, usersNotified: users };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(CommentMessageParam)
  async commentMessage({
    messageFamId,
    familyId,
    authorId,
    commentPreview,
  }: CommentMessageParam): Promise<HandlerReturnType> {
    try {
      const familyMembers = await this.redisFamilyMemberService.getFamily(
        familyId
      );

      let author: RedisFamilyMember;
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

      const notifArgs = {
        title: notifPayload.title,
        body: notifPayload.body,
        screen: "MessageFamily",
        param: { messageId: messageFamId },
      };

      const pushResult = await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        ...notifArgs,
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      // 3. handle notification save
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        restOfFamily.map((member) => ({
          receiverId: member.userId,
          ...notifArgs,
        }))
      );

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }
}
