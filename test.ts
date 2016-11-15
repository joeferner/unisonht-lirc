const repl = require('repl');
const Lirc = require('.').default;
var lirc = new Lirc({});

const r = repl.start('> ');
r.context.lirc = lirc;
