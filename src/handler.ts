import Scanner, { Statuses } from './Scanner';

exports.handler = async function scannerHandler(): Promise<any> {
  const { env: { RELEASE_IDS } } = process;

  if (!RELEASE_IDS) {
    return Statuses.NO_IDS_FOUND;
  }

  await new Scanner().scan(RELEASE_IDS.split(','));
};
