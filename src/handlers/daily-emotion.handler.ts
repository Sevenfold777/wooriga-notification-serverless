import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FirebaseAdmin } from "src/utils/firebase-admin";

export class DailyEmotionHandler {
  private firebaseAdmin: FirebaseAdmin;

  constructor(firebaseAdmin: FirebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  @CustomValidate(EmotionChosenParam)
  emotionChosen({}: EmotionChosenParam) {}

  @CustomValidate(EmotionPokeParam)
  emotionPoke({}: EmotionPokeParam) {}
}
