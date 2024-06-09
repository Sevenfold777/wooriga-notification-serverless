import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
} from "src/constants/photo-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";

export class PhotoHandler {
  constructor() {}

  @CustomValidate(PhotoCreateParam)
  photoCreate({}: PhotoCreateParam) {}

  @CustomValidate(PhotoUploadedParam)
  PhotoUploadedParam({}: PhotoUploadedParam) {}

  @CustomValidate(CommentPhotoParam)
  commentPhoto({}: CommentPhotoParam) {}
}
