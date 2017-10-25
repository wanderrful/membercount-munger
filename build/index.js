"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scrape_utils_1 = require("./scrape_utils");
let worker = new scrape_utils_1.default({
    group_name: String(process.env.GROUP_NAME),
    check_interval: Number(process.env.CHECK_INTERVAL)
});
setInterval(worker.fn_run, worker.check_interval);
//# sourceMappingURL=index.js.map