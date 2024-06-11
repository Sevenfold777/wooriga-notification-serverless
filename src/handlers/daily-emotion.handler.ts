import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import { DailyEmotionNotifTemplates } from "src/templates/daily-emotion.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { sendNotification } from "src/utils/firebase-admin";
import { FamilyMember } from "src/utils/redis/family-member.entity";

export class DailyEmotionHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;

  constructor(redisFamilyMemberService: RedisFamilyMemberService) {
    this.redisFamilyMemberService = redisFamilyMemberService;
  }

  @CustomValidate(EmotionChosenParam)
  async emotionChosen({ familyId, userId }: EmotionChosenParam) {
    const familyMembers = await this.redisFamilyMemberService.getFamily(
      familyId
    );

    let userChosen: FamilyMember;
    const restOfFamily = familyMembers.filter((user) => {
      const condition = user.userId !== userId;
      if (!condition) {
        userChosen = user;
      }

      return condition;
    });

    if (restOfFamily.length === 0) {
      return;
    }

    const notifPayload = DailyEmotionNotifTemplates.EMOTION_CHOSEN(
      userChosen.userName
    );

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   TODO: screen: MESSAGE_HOME,
      //   param: {openEmotion: true, userId}
    });
  }

  @CustomValidate(EmotionPokeParam)
  async emotionPoke({ familyId, userId }: EmotionPokeParam) {
    const targetUser = await this.redisFamilyMemberService.getUser(
      familyId,
      userId
    );

    // 2. FCM request with info
    const notifPayload = DailyEmotionNotifTemplates.EMOTION_POKE(
      targetUser.userName
    );

    await sendNotification({
      tokens: [targetUser.fcmToken],
      title: notifPayload.title,
      body: notifPayload.body,
      //  TODO: screen: MESSAGE_HOME,
      // param: {openEmotion: true, userId}
    });
  }
}
