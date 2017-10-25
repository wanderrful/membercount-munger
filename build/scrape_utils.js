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
    let date = [String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear())];
    let time = [String(now.getHours() + 9)];
    for (let i of time) {
        if (Number(i) < 10) {
            i = "0" + i;
        }
    }
    return {
        date: date.join("/"),
        time: time.join(":")
    };
}
exports.fn_getTimeStamp = fn_getTimeStamp;
//# sourceMappingURL=scrape_utils.js.map