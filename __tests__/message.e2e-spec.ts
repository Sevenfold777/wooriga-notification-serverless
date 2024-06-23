import { NotificationType } from 'src/constants/notification-type';
import { handler } from '../index';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';
import { mockContextGenerator } from './utils/mock-context-generator';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';

describe('message e2e test', () => {
  it('message today test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.MESSAGE_TODAY,
      {
        familyIds: [3, 7],
      },
    );

    const emotionChosenRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [emotionChosenRecord] }, mockContext);

    // then
    // check RN launched
    // family:7은 redis에 저장되어 있지 않음 => 에러 발생시키지 않고 무시, family:3에 정상적으로 알림 전송
  });

  it('message birthday test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.MESSAGE_BIRTHDAY,
      { familyIds: [3, 7] },
    );

    const emotionChosenRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [emotionChosenRecord] }, mockContext);

    // then
    // check RN launched
    // family:7은 redis에 저장되어 있지 않음 => 에러 발생시키지 않고 무시, family:3에 정상적으로 알림 전송
  });

  it('comment message test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.COMMENT_MESSAGE,
      {
        familyId: 3,
        messageFamId: 29001,
        authorId: 3,
        commentPreview: '댓글 미리보기 테스트',
      },
    );

    const emotionChosenRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [emotionChosenRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });
});
