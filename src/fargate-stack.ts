import {
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import {
  AwsLogDriver,
  ContainerImage,
  FargateTaskDefinition,
} from '@aws-cdk/aws-ecs';
import {
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';
import {
  AlbFargateServices,
  LoadBalancerAccessibility,
} from 'serverless-container-constructs';

export class FargateStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const vpc = new Vpc(this, 'vpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'Public',
          subnetType: SubnetType.PUBLIC,
        },
      ],
    });
    const taskDefinition = new FargateTaskDefinition(this, 'demo-task-definition', {
      cpu: 256,
      memoryLimitMiB: 512,
    });
    taskDefinition.addContainer('nuxtjs-container', {
      image: ContainerImage.fromAsset('./assets/nuxtjs', {
        buildArgs: {
          ENV: 'prod',
        },
      }),
      memoryLimitMiB: 512,
      portMappings: [
        {
          containerPort: 80,
        },
      ],
      logging: new AwsLogDriver({
        streamPrefix: 'nuxtjs',
      }),
    });
    // taskDefinition.applyRemovalPolicy(RemovalPolicy.DESTROY);
    vpc.applyRemovalPolicy(RemovalPolicy.DESTROY);
    new AlbFargateServices(this, 'NuxtJsService', {
      vpc: vpc,
      vpcSubnets: {
        subnetType: SubnetType.PUBLIC,
        onePerAz: true,
      },
      spot: true,
      tasks: [
        {
          task: taskDefinition,
          listenerPort: 80,
          desiredCount: 1,
          accessibility: LoadBalancerAccessibility.EXTERNAL_ONLY,
        },
      ],
    });
  }
}