"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const index_1 = require("./index");
const process_1 = require("process");
let running = false;
function run() {
    running = true;
    (0, index_1.evaluate)((0, index_1.parse)((0, fs_1.readFileSync)('./randomnumber-min.stpd').toString())).then(exitCode => {
        console.log(`Program exited with code ${exitCode}. Press R to restart.`);
        running = false;
    });
}
(0, fs_1.watchFile)('./randomnumber-min.stpd', { interval: 10 }, () => {
    if (running)
        return;
    console.log('File accessed: restarting...');
    run();
});
process_1.stdin.setRawMode(true);
process_1.stdin.on('data', (data) => {
    if (data.toString()[0]?.toLowerCase() === 'r') {
        if (!running) {
            console.log('Restarting...');
            run();
        }
    }
});
run();
//# sourceMappingURL=test.js.map