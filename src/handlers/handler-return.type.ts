import { RedisFamilyMember } from "src/utils/redis/redis-family-member.entity";

export type HandlerReturnType = {
  result: boolean;

  usersNotified?: RedisFamilyMember[];
};
