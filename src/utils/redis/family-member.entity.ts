import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from "class-validator";
import { UserStatus } from "./user-status.enum";

export class FamilyMember {
  @IsNumber()
  familyId: number;

  @IsNumber()
  userId: number;

  @IsNotEmpty()
  @IsString()
  userName: string;

  @IsString()
  fcmToken: string;

  @IsBoolean()
  mktPushAgreed: boolean;

  @IsEnum(UserStatus)
  status: UserStatus;

  constructor(
    familyId: number,
    userId: number,
    userName: string,
    fcmToken: string,
    mktPushAgreed: boolean,
    status: UserStatus
  ) {
    this.familyId = familyId;
    this.userId = userId;
    this.userName = userName;
    this.fcmToken = fcmToken;
    this.mktPushAgreed = mktPushAgreed;
    this.status = status;
  }
}
