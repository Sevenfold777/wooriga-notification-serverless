import { NotificationType } from 'src/constants/notification-type';
import { handler } from '../index';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';
import { mockContextGenerator } from './utils/mock-context-generator';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';

describe('daily emotion e2e test', () => {
  it('emotion chosen test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.EMOTION_CHOSEN,
      {
        familyId: 3,
        userId: 4,
      },
    );

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
  });

  it('emotion chosen test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.EMOTION_POKE, {
      familyId: 3,
      userId: 4,
    });

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
  });

  it('emotion poke test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.EMOTION_POKE, {
      familyId: 3,
      userId: 4,
    });
    const testRecord = mockEventRecordGenerator(sqsReqDTO);

    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
  });
});
