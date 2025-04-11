import 'dotenv/config';
import ViteExpress from 'vite-express';

import { app } from './server';

const PORT = Number(process.env.VITE_BE_PORT) || 3000;

ViteExpress.listen(app, PORT, () => {
    console.log(`Server is listening at http://localhost:${PORT}`);
});
