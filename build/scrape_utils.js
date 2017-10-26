"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
;
;
;
;
function fn_log(text, args = "--") {
    console.log("*** DB ::  ", text, " :: ", args);
}
exports.fn_log = fn_log;
function fn_getTimeStamp() {
    let now = new Date();
    let date = String(now.getDay());
    let time = String((now.getHours() + 9) % 24);
    if (Number(time) < 10) {
        time = "0" + time;
    }
    return {
        date: date,
        time: time
    };
}
exports.fn_getTimeStamp = fn_getTimeStamp;
//# sourceMappingURL=scrape_utils.js.map