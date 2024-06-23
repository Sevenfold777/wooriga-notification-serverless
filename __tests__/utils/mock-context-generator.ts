import { Context } from 'aws-lambda';

export function mockContextGenerator({
  onDone,
  onSucceeded,
  onFailed,
  remainingTime,
}: ParamType): Context {
  return {
    callbackWaitsForEmptyEventLoop: false,
    functionName: '',
    functionVersion: '',
    invokedFunctionArn: '',
    memoryLimitInMB: '',
    awsRequestId: '',
    logGroupName: '',
    logStreamName: '',
    getRemainingTimeInMillis: function (): number {
      return 10;
    },
    done: function (error?: Error, result?: any): void {},
    fail: function (error: string | Error): void {},
    succeed: function (messageOrObject: any): void {},
  };
}

type ParamType = {
  onDone?: () => void;
  onSucceeded?: () => void;
  onFailed?: () => void;
  remainingTime?: number;
};
