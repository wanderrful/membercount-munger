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
    let date: string = String(now.getDay());
    let time: string = String((now.getHours() + 9) % 24); //adjusting 9 hours for UTC+9
    if ( Number(time) < 10 ) {
        time = "0" + time;
    }
    
    return { 
        date: date,
        time: time
    };
}