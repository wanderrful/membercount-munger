import * as scrapy from "node-scrapy";



export interface Config {
    url: string,
    model: any
};



export function fn_getGroupData(config: Config): void {
    scrapy.scrape(config.url, config.model, (err,data) => {
        if (err) return console.error(err);
        
        console.log({
            timestamp: fn_getTimeStamp(),
            ...data
        });
    });
}

function fn_getTimeStamp(): Object {
    // Create a date object with the current time
    let now: Date = new Date();
    // Create an array with the current month, day and time
    let date: Array<String> = [ String(now.getMonth() + 1), String(now.getDate()), String(now.getFullYear()) ];
    // Create an array with the current hour, minute and second
    let time: Array<String> = [ String(now.getHours()), String(now.getMinutes())];
    // If seconds and minutes are less than 10, add a zero
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