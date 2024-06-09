# Wooriga Notification Server Lambda (Serverless)

- 메인 API의 부하와 책임을 분산하고자 알림 서버 분리

- 비용과 유지보수의 문제로 AWS Lambda를 사용하여 serverless 환경 구축

- Push 알림 전송 서비스로 Firebase Cloud Messaging 사용

- AWS의 메세지큐 서비스인 SQS를 통한 비동기 통신으로 API 서버와 알림 서버를 decouple하고, 알림 서비스에서 가장 중요한 문제인 알림 누락이 발생하지 않도록 함

- 알림 전송에 필요한 사용자 정보는 I/O 속도가 빠른 DynamoDB에 다중화하고 본 함수는 DynamoDB에만 접근 (RDS 접근하지 않음)

- RDS와 DynamoDB 사이의 동기화 문제는 API 서버가 책임지고 관리 (사용자 정보 수정 이벤트 발생시 API 서버가 DynamoDB에 직접 put item 요청)

- 본 서버는 알림 "전송" 서버로서의 역할에 집중하며, 이외 API 서버에 포함된 알림 기능은 장기적으로 별도의 서버로 분리될 수 있음(쉽게 분리 가능하도록 알림 모듈 decouple)

## AWS Lambda 배포

- 개발 환경 aws cli가 충분히 권한이 있는 profile로 설정되었는지 확인 후 진행
- lambda execution 권한을 가진 role 설정

### Lambda 함수 생성

```
aws lambda create-function --function-name ${함수명} --runtime "nodejs20.x" --role ${실행 역할 ARN} --zip-file ${zip파일경로} --handler index.handler
```

### Lambda 함수 업데이트

```
aws lambda update-function-code --function-name ${함수명} --zip-file ${zip파일경로}
```
