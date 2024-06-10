import {
  LetterSendParam,
  NotifyBirthdayParam,
  TimeCapsulesOpenedParam,
} from "src/constants/letter-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { DynamoDBService } from "src/utils/dynamodb.service";

export class LetterHandler {
  private dynamodbService: DynamoDBService;

  constructor(dynamodbService: DynamoDBService) {
    this.dynamodbService = dynamodbService;
  }

  @CustomValidate(LetterSendParam)
  async letterSend({}: LetterSendParam) {}

  @CustomValidate(TimeCapsulesOpenedParam)
  async timeCapsuleOpened({}: TimeCapsulesOpenedParam) {}

  @CustomValidate(NotifyBirthdayParam)
  async notifyBirthDay({}: NotifyBirthdayParam) {}
}
