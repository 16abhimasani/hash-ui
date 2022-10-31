import { Wallet } from 'ethers';
import { NextApiRequest, NextApiResponse } from 'next';
import { MAINNET_PROVIDER } from '../../../clients/provider';
import { ADDRESS_REGEX, TX_HASH_REGEX } from '../../../utils/regex';

const SAGA_VERIFIER_PRIVATE_KEY = process.env.SAGA_VERIFIER_PRIVATE_KEY || '';
const sagaSigner = new Wallet(SAGA_VERIFIER_PRIVATE_KEY, MAINNET_PROVIDER);

const handleVerify = async (req: NextApiRequest, res: NextApiResponse) => {
  const { hash, address } = req.query;

  if (typeof hash !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }
  if (!TX_HASH_REGEX.test(hash as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'hash is not a valid value' });
    return;
  }
  if (typeof address !== 'string') {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }
  if (!ADDRESS_REGEX.test(address as string)) {
    res
      .status(422)
      .json({ statusCode: 422, message: 'address is not a valid value' });
    return;
  }
  res.status(200).json({});

  // const response = await MAINNET_PROVIDER.getTransaction(hash);
  // const receipt = await MAINNET_PROVIDER.getTransactionReceipt(hash);
  // if (!response) {
  //   res.status(404).json({ statusCode: 404, message: 'hash not found' });
  //   return;
  // }
  // const normalizedAddress = address.toLowerCase();

  // const isValidTxn =
  //   response.from.toLowerCase() === normalizedAddress ||
  //   (!!response.to && response.to.toLowerCase() === normalizedAddress);

  // let isValidLoggedTxn = false;
  // if (!!receipt) {
  //   const topics = uniq(flatten(receipt.logs.map((l) => l.topics)));
  //   isValidLoggedTxn = some(
  //     topics.map((t) => {
  //       return t.slice(-40).toLowerCase() === normalizedAddress.slice(2);
  //     }),
  //   );
  // }

  // if (isValidTxn || isValidLoggedTxn) {
  //   const signedMint: SignedMint = {
  //     txHash: hash,
  //     dst: address,
  //     salt: Date.now(),
  //     signature: '0x0',
  //   };
  //   const messageHash = utils.solidityKeccak256(
  //     ['address', 'uint256', 'uint256'],
  //     [signedMint.dst, signedMint.txHash, signedMint.salt],
  //   );

  //   const bytesMessageHash = utils.arrayify(messageHash);
  //   const signature = await sagaSigner.signMessage(bytesMessageHash);
  //   res.setHeader(
  //     'Cache-Control',
  //     `immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  //   );
  //   res.status(200).json({
  //     signedMint: {
  //       ...signedMint,
  //       signature,
  //     },
  //     signer: sagaSigner.address,
  //   });
  // } else {
  //   const signedMint: SignedMint = {
  //     txHash: hash,
  //     dst: address,
  //     salt: Date.now(),
  //     signature: '0x0',
  //   };
  //   res.setHeader(
  //     'Cache-Control',
  //     `immutable, no-transform, s-maxage=31536000, max-age=31536000`,
  //   );
  //   res.status(200).json({
  //     signedMint,
  //     signer: sagaSigner.address,
  //   });
  // }
};

export default handleVerify;
