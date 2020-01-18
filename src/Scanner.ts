import * as Parser from 'rss-parser';

import HtmlReport from './HtmlReport';
import Mailer from './Mailer';
import S3Helpers from './S3';

export enum Statuses {
  NOT_SENT = 'emailNotSent',
  NO_IDS_FOUND = 'noIdsFound',
  NO_UPDATES = 'noUpdatesFound',
}

export default class Scanner {
  private readonly RSS_URL = 'https://www.discogs.com/sell/mplistrss?output=rss&release_id=#id#';
  private readonly BUCKET_NAME = 'discogs-market-scanner-db';
  private readonly BUCKET_KEY = 'db.json';
  private readonly s3 = new S3Helpers(this.BUCKET_NAME, this.BUCKET_KEY);
  private readonly mailer = new Mailer();
  private readonly htmlReport = new HtmlReport();
  private readonly rssParser = new Parser({
    customFields: {
      item: ['summary', 'id'],
    },
  });

  public async scan(releaseIds: string[]) {
    const jsonFiles = await this.getRssJsonFiles(releaseIds);
    const flattenedFiles = this.flattenRssFiles(jsonFiles);
    const sortedFiles = this.mapColumnsAndSort(flattenedFiles);
    const currentIds = sortedFiles.map((file) => file.id);
    const storedIds = await this.s3.get();

    const shouldSendUpdate = !currentIds.every((id) => storedIds.includes(id));

    if (!shouldSendUpdate) {
      return Statuses.NO_UPDATES;
    }

    try {
      const messageId = await this.mailer.sendEmail({
        body: this.htmlReport.toHtmlTable(sortedFiles),
        from: 'leudanielm@gmail.com',
        subject: '🤘 Updates from Discogs Market Scanner',
        to: 'leudanielm@gmail.com',
      });

      return messageId;
    } catch (error) {
      console.error(error);

      return Statuses.NOT_SENT;
    }
  }

  private async parseRssFromUrl(rssUrl: string): Promise<Parser.Output> {
    return await this.rssParser.parseURL(rssUrl);
  }

  private mapFeedColumns(
    { id, title, link, pubDate, summary: { _ } }:
      { id: string, title: string, link: string, pubDate: string, summary: { _: string } },
  ) {
    return { id, title, link, pubDate, price: _.split(' - ')[0] };
  }

  private async getRssJsonFiles(releaseIds: string[]) {
    const rssUrls = releaseIds.map((id) => this.RSS_URL.replace('#id#', id));
    return await Promise.all(rssUrls.map((url) => this.parseRssFromUrl(url)));
  }

  private flattenRssFiles(rssFiles: any[]) {
    return rssFiles
      .map((entry: any) => entry.items)
      .reduce((accumulator: any[], value: any[]) => accumulator.concat(value), []);
  }

  private mapColumnsAndSort(rssItems: any[]) {
    return rssItems
      .map((cols) => this.mapFeedColumns(cols))
      .sort((a: any, b: any) => b.pubDate - a.pubDate);
  }
}
