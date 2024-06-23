import { handler } from 'index';
import { NotificationType } from 'src/constants/notification-type';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';
import { mockContextGenerator } from './utils/mock-context-generator';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';

describe('family pedia emotion e2e test', () => {
  it('pedia question created test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.PEDIA_QUESTION_CREATED,
      {
        familyId: 3,
        ownerId: 4,
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

  it('pedia question editted test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.PEDIA_QUESTION_EDITTED,
      {
        familyId: 3,
        ownerId: 4,
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

  it('pedia question answered test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.PEDIA_ANSWER, {
      familyId: 3,
      ownerId: 4,
    });

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });

  it('pedia photo editted test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.PEDIA_EDIT_PHOTO,
      {
        familyId: 3,
        ownerId: 4,
        editorId: 3,
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
});
