import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { FamilyPediaNotifTemplates } from "src/templates/family-pedia.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { sendNotification } from "src/utils/firebase-admin";
import { FamilyMember } from "src/utils/redis/family-member.entity";

export class FamilyPediaHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;

  constructor(redisFamilyMemberService: RedisFamilyMemberService) {
    this.redisFamilyMemberService = redisFamilyMemberService;
  }

  @CustomValidate(PediaQuestionCreatedParam)
  async pediaQuestionCreated({ familyId, ownerId }: PediaQuestionCreatedParam) {
    const owner = await this.redisFamilyMemberService.getUser(
      familyId,
      ownerId
    );

    const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_CREATED(
      owner.userName
    );

    await sendNotification({
      tokens: [owner.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      // TODO: screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaQuestionEdittedParam)
  async pediaQuestionEditted({ familyId, ownerId }: PediaQuestionEdittedParam) {
    const owner = await this.redisFamilyMemberService.getUser(
      familyId,
      ownerId
    );

    const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_EDITTED(
      owner.userName
    );

    await sendNotification({
      tokens: [owner.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      // TODO: screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaAnswerParam)
  async pediaAnswer({ familyId, ownerId }: PediaAnswerParam) {
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

    const notifPayload = FamilyPediaNotifTemplates.PEDIA_ANSWER(owner.userName);

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      // TODO: screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaEditPhotoParam)
  async pediaEditPhoto({ familyId, ownerId }: PediaEditPhotoParam) {
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

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      // TODO: screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }
}
