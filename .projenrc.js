const { AwsCdkTypeScriptApp } = require('projen');

const project = new AwsCdkTypeScriptApp({
  authorName: 'SoftChef',
  authorEmail: 'poke@softchef.com',
  authorUrl: 'https://www.softchef.com',
  authorOrganization: true,
  cdkVersion: '1.95.2',
  defaultReleaseBranch: 'main',
  name: 'cdk-pipelines-example',
  repositoryUrl: 'https://github.com/SoftChef/cdk-pipelines-example.git',
  cdkDependencies: [
    '@aws-cdk/aws-autoscaling',
    '@aws-cdk/aws-codestarconnections',
    '@aws-cdk/aws-ec2',
    '@aws-cdk/aws-ecs',
    '@aws-cdk/aws-elasticloadbalancingv2',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/pipelines',
  ],
  deps: [
    'dotenv',
    'serverless-container-constructs',
  ],
  context: {
    '@aws-cdk/core:newStyleStackSynthesis': true,
  },
  gitignore: [
    '.env',
    'cdk.context.json',
  ],
});

project.synth();