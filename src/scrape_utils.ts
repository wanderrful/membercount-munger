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



/// Interface structs
export interface IWorkerConfig {
    group_name: string,
    check_interval: number
};
export interface IScrapeConfig {
    url: string,
    model: IModelConfig
};
export interface IModelConfig {
    count: string,
    ingame: string,
    online: string
};
interface ITimeStamp {
    date: string,
    time: string
};
export interface IRowData extends IModelConfig {
    timestamp: ITimeStamp
};



/// Utility functions
// To make console.log have a consistent format
export function fn_log(text: string, args: any = "--"): void {
    console.log("*** DB ::  ", text, " :: ", args);
}

// Returns the current timestamp as a convenient JSON object
export function fn_getTimeStamp(): ITimeStamp {
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