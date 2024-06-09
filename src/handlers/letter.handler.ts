import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenedParam,
} from "src/constants/letter-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";

export class LetterHandler {
  constructor() {}

  @CustomValidate(LetterSendParam)
  letterSend({}: LetterSendParam) {}

  @CustomValidate(TimeCapsulesOpenedParam)
  timeCapsuleOpened({}: TimeCapsulesOpenedParam) {}

  @CustomValidate(NotifyBirthdayParam)
  notifyBirthDay({}: NotifyBirthdayParam) {}
}
