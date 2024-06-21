import { RedisFamilyMemberService } from "./utils/redis/redis-family-member.service";
import { MessageHandler } from "./handlers/message.handler";
import { DailyEmotionHandler } from "./handlers/daily-emotion.handler";
import { FamilyPediaHandler } from "./handlers/family-pedia.handler";
import { LetterHandler } from "./handlers/letter.handler";
import { PhotoHandler } from "./handlers/photo.handler";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";
import { NotificationType } from "src/constants/notification-type";
import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import {
  CommentPhotoParam,
  PhotoCreateParam,
} from "src/constants/photo-notification";
import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenParam,
} from "src/constants/letter-notification";
import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { Redis } from "ioredis";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { SQSClient } from "@aws-sdk/client-sqs";

export class NotificationHandler {
  private messageHandler: MessageHandler;
  private photoHandler: PhotoHandler;
  private letterHandler: LetterHandler;
  private emotionHandler: DailyEmotionHandler;
  private pediaHandler: FamilyPediaHandler;

  constructor(
    redis: Redis,
    sendNotification: (args: SendNotifcationParamType) => Promise<boolean>,
    sqsClient: SQSClient
  ) {
    const redisFamilyMemberService = new RedisFamilyMemberService(redis);

    this.messageHandler = new MessageHandler(
      redisFamilyMemberService,
      sendNotification,
      sqsClient
    );
    this.photoHandler = new PhotoHandler(
      redisFamilyMemberService,
      sendNotification,
      sqsClient
    );
    this.letterHandler = new LetterHandler(
      redisFamilyMemberService,
      sendNotification,
      sqsClient
    );
    this.emotionHandler = new DailyEmotionHandler(
      redisFamilyMemberService,
      sendNotification,
      sqsClient
    );
    this.pediaHandler = new FamilyPediaHandler(
      redisFamilyMemberService,
      sendNotification,
      sqsClient
    );
  }

  async handleNotification({
    type,
    param,
  }: SqsNotificationReqDTO<NotificationType>) {
    try {
      if (!type) {
        throw new Error("Requested notification type undefined.");
      }

      // TODO: 사용빈도에 따라 순서 설정
      switch (type) {
        case NotificationType.MESSAGE_TODAY:
          await this.messageHandler.messageToday(param as MessageTodayParam);
          break;

        case NotificationType.MESSAGE_BIRTHDAY:
          await this.messageHandler.messageBirthday(
            param as MessageBirthdayParam
          );
          break;

        case NotificationType.COMMENT_MESSAGE:
          await this.messageHandler.commentMessage(
            param as CommentMessageParam
          );
          break;

        case NotificationType.PHOTO_CREATE:
          await this.photoHandler.photoCreate(param as PhotoCreateParam);
          break;

        case NotificationType.COMMENT_PHOTO:
          await this.photoHandler.commentPhoto(param as CommentPhotoParam);
          break;

        case NotificationType.LETTER_SEND:
          await this.letterHandler.letterSend(param as LetterSendParam);
          break;

        case NotificationType.TIMECAPSULE_OPEN:
          await this.letterHandler.timeCapsuleOpen(
            param as TimeCapsulesOpenParam
          );
          break;

        case NotificationType.NOTIFY_BIRTHDAY:
          await this.letterHandler.notifyBirthDay(param as NotifyBirthdayParam);
          break;

        case NotificationType.EMOTION_CHOSEN:
          await this.emotionHandler.emotionChosen(param as EmotionChosenParam);
          break;

        case NotificationType.EMOTION_POKE:
          await this.emotionHandler.emotionPoke(param as EmotionPokeParam);
          break;

        case NotificationType.PEDIA_QUESTION_CREATED:
          await this.pediaHandler.pediaQuestionCreated(
            param as PediaQuestionCreatedParam
          );
          break;

        case NotificationType.PEDIA_QUESTION_EDITTED:
          await this.pediaHandler.pediaQuestionEditted(
            param as PediaQuestionEdittedParam
          );
          break;

        case NotificationType.PEDIA_ANSWER:
          await this.pediaHandler.pediaAnswer(param as PediaAnswerParam);
          break;

        case NotificationType.PEDIA_EDIT_PHOTO:
          await this.pediaHandler.pediaEditPhoto(param as PediaEditPhotoParam);
          break;

        default:
          throw new Error("Type provided. But there's no matching type.");
      }
    } catch (e) {
      console.error(e);
    }
  }
}
