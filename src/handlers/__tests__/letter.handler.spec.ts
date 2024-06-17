import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import MockRedis from "ioredis-mock";
import { SendNotifcationParamType } from "src/utils/fcm/send-notification.type";
import { LetterHandler } from "../letter.handler";
import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";
import {
  NotifyBirthdayParam,
  TimeCapsulesOpenParam,
} from "src/constants/letter-notification";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { mockClient } from "aws-sdk-client-mock";

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

    // mock sqs client
    const sqsClient = new SQSClient();
    const mockSQSClient = mockClient(sqsClient);
    mockSQSClient.on(SendMessageCommand).resolves({});

    letterHandler = new LetterHandler(
      mockRedisFamilyMemberService,
      mockSendNotification,
      sqsClient
    );
  });

  it("letter send", async () => {
    // given
    const randomLetterId = 1;
    const randomIsTimeCapsule = false;

    const familyId = 10005;

    const member1 = new RedisFamilyMember();
    member1.familyId = familyId;
    member1.userId = 20013;
    member1.userName = "name_10005_20013";
    member1.fcmToken = "token_10005_20013";
    member1.mktPushAgreed = true;

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
      const family: RedisFamilyMember[] = [];

      for (let i = 0; i < USERS_IN_FAMILY_COUNT; i++) {
        const member1 = new RedisFamilyMember();
        member1.familyId = familyId;
        member1.userId = newUserId;
        member1.userName = `name_${familyId}_${newUserId}`;
        member1.fcmToken = `token_${familyId}_${newUserId}`;
        member1.mktPushAgreed = true;

        family.push(member1);

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
      const family: RedisFamilyMember[] = [];

      for (let i = 0; i < USERS_IN_FAMILY_COUNT; i++) {
        const member1 = new RedisFamilyMember();
        member1.familyId = familyId;
        member1.userId = newUserId;
        member1.userName = `name_${familyId}_${newUserId}`;
        member1.fcmToken = `token_${familyId}_${newUserId}`;
        member1.mktPushAgreed = true;

        family.push(member1);

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
