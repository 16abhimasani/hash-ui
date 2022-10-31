import { NextApiRequest, NextApiResponse } from 'next';
import { createListedSaleAlert } from '../../../utils/alert-server';
import { createOrderAndMaybeUpdateBestOrderToDisplay } from '../../../utils/createOrder';
import { validateTraderSaleOrder } from '../../../utils/traderValidation';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(400).json({ statusCode: 400, message: 'Bad Request' });
    return;
  }

  const signedOrder = req.body;

  if (validateTraderSaleOrder(signedOrder)) {
    res.status(422).json({ statusCode: 422, message: 'order is invalid' });
    return;
  }

  try {
    const { hash, cid } = await createOrderAndMaybeUpdateBestOrderToDisplay(
      signedOrder,
    );
    await createListedSaleAlert(hash, signedOrder);
    res.status(200).json({ cid });
  } catch (e) {
    console.log(e);
    res.status(500).json({ statusCode: 500, message: 'Something went wrong' });
  }
};

export default handle;
