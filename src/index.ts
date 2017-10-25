import * as scrapy from "node-scrapy";  // to get the data
import * as pg from "pg";               // to record the data

import * as Scrape from "./scrape_utils";



const config: Scrape.IWorkerConfig = {
    group_name: String(process.env.GROUP_NAME),
    check_interval: ( Number(process.env.CHECK_INTERVAL) * 60 * 1000 )
};

const worker: pg.Client = new pg.Client({
    connectionString: process.env.DATABASE_URL
}); //database login details are pulled automatically from environment variables!



// The main entry point for actually doing work
function fn_run(): void {
    // Configure the data object for scraping
    let scrape_config: Scrape.IScrapeConfig = {
        url: ("http://steamcommunity.com/groups/" + config.group_name),
        model: { 
            count: ".content .membercounts .membercount.members .count",
            ingame: ".content .membercounts .membercount.ingame .count",
            online: ".content .membercounts .membercount.online .count"
        }
    };

    // Scrape the assigned webpage for the needed data
    scrapy.scrape(scrape_config.url, scrape_config.model, (err,data: Scrape.IModelConfig) => {
        if (err) return console.error(err);
        
        // Add the new row to the database
        fn_db_writeToDatabase({
            timestamp: Scrape.fn_getTimeStamp(),
            ...data
        })
    });
}

// Use this to access the database.  Called in the constructor.
function fn_login(do_the_thing: () => void): void {
    // Attempt to connect to the PostgreSQL Database!
    worker.connect((err) => {
        if (err) {
            Scrape.fn_log("CONNECTION ERROR", err.stack);
        } else {
            Scrape.fn_log("CONNECTION SUCCESSFUL");
            
            // Now that we are logged in, do the thing
            do_the_thing();
        }
    });
}



/// Database functions!
// Initialize the master table, if it does not already exist.
function fn_db_initMasterTable(): void {
    worker.query({
        text: "CREATE TABLE IF NOT EXISTS db_membercounts(timestamp_date text not null, timestamp_time text not null, count text not null, ingame text not null, online text not null)"
    }, (err, res) => {
        fn_db_handleQueryResult(err,res);
    });
}
// Insert a new row into the master table with the given data
function fn_db_writeToDatabase(data: Scrape.IRowData): void {
    worker.query({
        text: "INSERT INTO db_membercounts VALUES($1, $2, $3, $4, $5)",
        values: [data.timestamp.date, data.timestamp.time, data.count, data.ingame, data.online]
    }, (err, res) => {
        fn_db_handleQueryResult(err,res);
    });
}
// Reports errors or results from query attempts
function fn_db_handleQueryResult(err: Error, res: pg.QueryResult) {
    if (err) {
        Scrape.fn_log("QUERY ERROR", err.stack);
    } else {
        Scrape.fn_log("QUERY SUCCESS")
    }
}
// Closes the connection to the PostgreSQL server!
function fn_db_closeConnection(): void {
    worker.end( (err) => {
        if (err) {
            Scrape.fn_log("ERROR DURING DISCONNECTION", err.stack);
        }
        Scrape.fn_log("DISCONNECTED");
    });
}



// Shut down gracefully
process.on("beforeExit", (code) => {
    fn_db_closeConnection();
    Scrape.fn_log("SHUTTING DOWN", code);
});



// Initialize the master table
fn_login(fn_db_initMasterTable);



// Begin the work cycle
setInterval( fn_run, config.check_interval);