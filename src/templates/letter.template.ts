import { NotificationType } from "src/constants/notification-type";

export const LetterNotifParamType = {
  [NotificationType.LETTER_SEND]: letterSendTemplate,
  [NotificationType.TIMECAPSULE_OPENED]: timeCapsulesOpenedTemplate,
  [NotificationType.NOTIFY_BIRTHDAY]: notifyBirthdayTemplate,
};

function letterSendTemplate() {
  return ``;
}

function timeCapsulesOpenedTemplate() {
  return ``;
}

function notifyBirthdayTemplate() {
  return ``;
}
