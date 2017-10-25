import ScrapeWorker from "./scrape_utils";



let worker = new ScrapeWorker({
    group_name: String(process.env.GROUP_NAME),
    check_interval: Number(process.env.CHECK_INTERVAL)
});



// Begin the work cycle
setInterval( worker.fn_run, worker.check_interval);