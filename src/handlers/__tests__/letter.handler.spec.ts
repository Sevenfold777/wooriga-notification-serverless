import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { LetterHandler } from "../letter.handler";
import { FamilyMember } from "src/utils/redis/family-member.entity";
import {
  NotifyBirthdayParam,
  TimeCapsulesOpenParam,
} from "src/constants/letter-notification";

jest.mock("src/utils/redis/redis-family-member.service");

describe("letter handler unit test", () => {
  let letterHandler: LetterHandler;
  let mockRedisFamilyMemberService: jest.Mocked<RedisFamilyMemberService>;

  beforeAll(() => {
    mockRedisFamilyMemberService = new RedisFamilyMemberService(
      new MockRedis()
    ) as jest.Mocked<RedisFamilyMemberService>;

    const mockSendNotification = jest.fn((args: SendNotifcationParamType) =>
      Promise.resolve(true)
    );

    letterHandler = new LetterHandler(
      mockRedisFamilyMemberService,
      mockSendNotification
    );
  });

  it("letter send", async () => {
    // given
    const randomLetterId = 1;
    const randomIsTimeCapsule = false;

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
    const { result, usersNotified } = await letterHandler.letterSend({
      letterId: randomLetterId,
      receiverId: member1.userId,
      familyId,
      isTimeCapsule: randomIsTimeCapsule,
    });

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(1);

    expect(usersNotified[0]).toEqual(member1);
  });

  it("time capsule open", async () => {
    // given: mock three families
    const USERS_IN_FAMILY_COUNT = 3;
    const RECEIVER_IDX = 1;
    const SENDER_IDX = 2;

    const mockFamilyIds = [10001, 10002, 10003];
    let newUserId = 20001;

    const mockFamilyMembers = mockFamilyIds.map((familyId) => {
      const family: FamilyMember[] = [];

      for (let i = 0; i < USERS_IN_FAMILY_COUNT; i++) {
        family.push(
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

      return family;
    });

    mockRedisFamilyMemberService.getFamily
      .mockResolvedValueOnce(mockFamilyMembers[0])
      .mockResolvedValueOnce(mockFamilyMembers[1])
      .mockResolvedValueOnce(mockFamilyMembers[2]);

    const mockTimeCapsulse: TimeCapsulesOpenParam = {
      timaCapsules: mockFamilyIds.map((familyId, idx) => {
        const randomLetterId = familyId;

        return {
          letterId: randomLetterId,
          receiverId: mockFamilyMembers[idx][RECEIVER_IDX].userId,
          senderId: mockFamilyMembers[idx][SENDER_IDX].userId,
          familyId,
        };
      }),
    };

    // when
    const { result, usersNotified } = await letterHandler.timeCapsuleOpen(
      mockTimeCapsulse
    );

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(mockFamilyIds.length * 2);

    usersNotified.forEach((user, idx) => {
      const familyIndex = Math.floor(idx / 2);
      const userIndex = idx % 2 ? SENDER_IDX : RECEIVER_IDX;

      expect(user).toEqual(mockFamilyMembers[familyIndex][userIndex]);
    });
  });

  it("notify birthday", async () => {
    // given: mock three families
    const USERS_IN_FAMILY_COUNT = 3;
    const BIRTHDAY_USER_IDX = 1;

    const mockFamilyIds = [10001, 10002, 10003];
    let newUserId = 20001;

    const mockFamilyMembers = mockFamilyIds.map((familyId) => {
      const family: FamilyMember[] = [];

      for (let i = 0; i < USERS_IN_FAMILY_COUNT; i++) {
        family.push(
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

      return family;
    });

    mockRedisFamilyMemberService.getFamily
      .mockResolvedValueOnce(mockFamilyMembers[0])
      .mockResolvedValueOnce(mockFamilyMembers[1])
      .mockResolvedValueOnce(mockFamilyMembers[2]);

    const mockFamilyIdsWithBirthdayUserId: NotifyBirthdayParam = {
      familyIdsWithBirthdayUserId: [
        {
          familyId: mockFamilyIds[0],
          birthdayUserId: mockFamilyMembers[0][BIRTHDAY_USER_IDX].userId,
        },
        {
          familyId: mockFamilyIds[1],
          birthdayUserId: mockFamilyMembers[1][BIRTHDAY_USER_IDX].userId,
        },
        {
          familyId: mockFamilyIds[2],
          birthdayUserId: mockFamilyMembers[2][BIRTHDAY_USER_IDX].userId,
        },
      ],
    };

    // when
    const { result, usersNotified } = await letterHandler.notifyBirthDay(
      mockFamilyIdsWithBirthdayUserId
    );

    // then
    expect(result).toBe(true);
    expect(usersNotified.length).toBe(
      mockFamilyIds.length * USERS_IN_FAMILY_COUNT - USERS_IN_FAMILY_COUNT
    );

    for (let i = 0; i < mockFamilyIds.length; i++) {
      for (let j = 0; j < USERS_IN_FAMILY_COUNT; j++) {
        if (j === BIRTHDAY_USER_IDX) {
          expect(usersNotified).not.toContainEqual(mockFamilyMembers[i][j]);
        } else {
          expect(usersNotified).toContainEqual(mockFamilyMembers[i][j]);
        }
      }
    }
  });
});
