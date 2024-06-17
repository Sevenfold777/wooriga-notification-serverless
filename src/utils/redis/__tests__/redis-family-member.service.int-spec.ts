import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import { Redis } from "ioredis";
import {
  FAMILY_ID_PREFIX,
  RedisUserInfoType,
  USER_ID_PREFIX,
} from "../redis-family-member.type";
import {
  FAMILY_ID_BASE,
  TEST_FAMILY_COUNT,
  TEST_MEMBERS_EACH_COUNT,
  USER_ID_BASE,
} from "./config";
import "dotenv/config";

describe("redis service integration test", () => {
  let redisFamilyMemberService: RedisFamilyMemberService;
  let redis: Redis;

  beforeAll(async () => {
    // generate test data
    redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    });
    redisFamilyMemberService = new RedisFamilyMemberService(redis);

    const pipeline = redis.pipeline();

    for (let x = 1; x < TEST_FAMILY_COUNT + 1; x++) {
      const familyId = FAMILY_ID_BASE + x;

      for (let y = 1; y < TEST_MEMBERS_EACH_COUNT + 1; y++) {
        const userId = USER_ID_BASE + (x - 1) * TEST_MEMBERS_EACH_COUNT + y;

        const userInfo: RedisUserInfoType = {
          userName: `name_${familyId}_${userId}`,
          fcmToken: `token_${familyId}_${userId}`,
          mktPushAgreed: Boolean(userId),
        };

        const userIdKey = USER_ID_PREFIX + String(userId);
        const user = { [userIdKey]: JSON.stringify(userInfo) };

        const familyIdKey = FAMILY_ID_PREFIX + String(familyId);
        pipeline.hset(familyIdKey, user);
      }
    }

    await pipeline.exec();
  });

  afterAll(async () => {
    // clear test data
    await redis.unlink(
      [...Array(TEST_FAMILY_COUNT).keys()].map(
        (x) => FAMILY_ID_PREFIX + String(x + 1 + FAMILY_ID_BASE)
      )
    );

    await redis.quit();
  });

  it("get Family", async () => {
    const tgtFamilyId = FAMILY_ID_BASE + 5;

    const familyMembers = await redisFamilyMemberService.getFamily(tgtFamilyId);

    familyMembers.sort((a, b) => a.userId - b.userId);

    expect(familyMembers.length).toBe(TEST_MEMBERS_EACH_COUNT);

    familyMembers.forEach((user, idx) => {
      const tgtUserId =
        USER_ID_BASE +
        (idx + 1) +
        (tgtFamilyId - FAMILY_ID_BASE - 1) * TEST_MEMBERS_EACH_COUNT;

      expect(user.familyId).toBe(tgtFamilyId);
      expect(user.userId).toBe(tgtUserId);
      expect(user.userName).toBe(`name_${tgtFamilyId}_${tgtUserId}`);
      expect(user.fcmToken).toBe(`token_${tgtFamilyId}_${tgtUserId}`);
      expect(user.mktPushAgreed).toBe(Boolean(tgtUserId));
    });
  });

  it("get User", async () => {
    // 5번 가족의, 2번 사용자
    const tgtFamilyId = FAMILY_ID_BASE + 5;
    const tgtUserId =
      USER_ID_BASE +
      2 +
      (tgtFamilyId - FAMILY_ID_BASE - 1) * TEST_MEMBERS_EACH_COUNT;

    const familyMember = await redisFamilyMemberService.getUser(
      tgtFamilyId,
      tgtUserId
    );

    expect(familyMember.familyId).toBe(tgtFamilyId);
    expect(familyMember.userId).toBe(tgtUserId);
    expect(familyMember.userName).toBe(`name_${tgtFamilyId}_${tgtUserId}`);
    expect(familyMember.fcmToken).toBe(`token_${tgtFamilyId}_${tgtUserId}`);
    expect(familyMember.mktPushAgreed).toBe(Boolean(tgtUserId));
  });

  it("get FamilyMembers By Ids", async () => {
    const TGT_FAMILY_COUNT = 5;
    // const TGT_FAMILY_COUNT = TEST_FAMILY_COUNT; // 가족 전체 검색용 테스트

    const tgtFamilyIds = [...Array(TGT_FAMILY_COUNT).keys()].map(
      (x) => FAMILY_ID_BASE + 2 * x + 1
    );

    // const tgtFamilyIds = [...Array(TGT_FAMILY_COUNT).keys()].map(
    //   (x) => FAMILY_ID_BASE + x + 1
    // ); // 가족 전체 검색용 테스트

    const users = await redisFamilyMemberService.getFamilyMembersByIds(
      tgtFamilyIds
    );

    users.sort((a, b) => {
      if (a.familyId < b.familyId) return -1;
      else if (a.familyId > b.familyId) return 1;
      else return a.userId - b.userId;
    });

    expect(users.length).toBe(TGT_FAMILY_COUNT * TEST_MEMBERS_EACH_COUNT);

    users.forEach((user, idx) => {
      const familyId = tgtFamilyIds[Math.floor(idx / TEST_MEMBERS_EACH_COUNT)];
      const userId =
        USER_ID_BASE +
        (familyId - FAMILY_ID_BASE - 1) * TEST_MEMBERS_EACH_COUNT +
        ((idx % TEST_MEMBERS_EACH_COUNT) + 1);

      expect(user.familyId).toBe(familyId);
      expect(user.userId).toBe(userId);
      expect(user.userName).toBe(`name_${familyId}_${userId}`);
      expect(user.fcmToken).toBe(`token_${familyId}_${userId}`);
      expect(user.mktPushAgreed).toBe(Boolean(userId));
    });
  });
});
