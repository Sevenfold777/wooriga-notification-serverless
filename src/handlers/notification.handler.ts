import { FirebaseAdmin } from "../utils/firebase-admin";
import { MessageHandler } from "./message.handler";
import { DailyEmotionHandler } from "./daily-emotion.handler";
import { FamilyPediaHandler } from "./family-pedia.handler";
import { LetterHandler } from "./letter.handler";
import { PhotoHandler } from "./photo.handler";
import { SqsNotificationReqDTO } from "src/dto/sqs-notification-req.dto";
import { NotificationType } from "src/constants/notification-type";

export class NotificationHandler {
  private firebaseAdmin: FirebaseAdmin;
  private messageHandler: MessageHandler;
  private photoHandler: PhotoHandler;
  private letterHandler: LetterHandler;
  private emotionHandler: DailyEmotionHandler;
  private pediaHandler: FamilyPediaHandler;

  constructor() {
    this.firebaseAdmin = new FirebaseAdmin();

    this.messageHandler = new MessageHandler(this.firebaseAdmin);
    this.photoHandler = new PhotoHandler(this.firebaseAdmin);
    this.letterHandler = new LetterHandler(this.firebaseAdmin);
    this.emotionHandler = new DailyEmotionHandler(this.firebaseAdmin);
    this.pediaHandler = new FamilyPediaHandler(this.firebaseAdmin);
  }

  handleNotification({
    type,
    param,
    save,
  }: SqsNotificationReqDTO<NotificationType>) {
    // type, param, save에 대한 기본적인 (에러) 처리
  }
}
