import { handler } from 'index';
import { mockEventRecordGenerator } from './utils/mock-event-record-generator';
import { mockContextGenerator } from './utils/mock-context-generator';
import { SqsNotificationReqDTO } from 'src/dto/sqs-notification-req.dto';
import { NotificationType } from 'src/constants/notification-type';

/**
 * AWARE: 한 번에 3개의 세부 테스르틀 실행하면 fcm already initialized 에러 발생
 * 일단 번거로워도 한 개 식 테스트 진행
 * 여러 방법이 있을 수 있지만, 그래도 serverless의 cold start와
 * 가장 유사한 e2e 테스트를 위해 이렇게 진행
 */
describe('multiple sqs messages 동시 처리 e2e', () => {
  it('모두 정상적인 요청', async () => {
    // given
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const sqsReqDTO1 = new SqsNotificationReqDTO(
      NotificationType.EMOTION_CHOSEN,
      {
        familyId: 3,
        userId: 4,
      },
    ); // 알림: count(familyMembers) - 1개
    const mockRecord1 = mockEventRecordGenerator(sqsReqDTO1);

    const sqsReqDTO2 = new SqsNotificationReqDTO(
      NotificationType.PEDIA_ANSWER,
      {
        familyId: 3,
        ownerId: 4,
      },
    ); // 알림: count(familyMembers) - 1개
    const mockRecord2 = mockEventRecordGenerator(sqsReqDTO2);

    const sqsReqDTO3 = new SqsNotificationReqDTO(
      NotificationType.COMMENT_MESSAGE,
      {
        familyId: 3,
        messageFamId: 29001,
        authorId: 3,
        commentPreview: '댓글 미리보기 테스트',
      },
    ); // 알림: count(familyMembers) - 1개
    const mockRecord3 = mockEventRecordGenerator(sqsReqDTO3);

    const mockContext = mockContextGenerator({});

    // when
    await handler(
      { Records: [mockRecord1, mockRecord2, mockRecord3] },
      mockContext,
    );

    // then
    // check RN & AWS SQS manually

    /* 
        에러 한 번만 나야 하지만
        sqs client credentials 설정하지 않으면 2번 나야 함 (emotion chosen은 sqs store 요청 없음)
        AWARE: SQS까지 e2e test 하려면 expect 1로 바꾸고, index.ts에서 credentials 설정
    */
    // expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });

  it('비정상 요청도 존재', async () => {
    // given
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const sqsReqDTO1 = new SqsNotificationReqDTO(
      NotificationType.EMOTION_CHOSEN,
      {
        familyId: 3,
        userId: 4,
      },
    );
    const mockRecord1 = mockEventRecordGenerator(sqsReqDTO1);

    const sqsReqDTO2 = {
      type: NotificationType.PEDIA_ANSWER,
      param: {
        // familyId: 3, // 에러
        ownerId: 4,
      },
    };
    const mockRecord2 = mockEventRecordGenerator(
      sqsReqDTO2 as SqsNotificationReqDTO<NotificationType>,
    );

    const sqsReqDTO3 = new SqsNotificationReqDTO(
      NotificationType.COMMENT_MESSAGE,
      {
        familyId: 3,
        messageFamId: 29001,
        authorId: 3,
        commentPreview: '댓글 미리보기 테스트',
      },
    );
    const mockRecord3 = mockEventRecordGenerator(sqsReqDTO3);

    const mockContext = mockContextGenerator({});

    // when
    await handler(
      { Records: [mockRecord1, mockRecord2, mockRecord3] },
      mockContext,
    );

    // then
    // check RN & AWS SQS manually

    /* 
        에러 한 번만 나야 하지만
        sqs client credentials 설정하지 않으면 2번 나야 함
        AWARE: SQS까지 e2e test 하려면 expect 1로 바꾸고, index.ts에서 credentials 설정
    */
    // expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);
  });

  it('모두 비정상 요청', async () => {
    // given
    const consoleErrorSpy = jest.spyOn(console, 'error');

    const sqsReqDTO1 = {
      type: NotificationType.EMOTION_CHOSEN,
      param: {
        familyId: 3,
        // userId: 4, // 에러
      },
    };
    const mockRecord1 = mockEventRecordGenerator(
      sqsReqDTO1 as SqsNotificationReqDTO<NotificationType>,
    );

    const sqsReqDTO2 = {
      type: NotificationType.PEDIA_ANSWER,
      param: {
        // familyId: 3, // 에러
        ownerId: 4,
      },
    };
    const mockRecord2 = mockEventRecordGenerator(
      sqsReqDTO2 as SqsNotificationReqDTO<NotificationType>,
    );

    const sqsReqDTO3 = {
      type: NotificationType.COMMENT_MESSAGE,
      param: {
        familyId: 3,
        // messageFamId: 29001, // 에러
        authorId: 3,
        commentPreview: '댓글 미리보기 테스트',
      },
    };
    const mockRecord3 = mockEventRecordGenerator(
      sqsReqDTO3 as SqsNotificationReqDTO<NotificationType>,
    );

    const mockContext = mockContextGenerator({});

    // when
    await handler(
      { Records: [mockRecord1, mockRecord2, mockRecord3] },
      mockContext,
    );

    // then
    expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
  });
});
