import { gql } from '@apollo/client';

export const GET_TOKEN_METADATA_QUERY = gql`
  query Hash($id: String!) {
    hash(id: $id) {
      id
      hash
      createdAt
      createdBy
      ownership {
        owner
      }
      documents {
        key
        writer
        text
        createdAt
      }
      affirmedDocuments {
        key
        writer
        text
        createdAt
      }
    }
  }
`;

export const GET_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY = gql`
  query Hashes($hash: String!, $blockNum: Int!) {
    hashes(where: { hash: $hash }, block: { number: $blockNum }) {
      id
    }
  }
`;

export const GET_RICH_TOKEN_METADATA_BY_HASH_BLOCK_BASED_QUERY = gql`
  query Hashes($hash: String!, $blockNum: Int!) {
    hashes(where: { hash: $hash }, block: { number: $blockNum }) {
      id
      hash
      createdAt
      createdBy
      ownership {
        owner
      }
      documents {
        key
        writer
        text
        createdAt
      }
      affirmedDocuments {
        key
        writer
        text
        createdAt
      }
      metadataHistory {
        key
        writer
        text
        metadataRepository
        createdAt
      }
    }
  }
`;

export interface LATEST_MINTED_HASH_TYPE {
  id: string;
  hash: string;
  createdAt: string;
  createdBy: string;
}

export const GET_LATEST_MINTS_BY_BLOCK_BASED_QUERY = gql`
  query Hashes($blockNum: Int!) {
    hashes(
      first: 256
      orderBy: createdAt
      orderDirection: desc
      block: { number: $blockNum }
    ) {
      id
      hash
      createdAt
      createdBy
    }
  }
`;

export const GET_TOKEN_METADATA_BLOCK_BASED_QUERY = gql`
  query Hash($id: String!, $blockNum: Int!) {
    hash(id: $id, block: { number: $blockNum }) {
      id
      hash
      createdAt
      createdBy
      ownership {
        owner
      }
      documents {
        key
        writer
        text
        createdAt
      }
      affirmedDocuments {
        key
        writer
        text
        createdAt
      }
    }
  }
`;

// export const GET_ACCOUNT_TOKENS = `
//   {
//     hashOwnerships(where: { owner: "0x34a745008a643eebc58920eaa29fb1165b4a288e"}) {
//       hash {
//         id
//         hash
//       }
//     }
//   }
// `;
