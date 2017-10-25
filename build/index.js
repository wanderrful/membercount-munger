"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scrapy = require("node-scrapy");
const pg = require("pg");
const Scrape = require("./scrape_utils");
const config = {
    group_name: String(process.env.GROUP_NAME),
    check_interval: (Number(process.env.CHECK_INTERVAL) * 60 * 1000)
};
const worker = new pg.Client({
    connectionString: process.env.DATABASE_URL
});
worker.on("error", (err) => {
    Scrape.fn_log("ERROR:", err.message);
});
worker.on('notice', (msg) => {
    Scrape.fn_log('Notice:', msg.message);
});
function fn_run() {
    let scrape_config = {
        url: ("http://steamcommunity.com/groups/" + config.group_name),
        model: {
            count: ".content .membercounts .membercount.members .count",
            ingame: ".content .membercounts .membercount.ingame .count",
            online: ".content .membercounts .membercount.online .count"
        }
    };
    scrapy.scrape(scrape_config.url, scrape_config.model, (err, data) => {
        if (err)
            return console.error(err);
        fn_login(() => {
            fn_db_writeToDatabase(Object.assign({ timestamp: this.fn_getTimeStamp() }, data));
        });
    });
}
function fn_login(do_the_thing) {
    worker.connect((err) => {
        if (err) {
            Scrape.fn_log("CONNECTION ERROR", err.stack);
        }
        else {
            Scrape.fn_log("CONNECTION SUCCESSFUL");
            do_the_thing();
        }
    });
}
function fn_db_initMasterTable() {
    worker.query({
        text: "CREATE TABLE IF NOT EXISTS db_membercounts(timestamp_date text not null primary key, timestamp_time text not null, count text not null, ingame text not null, online text not null)"
    }, (err, res) => {
        fn_db_handleQueryResult(err, res);
        fn_db_closeConnection();
    });
}
function fn_db_writeToDatabase(data) {
    worker.query({
        text: "INSERT INTO db_membercounts VALUES($1, $2, $3, $4, $5)",
        values: [data.timestamp.date, data.timestamp.time, data.count, data.ingame, data.online]
    }, (err, res) => {
        fn_db_handleQueryResult(err, res);
        fn_db_closeConnection();
    });
}
function fn_db_handleQueryResult(err, res) {
    if (err) {
        Scrape.fn_log("QUERY ERROR", err.stack);
    }
    else {
        Scrape.fn_log("QUERY RESULT", res.rows);
    }
}
function fn_db_closeConnection() {
    worker.end((err) => {
        if (err) {
            Scrape.fn_log("ERROR DURING DISCONNECTION", err.stack);
        }
        Scrape.fn_log("DISCONNECTED");
    });
}
fn_login(fn_db_initMasterTable);
setInterval(fn_run, config.check_interval);
//# sourceMappingURL=index.js.map