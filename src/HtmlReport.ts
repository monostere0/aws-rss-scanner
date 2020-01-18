import * as relativeDate from 'relative-date';

export default class HtmlReport {
  private readonly TH_STYLE = 'border: solid 1px #000';
  private readonly TD_STYLE = 'border: solid 1px #000';

  public toHtmlTable(objectArray: object[]): string {
    const tableColumns = Object.keys(objectArray[0]);
    return [
      '<table cellspacing="0">',
      '<tr>',
      tableColumns.map((colName) => this.generateTableHeader(colName)).join(''),
      '</tr>',
      ...objectArray.map((item: any) => {
        return [
          '<tr>',
          tableColumns.map((columnName) => {
            return this.mapColumnsByKeyName(columnName, item[columnName]);
          }).join(''),
          '</tr>',
        ];
      }),
      '</table>',
    ].join('');
  }

  private mapColumnsByKeyName(columnName: string, cellContents: string) {
    return this.generateTableCell(this.parseCellContent(columnName, cellContents));
  }

  private generateTableHeader(contents: string) {
    return `<th style="${this.TH_STYLE}">${contents}</th>`;
  }

  private generateTableCell(contents: string) {
    return `<th style="${this.TD_STYLE}">${contents}</th>`;
  }

  private getReleaseId(content: string) {
    const matchArray = content.match(/\d+/g);

    return matchArray?.length ? matchArray[0] : 'INVALID_ID';
  }

  private parseCellContent(keyName: string, content: string) {
    switch (keyName) {
      case 'link':
        return `<a href="${content}">${content}</a>`;
      case 'pubDate':
        return relativeDate(new Date(content));
      case 'id':
        return this.getReleaseId(content);
      default:
        return content;
    }
  }
}
