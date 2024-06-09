import {
  PediaAnswerParam,
  PediaEditPhotoParam,
  PediaQuestionCreatedParam,
  PediaQuestionEdittedParam,
} from "src/constants/family-pedia-notification";
import { CustomValidate } from "src/utils/custom-validate.decorator";

export class FamilyPediaHandler {
  constructor() {}

  @CustomValidate(PediaQuestionCreatedParam)
  pediaQuestionCreated({}: PediaQuestionCreatedParam) {}

  @CustomValidate(PediaQuestionEdittedParam)
  pediaQuestionEditted({}: PediaQuestionEdittedParam) {}

  @CustomValidate(PediaAnswerParam)
  pediaAnswer({}: PediaAnswerParam) {}

  @CustomValidate(PediaEditPhotoParam)
  pediaEditPhoto({}: PediaEditPhotoParam) {}
}
