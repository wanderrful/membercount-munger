/* 
 * This ScrapeWorker class is meant to be run by a worker via one of 
 * Heroku's Dyno things.
 *
 * Its purpose is to monitor the Steam group's player counts and
 * record the data so that I can figure out when most of my friends
 * are online. That way, I can know when the best times to host group
 * events are!
 * 
 */
import * as scrapy from "node-scrapy";  // to get the data
import * as pg from "pg";               // to record the data



interface IWorkerConfig {
    group_name: string,
    check_interval: number
};
interface IScrapeConfig {
    url: string,
    model: IModelConfig
};
interface IModelConfig {
    count: string,
    ingame: string,
    online: string
};
interface ITimeStamp {
    date: string,
    time: string
};
interface IRowData extends IModelConfig {
    timestamp: ITimeStamp
};



export default class ScrapeWorker extends pg.Client {
    /// Class members
    public group_url: string;
    public check_interval: number;

    
    
    /// Constructor
    constructor(config: IWorkerConfig) {
        super({}); //database login details are pulled automatically from environment variables!

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



    /// Class functions
    // Use this to access the database.  Called in the constructor.
    fn_login(do_the_thing: () => void): void {
        // Attempt to connect to the PostgreSQL Database!
        this.connect((err) => {
            if (err) {
                this.fn_log("CONNECTION ERROR", err.stack);
            } else {
                this.fn_log("CONNECTION SUCCESSFUL");
                
                // Now that we are logged in, attempt to initialize the master table
                do_the_thing();
            }
        });
    }

    // The main entry point for actually doing work
    fn_run(): void {
        // Configure the data object for scraping
        let config: IScrapeConfig = {
            url: this.group_url,
            model: { 
                count: ".content .membercounts .membercount.members .count",
                ingame: ".content .membercounts .membercount.ingame .count",
                online: ".content .membercounts .membercount.online .count"
            }
        };

        // Scrape the assigned webpage for the needed data
        scrapy.scrape(config.url, config.model, (err,data: IModelConfig) => {
            if (err) return console.error(err);
            
            // Connect to the database, do the thing, and close the connection
            this.fn_login( () => {
                this.fn_db_writeToDatabase({
                    timestamp: this.fn_getTimeStamp(),
                    ...data
                })
            });
        });
    }

    
    
    /// Database query functions!
    // Initialize the master table, if it does not already exist.
    fn_db_initMasterTable(): void {
        this.query({
            text: "CREATE TABLE IF NOT EXISTS db_membercounts(timestamp_date text not null primary key, timestamp_time text not null, count text not null, ingame text not null, online text not null)"
        }, (err, res) => {
            this.fn_db_handleQueryResult(err,res);
            this.fn_db_closeConnection();
        });
    }
    // Insert a new row into the master table with the given data
    fn_db_writeToDatabase(data: IRowData): void {
        this.query({
            text: "INSERT INTO db_membercounts VALUES($1, $2, $3, $4, $5)",
            values: [data.timestamp.date, data.timestamp.time, data.count, data.ingame, data.online]
        }, (err, res) => {
            this.fn_db_handleQueryResult(err,res);
            this.fn_db_closeConnection();
        });
    }
    // Reports errors or results from query attempts
    fn_db_handleQueryResult(err: Error, res: pg.QueryResult, do_the_thing?: () => void) {
        if (err) {
            this.fn_log("QUERY ERROR", err.stack);
        } else {
            this.fn_log("QUERY RESULT", res.rows)
        }
        do_the_thing();
    }
    // Closes the connection to the PostgreSQL server!
    fn_db_closeConnection(): void {
        this.end( (err) => {
            if (err) {
                this.fn_log("ERROR DURING DISCONNECTION", err.stack);
            }
            this.fn_log("DISCONNECTED");
        });
    }


    
    /// Utility functions
    // To make console.log have a consistent format
    fn_log(text: string, args?: any): void {
        console.log("*** DB ::  ", text, " :: ", args);
    }

    // Returns the current timestamp as a convenient JSON object
    fn_getTimeStamp(): ITimeStamp {
        let now: Date = new Date();
        let date: Array<String> = [ String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear()) ];
        let time: Array<String> = [ String(now.getHours()) ];
        for (let i of time) {  
            if ( Number(i) < 10 ) {
              i = "0" + i;
            }
        }
        
        return { 
            date: date.join("/"),
            time: time.join(":")
        };
    }
};