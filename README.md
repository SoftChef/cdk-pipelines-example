# CDK Pipelines Example

### Installation
```
npx projen
```

### Deploy Lambda pipeline example

This example is a general service with AWS full-managed services.
```
cdk deploy lambda-pipeline-stack
```

### Deploy Fargate pipeline example

This example is running the NuxtJS service on the Fargate service.

```
cdk deploy fargate-pipeline-stack
```

### Deploy EC2 pipeline example

This example is running the Magento service on the EC2 service.
Before deployment, need subscirbe [Magento](https://aws.amazon.com/marketplace/pp/prodview-zthfwp2zvh2fq) AMI on the AWS Marketplace.

```
cdk deploy ec2-pipeline-stack
```

### Update pending connection manually

1. Login to AWS console
2. Go to `CodePipeline` service
3. Click `Settings and Connections` at left menu
4. Select your connection and click `Update pending connection` button
5. Connect to your `GitHub` and authorize with your `organization` in the pop window
6. Connect success