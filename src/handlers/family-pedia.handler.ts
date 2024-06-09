import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";
import { FirebaseAdmin } from "src/utils/firebase-admin";

export class FamilyPediaHandler {
  private firebaseAdmin: FirebaseAdmin;

  constructor(firebaseAdmin: FirebaseAdmin) {
    this.firebaseAdmin = firebaseAdmin;
  }

  @CustomValidate(PediaQuestionCreatedParam)
  pediaQuestionCreated({}: PediaQuestionCreatedParam) {}

  @CustomValidate(PediaQuestionEdittedParam)
  pediaQuestionEditted({}: PediaQuestionEdittedParam) {}

  @CustomValidate(PediaAnswerParam)
  pediaAnswer({}: PediaAnswerParam) {}

  @CustomValidate(PediaEditPhotoParam)
  pediaEditPhoto({}: PediaEditPhotoParam) {}
}
