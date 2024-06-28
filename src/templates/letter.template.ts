import { NotificationType } from 'src/constants/notification-type';
import { TemplateReturnType } from './common';

export const LetterNotifTemplates = {
  [NotificationType.LETTER_SEND]: letterSendTemplate,
  [NotificationType.TIMECAPSULE_OPEN]: {
    receiverTemplate: timeCapsulesOpenReceiverTemplate,
    senderTemplate: timeCapsulesOpenSenderTemplate,
  },
  [NotificationType.NOTIFY_BIRTHDAY]: notifyBirthdayTemplate,
};

function letterSendTemplate(
  receiverName: string,
  isTimeCapsule: boolean,
): TemplateReturnType {
  return isTimeCapsule
    ? {
        title: `우리가 편지`,
        body: `우리가족이 ${receiverName} 님에게 새로운 타임캡슐을 작성했습니다!`,
      }
    : {
        title: `우리가 편지`,
        body: `우리가족이 ${receiverName} 님에게 작성한 편지가 도착했습니다!`,
      };
}

function timeCapsulesOpenReceiverTemplate(): TemplateReturnType {
  return {
    title: `우리가 편지`,
    body: `기다리고 있던 타임캡슐이 공개되었습니다!`,
  };
}

function timeCapsulesOpenSenderTemplate(
  receiverName: string,
): TemplateReturnType {
  return {
    title: `우리가 편지`,
    body: `${receiverName} 님에게 작성한 타임캡슐이 공개되었습니다!`,
  };
}

function notifyBirthdayTemplate(birthdayUserName: string): TemplateReturnType {
  return {
    title: `우리가 생일`,
    body: `곧 사랑하는 우리가족 ${birthdayUserName} 님의 생일이에요! 따뜻한 축하의 편지를 전해보아요`,
  };
}
