import { NotificationType } from 'src/constants/notification-type';
import { handler } from '../index';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';
import { mockContextGenerator } from './utils/mock-context-generator';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';

describe('letter e2e test', () => {
  it('letter send test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.LETTER_SEND, {
      familyId: 3,
      letterId: 120,
      receiverId: 4,
      isTimeCapsule: false,
    });

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });

  it('timecapsule send test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.LETTER_SEND, {
      familyId: 3,
      letterId: 120,
      receiverId: 4,
      isTimeCapsule: true,
    });

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });

  it('timecapsule open test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.TIMECAPSULE_OPEN,
      {
        timaCapsules: [
          {
            familyId: 3,
            receiverId: 4,
            letterId: 120,
            senderId: 3,
          },
          {
            familyId: 3,
            receiverId: 13,
            letterId: 72,
            senderId: 4,
          },
        ],
      },
    );

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });

  it('notify birthday test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.NOTIFY_BIRTHDAY,
      {
        familyIdsWithBirthdayUserId: [
          { familyId: 3, birthdayUserId: 13 },
          { familyId: 7, birthdayUserId: 7 }, // redis에 저장되지 않은 것 (에러 발생하지 않고 무시하도록 expected)
        ],
      },
    );
    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // redis에 없는 family member 에러 없이 무시
  });
});
