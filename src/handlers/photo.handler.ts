import {
  CommentPhotoParam,
  PhotoCreateParam,
} from "src/constants/photo-notification";
import { PhotoNotifTemplates } from "src/templates/photo.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { FamilyMember } from "src/utils/redis/family-member.entity";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { HandlerReturnType } from "./handler-return.type";

export class PhotoHandler {
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

      const authorNotifPayload =
        PhotoNotifTemplates.PHOTO_CREATE.authorTemplate();

      const othersNotifPayload =
        PhotoNotifTemplates.PHOTO_CREATE.othersTemplate(
          author.userName,
          titlePreview
        );

      await Promise.all([
        this.sendNotification({
          tokens: [author.fcmToken],
          title: authorNotifPayload.title,
          body: authorNotifPayload.body,
          //   TODO: screen: PHOTO,
          //   param: {photoId}
        }),
        this.sendNotification({
          tokens: restOfFamily.map((res) => res.fcmToken),
          title: othersNotifPayload.title,
          body: othersNotifPayload.body,
          //   TODO: screen: PHOTO,
          //   param: {photoId}
        }),
      ]);

      // 3. TODO: handle save notification

      return { result: true, usersNotified: [author, ...restOfFamily] };
    } catch (error) {
      console.error(error.message);
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

      const notifPayload = PhotoNotifTemplates.COMMENT_PHOTO(
        author.userName,
        commentPreview
      );

      await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        //   TODO: screen: COMMENT_PHOTO,
        //   param: {photoId}
      });

      // 3. TODO: handle save notification

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      console.error(error.message);
      return { result: false };
    }
  }
}
