import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { FamilyPediaHandler } from "../family-pedia.handler";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { FamilyMember } from "src/utils/redis/family-member.entity";

jest.mock("src/utils/redis/redis-family-member.service");

describe("family-pedia handler unit test", () => {
  let familyPediaHandler: FamilyPediaHandler;
  let mockRedisFamilyMemberService: jest.Mocked<RedisFamilyMemberService>;

  beforeAll(() => {
    mockRedisFamilyMemberService = new RedisFamilyMemberService(
      new MockRedis()
    ) as jest.Mocked<RedisFamilyMemberService>;

    // mock sendNotification to inject to handler constructor
    const mockSendNotification = jest.fn((args: SendNotifcationParamType) =>
      Promise.resolve(true)
    );

    familyPediaHandler = new FamilyPediaHandler(
      mockRedisFamilyMemberService,
      mockSendNotification
    );
  });

  it("family-pedia question created", async () => {
    // given
    const familyId = 10005;

    const member1 = new FamilyMember(
      familyId,
      20013,
      "name_10005_20013",
      "token_10005_20013",
      true
    );

    mockRedisFamilyMemberService.getUser.mockResolvedValueOnce(member1);

    // when
    const { result, usersNotified } =
      await familyPediaHandler.pediaQuestionCreated({
        familyId,
        ownerId: member1.userId,
      });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(1);

    expect(usersNotified[0]).toEqual(member1);
  });

  it("family-pedia question editted", async () => {
    // given
    const familyId = 10005;

    const member1 = new FamilyMember(
      familyId,
      20013,
      "name_10005_20013",
      "token_10005_20013",
      true
    );

    mockRedisFamilyMemberService.getUser.mockResolvedValueOnce(member1);

    // when
    const { result, usersNotified } =
      await familyPediaHandler.pediaQuestionEditted({
        familyId,
        ownerId: member1.userId,
      });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(1);

    expect(usersNotified[0]).toEqual(member1);
  });

  it("family-pedia answered", async () => {
    // given
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
    const { result, usersNotified } = await familyPediaHandler.pediaAnswer({
      familyId,
      ownerId: member2.userId,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length - 1);

    expect(usersNotified).not.toContainEqual(member2);
    expect(usersNotified[0]).toEqual(member1);
    expect(usersNotified[1]).toEqual(member3);
  });

  it("family-pedia edit photo", async () => {
    // given
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
    const { result, usersNotified } = await familyPediaHandler.pediaEditPhoto({
      familyId,
      ownerId: member2.userId,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyMembers.length - 1);

    expect(usersNotified).not.toContainEqual(member2);
    expect(usersNotified[0]).toEqual(member1);
    expect(usersNotified[1]).toEqual(member3);
  });
});
