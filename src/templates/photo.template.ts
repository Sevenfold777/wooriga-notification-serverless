import { NotificationType } from "src/constants/notification-type";

export const PhotoNotifParamType = {
  [NotificationType.PHOTO_CREATE]: photoCreateTemplate,
  [NotificationType.PHOTO_UPLOADED]: photoUploadedTemplate,
  [NotificationType.COMMENT_PHOTO]: commentPhotoTemplate,
};

function photoCreateTemplate() {
  return ``;
}

function photoUploadedTemplate() {
  return ``;
}

function commentPhotoTemplate() {
  return ``;
}
