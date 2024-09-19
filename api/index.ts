import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { errorHandler } from '../src/middlewares/handleError.ts';
import routes from '../src/routes/index.ts';

const appName = 'moncy-express-ts-starter';
const preferredPortNumber = 3000;

const app = express();

app.use(express.json());
morgan.token('url', (req, res) => decodeURIComponent(req.url ?? ''));
app.use(morgan('tiny'));
app.use(compression());
app.use(helmet());
app.disable('x-powered-by');

app.use('/', routes);
app.use(errorHandler);

app.listen(preferredPortNumber, () => {
  console.log(
    `${appName} app started on http://localhost:${preferredPortNumber}`,
  );
});
