import * as AWS from 'aws-sdk';

export default class S3 {
  constructor(private bucketName: string, private bucketKey: string) {
    AWS.config.update({ region: 'eu-central-1' });
  }

  public async get(): Promise<any> {
    const { Body: fileContent } = await new AWS.S3()
      .getObject({
        Bucket: this.bucketName,
        Key: this.bucketKey,
      }).promise();

    if (!fileContent) {
      throw new Error('S3Helpers.get: Undefined file content.');
    }

    return JSON.parse(fileContent.toString('utf8'));
  }

  public async store(data: any): Promise<AWS.S3.PutObjectOutput> {
    return await new AWS.S3().putObject({
      Body: JSON.stringify(data),
      Bucket: this.bucketName,
      Key: this.bucketKey,
    }).promise();
  }
}
