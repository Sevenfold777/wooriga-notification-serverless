import {
  NotificationParamType,
  NotificationType,
} from "../constants/notification-type";

export class SqsNotificationReqDTO<T extends NotificationType> {
  type: T;

  param: NotificationParamType[T];
}
