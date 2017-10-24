/* This file is meant to be run by a worker via one of Heroku's Dyno things.

 * The purpose of this file is to monitor the Steam group's player counts
 * so that I can use it to figure out when most people are online. That
 * way, I can know when the best times to host group events are!
 * 
 */
import * as scrapy from "node-scrapy";  // to get the data
import * as pg from "pg";               // to record the data



export interface Config {
    url: string,
    model: any
};



// Scrape function to get data.
function fn_getGroupData(config: Config): void {
    scrapy.scrape(config.url, config.model, (err,data) => {
        if (err) return console.error(err);
        
        console.log({
            timestamp: fn_getTimeStamp(),
            ...data
        });
    });
}

// Returns a timestamp as an object.
function fn_getTimeStamp(): Object {
    let now: Date = new Date();
    let date: Array<String> = [ String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear()) ];
    let time: Array<String> = [ String(now.getHours()), String(now.getMinutes())];

    for (let i of time) {  
        if ( Number(i) < 10 ) {
          i = "0" + i;
        }
    }
    // Return the formatted string
    return { 
        date: date.join("/"),
        time: time.join(":")
    };
}



// PostgreSQL queries
const db_initQuery: string = `
CREATE TABLE IF NOT EXISTS db_membercounts(
    timestamp text not null primary key, count numeric not null, ingame numeric not null, online numeric not null
)`;
const db_insertQuery: string = `
INSERT INTO db_membercounts 
VALUES(
    $1
)`;

// PostgreSQL functions
function fn_connectToDB(): pg.Client {
    const client = new pg.Client();

    client.connect((err) => {
        if (err) {
            console.error("*** DB CONNECTION ERROR: ", err.stack);
        } else {
            console.log("*** DB CONNECTION SUCCESSFUL!");
            fn_query(client, db_initQuery, ()=>{

            });
        }
    });
    client.on("error", (err) => {
        console.error("*** DB ERROR: ", err.stack);
    });

    return client;
}
function fn_query(client: pg.Client, query: Object|string, func: (args?: any) => any ): void {
    client.query(query, (err, res) => {
        if (err) {
            console.error("*** DB ERROR: ", err.stack);
        } else {
            console.log(res.rows);
            func(res);
        }
    });
}
function fn_insert(client: pg.Client, query: Object|string, func:(args?: any) => any): void {
    fn_query(client, query, func());
}



// Main entry point function
export function fn_run(): void {
    // Configure the data object for scraping
    let config: Config = {
        url: "http://steamcommunity.com/groups/fuckfuckgames",
        model: { 
            count: ".content .membercounts .membercount.members .count",
            ingame: ".content .membercounts .membercount.ingame .count",
            online: ".content .membercounts .membercount.online .count"
        }
    };

    // Connect to the Database
    const client = fn_connectToDB();

    // Finally, begin the looping scrape for data
    setInterval( () => {
        fn_getGroupData(config);
    }, 30 * 60 * 1000);
}



