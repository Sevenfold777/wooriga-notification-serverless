import { FamilyMember } from "src/utils/redis/family-member.entity";

export type HandlerReturnType = {
  result: boolean;

  usersNotified?: FamilyMember[];
};
