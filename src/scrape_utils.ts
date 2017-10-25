/* This file is meant to be run by a worker via one of Heroku's Dyno things.

 * The purpose of this file is to monitor the Steam group's player counts
 * so that I can use it to figure out when most people are online. That
 * way, I can know when the best times to host group events are!
 * 
 */
import * as scrapy from "node-scrapy";  // to get the data
import * as pg from "pg";               // to record the data



interface IWorkerConfig {
    group_url: string,
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



    /// PostgreSQL query strings
    public db_initQuery: string = `
CREATE TABLE IF NOT EXISTS db_membercounts(
    timestamp text not null primary key, count numeric not null, ingame numeric not null, online numeric not null
)`;
    public db_insertQuery: string = `
INSERT INTO db_membercounts 
VALUES(
    $1
)`;

    
    
    /// Constructor
    constructor(config: IWorkerConfig) {
        super({}); //database login details are pulled automatically from environment variables!

        this.on("error", (err) => {
            this.fn_log("ERROR:", err.stack);
        });

        this.on('notice', (msg) => { 
            this.fn_log('Notice:', msg);
        });

        this.group_url = config.group_url;
        this.check_interval = config.check_interval;
    }



    /// Class methods

    // Utility function to make console.log have a consistent format
    fn_log(text: string, args?: any): void {
        console.log("*** DB ::  ", text, " :: ", args);
    }

    // Utility function that returns the current timestamp as a convenient JSON object
    fn_getTimeStamp(): ITimeStamp {
        let now: Date = new Date();
        let date: Array<String> = [ String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear()) ];
        let time: Array<String> = [ String(now.getHours()), String(now.getMinutes())];
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

                this.end( (err) => {
                    if (err) {
                        this.fn_log("ERROR DURING DISCONNECTION", err.stack);
                    }
                    this.fn_log("DISCONNECTED");
                });
            }
        });
    }

    // Initialize the master table, if it does not already exist.
    fn_initMasterTable(): void {
        this.query({
            text: this.db_initQuery
        }, (err, res) => {
            if (err) {
                this.fn_log("QUERY ERROR", err.stack);
            }
            this.end();
        });
    }

    // Scrape the bot's assigned page to get and return the configured data.
    fn_getGroupData(config: IScrapeConfig): void {
        
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

        scrapy.scrape(config.url, config.model, (err,data: IModelConfig) => {
            if (err) return console.error(err);
            
            this.fn_login( () => {
                this.fn_writeToDatabase({
                    timestamp: this.fn_getTimeStamp(),
                    ...data
                })
            });
        });
    }

    fn_writeToDatabase(data: IRowData): void {
        throw "Not yet implemented!";
    }
};
//(Number(process.env.CHECK_INTERVAL) * 60 * 1000 ) )


////





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