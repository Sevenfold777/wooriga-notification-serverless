import { NotificationType } from "src/constants/notification-type";
import { TemplateReturnType } from "./common";

export const FamilyPediaNotifTemplates = {
  [NotificationType.PEDIA_QUESTION_CREATED]: pediaQuestionCreatedTemplate,
  [NotificationType.PEDIA_QUESTION_EDITTED]: pediaQuestionEdittedTemplate,
  [NotificationType.PEDIA_ANSWER]: pediaAnswerTemplate,
  [NotificationType.PEDIA_EDIT_PHOTO]: pediaEditPhotoTemplate,
};

function pediaQuestionCreatedTemplate(userName: string): TemplateReturnType {
  return {
    title: `우리가 인물사전`,
    body: `${userName} 님의 인물사전에 새로운 질문이 등록되었습니다!`,
  };
}

function pediaQuestionEdittedTemplate(userName: string): TemplateReturnType {
  return {
    title: `우리가 인물사전`,
    body: `${userName} 님의 인물사전에 등록된 질문이 수정되었습니다!`,
  };
}

function pediaAnswerTemplate(userName: string): TemplateReturnType {
  return {
    title: `우리가 인물사전`,
    body: `${userName} 님이 인물사전에 새로운 답변을 등록했습니다!`,
  };
}

function pediaEditPhotoTemplate(userName: string): TemplateReturnType {
  return {
    title: `우리가 인물사전`,
    body: `${userName} 님의 인물사전 사진이 변경되었습니다!`,
  };
}
