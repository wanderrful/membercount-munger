import * as Scrape from "./scrape_utils";

let url: string = "http://steamcommunity.com/groups/fuckfuckgames";
let model = { 
    count: ".content .membercounts .membercount.members .count",
    ingame: ".content .membercounts .membercount.ingame .count",
    online: ".content .membercounts .membercount.online .count"
};



let config: Scrape.Config = {
    url: url,
    model: model
};



Scrape.fn_getGroupData(config);