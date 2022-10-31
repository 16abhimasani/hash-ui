import Airtable, { FieldSet, Records } from 'airtable';
import { AirtableBase } from 'airtable/lib/airtable_base';
import { AIRTABLE_API_KEY } from '../constants';

Airtable.configure({
  apiKey: AIRTABLE_API_KEY,
});

export interface AirtableData {
  base: AirtableBase;
  table: string;
  view: string;
}

export const VERDICT_AIRTABLE_DATA: AirtableData = {
  base: Airtable.base('appdKk6v1apbXEQKG'),
  table: 'Verdicts Queue',
  view: 'Verdicts Queue - $HASH Historians',
};

export interface VerdictQueueAirtableRecordType {
  'Discord Handle': string; // victorrortvedt#3874
  'HASH URL': string; // https://hash.pob.studio/art/0xccc...
  'status': string; // verified
  'Notes': string;
  [key: string]: string; // for Partial<FieldSet> type compatibility
}

export const getAirtableRecords = async (airtable: AirtableData) => {
  const { base, table, view } = airtable;
  return await new Promise((resolve, reject) => {
    let results: Records<FieldSet>[] = [];
    base(table)
      .select({
        // maxRecords: 999,
        view,
      })
      .eachPage(
        (records, fetchNextPage) => {
          results.push(records);
          fetchNextPage();
        },
        (err) => {
          if (err) {
            console.error(err);
            return reject(results.flat());
          }
          return resolve(results.flat());
        },
      );
  });
};

export const removeAirtableRecord = async (
  airtable: AirtableData,
  id: string,
) => {
  const { base, table } = airtable;
  return await new Promise((resolve, reject) => {
    base(table).destroy(id, (err, _deletedRecord) => {
      if (err) {
        console.error(err);
        return reject(false);
      }
      return resolve(true);
    });
  });
};

export const createAirtableRecord = async (
  airtable: AirtableData,
  entry: VerdictQueueAirtableRecordType | Partial<FieldSet>,
) => {
  const { base, table } = airtable;
  return await new Promise((resolve, reject) => {
    base(table).create(entry, (err, _record) => {
      if (err) {
        console.error(err);
        return reject(false);
      }
      return resolve(true);
    });
  });
};
