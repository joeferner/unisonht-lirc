import { UnisonHT, WebApi } from '@unisonht/unisonht';
import { Lirc } from '.';

const port = 3000;
const unisonht = new UnisonHT({});
unisonht.use(new WebApi({ port }));

unisonht.use(
  new Lirc('lirc', {
    fromLirc: (remote, button) => {
      return button;
    },
  }),
);

async function start() {
  try {
    await unisonht.start();
    console.log(`Listening http://localhost:${port}`);
  } catch (err) {
    console.error('failed to start', err);
  }
}

start();
