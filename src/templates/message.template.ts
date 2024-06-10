import { NotificationType } from "src/constants/notification-type";
import { TemplateReturnType } from "./common";

export const MessageNotifTemplates = {
  [NotificationType.MESSAGE_TODAY]: messageTodayTemplate,
  [NotificationType.MESSAGE_BIRTHDAY]: messageBirthdayTemplate,
  [NotificationType.COMMENT_MESSAGE]: commentMessageTemplate,
};

function messageTodayTemplate(): TemplateReturnType {
  return { title: `우리가 이야기`, body: `오늘의 이야기가 도착했습니다!` };
}

function messageBirthdayTemplate(): TemplateReturnType {
  return { title: `우리가 이야기`, body: `오늘의 이야기가 도착했습니다!` };
}

function commentMessageTemplate(
  userName: string,
  payload: string
): TemplateReturnType {
  const commentPreview =
    payload.length > 10 ? payload.slice(0, 10) + "..." : payload;

  return {
    title: `우리가 이야기`,
    body: `${userName} 님이 이야기에 댓글을 작성했습니다! "${commentPreview}"`,
  };
}
