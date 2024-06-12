import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
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
    sendNotification: (args: SendNotifcationParamType) => Promise<boolean>;
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

      const notifPayload = PhotoNotifTemplates.PHOTO_CREATE(
        author.userName,
        titlePreview
      );

      await this.sendNotification({
        tokens: restOfFamily.map((res) => res.fcmToken),
        title: notifPayload.title,
        body: notifPayload.body,
        //   TODO: screen: PHOTO,
        //   param: {photoId}
      });

      // 3. TODO: handle save notification

      return { result: true, usersNotified: restOfFamily };
    } catch (error) {
      return { result: false };
    }
  }

  @CustomValidate(PhotoUploadedParam)
  async photoUploaded({}: PhotoUploadedParam): Promise<HandlerReturnType> {
    try {
      return { result: false, usersNotified: [] };
    } catch (error) {
      return { result: false };
    }
    // TODO: 구현에 따라 생각 (photoCreate에 병합할 수도)
    // return { result: true, usersNotified: }
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
      return { result: false };
    }
  }
}
