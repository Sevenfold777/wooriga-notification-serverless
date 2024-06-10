import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { DynamoDBService } from "src/utils/dynamodb.service";

export class FamilyPediaHandler {
  private dynamodbService: DynamoDBService;

  constructor(dynamodbService: DynamoDBService) {
    this.dynamodbService = dynamodbService;
  }

  @CustomValidate(PediaQuestionCreatedParam)
  async pediaQuestionCreated({}: PediaQuestionCreatedParam) {}

  @CustomValidate(PediaQuestionEdittedParam)
  async pediaQuestionEditted({}: PediaQuestionEdittedParam) {}

  @CustomValidate(PediaAnswerParam)
  async pediaAnswer({}: PediaAnswerParam) {}

  @CustomValidate(PediaEditPhotoParam)
  async pediaEditPhoto({}: PediaEditPhotoParam) {}
}
