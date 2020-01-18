import * as AWS from 'aws-sdk';

export interface SendOptions {
  from: string;
  to: string;
  subject: string;
  body: string;
}

export default class Mailer {
  public constructor() {
    AWS.config.update({ region: 'eu-central-1' });
  }

  public async sendEmail(options: SendOptions): Promise<string> {
    const configParams = {
      Destination: {
        ToAddresses: [
          options.to,
        ],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: options.body,
          },
          Text: {
            Charset: 'UTF-8',
            Data: options.body,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: options.subject,
        },
      },
      Source: options.from,
    };

    const { MessageId } = await new AWS.SES({ apiVersion: '2010-12-01' })
      .sendEmail(configParams).promise();

    return MessageId;
  }
}
