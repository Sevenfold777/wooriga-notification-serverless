import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { MessageHandler } from "../message.handler";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";

jest.mock("src/utils/redis/redis-family-member.service");

describe("message handler unit test", () => {
  let messageHandler: MessageHandler;
  let mockRedisFamilyMemberService: jest.Mocked<RedisFamilyMemberService>;

  beforeAll(() => {
    mockRedisFamilyMemberService = new RedisFamilyMemberService(
      new MockRedis()
    ) as jest.Mocked<RedisFamilyMemberService>;

    const mockSendNotification = jest.fn((args: SendNotifcationParamType) =>
      Promise.resolve(true)
    );

    // mock sqs client
    const sqsClient = new SQSClient();
    const mockSQSClient = mockClient(sqsClient);
    mockSQSClient.on(SendMessageCommand).resolves({});

    messageHandler = new MessageHandler(
      mockRedisFamilyMemberService,
      mockSendNotification,
      sqsClient
    );
  });

  it("message today", async () => {
    // given: mock three families
    const mockFamilyIds = [10001, 10002, 10003];
    let newUserId = 20001;
    const mockFamilyMembers: RedisFamilyMember[] = [];

    mockFamilyIds.forEach((familyId) => {
      for (let i = 0; i < 3; i++) {
        const member1 = new RedisFamilyMember();
        member1.familyId = familyId;
        member1.userId = newUserId;
        member1.userName = `name_${familyId}_${newUserId}`;
        member1.fcmToken = `token_${familyId}_${newUserId}`;
        member1.mktPushAgreed = true;

        mockFamilyMembers.push(member1);

        newUserId++;
      }
    });

    mockRedisFamilyMemberService.getFamilyMembersByIds.mockResolvedValueOnce(
      mockFamilyMembers
    );

    // when
    const { result, usersNotified } = await messageHandler.messageToday({
      familyIds: mockFamilyIds,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length);

    usersNotified.forEach((user, idx) =>
      expect(user).toEqual(mockFamilyMembers[idx])
    );
  });

  it("message birthday", async () => {
    // given: mock three families
    const mockFamilyIds = [10001, 10002, 10003];
    let newUserId = 20001;
    const mockFamilyMembers: RedisFamilyMember[] = [];

    mockFamilyIds.forEach((familyId) => {
      for (let i = 0; i < 3; i++) {
        const member1 = new RedisFamilyMember();
        member1.familyId = familyId;
        member1.userId = newUserId;
        member1.userName = `name_${familyId}_${newUserId}`;
        member1.fcmToken = `token_${familyId}_${newUserId}`;
        member1.mktPushAgreed = true;

        mockFamilyMembers.push(member1);

        newUserId++;
      }
    });

    mockRedisFamilyMemberService.getFamilyMembersByIds.mockResolvedValueOnce(
      mockFamilyMembers
    );

    // when
    const { result, usersNotified } = await messageHandler.messageToday({
      familyIds: mockFamilyIds,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length);

    usersNotified.forEach((user, idx) =>
      expect(user).toEqual(mockFamilyMembers[idx])
    );
  });

  it("comment message", async () => {
    // given
    const randomMessageFamId = 1;
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
    const { result, usersNotified } = await messageHandler.commentMessage({
      familyId,
      authorId: member3.userId,
      messageFamId: randomMessageFamId,
      commentPreview: randomCommentPreview,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length - 1);

    expect(usersNotified).not.toContainEqual(member3);
    expect(usersNotified).toContainEqual(member1);
    expect(usersNotified).toContainEqual(member2);
  });
});
