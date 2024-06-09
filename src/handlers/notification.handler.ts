import { MessageHandler } from "./message.handler";
import { DailyEmotionHandler } from "./daily-emotion.handler";
import { FamilyPediaHandler } from "./family-pedia.handler";
import { LetterHandler } from "./letter.handler";
import { PhotoHandler } from "./photo.handler";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";
import { NotificationType } from "src/constants/notification-type";

export class NotificationHandler {
  private messageHandler: MessageHandler;
  private photoHandler: PhotoHandler;
  private letterHandler: LetterHandler;
  private emotionHandler: DailyEmotionHandler;
  private pediaHandler: FamilyPediaHandler;

  constructor() {
    this.messageHandler = new MessageHandler();
    this.photoHandler = new PhotoHandler();
    this.letterHandler = new LetterHandler();
    this.emotionHandler = new DailyEmotionHandler();
    this.pediaHandler = new FamilyPediaHandler();
  }

  handleNotification({
    type,
    param,
    save,
  }: SqsNotificationReqDTO<NotificationType>) {
    // type, param, save에 대한 기본적인 (에러) 처리
  }
}
