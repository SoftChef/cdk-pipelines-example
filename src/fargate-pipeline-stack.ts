import {
  CfnConnection,
} from '@aws-cdk/aws-codestarconnections';
import {
  PolicyStatement,
} from '@aws-cdk/aws-iam';
import {
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
  Stage,
  StageProps,
} from '@aws-cdk/core';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from '@aws-cdk/pipelines';
import {
  FargateStack,
} from './fargate-stack';

export class FargatePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);
    const connection = new CfnConnection(this, 'GitHubConnection', {
      connectionName: 'GitHub',
      providerType: 'GitHub',
    });
    const pipeline = new CodePipeline(this, 'pipeline', {
      codeBuildDefaults: {
        rolePolicy: [
          new PolicyStatement({
            actions: [
              'sts:AssumeRole',
            ],
            resources: [
              'arn:aws:iam::*:role/cdk-hnb659fds-lookup-role-*',
            ],
          }),
        ],
      },
      synth: new ShellStep('synth', {
        input: CodePipelineSource.connection('softchef/cdk-pipelines-example', 'main', {
          connectionArn: connection.attrConnectionArn,
        }),
        commands: [
          'cp .env.prod .env',
          'npm install -g aws-cdk',
          'npm install projen',
          'npx projen',
          'npx projen build',
          'cdk synth',
        ],
        primaryOutputDirectory: 'cdk.out',
      }),
    });
    pipeline.addStage(
      new FargateApplication(this, 'FargateApplication', {
        env: {
          account: process.env.CDK_DEFAULT_ACCOUNT,
          region: process.env.CDK_DEFAULT_REGION,
        },
      }),
    );
    connection.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
}

class FargateApplication extends Stage {
  constructor(scope: Construct, id: string, props: StageProps = {}) {
    super(scope, id, props);
    new FargateStack(this, 'fargate-stack', {});
  }
}