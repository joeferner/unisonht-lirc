import { UnisonHT } from '@unisonht/unisonht';
import { Lirc } from '.';
import Debug from 'debug';

const debug = Debug('lirc:test');

const port = 3000;
const unisonht = new UnisonHT({});

unisonht.use(
  new Lirc('lirc', {
    fromLirc: (remote, button) => {
      return button;
    },
  }),
);

async function start() {
  try {
    await unisonht.listen(port);
    debug(`Listening http://localhost:${port}`);
  } catch (err) {
    debug(`failed to start: ${err}`);
  }
}

start();
