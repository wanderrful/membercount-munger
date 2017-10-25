import ScrapeWorker from "./scrape_utils";



let worker = new ScrapeWorker({
    group_url: String(process.env.GROUP_URL),
    check_interval: Number(process.env.CHECK_INTERVAL)
});
worker.fn_run();
