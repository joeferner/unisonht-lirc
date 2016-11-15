import {Input, InputOptions} from 'unisonht/lib/Input';

interface LircOptions extends InputOptions {

}

export default class Lirc extends Input {
  constructor(options: LircOptions) {
    super(options);
  }
}
