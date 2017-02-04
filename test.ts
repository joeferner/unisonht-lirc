import {UnisonHT} from "unisonht";
import {Lirc} from ".";

const unisonht = new UnisonHT();

unisonht.use(new Lirc('lirc'));

unisonht.listen(3000)
  .catch((err) => {
    console.error('listen error', err);
  });
