import * as Test from "./scrape_utils";

let url: string = "http://steamcommunity.com/groups/fuckfuckgames";
let selector: string = ".repository-meta";
let model = { 
    count: ".content .membercounts .membercount.members .count",
    ingame: ".content .membercounts .membercount.ingame .count",
    online: ".content .membercounts .membercount.online .count"
};



let config: Test.Config = {
    url: url,
    config: model
};



Test.fn_run(config);