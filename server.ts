import 'dotenv/config';
import app from './src/app';
import {env} from './src/config/env';

app.listen(env.PORT, () => {
  console.log(`Server running on port`);
});
