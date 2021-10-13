import {
  AutoScalingGroup,
} from '@aws-cdk/aws-autoscaling';
import {
  InstanceClass,
  InstanceSize,
  InstanceType,
  MachineImage,
  Peer,
  Port,
  SecurityGroup,
  SubnetType,
  Vpc,
} from '@aws-cdk/aws-ec2';
import {
  ApplicationListener,
  ApplicationLoadBalancer,
  ApplicationProtocol,
  IpAddressType,
} from '@aws-cdk/aws-elasticloadbalancingv2';
import {
  Construct,
  RemovalPolicy,
  Stack,
  StackProps,
} from '@aws-cdk/core';

export class Ec2Stack extends Stack {

  private vpc: Vpc;

  private securityGroup: SecurityGroup;

  private autoScalingGroup: AutoScalingGroup;

  private applicationLoadBalancer: ApplicationLoadBalancer;

  private applicationListener: ApplicationListener;

  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    this.vpc = this.createVpc();
    this.securityGroup = this.createSecurityGroup();
    this.autoScalingGroup = this.createAutoScalingGroup();
    this.applicationLoadBalancer = this.createApplicationLoadBalancer();
    this.applicationListener = this.createApplicationListener();
    // Apply removal policy
    this.autoScalingGroup.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.applicationLoadBalancer.applyRemovalPolicy(RemovalPolicy.DESTROY);
    this.applicationListener.applyRemovalPolicy(RemovalPolicy.DESTROY);
  }
  private createVpc(): Vpc {
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
    return vpc;
  }

  private createSecurityGroup(): SecurityGroup {
    const securityGroup = new SecurityGroup(this, 'Magento-SecurityGroup', {
      vpc: this.vpc,
    });
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22), 'SSH Service');
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(443), 'NGINX Agent(Encrypted)');
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80), 'NGINX Agent(Non-encrypted)');
    securityGroup.addEgressRule(Peer.anyIpv4(), Port.allTraffic(), 'All Traffic');
    return securityGroup;
  }

  private createAutoScalingGroup(): AutoScalingGroup {
    return new AutoScalingGroup(this, 'AutoScalingGroup', {
      vpc: this.vpc,
      instanceType: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
      machineImage: MachineImage.genericLinux({
        [process.env.MAGENTO_USE1_REGION!]: process.env.MAGENTO_USE1_AMI_ID!,
        [process.env.MAGENTO_APNE1_REGION!]: process.env.MAGENTO_APNE1_AMI_ID!,
      }),
      securityGroup: this.securityGroup,
      desiredCapacity: parseInt(process.env.MAGENTO_DESIRED_CAPACITY!),
      maxCapacity: 1,
      minCapacity: 0,
      keyName: 'MagentoService',
    });
  }

  private createApplicationLoadBalancer(): ApplicationLoadBalancer {
    const applicationLoadBalancer = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: this.vpc,
      vpcSubnets: this.vpc.selectSubnets({
        subnetType: SubnetType.PUBLIC,
      }),
      securityGroup: this.securityGroup,
      internetFacing: true,
      ipAddressType: IpAddressType.IPV4,
    });
    return applicationLoadBalancer;
  }

  private createApplicationListener(): ApplicationListener {
    const applicationListener = new ApplicationListener(this, 'MagentoService', {
      loadBalancer: this.applicationLoadBalancer,
      protocol: ApplicationProtocol.HTTP,
      port: 80,
    });
    applicationListener.addTargets('Target', {
      protocol: ApplicationProtocol.HTTP,
      targets: [
        this.autoScalingGroup,
      ],
    });
    applicationListener.connections.allowDefaultPortFromAnyIpv4();
    return applicationListener;
  }
}