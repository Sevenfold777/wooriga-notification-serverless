import { IsBoolean, IsNotEmpty, IsNumber, IsString } from "class-validator";

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

  constructor(
    familyId: number,
    userId: number,
    userName: string,
    fcmToken: string,
    mktPushAgreed: boolean
  ) {
    this.familyId = familyId;
    this.userId = userId;
    this.userName = userName;
    this.fcmToken = fcmToken;
    this.mktPushAgreed = mktPushAgreed;
  }
}
