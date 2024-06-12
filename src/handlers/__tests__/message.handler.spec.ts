import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { MessageHandler } from "../message.handler";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { FamilyMember } from "src/utils/redis/family-member.entity";

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

    messageHandler = new MessageHandler(
      mockRedisFamilyMemberService,
      mockSendNotification
    );
  });

  it("message today", async () => {
    // given: mock three families
    const mockFamilyIds = [10001, 10002, 10003];
    let newUserId = 20001;
    const mockFamilyMembers: FamilyMember[] = [];

    mockFamilyIds.forEach((familyId) => {
      for (let i = 0; i < 3; i++) {
        mockFamilyMembers.push(
          new FamilyMember(
            familyId,
            newUserId,
            `name_${familyId}_${newUserId}`,
            `token_${familyId}_${newUserId}`,
            true
          )
        );

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
    const mockFamilyMembers: FamilyMember[] = [];

    mockFamilyIds.forEach((familyId) => {
      for (let i = 0; i < 3; i++) {
        mockFamilyMembers.push(
          new FamilyMember(
            familyId,
            newUserId,
            `name_${familyId}_${newUserId}`,
            `token_${familyId}_${newUserId}`,
            true
          )
        );

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

    const member1 = new FamilyMember(
      familyId,
      20013,
      "name_10005_20013",
      "token_10005_20013",
      true
    );

    const member2 = new FamilyMember(
      familyId,
      20014,
      "name_10005_20014",
      "token_10005_20014",
      true
    );

    const member3 = new FamilyMember(
      familyId,
      20015,
      "name_10005_20015",
      "token_10005_20015",
      true
    );

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
