import {
  EmotionChosenParam,
  EmotionPokeParam,
} from "src/constants/daily-emotion-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { DynamoDBService } from "src/utils/dynamodb.service";

export class DailyEmotionHandler {
  private dynamodbService: DynamoDBService;

  constructor(dynamodbService: DynamoDBService) {
    this.dynamodbService = dynamodbService;
  }

  @CustomValidate(EmotionChosenParam)
  async emotionChosen({}: EmotionChosenParam) {}

  @CustomValidate(EmotionPokeParam)
  async emotionPoke({}: EmotionPokeParam) {}
}
