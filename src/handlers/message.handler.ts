import {
  CommentMessageParam,
  MessageBirthdayParam,
  MessageTodayParam,
} from "src/constants/message-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { DynamoDBService } from "src/utils/dynamodb.service";

export class MessageHandler {
  private dynamodbService: DynamoDBService;

  constructor(dynamodbService: DynamoDBService) {
    this.dynamodbService = dynamodbService;
  }

  @CustomValidate(MessageTodayParam)
  async messageToday({ familyIds }: MessageTodayParam) {}

  @CustomValidate(MessageBirthdayParam)
  async messageBirthday({ familyIds }: MessageBirthdayParam) {}

  @CustomValidate(CommentMessageParam)
  async commentMessage({ messageFamId, familyId }: CommentMessageParam) {}
}
