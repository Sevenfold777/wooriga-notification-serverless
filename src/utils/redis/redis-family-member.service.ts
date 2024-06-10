import { RedisClientType, createClient } from "redis";
import { FamilyMember } from "./family-member.entity";
import { RedisUserInfoType } from "./redis-user-info.type";
import { UserStatus } from "./user-status.enum";

export class RedisFamilyMemberService {
  private client: RedisClientType;

  constructor() {
    this.client = createClient();
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
      const familyRaw = await this.client.hGetAll(String(familyId));

      const familyMembers: FamilyMember[] = [];
      const userIds = Object.keys(familyRaw);

      for (const userId of userIds) {
        const { userName, fcmToken, mktPushAreed, status }: RedisUserInfoType =
          JSON.parse(familyRaw[userId]);

        const member = new FamilyMember(
          familyId,
          parseInt(userId),
          userName,
          fcmToken,
          mktPushAreed,
          UserStatus[status]
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
      const userInfoRaw = await this.client.hGet(
        String(familyId),
        String(userId)
      );

      const { userName, fcmToken, mktPushAreed, status }: RedisUserInfoType =
        JSON.parse(userInfoRaw[userId]);

      const member = new FamilyMember(
        familyId,
        userId,
        userName,
        fcmToken,
        mktPushAreed,
        UserStatus[status]
      );

      return member;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * 소수의 family id list를 입력 받아 여러 family를 반환
   * 내부적으로는 반복문과 HGETALL을 사용
   * Promise.allSettled를 사용하여 애플리케이션 수준에서의 병렬처리 노력
   * (redis가 싱글스레드이기에 큰 차이가 없을 수도 => TODO: 비교 테스트)
   * @param familyIds 찾고자 하는 familyId(redis key)의 집합
   * @usecase messageToday
   */
  async getFamilyMembersByIds(familyIds: number[]): Promise<FamilyMember[]> {
    try {
      const usersFound: FamilyMember[] = [];

      for (const familyId of familyIds) {
        const familyMembers = await this.getFamily(familyId);
        usersFound.push(...familyMembers);
      }

      return usersFound;
    } catch (e) {
      throw new Error(e.message);
    }
  }

  /**
   * 반환하지 않을 소수의 family id list를 입력 받아 full scan에 가까운 작업
   * KEYS 대신 SCAN을 사용하여 redis의 싱글스레드가 blocking되는 것을 방지
   * 사용하는 memory 용량은 500MB이고, 하나의 user entity는 약 300바이트의 크기를 갖기에
   * 전체 user를 메모리에 올리기에 매우 충분
   * 150만 이상의 사용자에 대하여 효율적인 TTL 운영으로 처리 가능할 듯 (장기 미사용 유저 등)
   * 장기적으로는 샤딩 고려
   * @param exceptFamilyIds 찾고자 하는 familyId(redis key)의 집합
   * @usecase messageToday
   */
  async scanFamilyMembersExceptIds(
    exceptFamilyIds: number[]
  ): Promise<FamilyMember[]> {
    try {
      return null;
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
