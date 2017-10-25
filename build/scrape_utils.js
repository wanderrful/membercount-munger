"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const scrapy = require("node-scrapy");
const pg = require("pg");
;
;
;
;
;
class ScrapeWorker extends pg.Client {
    constructor(config) {
        super({
            connectionString: process.env.DATABASE_URL
        });
        this.on("error", (err) => {
            this.fn_log("ERROR:", err.stack);
        });
        this.on('notice', (msg) => {
            this.fn_log('Notice:', msg);
        });
        this.group_url = "http://steamcommunity.com/groups/" + config.group_name;
        this.check_interval = config.check_interval * 60 * 1000;
        this.fn_login(this.fn_db_initMasterTable);
    }
    fn_login(do_the_thing) {
        this.connect((err) => {
            if (err) {
                this.fn_log("CONNECTION ERROR", err.stack);
            }
            else {
                this.fn_log("CONNECTION SUCCESSFUL");
                do_the_thing();
            }
        });
    }
    fn_run() {
        let config = {
            url: this.group_url,
            model: {
                count: ".content .membercounts .membercount.members .count",
                ingame: ".content .membercounts .membercount.ingame .count",
                online: ".content .membercounts .membercount.online .count"
            }
        };
        scrapy.scrape(config.url, config.model, (err, data) => {
            if (err)
                return console.error(err);
            this.fn_login(() => {
                this.fn_db_writeToDatabase(Object.assign({ timestamp: this.fn_getTimeStamp() }, data));
            });
        });
    }
    fn_db_initMasterTable() {
        this.query({
            text: "CREATE TABLE IF NOT EXISTS db_membercounts(timestamp_date text not null primary key, timestamp_time text not null, count text not null, ingame text not null, online text not null)"
        }, (err, res) => {
            this.fn_db_handleQueryResult(err, res);
            this.fn_db_closeConnection();
        });
    }
    fn_db_writeToDatabase(data) {
        this.query({
            text: "INSERT INTO db_membercounts VALUES($1, $2, $3, $4, $5)",
            values: [data.timestamp.date, data.timestamp.time, data.count, data.ingame, data.online]
        }, (err, res) => {
            this.fn_db_handleQueryResult(err, res);
            this.fn_db_closeConnection();
        });
    }
    fn_db_handleQueryResult(err, res, do_the_thing) {
        if (err) {
            this.fn_log("QUERY ERROR", err.stack);
        }
        else {
            this.fn_log("QUERY RESULT", res.rows);
        }
        do_the_thing();
    }
    fn_db_closeConnection() {
        this.end((err) => {
            if (err) {
                this.fn_log("ERROR DURING DISCONNECTION", err.stack);
            }
            this.fn_log("DISCONNECTED");
        });
    }
    fn_log(text, args) {
        console.log("*** DB ::  ", text, " :: ", args);
    }
    fn_getTimeStamp() {
        let now = new Date();
        let date = [String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear())];
        let time = [String(now.getHours())];
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
}
exports.default = ScrapeWorker;
;
//# sourceMappingURL=scrape_utils.js.map