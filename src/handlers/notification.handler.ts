import { MessageHandler } from "./message.handler";
import { DailyEmotionHandler } from "./daily-emotion.handler";
import { FamilyPediaHandler } from "./family-pedia.handler";
import { LetterHandler } from "./letter.handler";
import { PhotoHandler } from "./photo.handler";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";
import { NotificationType } from "src/constants/notification-type";
import { DynamoDBService } from "src/utils/dynamodb.service";
import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
} from "src/constants/photo-notification";
import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenedParam,
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

export class NotificationHandler {
  private messageHandler: MessageHandler;
  private photoHandler: PhotoHandler;
  private letterHandler: LetterHandler;
  private emotionHandler: DailyEmotionHandler;
  private pediaHandler: FamilyPediaHandler;

  constructor() {
    const dynamodbService = new DynamoDBService();

    this.messageHandler = new MessageHandler(dynamodbService);
    this.photoHandler = new PhotoHandler(dynamodbService);
    this.letterHandler = new LetterHandler(dynamodbService);
    this.emotionHandler = new DailyEmotionHandler(dynamodbService);
    this.pediaHandler = new FamilyPediaHandler(dynamodbService);
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

        case NotificationType.PHOTO_UPLOADED:
          await this.photoHandler.photoUploaded(param as PhotoUploadedParam);
          break;

        case NotificationType.COMMENT_PHOTO:
          await this.photoHandler.commentPhoto(param as CommentPhotoParam);
          break;

        case NotificationType.LETTER_SEND:
          await this.letterHandler.letterSend(param as LetterSendParam);
          break;

        case NotificationType.TIMECAPSULE_OPENED:
          await this.letterHandler.timeCapsuleOpened(
            param as TimeCapsulesOpenedParam
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
      console.error(e.message);
    }
  }
}
