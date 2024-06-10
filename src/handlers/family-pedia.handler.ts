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
    // 1. TODO: get tokens from db
    let owner: FamilyMember;

    // 2. FCM request with info
    const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_CREATED(
      owner.userName
    );

    await sendNotification({
      tokens: [owner.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      // screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaQuestionEdittedParam)
  async pediaQuestionEditted({ familyId, ownerId }: PediaQuestionEdittedParam) {
    // 1. TODO: get tokens from db
    let owner: FamilyMember;

    // 2. FCM request with info
    const notifPayload = FamilyPediaNotifTemplates.PEDIA_QUESTION_EDITTED(
      owner.userName
    );

    await sendNotification({
      tokens: [owner.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      // screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaAnswerParam)
  async pediaAnswer({ familyId, ownerId }: PediaAnswerParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];
    let owner: FamilyMember;
    const restOfFamily = tempResult.filter((user) => {
      const condition = user.userId !== ownerId;
      if (!condition) {
        owner = user;
      }

      return condition;
    });

    // 2. FCM request with info
    if (restOfFamily.length === 0) {
      return;
    }

    const notifPayload = FamilyPediaNotifTemplates.PEDIA_ANSWER(owner.userName);

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      // screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PediaEditPhotoParam)
  async pediaEditPhoto({ familyId, ownerId }: PediaEditPhotoParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];
    let owner: FamilyMember;
    const restOfFamily = tempResult.filter((user) => {
      const condition = user.userId !== ownerId;
      if (!condition) {
        owner = user;
      }

      return condition;
    });

    // 2. FCM request with info
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
      // screen: PEDIA,
      // param: {pediaId: ownerId}
    });

    // 3. TODO: handle save notification
  }
}
