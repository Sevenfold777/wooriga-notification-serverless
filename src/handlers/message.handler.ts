import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";

export class MessageHandler {
  constructor() {}

  @CustomValidate(MessageTodayParam)
  messageToday({}: MessageTodayParam) {}

  @CustomValidate(MessageBirthdayParam)
  messageBirthday({}: MessageBirthdayParam) {}

  @CustomValidate(CommentMessageParam)
  commentMessage({}: CommentMessageParam) {}
}
