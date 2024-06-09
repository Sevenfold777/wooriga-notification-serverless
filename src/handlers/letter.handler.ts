import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenedParam,
} from "src/constants/letter-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FirebaseAdmin } from "src/utils/firebase-admin";

export class LetterHandler {
  private firebaseAdmin: FirebaseAdmin;

  constructor(firebaseAdmin: FirebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  @CustomValidate(LetterSendParam)
  letterSend({}: LetterSendParam) {}

  @CustomValidate(TimeCapsulesOpenedParam)
  timeCapsuleOpened({}: TimeCapsulesOpenedParam) {}

  @CustomValidate(NotifyBirthdayParam)
  notifyBirthDay({}: NotifyBirthdayParam) {}
}
