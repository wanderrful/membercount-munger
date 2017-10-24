import * as scrapy from "node-scrapy";

let url: string = "https://github.com/strongloop/express";
let selector: string = ".repository-meta";

scrapy.scrape(url, selector, (err,data) => {
    if (err) return console.error(err);
    console.log(data);
});