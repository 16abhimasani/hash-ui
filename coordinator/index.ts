import { BigNumber } from '@ethersproject/bignumber';
import { deployments, MetadataCoordinator__factory } from '@hash/protocol';
import { MetadataRegistryInfo } from '@hash/protocol/deployments/types';
import { PROVIDER } from '../clients/provider';
import { CHAIN_ID, NULL_ADDRESS, ZERO } from '../constants';
import { TokenMetadata } from '../types/metadata';
import { getObjectFromURI } from '../utils/ipfs-metadata';
import { addTokenIdToTokenMetadata } from './middleware';

export interface MetadataPreferences {
  version: 1;
  pickedKeys: string[];
  remapKeysMap?: { [key: string]: string };
}

export interface MetadataDocument {
  writer: string;
  text: string;
  creationTime: BigNumber;
}

export const EMPTY_DOCUMENT: MetadataDocument = {
  writer: NULL_ADDRESS,
  text: '{}',
  creationTime: ZERO,
};

const coordinator = MetadataCoordinator__factory.connect(
  deployments[CHAIN_ID].registry.coordinator,
  PROVIDER,
);

export const at = (obj: any, key: string) => {
  const splitKeys = key.split('.');
  let ctx = Object.assign({}, obj);
  for (const key of splitKeys) {
    if (ctx[key] === undefined) {
      return undefined;
    }
    ctx = ctx[key];
  }
  return ctx;
};

export const set = (obj: any, key: string, value: any) => {
  const splitKeys = key.split('.');
  const updatedObj = obj;
  let ctx = updatedObj;
  for (let i = 0; i < splitKeys.length; ++i) {
    const key = splitKeys[i];
    if (i !== splitKeys.length - 1 && ctx[key] === undefined) {
      ctx[key] = {};
    }
    if (i !== splitKeys.length - 1) {
      ctx = ctx[key];
    } else {
      ctx[key] = value;
    }
  }
};

/**
 * mergeDeep credit goes to: https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
 */
export const mergeDeep = (...objects: any[]) => {
  const isObject = (obj: any) => obj && typeof obj === 'object';

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key];
      const oVal = obj[key];

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = pVal.concat(...oVal);
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = mergeDeep(pVal, oVal);
      } else {
        prev[key] = oVal;
      }
    });
    return prev;
  }, {});
};

export const mergeDocumentsByInfos = async (
  documents: MetadataDocument[],
  infos: MetadataRegistryInfo[],
) => {
  const metadataArr: object[] = [];
  for (let i = 0; i < documents.length; ++i) {
    const pref = (await getObjectFromURI(
      infos[i].prefURI,
    )) as MetadataPreferences;
    const metadata = await getObjectFromURI(documents[i].text);
    // console.log(metadata, pref);

    if (pref.version === 1) {
      const o: any = {};
      for (const key of pref.pickedKeys) {
        if (!!at(metadata, key)) {
          const newKey = pref.remapKeysMap?.[key] ?? key;
          set(o, newKey, at(metadata, key));
        }
      }
      metadataArr.push(o);
    }
  }

  return mergeDeep(...metadataArr);
};

export const getDocumentsAndInfosByCoordinator = async (id: string) => {
  const [documents, infos] = await coordinator.tokenIdToDocuments(id);

  const documentsWithOnlyJson: MetadataDocument[] = [];
  const infosWithOnlyJson: MetadataRegistryInfo[] = [];

  for (let i = 0; i < documents.length; ++i) {
    const pref = (await getObjectFromURI(
      infos[i].prefURI,
    )) as MetadataPreferences;
    const metadata = await getObjectFromURI(documents[i].text);
    documentsWithOnlyJson.push({
      ...documents[i],
      text: JSON.stringify(metadata),
    });
    infosWithOnlyJson.push({ ...infos[i], prefURI: JSON.stringify(pref) });
  }

  return [documentsWithOnlyJson, infosWithOnlyJson];
};

export const applyMiddlewares = async (
  metadata: any,
  middlewares: ((m: any) => Promise<any>)[] = [],
) => {
  let localMetadata = metadata;
  for (const mw of middlewares) {
    localMetadata = await mw(localMetadata);
  }
  return localMetadata;
};

export const getTokenMetadataByCoordinator = async (
  id: string,
  middlewares: ((m: any) => Promise<any>)[] = [],
) => {
  const [documents, infos] = await coordinator.tokenIdToDocuments(id);

  return (await applyMiddlewares(
    await mergeDocumentsByInfos(documents, infos),
    [
      addTokenIdToTokenMetadata(BigNumber.from(id).toHexString()),
      ...middlewares,
    ],
  )) as TokenMetadata;
};
