import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { MessageNotifTemplates } from "src/templates/message.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { FamilyMember } from "src/utils/redis/family-member.entity";
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
        //   TODO: screen: MESSAGE_HOME,
        //   param: {}
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
        //   TODO: screen: MESSAGE_HOME,
        //   param: {}
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

      const pushResult = await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: MESSAGE_FAMILY,
        // param: {messageFamId}
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      // 3. TODO: handle save notification
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        restOfFamily.map((member) => ({
          receiverId: member.userId,
          title: notifPayload.title,
          body: notifPayload.body,
          // TODO: screen: MESSAGE_FAMILY,
          // param: {messageFamId}
        }))
      );

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }
}
