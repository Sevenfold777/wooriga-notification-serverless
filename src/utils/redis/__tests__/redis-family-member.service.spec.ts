import { RedisFamilyMemberService } from "src/utils/redis/redis-family-member.service";
import MockRedis from "ioredis-mock";
import { Redis } from "ioredis";
import { redisTestCase } from "./testcase";
import {
  FAMILY_ID_BASE,
  TEST_FAMILY_COUNT,
  TEST_MEMBERS_EACH_COUNT,
  USER_ID_BASE,
} from "./config";

describe("redis service unit test", () => {
  let mockRedis: Redis;
  let redisFamilyMemberService: RedisFamilyMemberService;

  beforeAll(() => {
    mockRedis = new MockRedis({
      data: redisTestCase,
    });

    redisFamilyMemberService = new RedisFamilyMemberService(mockRedis);
  });

  afterAll(async () => {
    // mock redis이기 때문에 실질적 효과는 없음
    await mockRedis.quit();
  });

  it("get Family", async () => {
    const tgtFamilyId = FAMILY_ID_BASE + 5;
    const tgtUserIdBase = USER_ID_BASE + 4 * TEST_MEMBERS_EACH_COUNT + 1;

    const familyMembers = await redisFamilyMemberService.getFamily(tgtFamilyId);
    familyMembers.sort((a, b) => a.userId - b.userId);

    familyMembers.forEach((member, idx) => {
      const userId = tgtUserIdBase + idx;

      expect(member.familyId).toBe(tgtFamilyId);
      expect(member.userId).toBe(userId);
      expect(member.fcmToken).not.toBeNull();
      expect(member.mktPushAgreed).not.toBeNull();
      expect(member.userName).not.toBeNull();
    });
  });

  it("get User", async () => {
    const tgtFamilyId = FAMILY_ID_BASE + 5;
    const tgtUserId = USER_ID_BASE + 4 * TEST_MEMBERS_EACH_COUNT + 1;

    const familyMember = await redisFamilyMemberService.getUser(
      tgtFamilyId,
      tgtUserId
    );

    expect(familyMember.familyId).toBe(tgtFamilyId);
    expect(familyMember.userId).toBe(tgtUserId);
    expect(familyMember.fcmToken).not.toBeNull();
    expect(familyMember.mktPushAgreed).not.toBeNull();
    expect(familyMember.userName).not.toBeNull();
  });

  it("get FamilyMembers By Ids", async () => {
    const tgtFamilyIdOffsets = [1, 6, 8, 9];
    const tgtFamilyIds = tgtFamilyIdOffsets.map(
      (offset) => FAMILY_ID_BASE + offset
    );
    const tgtUserIdBase = tgtFamilyIdOffsets.map(
      (offset) => USER_ID_BASE + (offset - 1) * TEST_MEMBERS_EACH_COUNT + 1
    );

    const users = await redisFamilyMemberService.getFamilyMembersByIds(
      tgtFamilyIds
    );

    users.sort((a, b) => {
      if (a.familyId < b.familyId) return -1;
      else if (a.familyId > b.familyId) return 1;
      else return a.userId - b.userId;
    });

    tgtFamilyIds.forEach((familyId, idx) => {
      const familyMembers = users.slice(
        idx * TEST_MEMBERS_EACH_COUNT,
        (idx + 1) * TEST_MEMBERS_EACH_COUNT
      );

      familyMembers.forEach((member, i) => {
        expect(member.familyId).toBe(familyId);
        expect(member.userId).toBe(tgtUserIdBase[idx] + i);
        expect(member.fcmToken).not.toBeNull();
        expect(member.mktPushAgreed).not.toBeNull();
        expect(member.userName).not.toBeNull();
      });
    });
  });
});
