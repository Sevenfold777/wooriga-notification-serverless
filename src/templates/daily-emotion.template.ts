import { NotificationType } from "src/constants/notification-type";
import { TemplateReturnType } from "./common";

export const DailyEmotionNotifTemplates = {
  [NotificationType.EMOTION_CHOSEN]: emotionChosenTemplate,
  [NotificationType.EMOTION_POKE]: emotionPokeTemplate,
};

function emotionChosenTemplate(userName: string): TemplateReturnType {
  return {
    title: `오늘의 우리가`,
    body: `${userName} 님이 오늘의 감정을 선택했습니다!`,
  };
}

function emotionPokeTemplate(userName: string): TemplateReturnType {
  return {
    title: `오늘의 감정을 선택해주세요`,
    body: `가족들이 ${userName} 님의 기분을 궁금해합니다!`,
  };
}
