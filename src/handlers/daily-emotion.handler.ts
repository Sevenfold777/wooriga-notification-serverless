import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import { DailyEmotionNotifTemplates } from "src/templates/daily-emotion.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FamilyMember } from "src/utils/redis/family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";

export class DailyEmotionHandler {
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

  @CustomValidate(EmotionChosenParam)
  async emotionChosen({
    familyId,
    userId,
  }: EmotionChosenParam): Promise<HandlerReturnType> {
    try {
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

      await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        //   TODO: screen: MESSAGE_HOME,
        //   param: {openEmotion: true, userId}
      });

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(EmotionPokeParam)
  async emotionPoke({
    familyId,
    userId,
  }: EmotionPokeParam): Promise<HandlerReturnType> {
    try {
      const targetUser = await this.redisFamilyMemberService.getUser(
        familyId,
        userId
      );

      // 2. FCM request with info
      const notifPayload = DailyEmotionNotifTemplates.EMOTION_POKE(
        targetUser.userName
      );

      await this.sendNotification({
        tokens: [targetUser.fcmToken],
        title: notifPayload.title,
        body: notifPayload.body,
        //  TODO: screen: MESSAGE_HOME,
        // param: {openEmotion: true, userId}
      });

      return {
        result: true,
        usersNotified: [targetUser],
      };
    } catch (error) {
      return { result: false };
    }
  }
}
