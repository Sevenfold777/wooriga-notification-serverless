import MockRedis from "ioredis-mock";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { PhotoHandler } from "../photo.handler";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { sendNotification } from "src/utils/fcm/send-notification";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";

jest.mock("src/utils/redis/redis-family-member.service");

describe("photo handler unit test", () => {
  let photoHandler: PhotoHandler;
  let mockRedisFamilyMemberService: jest.Mocked<RedisFamilyMemberService>;
  let mockSendNotification: typeof sendNotification;

  beforeAll(() => {
    mockRedisFamilyMemberService = new RedisFamilyMemberService(
      new MockRedis()
    ) as jest.Mocked<RedisFamilyMemberService>;

    mockSendNotification = jest.fn((args: SendNotifcationParamType) =>
      Promise.resolve(true)
    );

    // mock sqs client
    const sqsClient = new SQSClient();
    const mockSQSClient = mockClient(sqsClient);
    mockSQSClient.on(SendMessageCommand).resolves({});

    photoHandler = new PhotoHandler(
      mockRedisFamilyMemberService,
      mockSendNotification,
      sqsClient
    );
  });

  it("photo create", async () => {
    // given
    const randomPhotoId = 1;
    const randomTitlePreview = "this is comment preview";

    const familyId = 10005;

    const member1 = new RedisFamilyMember();
    member1.familyId = familyId;
    member1.userId = 20013;
    member1.userName = "name_10005_20013";
    member1.fcmToken = "token_10005_20013";
    member1.mktPushAgreed = true;

    const member2 = new RedisFamilyMember();
    member2.familyId = familyId;
    member2.userId = 20014;
    member2.userName = "name_10005_20014";
    member2.fcmToken = "token_10005_20014";
    member2.mktPushAgreed = true;

    const member3 = new RedisFamilyMember();
    member3.familyId = familyId;
    member3.userId = 20015;
    member3.userName = "name_10005_20015";
    member3.fcmToken = "token_10005_20015";
    member3.mktPushAgreed = true;

    const mockFamilyMembers = [member1, member2, member3];

    mockRedisFamilyMemberService.getFamily.mockResolvedValueOnce(
      mockFamilyMembers
    );

    // when
    const { result, usersNotified } = await photoHandler.photoCreate({
      familyId,
      authorId: member2.userId,
      photoId: randomPhotoId,
      titlePreview: randomTitlePreview,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length);

    expect(usersNotified).toContainEqual(member1);
    expect(usersNotified).toContainEqual(member2);
    expect(usersNotified).toContainEqual(member3);

    // handler return에서 author가 0번에 나오도록 설정되어 있음 (테스트용, 알림 서버 운영과 무관)
    expect(usersNotified[0]).toEqual(member2);
  });

  it("comment photo", async () => {
    // given
    const randomPhotoId = 1;
    const randomCommentPreview = "this is comment preview";

    const familyId = 10005;
    const member1 = new RedisFamilyMember();
    member1.familyId = familyId;
    member1.userId = 20013;
    member1.userName = "name_10005_20013";
    member1.fcmToken = "token_10005_20013";
    member1.mktPushAgreed = true;

    const member2 = new RedisFamilyMember();
    member2.familyId = familyId;
    member2.userId = 20014;
    member2.userName = "name_10005_20014";
    member2.fcmToken = "token_10005_20014";
    member2.mktPushAgreed = true;

    const member3 = new RedisFamilyMember();
    member3.familyId = familyId;
    member3.userId = 20015;
    member3.userName = "name_10005_20015";
    member3.fcmToken = "token_10005_20015";
    member3.mktPushAgreed = true;

    const mockFamilyMembers = [member1, member2, member3];

    mockRedisFamilyMemberService.getFamily.mockResolvedValueOnce(
      mockFamilyMembers
    );

    // when
    const { result, usersNotified } = await photoHandler.commentPhoto({
      familyId,
      authorId: member1.userId,
      photoId: randomPhotoId,
      commentPreview: randomCommentPreview,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length - 1);

    expect(usersNotified).not.toContainEqual(member1);
    expect(usersNotified).toContainEqual(member2);
    expect(usersNotified).toContainEqual(member3);
  });
});
