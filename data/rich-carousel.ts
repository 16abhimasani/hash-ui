import { utils } from 'ethers';
import { getTwitterShareLink } from '../bots/twitter';
import {
  ZINE_POH_V1_ASSETS,
  ZINE_POH_V1_AUCTION,
  ZINE_POH_V1_BLOG,
} from '../constants';
import { CarouselData } from '../stores/carousel';

export const RICH_CAROUSEL_METADATA_MAP: { [id: string]: CarouselData[] } = {
  'poh-v1': [
    {
      id: 'zine.gif',
      asset: `${ZINE_POH_V1_ASSETS}/zine.gif`,
      title: 'Proof of History - Vol. 1',
      description: 'Zine',
      linkHref: ZINE_POH_V1_BLOG,
      linkLabel: 'Read Blog',
      shareHref: getTwitterShareLink(
        ZINE_POH_V1_BLOG,
        'Check out this NFT zine!',
      ),
      price: utils.parseEther('1'),
      priceHref: ZINE_POH_V1_AUCTION,
      type: 'custom',
    },
    {
      id: 'cover.jpg',
      asset: `${ZINE_POH_V1_ASSETS}/cover.jpg`,
      title: 'Proof of History - Vol. 1',
      description: 'Cover',
      linkHref: ZINE_POH_V1_BLOG,
      shareHref: getTwitterShareLink(
        ZINE_POH_V1_BLOG,
        'Check out this NFT zine!',
      ),
      linkLabel: 'Read Blog',
      price: utils.parseEther('1'),
      priceHref: ZINE_POH_V1_AUCTION,
      type: 'custom',
    },
    {
      id: 'cover-alt.jpg',
      asset: `${ZINE_POH_V1_ASSETS}/cover-alt.jpg`,
      title: 'Proof of History - Vol. 1',
      description: 'Cover Alt',
      linkHref: ZINE_POH_V1_BLOG,
      shareHref: getTwitterShareLink(
        ZINE_POH_V1_BLOG,
        'Check out this NFT zine!',
      ),
      linkLabel: 'Read Blog',
      price: utils.parseEther('1'),
      priceHref: ZINE_POH_V1_AUCTION,
      type: 'custom',
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s00-1.jpg`,
      id: `0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s01-1.jpg`,
      id: `0x5c504ed432cb51138bcf09aa5e8a410dd4a1e204ef84bfed1be16dfba1b22060`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s00-2.jpg`,
      id: `0x31ded263506ea36e6ea777efc2c39a999e6fba4f4d338c7313af6aac6d9bf3e3`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s01-2.jpg`,
      id: `0x31ded263506ea36e6ea777efc2c39a999e6fba4f4d338c7313af6aac6d9bf3e3`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s00-3.jpg`,
      id: `0x404d8e109822ce448e68f45216c12cb051b784d068fbe98317ab8e50c58304ac`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s01-3.jpg`,
      id: `0x404d8e109822ce448e68f45216c12cb051b784d068fbe98317ab8e50c58304ac`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s00-4.jpg`,
      id: `0x6e5fa6686803a5c825b3b03174b2c4a433fdc1b354f05078396b292a78b49879`,
    },
    {
      type: 'hash',
      asset: `${ZINE_POH_V1_ASSETS}/s01-4.jpg`,
      id: `0x6e5fa6686803a5c825b3b03174b2c4a433fdc1b354f05078396b292a78b49879`,
    },
  ],
};
