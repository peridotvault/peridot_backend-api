import app from './app';
import { env } from './config/env';

const port = Number(env.PORT);

app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
});
