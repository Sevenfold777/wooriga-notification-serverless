import { NotificationType } from "src/constants/notification-type";

export const DailyEmotionNotifTemplates = {
  [NotificationType.EMOTION_CHOSEN]: emotionChosenTemplate,
  [NotificationType.EMOTION_POKE]: emotionPokeTemplate,
};

function emotionChosenTemplate() {
  return ``;
}

function emotionPokeTemplate() {
  return ``;
}
