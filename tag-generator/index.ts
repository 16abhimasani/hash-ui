import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { utils } from 'ethers';
import { flatten, uniq } from 'lodash';
import { admin } from '../clients/firebase-server';
import { PROVIDER } from '../clients/provider';
import { Tag } from '../types/tag';
import { CUSTOM_TAG_FUNCS, LIVE_CUSTOM_TAG_FUNCS } from './custom';
import { getAddressFromTopicSafely } from './utils';

const firestore = admin.firestore();

export const getTagsForHash = async (
  hash: string,
  tokenId?: string,
): Promise<[string[], { [key: string]: string[] }]> => {
  const transaction = await PROVIDER.getTransaction(hash);
  const receipt = await PROVIDER.getTransactionReceipt(hash);
  const ref = firestore.collection(FIRESTORE_ROUTES.TOKENS.ROOT).doc(hash);
  const snapshot = await ref.get();
  const metadata = snapshot?.data();

  let tags: Tag[] = [];
  // handle live-custom-tag
  const liveCustomTagQuery = firestore
    .collection(FIRESTORE_ROUTES.TAGS)
    .where('metadata.type', '==', 'live-custom-tag');
  const liveCustomTagDocs = (await liveCustomTagQuery.get()).docs;
  const liveCustomTagPromises = liveCustomTagDocs.map(async (d) => {
    const funcName = d.data().metadata.funcName;
    if (!funcName || !LIVE_CUSTOM_TAG_FUNCS[funcName]) {
      return undefined;
    }
    if (await LIVE_CUSTOM_TAG_FUNCS[funcName](hash, tokenId, metadata)) {
      return d.data() as Tag;
    }
    return undefined;
  });
  const liveCustomTags = (await Promise.all(liveCustomTagPromises)).filter(
    (t) => !!t,
  ) as Tag[];
  tags = tags.concat(liveCustomTags);
  // handle custom-tag
  const customTagQuery = firestore
    .collection(FIRESTORE_ROUTES.TAGS)
    .where('metadata.type', '==', 'custom-tag');
  const customTagDocs = (await customTagQuery.get()).docs;
  const customTagPromises = customTagDocs.map(async (d) => {
    const funcName = d.data().metadata.funcName;
    if (!funcName || !CUSTOM_TAG_FUNCS[funcName]) {
      return undefined;
    }
    if (
      await CUSTOM_TAG_FUNCS[funcName](
        hash,
        tokenId,
        transaction,
        receipt,
        metadata,
      )
    ) {
      return d.data() as Tag;
    }
    return undefined;
  });
  const customTags = (await Promise.all(customTagPromises)).filter(
    (t) => !!t,
  ) as Tag[];
  tags = tags.concat(customTags);

  // handle event-match-tag
  const eventMatchTagQuery = firestore
    .collection(FIRESTORE_ROUTES.TAGS)
    .where('metadata.type', '==', 'event-match-tag');
  const eventMatchTagDocs = (await eventMatchTagQuery.get()).docs;
  const eventMatchTags = eventMatchTagDocs
    .map((e) => {
      const eventTagTopics = e.data().metadata.topics;
      const isTagMatched = receipt.logs.reduce((a: boolean, c) => {
        const len = Math.min(c.topics.length, eventTagTopics.length);
        const isEqual = c.topics.slice(0, len).reduce((a, c, i) => {
          if (a && eventTagTopics[i] !== '*' && eventTagTopics[i] !== c) {
            return false;
          }
          return a;
        }, true);
        if (isEqual) {
          return true;
        }
        return a;
      }, false);
      if (isTagMatched) {
        return e.data();
      }
      return undefined;
    })
    .filter((t) => !!t) as Tag[];
  tags = tags.concat(eventMatchTags);

  // handle contract-interaction-tag
  const to = transaction.to ?? receipt.contractAddress;
  const from = transaction.from;
  const logEmitters = receipt.logs.map((l) => l.address);
  const erc20And721TransferAccounts = flatten(
    receipt.logs
      .filter(
        (l) =>
          l.topics[0] ===
          '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef',
      )
      .map((l) => [
        getAddressFromTopicSafely(l.topics[1]),
        getAddressFromTopicSafely(l.topics[2]),
      ]),
  );
  const erc1155SingleTransferAccounts = flatten(
    receipt.logs
      .filter(
        (l) =>
          l.topics[0] ===
          '0xc3d58168c5ae7397731d063d5bbf3d657854427343f4c083240f7aacaa2d0f62',
      )
      .map((l) => [
        getAddressFromTopicSafely(l.topics[1]),
        getAddressFromTopicSafely(l.topics[2]),
        getAddressFromTopicSafely(l.topics[3]),
      ]),
  );
  const erc1155BatchTransferAccounts = flatten(
    receipt.logs
      .filter(
        (l) =>
          l.topics[0] ===
          '0x4a39dc06d4c0dbc64b70af90fd698a233a518aa5d07e595d983b8c0526c8f7fb',
      )
      .map((l) => [
        getAddressFromTopicSafely(l.topics[1]),
        getAddressFromTopicSafely(l.topics[2]),
        getAddressFromTopicSafely(l.topics[3]),
      ]),
  );

  // NOTE: LIMITED TO 10
  const addresses = uniq(
    [
      to,
      from,
      ...logEmitters,
      ...erc20And721TransferAccounts,
      ...erc1155SingleTransferAccounts,
      ...erc1155BatchTransferAccounts,
    ]
      .filter((a) => !!a)
      .map((a) => utils.getAddress(a)),
  ).slice(0, 10);

  let contractInteractionTags: Tag[] = [];
  let tagGroupTags: Tag[] = [];
  if (addresses.length !== 0) {
    const query = firestore
      .collection(FIRESTORE_ROUTES.TAGS)
      .where('metadata.type', '==', 'contract-interaction-tag')
      .where('metadata.contractAddresses', 'array-contains-any', addresses);
    const snapshot = await query.get();
    contractInteractionTags = snapshot.docs.map((d) => d.data() as Tag);
    tags = tags.concat(contractInteractionTags);
    if (tags.length !== 0) {
      // handle tag-group-tag
      // NOTE: LIMITED TO 10
      const tagGroupQuery = firestore
        .collection(FIRESTORE_ROUTES.TAGS)
        .where('metadata.type', '==', 'tag-group-tag')
        .where(
          'metadata.keys',
          'array-contains-any',
          tags.map((d) => d.key).slice(0, 10),
        );
      const tagGroupSnapshot = await tagGroupQuery.get();
      tagGroupTags = tagGroupSnapshot.docs.map((d) => d.data() as Tag);
      tags = tags.concat(tagGroupTags);
    }
  }

  // lower the priority value, the better
  return [
    tags.map((t) => t.key),
    // .sort(
    //   (a: Tag, b: Tag) => (a.priority ?? Infinity) - (b.priority ?? Infinity),
    // )
    // .map((t) => t.key),
    {
      'custom-tag': customTags.map((t) => t.key),
      'live-custom-tag': liveCustomTags.map((t) => t.key),
      'event-match-tag': eventMatchTags.map((t) => t.key),
      'contract-interaction-tag': contractInteractionTags.map((t) => t.key),
      'tag-group-tag': tagGroupTags.map((t) => t.key),
    },
  ];
};

export const getTagsForHashByCache = async (
  hash: string,
  tokenId: string | undefined,
  tagsByType: { [key: string]: string[] },
): Promise<[string[], { [key: string]: string[] }]> => {
  const ref = firestore.collection(FIRESTORE_ROUTES.TOKENS.ROOT).doc(hash);
  const snapshot = await ref.get();
  const metadata = snapshot?.data();

  let tags: string[] = [];
  // handle live-custom-tag
  const liveCustomTagQuery = firestore
    .collection(FIRESTORE_ROUTES.TAGS)
    .where('metadata.type', '==', 'live-custom-tag');
  const liveCustomTagDocs = (await liveCustomTagQuery.get()).docs;
  const liveCustomTagPromises = liveCustomTagDocs.map(async (d) => {
    const funcName = d.data().metadata.funcName;
    if (!funcName || !LIVE_CUSTOM_TAG_FUNCS[funcName]) {
      return undefined;
    }
    if (await LIVE_CUSTOM_TAG_FUNCS[funcName](hash, tokenId, metadata)) {
      return d.data() as Tag;
    }
    return undefined;
  });
  const liveCustomTags = (
    (await Promise.all(liveCustomTagPromises)).filter((t) => !!t) as Tag[]
  ).map((t) => t.key);
  tags = tags.concat(liveCustomTags);

  tags = tags.concat(tagsByType['custom-tag'] ?? []);
  tags = tags.concat(tagsByType['event-match-tag'] ?? []);
  tags = tags.concat(tagsByType['contract-interaction-tag'] ?? []);

  const tagGroupQuery = firestore
    .collection(FIRESTORE_ROUTES.TAGS)
    .where('metadata.type', '==', 'tag-group-tag')
    .where('metadata.keys', 'array-contains-any', tags.slice(0, 10));
  const tagGroupSnapshot = await tagGroupQuery.get();
  const tagGroupTags = tagGroupSnapshot.docs
    .map((d) => d.data() as Tag)
    .map((t) => t.key);
  tags = tags.concat(tagGroupTags);

  // TODO: lower the priority value, the better
  return [
    tags,
    {
      ...tagsByType,
      'live-custom-tag': liveCustomTags,
      'tag-group-tag': tagGroupTags,
    },
  ];
};
