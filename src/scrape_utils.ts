/* This file is meant to be run by a worker via one of Heroku's Dyno things.

 * The purpose of this file is to monitor the Steam group's player counts
 * so that I can use it to figure out when most people are online. That
 * way, I can know when the best times to host group events are!
 * 
 */
import * as scrapy from "node-scrapy";  // to get the data
import * as pg from "pg";               // to record the data



interface Config {
    url: string,
    model: any
};



////



export default class ScrapeWorker extends pg.Client {
    constructor() {
        super({});

        this.on("error", (err) => {
            console.error("*** DB ERROR: ", err.stack);
        });

        this.on('notice', (msg) => { 
            console.warn('notice:', msg);
        });
    }

    
    
    // PostgreSQL query strings
    public db_initQuery: string = `
CREATE TABLE IF NOT EXISTS db_membercounts(
    timestamp text not null primary key, count numeric not null, ingame numeric not null, online numeric not null
)`;
    public db_insertQuery: string = `
INSERT INTO db_membercounts 
VALUES(
    $1
)`;



    // Class methods
    fn_login(): void {
        // Attempt to connect to the PostgreSQL Database!
        this.connect((err) => {
            if (err) {
                console.error("*** DB CONNECTION ERROR: ", err.stack);
            } else {
                console.log("*** DB CONNECTION SUCCESSFUL!");
                
                // Initialize the Table we will use, if it does not exist
                this.query({
                    text: this.db_initQuery
                }, (err)=>{
                    console.error("*** QUERY ERROR: ", err.stack);
                });
            }
        });
    }
}



////



// Scrape function to get data.
function fn_getGroupData(config: Config): void {
    scrapy.scrape(config.url, config.model, (err,data) => {
        if (err) return console.error(err);
        
        return {
            timestamp: fn_getTimeStamp(),
            ...data
        };
    });
}

// Returns a timestamp as an object.
function fn_getTimeStamp(): Object {
    let now: Date = new Date();
    let date: Array<String> = [ String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear()) ];
    let time: Array<String> = [ String(now.getHours()), String(now.getMinutes())];

    for (let i of time) {  
        if ( +(i) < 10 ) {
          i = "0" + i;
        }
    }
    // Return the formatted string
    return { 
        date: date.join("/"),
        time: time.join(":")
    };
}





// PostgreSQL functions
function fn_connectToDB(): pg.Client {
    const client = new pg.Client({});

    

    return client;
}
function fn_query(client: pg.Client, query: pg.QueryConfig|string, func: (args?: any) => any ): void {
    client.query(query, (err, res) => {
        if (err) {
            console.error("*** DB ERROR: ", err.stack);
        } else {
            console.log(res.rows);
            func(res);
        }
    });
}
function fn_insert(client: pg.Client, query: pg.QueryConfig|string, func:(args?: any) => any): void {
    fn_query(client, query, func());
}



// Main entry point function
export function fn_run(): void {
    // Configure the data object for scraping
    let config: Config = {
        url: process.env.GROUP_URL,
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
        let data = fn_getGroupData(config);
    }, (+(process.env.CHECK_INTERVAL) * 60 * 1000 ) );
}