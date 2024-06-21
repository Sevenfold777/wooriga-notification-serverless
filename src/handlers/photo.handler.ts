import {
  CommentPhotoParam,
  PhotoCreateParam,
} from "src/constants/photo-notification";
import { PhotoNotifTemplates } from "src/templates/photo.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessageSQS } from "src/utils/sqs/send-message-sqs";

export class PhotoHandler {
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

  @CustomValidate(PhotoCreateParam)
  async photoCreate({
    photoId,
    titlePreview,
    authorId,
    familyId,
  }: PhotoCreateParam): Promise<HandlerReturnType> {
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

      const authorNotifPayload =
        PhotoNotifTemplates.PHOTO_CREATE.authorTemplate();

      const othersNotifPayload =
        PhotoNotifTemplates.PHOTO_CREATE.othersTemplate(
          author.userName,
          titlePreview
        );

      const pushResult = await Promise.all([
        this.sendNotification({
          tokens: [author.fcmToken],
          title: authorNotifPayload.title,
          body: authorNotifPayload.body,
          screen: "Photo",
          param: { photoId },
        }),
        this.sendNotification({
          tokens: restOfFamily.map((res) => res.fcmToken),
          title: othersNotifPayload.title,
          body: othersNotifPayload.body,
          screen: "Photo",
          param: { photoId },
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
        restOfFamily.map((member) => ({
          receiverId: member.userId,
          title: othersNotifPayload.title,
          body: othersNotifPayload.body,
          screen: "Photo",
          param: { photoId },
        })) // 사진 게시자에게는 푸시 알림만 전송 (저장 X)
      );

      return { result: true, usersNotified: [author, ...restOfFamily] };
    } catch (e) {
      console.error(e);
      return { result: false };
    }
  }

  @CustomValidate(CommentPhotoParam)
  async commentPhoto({
    photoId,
    familyId,
    authorId,
    commentPreview,
  }: CommentPhotoParam): Promise<HandlerReturnType> {
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

      const notifPayload = PhotoNotifTemplates.COMMENT_PHOTO(
        author.userName,
        commentPreview
      );

      const notifArgs = {
        title: notifPayload.title,
        body: notifPayload.body,
        screen: "Photo",
        param: { photoId },
      };

      const pushResult = await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        ...notifArgs,
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      // 3. handle save notification
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        restOfFamily.map((member) => ({
          receiverId: member.userId,
          ...notifArgs,
        })) // 사진 게시자에게는 푸시 알림만 전송 (저장 X)
      );

      return { result: true, usersNotified: restOfFamily };
    } catch (e) {
      console.error(e);
      return { result: false };
    }
  }
}
