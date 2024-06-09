import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
} from "src/constants/photo-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FirebaseAdmin } from "src/utils/firebase-admin";

export class PhotoHandler {
  private firebaseAdmin: FirebaseAdmin;

  constructor(firebaseAdmin: FirebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  @CustomValidate(PhotoCreateParam)
  photoCreate({}: PhotoCreateParam) {}

  @CustomValidate(PhotoUploadedParam)
  PhotoUploadedParam({}: PhotoUploadedParam) {}

  @CustomValidate(CommentPhotoParam)
  commentPhoto({}: CommentPhotoParam) {}
}
