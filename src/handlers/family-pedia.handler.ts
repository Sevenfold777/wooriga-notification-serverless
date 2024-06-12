import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { FamilyPediaNotifTemplates } from "src/templates/family-pedia.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { FamilyMember } from "src/utils/redis/family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";
import { SQSClient } from "@aws-sdk/client-sqs";
import { sendMessageSQS } from "src/utils/sqs/send-message-sqs";

export class FamilyPediaHandler {
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

  @CustomValidate(PediaQuestionCreatedParam)
  async pediaQuestionCreated({
    familyId,
    ownerId,
  }: PediaQuestionCreatedParam): Promise<HandlerReturnType> {
    try {
      const owner = await this.redisFamilyMemberService.getUser(
        familyId,
        ownerId
      );

      const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_CREATED(
        owner.userName
      );

      const pushResult = await this.sendNotification({
        tokens: [owner.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      /**
       * AWARE: sendMessageSQS 전부 알림 저장 요청에 대한 책임이 있기에 await 사용
       * 그러나 성공, 실패 여부가 알림 핸들링 전체 성패를 결정할 만큼 중대 하지는 않기에
       * 에러 로깅만 하고 넘어 감
       */
      // 3. handle save notification
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        [
          {
            receiverId: ownerId,
            title: notifPayload.title,
            body: notifPayload.body,
            // screen: PEDIA,
            // param: { pediaId: ownerId },
          },
        ]
      );

      return { result: true, usersNotified: [owner] };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(PediaQuestionEdittedParam)
  async pediaQuestionEditted({
    familyId,
    ownerId,
  }: PediaQuestionEdittedParam): Promise<HandlerReturnType> {
    try {
      const owner = await this.redisFamilyMemberService.getUser(
        familyId,
        ownerId
      );

      const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_EDITTED(
        owner.userName
      );

      const pushResult = await this.sendNotification({
        tokens: [owner.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      if (!pushResult) {
        throw new Error("Push notification send failed.");
      }

      // 3. handle save notification
      await sendMessageSQS(
        this.sqsClient,
        this.AWS_SQS_NOTIFICATION_STORE_URL,
        [
          {
            receiverId: ownerId,
            title: notifPayload.title,
            body: notifPayload.body,
            // screen: PEDIA,
            // param: { pediaId: ownerId },
          },
        ]
      );

      return { result: true, usersNotified: [owner] };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(PediaAnswerParam)
  async pediaAnswer({
    familyId,
    ownerId,
  }: PediaAnswerParam): Promise<HandlerReturnType> {
    try {
      const familyMembers = await this.redisFamilyMemberService.getFamily(
        familyId
      );

      let owner: FamilyMember;
      const restOfFamily = familyMembers.filter((user) => {
        const condition = user.userId !== ownerId;
        if (!condition) {
          owner = user;
        }

        return condition;
      });

      if (restOfFamily.length === 0) {
        return;
      }

      const notifPayload = FamilyPediaNotifTemplates.PEDIA_ANSWER(
        owner.userName
      );

      const pushResult = await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
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
          title: notifPayload.title,
          body: notifPayload.body,
          // TODO: screen: PEDIA,
          // param: {pediaId: ownerId}
        }))
      );

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(PediaEditPhotoParam)
  async pediaEditPhoto({
    familyId,
    ownerId,
  }: PediaEditPhotoParam): Promise<HandlerReturnType> {
    try {
      const familyMembers = await this.redisFamilyMemberService.getFamily(
        familyId
      );

      let owner: FamilyMember;
      const restOfFamily = familyMembers.filter((user) => {
        const condition = user.userId !== ownerId;
        if (!condition) {
          owner = user;
        }

        return condition;
      });

      if (restOfFamily.length === 0) {
        return;
      }

      const notifPayload = FamilyPediaNotifTemplates.PEDIA_EDIT_PHOTO(
        owner.userName
      );

      const pushResult = await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
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
          title: notifPayload.title,
          body: notifPayload.body,
          // TODO: screen: PEDIA,
          // param: {pediaId: ownerId}
        }))
      );

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }
}
