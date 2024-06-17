import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { DailyEmotionHandler } from "./../daily-emotion.handler";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { mockClient } from "aws-sdk-client-mock";

jest.mock("src/utils/redis/redis-family-member.service");

const mockSendNotification = jest.fn((args: SendNotifcationParamType) =>
  Promise.resolve(true)
);

describe("daily-emotion handler unit test", () => {
  let dailyEmotionHandler: DailyEmotionHandler;
  let mockRedisFamilyMemberService: jest.Mocked<RedisFamilyMemberService>;

  beforeAll(() => {
    mockRedisFamilyMemberService = new RedisFamilyMemberService(
      new MockRedis()
    ) as jest.Mocked<RedisFamilyMemberService>;

    // mock sqs client
    const sqsClient = new SQSClient();
    const mockSQSClient = mockClient(sqsClient);
    mockSQSClient.on(SendMessageCommand).resolves({});

    dailyEmotionHandler = new DailyEmotionHandler(
      mockRedisFamilyMemberService,
      mockSendNotification,
      sqsClient
    );
  });

  it("handle emotion chosen", async () => {
    // given
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
    const { result, usersNotified } = await dailyEmotionHandler.emotionChosen({
      familyId,
      userId: member2.userId,
    });

    usersNotified.sort((a, b) => a.userId - b.userId);

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length - 1);

    expect(usersNotified).not.toContainEqual(member2);
    expect(usersNotified[0]).toEqual(member1);
    expect(usersNotified[1]).toEqual(member3);
  });

  it("handle emotion poke", async () => {
    // given
    const familyId = 10005;

    const member1 = new RedisFamilyMember();
    member1.familyId = familyId;
    member1.userId = 20013;
    member1.userName = "name_10005_20013";
    member1.fcmToken = "token_10005_20013";
    member1.mktPushAgreed = true;

    mockRedisFamilyMemberService.getUser.mockResolvedValueOnce(member1);

    // when
    const { result, usersNotified } = await dailyEmotionHandler.emotionPoke({
      familyId,
      userId: member1.userId,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(1);

    expect(usersNotified[0]).toEqual(member1);
  });
});
