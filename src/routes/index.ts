import { eq } from 'drizzle-orm';
import express from 'express';
import 'express-async-errors';
import httpStatus from 'http-status';

import { db } from '../drizzle/index';
import { redirects } from '../drizzle/schema/redirects';
import { decodeJWT, encodeJWT } from '../utils/JWTRoutes';
import 'dotenv/config';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(httpStatus.OK).json({
    message: 'Home',
  });
});

router.get('/routes', async (req, res) => {
  try {
    const result = await db
      .select()
      .from(redirects)

    const BASE_HOST = `${req.protocol}://${req.get('host')}`;
    const buildLink = (jwt: Record<string, any>) => `${BASE_HOST}/jwt/${encodeJWT({ uuid: jwt.uuid })}`;
    const ans = result.map(row => ({
      ...row,
      link: buildLink(row)
    }))

    res.status(httpStatus.OK).json(ans)
  } catch (error) {

  }
})

router.get('/redirect/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;

    const result = await db
      .select()
      .from(redirects)
      .where(eq(redirects.uuid, uuid));

    if (result.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Redirect not found',
      });
    }

    return res.redirect(result[0].url);
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred',
    });
  }
});

router.get('/jwt/:jwt', async (req, res) => {
  try {
    const { uuid } = decodeJWT(req.params.jwt)

    const result = await db
      .select()
      .from(redirects)
      .where(eq(redirects.uuid, uuid as string));

    if (result.length === 0) {
      return res.status(httpStatus.NOT_FOUND).json({
        message: 'Redirect not found',
      });
    }

    return res.redirect(result[0].url);
  } catch (error) {
    console.error(error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      message: 'An error occurred',
    });
  }
});

router.get('/healthcheck', (req, res) => {
  res.status(httpStatus.OK).json({
    message: 'OK',
  });
});

export default router;
