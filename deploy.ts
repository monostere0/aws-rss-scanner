import * as events from '@aws-cdk/aws-events';
import * as targets from '@aws-cdk/aws-events-targets';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as cdk from '@aws-cdk/core';

const AWS_REGION = 'eu-central-1';

export class LambdaRssCloudWatchStack extends cdk.Stack {
  constructor(application: cdk.App, id: string, props: cdk.StackProps) {
    super(application, id, props);

    const marketScannerLambda = new lambda.Function(this, 'scanMarketFunction', {
      code: new lambda.AssetCode('./dist'),
      handler: 'market-scanner.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
    });

    // tslint:disable-next-line:no-unused-expression
    new s3.Bucket(this, 'scanMarketBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      bucketName: 'market-scanner-db',
    });

    const marketScannerCloudWatchRule = new events.Rule(this, 'scanMarketCron', {
      schedule: events.Schedule.rate(cdk.Duration.minutes(10)),
    });

    marketScannerCloudWatchRule.addTarget(new targets.LambdaFunction(marketScannerLambda));
  }
}

const app = new cdk.App();

// tslint:disable-next-line:no-unused-expression
new LambdaRssCloudWatchStack(app, 'MarketScanner', {
  env: { region: AWS_REGION },
});

app.synth();
