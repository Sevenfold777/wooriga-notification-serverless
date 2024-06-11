import { Redis } from "ioredis";
import { FamilyMember } from "./family-member.entity";
import { RedisUserInfoType } from "./redis-user-info.type";

export class RedisFamilyMemberService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis();
  }

  /**
   * familyId를 입력 받아 소속된 모든 user를 반환
   * 내부적으로 redis의 HGETALL을 호출 O(1) time
   * 일반적인 HGETALL은 가족 구성원 수 n에 대하여 O(n)이나,
   * 우리가에서 가족 구성원의 수는 통상적으로 한 자리수로 제한됨 O(1)
   * @param familyId redis 데이터베이스의 key
   */
  async getFamily(familyId: number): Promise<FamilyMember[]> {
    try {
      const familyRaw = await this.redis.hgetall(String(familyId));

      const familyMembers: FamilyMember[] = [];
      const userIds = Object.keys(familyRaw);

      for (const userId of userIds) {
        const { userName, fcmToken, mktPushAreed }: RedisUserInfoType =
          JSON.parse(familyRaw[userId]);

        const member = new FamilyMember(
          familyId,
          parseInt(userId),
          userName,
          fcmToken,
          mktPushAreed
        );

        familyMembers.push(member);
      }

      return familyMembers;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * familyId와 userId를 입력 받아 해당되는 user를 반환
   * 내부적으로 redis의 HGET을 호출 O(1) time
   * @param familyId redis 데이터베이스의 key
   * @param userId redis 데이터베이스의 value는 Hash Map 자료형
   */
  async getUser(familyId: number, userId: number): Promise<FamilyMember> {
    try {
      const userInfoRaw = await this.redis.hget(
        String(familyId),
        String(userId)
      );

      const { userName, fcmToken, mktPushAreed }: RedisUserInfoType =
        JSON.parse(userInfoRaw[userId]);

      const member = new FamilyMember(
        familyId,
        userId,
        userName,
        fcmToken,
        mktPushAreed
      );

      return member;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * family id list를 입력 받아 여러 family를 반환
   * 내부적으로는 redis Pipeline을 통해 여러 개의 HGETALL을 batch 처리
   * pipeline을 통해 RTT 최적화 및 redis context switch overhead를 낮추어 성능 향상
   * @param familyIds 찾고자 하는 familyId(redis key)의 집합
   * @usecase messageToday
   * TODO: 성능 비교 테스트
   */
  async getFamilyMembersByIds(familyIds: number[]): Promise<FamilyMember[]> {
    try {
      const usersFound: FamilyMember[] = [];

      const pipeline = this.redis.pipeline();
      familyIds.forEach((familyId) => pipeline.hgetall(String(familyId)));

      const result = await pipeline.exec();

      if (pipeline.length !== familyIds.length) {
        throw new Error("Missed some request in pipeline.");
      }

      result.forEach(([err, familyRaw], idx) => {
        if (err) {
          console.error(`Redis Error: ${err.name} - ${err.message}`);
          return;
        }

        const familyId = familyIds[idx];
        const userIds = Object.keys(familyRaw);

        for (const userId of userIds) {
          const { userName, fcmToken, mktPushAreed }: RedisUserInfoType =
            JSON.parse(familyRaw[userId]);

          const user = new FamilyMember(
            familyId,
            parseInt(userId),
            userName,
            fcmToken,
            mktPushAreed
          );

          usersFound.push(user);
        }
      });

      return usersFound;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
