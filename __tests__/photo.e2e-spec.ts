import { NotificationType } from 'src/constants/notification-type';
import { handler } from '../index';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';
import { mockContextGenerator } from './utils/mock-context-generator';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';

describe('photo e2e test', () => {
  it('photo create test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(NotificationType.PHOTO_CREATE, {
      familyId: 3,
      photoId: 39,
      authorId: 4,
      titlePreview: '사진 제목 미리보기',
    });

    const testRecord = mockEventRecordGenerator(sqsReqDTO);
    const mockContext = mockContextGenerator({});

    // when
    await handler({ Records: [testRecord] }, mockContext);

    // then
    // check RN launched
    // check notification store queue
  });

  it('comment photo test', async () => {
    // given
    const sqsReqDTO = new SqsNotificationReqDTO(
      NotificationType.COMMENT_PHOTO,
      {
        familyId: 3,
        photoId: 39,
        authorId: 3,
        commentPreview: '사진 댓글 테스트 미리보기',
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
