import {
  CommentPhotoParam,
  PhotoCreateParam,
  PhotoUploadedParam,
} from "src/constants/photo-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { DynamoDBService } from "src/utils/dynamodb.service";

export class PhotoHandler {
  private dynamodbService: DynamoDBService;

  constructor(dynamodbService: DynamoDBService) {
    this.dynamodbService = dynamodbService;
  }

  @CustomValidate(PhotoCreateParam)
  async photoCreate({}: PhotoCreateParam) {}

  @CustomValidate(PhotoUploadedParam)
  async photoUploaded({}: PhotoUploadedParam) {}

  @CustomValidate(CommentPhotoParam)
  async commentPhoto({}: CommentPhotoParam) {}
}
