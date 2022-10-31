import { NextApiRequest, NextApiResponse } from 'next';

const handle = async (req: NextApiRequest, res: NextApiResponse) => {
  res.status(410).json({ statusCode: 422, message: 'deprecated' });
  return;

  // if (req.method === 'GET') {
  //   const historianVerdictsQueue = await getAirtableRecords(
  //     VERDICT_AIRTABLE_DATA,
  //   );

  //   if (!historianVerdictsQueue) {
  //     res
  //       .status(422)
  //       .json({ statusCode: 422, message: 'Airtable records unavailable' });
  //     return;
  //   }

  //   res.setHeader(
  //     'Cache-Control',
  //     `public, immutable, no-transform, stale-while-revalidate, s-maxage=60, max-age=60`,
  //   );
  //   res.status(200).json({
  //     statusCode: 200,
  //     records: historianVerdictsQueue,
  //   });
  //   return;
  // }
  // if (req.method === 'POST') {
  //   try {
  //     await createAirtableRecord(
  //       VERDICT_AIRTABLE_DATA,
  //       req.body as VerdictQueueAirtableRecordType,
  //     );
  //   } catch (error) {
  //     res.status(422).json({
  //       statusCode: 422,
  //       message: `Failed to create Airtable record`,
  //     });
  //     return;
  //   }

  //   res.status(200).json({
  //     statusCode: 200,
  //     success: true,
  //   });
  //   return;
  // }
  // if (req.method === 'DELETE') {
  //   const { id } = req.query;

  //   if (typeof id !== 'string') {
  //     res.status(422).json({
  //       statusCode: 422,
  //       message: 'Airtable record id is not a valid value',
  //     });
  //     return;
  //   }

  //   try {
  //     await removeAirtableRecord(VERDICT_AIRTABLE_DATA, id);
  //   } catch (error) {
  //     res.status(422).json({
  //       statusCode: 422,
  //       message: `Failed to delete Airtable record ${id}`,
  //     });
  //     return;
  //   }

  //   res.status(200).json({
  //     statusCode: 200,
  //     success: true,
  //   });
  //   return;
  // }
  // res.status(400).json({ statusCode: 400, message: 'Bad Request' });
  // return;
};

export default handle;
