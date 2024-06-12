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

export class FamilyPediaHandler {
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

      await this.sendNotification({
        tokens: [owner.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      // 3. TODO: handle save notification

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

      await this.sendNotification({
        tokens: [owner.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      // 3. TODO: handle save notification

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

      await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      // 3. TODO: handle save notification

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

      await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        // TODO: screen: PEDIA,
        // param: {pediaId: ownerId}
      });

      // 3. TODO: handle save notification

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }
}
