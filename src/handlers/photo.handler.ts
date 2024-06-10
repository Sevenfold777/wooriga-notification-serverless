import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
} from "src/constants/photo-notification";
import { PhotoNotifTemplates } from "src/templates/photo.template";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { sendNotification } from "src/utils/firebase-admin";
import { FamilyMember } from "src/utils/redis/family-member.entity";

export class PhotoHandler {
  private redisFamilyMemberService: RedisFamilyMemberService;

  constructor(redisFamilyMemberService: RedisFamilyMemberService) {
    this.redisFamilyMemberService = redisFamilyMemberService;
  }

  @CustomValidate(PhotoCreateParam)
  async photoCreate({
    photoId,
    titlePreview,
    authorId,
    familyId,
  }: PhotoCreateParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];
    let author: FamilyMember;
    const restOfFamily = tempResult.filter((user) => {
      const condition = user.userId !== authorId;
      if (!condition) {
        author = user;
      }

      return condition;
    });

    // 2. FCM request with info
    if (restOfFamily.length === 0) {
      return;
    }

    const notifPayload = PhotoNotifTemplates.PHOTO_CREATE(
      author.userName,
      titlePreview
    );

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      // screen: PHOTO,
      //   param: {photoId}
    });

    // 3. TODO: handle save notification
  }

  @CustomValidate(PhotoUploadedParam)
  async photoUploaded({}: PhotoUploadedParam) {
    // TODO: 구현에 따라 생각 (photoCreate에 병합할 수도)
  }

  @CustomValidate(CommentPhotoParam)
  async commentPhoto({
    photoId,
    familyId,
    authorId,
    commentPreview,
  }: CommentPhotoParam) {
    // 1. TODO: get tokens from db
    let tempResult: FamilyMember[];
    let author: FamilyMember;
    const restOfFamily = tempResult.filter((user) => {
      const condition = user.userId !== authorId;
      if (!condition) {
        author = user;
      }

      return condition;
    });

    // 2. FCM request with info
    if (restOfFamily.length === 0) {
      return;
    }

    const notifPayload = PhotoNotifTemplates.COMMENT_PHOTO(
      author.userName,
      commentPreview
    );

    await sendNotification({
      tokens: restOfFamily.map((res) => res.fcmToken),
      title: notifPayload.title,
      body: notifPayload.body,
      //   screen: COMMENT_PHOTO,
      //   param: {photoId}
    });

    // 3. TODO: handle save notification
  }
}
