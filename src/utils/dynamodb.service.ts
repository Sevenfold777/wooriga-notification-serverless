import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  BatchGetCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

export class DynamoDBService {
  private docClient: DynamoDBDocumentClient;
  private table: string;

  constructor() {
    // init Dynamodb client
    const client = new DynamoDBClient({});

    // document client simplifies working with DynamoDB
    this.docClient = DynamoDBDocumentClient.from(client);
    this.table = process.env.AWS_DYNAMODB_USER_TABLE;
  }

  // TODO: return type dto(또는 entity) 선언해서 특정하기
  async queryByFamilyId(familyId: number) {
    const command = new QueryCommand({
      TableName: this.table,
      KeyConditionExpression: "familyId = :familyId",
      ExpressionAttributeValues: { ":familyId": familyId },
      // ConsistentRead: true, // strongly consistent (c.f. eventually consistent)
    });

    const res = await this.docClient.send(command);

    console.log(res);
  }

  async getItemByFamilyIdAndUserId(familyId: number, userId: number) {
    const command = new GetCommand({
      TableName: this.table,
      Key: { familyId, userId },
    });

    const res = await this.docClient.send(command);

    console.log(res);
  }

  // AWARE: Batch Get은 한 번에 최대 100개 항목 가져오기
  async getUsersInFamilies(familyIds: number[]) {
    /**
     * 문제: dynamoDB에서는 일반적인 방법으로 parition_key IN familyIds query 불가능
     * 사실상 모든 가족을 불러오는 것이니 scan을 사용할 수 있으나 RCU가 커져서
     * 사용량에 따라 과금되는 DynamoDB에서 큰 비용 발생 위험
     **/
    const command = new BatchGetCommand({
      RequestItems: {
        [this.table]: {
          Keys: [familyIds.map((familyId) => ({ familyId }))],
          // ProjectionExpression: "fcmToken",
        },
      },
    });

    const res = await this.docClient.send(command);

    console.log(res);
  }
}
