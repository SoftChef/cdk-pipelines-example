import {
  Function,
  InlineCode,
  Runtime,
} from '@aws-cdk/aws-lambda';
import {
  Construct,
  Stack,
} from '@aws-cdk/core';

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new Function(this, 'demo-function', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index',
      code: new InlineCode('exports.handler = async(event) => { console.log(event) }'),
    });
  }
}