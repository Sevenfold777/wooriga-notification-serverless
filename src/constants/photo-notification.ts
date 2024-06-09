import { IsNumber } from "class-validator";
import { NotificationType } from "./notification-type";

export type PhotoNotifParamType = {
  [NotificationType.PHOTO_CREATE]: PhotoCreateParam;
  [NotificationType.PHOTO_UPLOADED]: PhotoUploadedParam;
  [NotificationType.COMMENT_PHOTO]: CommentPhotoParam;
};

export class PhotoCreateParam {
  @IsNumber()
  photoId: number;

  @IsNumber()
  familyId: number;
}

export class PhotoUploadedParam {
  @IsNumber()
  photoId: number;

  @IsNumber()
  userId: number;
}

export class CommentPhotoParam {
  @IsNumber()
  photoId: number;

  @IsNumber()
  familyId: number;
}
