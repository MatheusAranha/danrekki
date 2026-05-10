import { createApp } from './app';
import { config } from './config';

const { port } = config();
const app = createApp();

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
