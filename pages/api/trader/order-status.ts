import { FIRESTORE_ROUTES } from '@hash/firebase-utils';
import { NextApiRequest, NextApiResponse } from 'next';
import { admin } from '../../../clients/firebase-server';
import { traderClient } from '../../../clients/trader-server';
import { SignedERC721OrderStruct } from '../../../types/trader';
import { isOrderStatusPotentiallyChanging } from '../../../utils/trader';
import { updateBestOrderToDisplay } from '../../../utils/updateBestOrderToDisplay';

const firestore = admin.firestore();

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  const { orderNonces: orderNoncesStr } = req.query;

  if (typeof orderNoncesStr !== 'string') {
    res.status(422).json({
      statusCode: 422,
      message: 'cidsString is not a valid value',
    });
    return;
  }

  if (orderNoncesStr.length === 0) {
    res.status(422).json({
      statusCode: 422,
      message: 'orderNonces is not a valid value',
    });
    return;
  }

  const orderNonces = orderNoncesStr.split(',');

  try {
    const orderRefs = orderNonces.map((c) =>
      firestore.collection(FIRESTORE_ROUTES.SIGNED_ORDERS).doc(c),
    );
    const orderSnapshots = await firestore.getAll(...orderRefs);

    const orderStatuses = await Promise.all(
      orderRefs.map(async (ref, i) => {
        const data = orderSnapshots[i].data();
        if (!data) {
          return { orderNonce: ref.id };
        }
        if (
          !data.orderStatus ||
          isOrderStatusPotentiallyChanging(data.orderType, data.orderStatus)
        ) {
          const orderStatus = await traderClient.getOrderStatus(
            data as SignedERC721OrderStruct,
          );
          console.log(orderStatus, data.orderStatus);
          if (data.orderStatus !== orderStatus) {
            await ref.update({ orderStatus });
          }
          const tokenId = data.erc721TokenId;
          await updateBestOrderToDisplay(tokenId, data.hash);
          return { orderNonce: ref.id, orderStatus };
        }
        return { orderNonce: ref.id, orderStatus: data.orderStatus };
      }),
    );

    res.setHeader(
      'Cache-Control',
      `public, no-transform, s-maxage=40, max-age=40`,
    );
    res.status(200).json({
      orderStatuses: orderStatuses.reduce(
        (a, c) => ({ ...a, [c.orderNonce]: c.orderStatus }),
        {},
      ),
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ statusCode: 500, message: 'Something went wrong' });
  }
};

export default handle;
