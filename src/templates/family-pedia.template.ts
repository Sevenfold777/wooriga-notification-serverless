import { NotificationType } from "src/constants/notification-type";

export const FamilyPediaNotifTemplates = {
  [NotificationType.PEDIA_QUESTION_CREATED]: pediaQuestionCreatedTemplate,
  [NotificationType.PEDIA_QUESTION_EDITTED]: pediaQuestionEdittedTemplate,
  [NotificationType.PEDIA_ANSWER]: pediaAnswerTemplate,
  [NotificationType.PEDIA_EDIT_PHOTO]: pediaEditPhotoTemplate,
};

function pediaQuestionCreatedTemplate() {
  return ``;
}

function pediaQuestionEdittedTemplate() {
  return ``;
}

function pediaAnswerTemplate() {
  return ``;
}

function pediaEditPhotoTemplate() {
  return ``;
}
