import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";

export class DailyEmotionHandler {
  constructor() {}

  @CustomValidate(EmotionChosenParam)
  emotionChosen({}: EmotionChosenParam) {}

  @CustomValidate(EmotionPokeParam)
  emotionPoke({}: EmotionPokeParam) {}
}
