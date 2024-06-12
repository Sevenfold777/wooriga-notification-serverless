import { NotificationType } from "src/constants/notification-type";
import { TemplateReturnType } from "./common";

export const PhotoNotifTemplates = {
  [NotificationType.PHOTO_CREATE]: {
    authorTemplate: photoCreateAuthorTemplate,
    othersTemplate: photoCreateOthersTemplate,
  },
  [NotificationType.COMMENT_PHOTO]: commentPhotoTemplate,
};

function photoCreateAuthorTemplate(): TemplateReturnType {
  return {
    title: `우리가 앨범`,
    body: `새로운 사진 등록이 완료됐습니다!`,
  };
}

function photoCreateOthersTemplate(
  userName: string,
  titlePreview: string
): TemplateReturnType {
  return {
    title: `우리가 앨범`,
    body: `${userName} 님이 앨범에 새로운 사진을 등록했습니다! "${titlePreview}"`,
  };
}

function commentPhotoTemplate(
  userName: string,
  payload: string
): TemplateReturnType {
  const commentPreview =
    payload.length > 10 ? payload.slice(0, 10) + "..." : payload;

  return {
    title: `우리가 앨범`,
    body: `${userName} 님이 사진에 댓글을 작성했습니다! "${commentPreview}"`,
  };
}
