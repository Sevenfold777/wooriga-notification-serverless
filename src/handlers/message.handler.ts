import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FirebaseAdmin } from "src/utils/firebase-admin";

export class MessageHandler {
  private firebaseAdmin: FirebaseAdmin;

  constructor(firebaseAdmin: FirebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  @CustomValidate(MessageTodayParam)
  messageToday({}: MessageTodayParam) {}

  @CustomValidate(MessageBirthdayParam)
  messageBirthday({}: MessageBirthdayParam) {}

  @CustomValidate(CommentMessageParam)
  commentMessage({}: CommentMessageParam) {}
}
