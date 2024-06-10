import { Type } from "class-transformer";
import { IsBoolean, IsNumber, ValidateNested } from "class-validator";
import { NotificationType } from "./notification-type";

export type LetterNotifParamType = {
  [NotificationType.LETTER_SEND]: LetterSendParam;
  [NotificationType.TIMECAPSULE_OPENED]: TimeCapsulesOpenedParam;
  [NotificationType.NOTIFY_BIRTHDAY]: NotifyBirthdayParam;
};

export class LetterSendParam {
  @IsNumber()
  letterId: number;

  @IsBoolean()
  isTimeCapsule: boolean;

  @IsNumber()
  familyId: number;

  @IsNumber()
  receiverId: number;
}

export class TimeCapsulesOpenedParam {
  @ValidateNested({ each: true })
  @Type(() => TimeCapsuleParam)
  timaCapsules: TimeCapsuleParam[];
}

export class NotifyBirthdayParam {
  @ValidateNested({ each: true })
  @Type(() => BirthdayUserWithFamilyParam)
  familyIdsWithUserId: BirthdayUserWithFamilyParam[];
}

class BirthdayUserWithFamilyParam {
  @IsNumber()
  familyId: number;

  @IsNumber()
  birthdayUserId: number;
}

class TimeCapsuleParam {
  @IsNumber()
  letterId: number;

  @IsNumber()
  receiverId: number;

  @IsNumber()
  senderId: number;

  @IsNumber()
  familyId: number;
}
