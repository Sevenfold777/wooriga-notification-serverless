# 우리가 Serverless 알림 시스템

가족 소통 모바일 애플리케이션 `우리가`의 [메인 API 서버](https://github.com/Sevenfold777/wooriga-backend-gql.git)에 집중되는 부하와 책임을 분산시키고자 진행한 알림 시스템 분리 프로젝트로, `AWS Lambda` 환경에서 운영되는 `Node.js` `Serverless` 애플리케이션입니다.

우리가는 오늘의 이야기(`Message`) 가족앨범(`Photo`), 편지(`Letter`), 인물사전(`Family-Pedia`), 오늘의 감정(`Daily-Emotion`) 서비스를 제공하며 서비스 내에서 가족과의 교류가 발생 시 알림 시스템이 동작합니다. 매일 정오에 가족들이 함께 대화를 나누기 좋은 이야기(`Message`) 주제를 전송하며, 이야기 전송, 댓글 작성 등의 상황에서 알림 시스템이 작동합니다. 따라서 `메인 API`와 `알림 시스템` 모두 매일 정오에 트래픽이 몰리는 특성을 가지고 있습니다.

## 목차

- [Node.js Serverless 시스템 (Typescript)](#nodejs-serverless-시스템-typescript)

- [메인 API와 AWS SQS를 사용한 비동기 통신](#메인-api와-aws-sqs를-사용한-비동기-통신)

- [Repo 간 공유되는 DTO 관련 파일 동기화를 위해 Github Action를 통한 자동화 체계 구축](#repo-간-공유되는-dto-관련-파일-동기화를-위해-github-action를-통한-자동화-체계-구축)

- [Redis: 알림 전송을 위한 User DB 선택](#redis-알림-전송을-위한-user-db-선택)

- [Jest를 사용한 Unit / Integration / E2E 테스트 진행](#jest를-사용한-unit--integration--e2e-테스트-진행)

## Node.js Serverless 시스템 (Typescript)

- Serverless 시스템 선택

  - 최초 메인 API와 동일하게 AWS Elastic Beanstalk 환경에서 동작하는 NestJS API를 기획했으나 비용 문제 고민

  - 알림 전송 기능의 높지 않은 복잡도와 서비스 특성 상 피크 타임에 집중되는 알림 기능 사용량을 고려하여 `AWS Lambda`를 사용한 `Serverless` 환경에서 운영 결정

  - NestJS 역시 Serverless 환경에서 동작할 수 있도록 기능을 제공하지만 `Cold Start` 문제가 치명적이라는 생각, 더욱이 사용자는 알림 시스템에 대하여 Real Time에 가까운 수준을 기대하므로 `Cold Start` 이슈를 최대한 회피하고자 Bare `Node.js`로 프로젝트를 가볍게 구성

  - 프레임워크에 의존하지 않도록 결정했기에 `Typescript` 사용과 적절한 프로젝트 구조(directories), [철저한 테스트](#jest를-사용한-unit--integration--e2e-테스트-진행)가 필수적

- 프로젝트 구조

  - `index.ts`는 프로그램의 Entry Point로 알림을 처리하는 `Notification Handler`를 호출하며 `Redis`, `Firebase Admin SDK`, `SQS Client`와 같은 외부 API 모듈을 초기화하여 `Notification Handler`에 의존성 주입

  - "`index.ts` --> `notification handler` --> `각 서비스 handler`" 순의 하향식으로 초기화가 이루어지며 Configuration 및 의존성 주입 진행, NestJS나 Spring과 같은 `Singleton Pattern` 적용

  - 각 서비스 handler는 `Templates`, `DTO`, `utils` 등을 활용하여 세부 알림 로직 구현

  - 서비스 handler 각각의 method는 직접 구현한 `Custom Validator` 데코레이터를 적용하여 `SQS`로부터 전달 받은 DTO에 대한 validation 진행

  <img width=800 src="https://github.com/Sevenfold777/wooriga-notification-serverless/assets/88102203/7d21028d-0f9c-489d-9c3e-0811fa8541f3" />

  ```javascript
  ├── __tests__ // E2E Tests
  │   ├── daily-emotion.e2e-spec.ts
  │   ├── ...
  │   └── utils/
  │  
  ├── index.ts // Entry Point for the Lambda Function
  └── src
    ├── constants // shared: Notification Types
    │   ├── daily-emotion-notification.ts
    │   ├── ...
    │
    ├── dto // shared: DTOs
    │   ├── create-notification-req.dto.ts
    │   └── sqs-notification-req.dto.ts
    │
    ├── handlers
    │   ├── __tests__ // Unit Tests
    │   ├── daily-emotion.handler.ts
    │   ├── ...
    │  
    ├── notification.handler.spec.ts
    ├── notification.handler.ts // Entry Point for All Other Handlers
    │
    ├── templates // Notification Title, Body Templates
    │   ├── common.ts
    │   ├── daily-emotion.template.ts
    │   ├── family-pedia.template.ts
    │   ├── letter.template.ts
    │   ├── message.template.ts
    │   └── photo.template.ts
    │
    └── utils // utilities
        ├── custom-validate.decorator.ts
        ├── fcm
        ├── redis
        └── sqs

  ```

## 메인 API와 AWS SQS를 사용한 비동기 통신

- 알림 서비스 분리의 본질적 목표 - 메인 서비스 API 책임 분산

  - `Lambda` 함수를 trigger 하는 방법에 대한 고민으로 `API Gateway`와 `SQS` 사이 고민

  - `API Gateway`로 알림 시스템 `decoupling` 구현 시, 알림 서버의 코드는 물리적으로 분리되지만 결국 메인 서버는 알림 전송을 동기적으로 요청하게 되어 푸시알림의 성패가 메인 서버의 API에 영향을 미치는 문제 잔존, 즉, 완전한 `decoupling` 구현이라는 목표 달성에 아쉬움

  - 따라서 AWS의 Message Queue인 `SQS`를 도입하여 비동기 통신하도록 하여 `decoupling` 진행

  - 푸시 알림은 DAU에 직접적인 영향, 따라서 알림 요청이 누락되지 않고 `조금 늦더라도 반드시 전송`되도록 해야 하는 요구 사항 존재, SQS는 서버의 상황에 따라 전송 실패시 일정 기간 동안 알림 전송 요청을 Queue에 보관할 수 있기에 문제 해결에 적합

- FIFO Queue 선택

  - `SQS`가 제공하는 Queue의 종류로 순서와 중복 방지가 보장되지 않는 `Standard Queue`과 이들이 보장되는 `FIFO Queue`가 존재

  - 알림 시스템의 특성상 `순서 보장`이 중요하고 (예: 댓글 작성 순서), 푸시 알림이 `중복 전송`될 경우 사용자 경험에 부정적 영향이 큼, 따라서 `FIFO Queue` 선택 (특히, `Standard Queue`는 짧은 시간 안에 전송된 Message들에 대하여 순서 보장이 거의 제대로 지켜지지 않음)

- Batch job을 통한 FIFO Queue의 한계와 Cold Start 문제 돌파

  - FIFO Queue는 Standard Queue보다 적은, 초당 300 ~ 3000개의 메세지만을 기본적으로 지원

  - 또한 Lambda는 Cold Start 문제로 `성능 문제`가 존재함과 동시에, 종량제 과금이 이루어지므로 잦은 Cold Start는 `비용`에도 악영향

  - 따라서 Lambda에서 SQS Message를 `10개 Batch 단위`로 읽어와 SQS Message의 처리율과 Cold Start 대비 실제 함수 실행 시간을 높이도록 구성

  - 또한 메인 API에서 알림을 요청 시 가급적 `알림 대상 사용자를 그룹화` 하여 하나의 SQS Message에 담을 수 있도록 하여 문제 해결

- 추가적으로, `SQS`에 접근하기 위해서는 `AWS Credentials` 인증을 해야하므로 알림 시스템이 Public에 노출되어 자체 Authorization을 진행해야 하는 문제를 겪지 않고 시스템 분리에 성공

## Repo 간 공유되는 DTO 관련 파일 동기화를 위해 Github Action를 통한 자동화 체계 구축

- `src/constants` 내의 파일들에는 알림 타입을 나타내는 enum `NotificationType`과 SQS를 통해 수신되는 DTO의 type을 정의하는 `NotificationParamType`이 존재

- 이들은 알림 요청을 수신하는 알림 시스템과 요청은 전송하는 메인 API 모두에게 필요하기에, 각 프로젝트의 Repository에 항상 동일하게 존재해야 함

- 그러나 비즈니스 요구사항에 따라 새로운 종류의 알림이 추가되는 것은 빈번하므로, 이들에 대한 잦은 수정은 불가피

- 따라서 알림 시스템의 `src/constants` 내 파일이 수정되었을 경우, `git`을 사용하여 자동으로 이를 감지하고 메인 API Repository에 자동으로 변경 사항을 `commit`하고 `pull request`를 등록하도록 `Github Action Workflow`를 작성하여 자동화된 체계 구축

- `pull request`를 `merge`하고 개발 환경에서 `git pull`을 실행하면 아래와 같은 Compile Error 발생

  - 수정 전 (pull 직후)

    ![git pr merge 이후 pull 결과](https://github.com/Sevenfold777/wooriga-notification-serverless/assets/88102203/ed092f9e-a1a7-4580-b2d7-75c4c12c7343)

- [Github Actions Workflow 소스코드](https://github.com/Sevenfold777/wooriga-notification-serverless/blob/4a1fcf68deb679228c275f9adeccc18c7aff9e96/.github/workflows/sync-notif-constants.yml) 주요 파트

  ```yaml
  - name: Check difference between
    id: check_changes
    run: |
    git diff --quiet HEAD^ HEAD -- src/constants || echo "changes-detected=true" >>   $GITHUB_ENV

  - name: Sync notification constants & push commit & Create PR
    if: ${{ env.changes-detected == 'true' }}
    env:
      GITHUB_TOKEN: ${{secrets.GH_TOKEN}}
      MAIN_API_REPO: Sevenfold777/wooriga-backend-gql
      BRANCH_NAME: sync-notif-constants
    run: |
      git config --global user.name 'github-actions'
      git config --global user.email 'github-actions@github.com'
      git clone https://github.com/${{ env.MAIN_API_REPO }} main-api
      cp -r src/constants main-api/src/sqs-notification
      cd main-api
      git checkout -b ${{ env.BRANCH_NAME }}
      git add src/sqs-notification/constants
      git commit -m 'sync shared notification constants from notification repo'
    git push --set-upstream https://${{ env.GITHUB_TOKEN }}@github.com/${{ env.  MAIN_API_REPO }} $BRANCH_NAME
      gh pr create \
        --title "[Github Actions] 알림 repo와 Main API repo 동기화" \
      --body "Github Action에 의하여 알림 repo와 공유된 types, enums에서의 변경 감지, 이에 따른 동기화   요청" \
        --head "${{ env.BRANCH_NAME }}" \
        --base "main"
  ```

## Redis: 알림 전송을 위한 User DB 선택

- 알림 시스템 전용 DB 도입 필요성

  - 사용자는 알림 시스템에 대하여 Real Time에 가까운 기대를 가지고 있으나, `Cold Start`로 인해 약간의 delay가 이미 발생하는 환경, 메인 DB인 `Mysql`은 RDBMS로 속도에 최적화된 DB는 아님

  - 정오에 `오늘의 이야기`가 전송 될 때 `메인 API`와 `Mysql` 모두에 트래픽이 집중, `알림 시스템` 분리와 더불어 `전용 DB 분리`를 통해 메인 DB에 집중되는 트래픽 분산 필요

  - 따라서 전용 데이터 베이스는 RDBMS에 비해 속도에 최적화된 `Nosql` `키값 저장소`여야 한다고 생각했으며, 다른 infra와 마찬가지로 `AWS`에서 구동되며 관리 소요가 크지 않은 완전 관리형 DB이기를 희망

  - 알림 시스템에서 필요한 DB 정보는 용량이 작음, `familyId`, `userId`, `fcmToken`, `mktPushAgreed`로 총 300~ 400 bytes 내외

### DynamoDB : 최초 선택

- AWS의 완전관리형 키값 저장소로 요구 사항을 가장 충족한다고 생각하여 도입 시도를 위한 테스트 진행

  - `Partion Key`로 `familyId`, `Sort Key`로 `userId`를 설정하여 가족을 타겟한 알림은 Partition Key를 기반으로 한 `GetItem으로`, 특정 사용자를 타겟한 알림은 `Sort Key`를 활용한 `Query`를 통해 해결하기에 용이

  - `오늘의 이야기`가 전송되는 정오 피크 타임에 집중되는 알림 시스템 트래픽을 `RCU` (Read Capacity Unit) `Auto Scaling`을 통해 탄력적으로 처리 가능

  - AWS 완전관리형 서비스로 진입 장벽이 비교적 낮다고 생각

- 문제점 발생과 선택 변경의 필요성 대두

  - `우리가`에서 가장 중요한 서비스는 `오늘의 이야기`로, "거의 모든" 사용자에게 오늘의 이야기를 전송하고 푸시 알림을 보내야 함

  - 그러나 `DynamoDB`는 이와 같은 전체 entry `scan`에 취약하고 높은 비용이 청구되며, scan에 filter를 걸어도 O(n) 타임에 전체 entry를 불러 온 뒤 filter를 진행

  - 따라서 전체 사용자를 m개의 Batch로 나누어 최적화를 하고자 해도, 전체 사용자를 n이라고 했을 때, O(n \* m)의 시간이 소요되며 그에 맞는 높은 비용 청구

  - 더욱이 `DynamoDB` Freetier의 `RCU`는 `초당 25 RCU`이므로 매일 정오 `오늘의 이야기`가 전송될 때마다 이를 상당히 초과하여 과금이 불가피

  - 따라서 I/O 성능은 `DynamoDB`와 같이 이점으로 가져가되, 식별 키를 바탕의 `넓은 범위 스캔` 시 비용이 크게 들지 않는 DB를 찾기 위한 선택 변경 필요

### Redis : 최종

- [RedisService 소스 코드 바로가기](https://github.com/Sevenfold777/wooriga-notification-serverless/blob/4a1fcf68deb679228c275f9adeccc18c7aff9e96/src/utils/redis/redis-family-member.service.ts)

- I/O 성능 이점을 가지면서 `DynamoDB`의 문제를 해소할 수 있는 키값 저장소로 `Redis` 선정, `AWS Elasticache`에서 운용, `Hash` 자료구조를 사용해 알림 시스템 전용 User DB 구현

- 메인 RDBMS의 User DB는 `userId`가 `PK`, `familyId`가 `FK`로 존재하며 이외에 많은 field가 존재하지만, 효과적인 `Redis` 운용을 위해 아래와 같은 `Redis Item` 사용

  - familyId를 각 Item의 Key로 하고, 각 Hash Item의 key로 userId를 사용

  - `hgetall ${familyId}`를 통해 가족 내 사용자 탐색은, 가족 구성원의 수 n에 대하여 `O(n)`에 가능하며 가족 구성원은 10명을 초과할 수 없기에 `O(1)`에 근사한다고 볼 수 있음

  - `hget ${familyId} ${userId}`를 통해 개별 사용자를 탐색할 수 있으며 시간복잡도는 `Hash` 자료구조를 사용했으므로 `O(1)`

  ```JSON
  {
    "family:${familyId}": {
        "user:${userId}":
            {
                "userName":"사용자명",
                "fcmToken":"FCM 토큰",
                "mktPushAreed":true
            },

        "user:${userId}":
            {
                "userName":"사용자명",
                "fcmToken":"FCM 토큰",
                "mktPushAreed":true
            }
    }
  }
  ```

- 그럼에도 모든 DB는 `오늘의 이야기`에서 필요한 광범위한 `scan` 시 성능 문제 발생, 따라서 이를 최대한 해결하고자 `Redis pipelining`을 적용하여 최대한 성능 개선

  - `오늘의 이야기`에서 요구되는 약 100개(Batch Size)의 `familyId`에 대한 동시 알림 요청을 `Redis`가 처리하기 위해서는 100번의 `hgetall ${familyId}` 실행 필요

  - 알림 시스템에서 Redis에 요청을 보낼 때는 결국 `네트워크 통신`을 거쳐야 하고 이때의 `RTT`(Round Trip Time)가 결국 알림 시스템 관점에서의 Redis 성능에 영향을 미침, 따라서 100번의 `hgetall` 요청을 보내는 경우 100번의 `RTT`가 발생하는 문제

  - 또한 `Redis`가 100번의 `hgetall` 요청을 처리하고자 메모리를 읽고 네트워크에 응답하기 위해서는 `Redis Kernel`에서 훨씬 더 많은 `context switching`이 수반되는 overhead 발생

- 따라서 이러한 요청을 Batch 단위로 처리하기 위해 제공되는 `Redis pipelining`을 통해 하나의 요청으로 100개의 Redis Item을 읽어오도록 하여, `DynamoDB` 사용시 발생한 문제를 효과적을 해결

\* `Redis`가 single thread 임에도 100개 read 요청 정도의 `pipeline`은 큰 부담이 아님

\*\* `FCM sendMulticast`의 푸시 알림 최대 동시 전송량이 토큰 500개이므로, 4인 가족을 기준으로 했을 때 100개 family에 대한 `hgetAll` 동시 요청 및 처리는 합리적

## Jest를 사용한 Unit / Integration / E2E 테스트 진행

- 별도의 프레임워크 사용 없는 `Node.js` 애플리케이션을 운영 환경에서 사용하기 위해 프로그램에 대한 철저한 테스트가 필수, 더욱이, `Lambda triggered by SQS` 환경에서 운영되기에 AWS 콘솔을 활용한 수동 테스트에 어려움

- Jest를 사용하여 성공 케이스와 실패 케이스를 포함한 `unit test` 19개, `integration test` 3개, `e2e test` 19개, `총 41개`의 테스트 진행

  - Unit Test: unit 테스트를 최우선으로 하여 테스트 진행, 이를 바탕으로 `Github Action Workflow` 환경에서 CI 구현

  - Integration Test: 본 프로젝트에서 `Redis`를 처음 사용하기에 구현한 `RedisService`가 실제 환경에서 정상 동작하는지 테스트

  - E2E Test: `Lambda triggered by SQS` 환경에서의 테스트를 용이하게 하고, 실제 디바이스에 `FCM`을 사용한 푸시 알림까지 정상적으로 전달되는지 사용자 환경에서 확인
