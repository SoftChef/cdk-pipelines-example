import {
  App,
} from '@aws-cdk/core';
import * as dotenv from 'dotenv';
import {
  Ec2PipelineStack,
} from './ec2-pipeline-stack';
import {
  FargatePipelineStack,
} from './fargate-pipeline-stack';
import {
  LambdaPipelineStack,
} from './lambda-pipeline-stack';

dotenv.config();

const app = new App();

new LambdaPipelineStack(app, 'lambda-pipeline-stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new FargatePipelineStack(app, 'fargate-pipeline-stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

new Ec2PipelineStack(app, 'ec2-pipeline-stack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

app.synth();