import { NotificationType } from "src/constants/notification-type";

export const MessageNotifParamType = {
  [NotificationType.MESSAGE_TODAY]: messageTodayTemplate,
  [NotificationType.MESSAGE_BIRTHDAY]: messageBirthdayTemplate,
  [NotificationType.COMMENT_MESSAGE]: commentMessageTemplate,
};

function messageTodayTemplate() {
  return ``;
}

function messageBirthdayTemplate() {
  return ``;
}

function commentMessageTemplate() {
  return ``;
}
