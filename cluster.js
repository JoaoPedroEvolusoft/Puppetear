const { Cluster } = require("puppeteer-cluster");
const fs = require("fs");

const urls = [
  "https://www.amazon.com.br/s?k=futebol&__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=192D3BJXWZ25Z&qid=1662934159&sprefix=futebo%2Caps%2C216&ref=sr_pg_1",
  "https://www.amazon.com.br/s?k=futebol+americano&crid=327T99YUTO4T2&sprefix=futebol%2Caps%2C235&ref=nb_sb_ss_ts-doa-p_2_7",
];

(async () => {
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 100,
    monitor: true,
    puppeteerOptions: {
      headless: false,
      defaultViewport: false,
      userDataDir: "./tmp",
    },
  });

  cluster.on("taskerror", (err, data) => {
    console.log(`Error crawling ${data}: ${err.message}`);
  });

  await cluster.task(async ({ page, data: url }) => {
    await page.goto(url);
    //   await page.screenshot({ path: "example.png" });

    // let's just call them productsHandle

    let i = 0;
    let items = [];
    let isBtnDisabled = false;
    while (!isBtnDisabled) {
      await page.waitForSelector('[data-cel-widget="search_result_1"]');
      const productsHandles = await page.$$(
        "div.s-main-slot.s-result-list.s-search-results.sg-row > .s-result-item"
      );
      // loop thru all handles
      for (const productshandle of productsHandles) {
        let title = "Null";
        let price = "Null";
        let img = "Null";

        try {
          title = await page.evaluate(
            (el) => el.querySelector("h2 > a > span").textContent,
            productshandle
          );
        } catch (error) {}
        try {
          price = await page.evaluate(
            (el) => el.querySelector(".a-price > .a-offscreen").textContent,
            productshandle
          );
        } catch (error) {}
        try {
          img = await page.evaluate(
            (el) => el.querySelector(".s-image").getAttribute("src"),
            productshandle
          );
          // do whatever you want with the data
        } catch (error) {}

        if (title !== "Null") {
          items.push(title, price, img);

          fs.appendFile(
            "results.csv",
            `${title.replace(/,/g, ".")},${price.replace(/,/g, ".")},${img}\n`,
            function (err) {
              if (err) throw err;
            }
          );
        }
      }
      await page.waitForSelector(".s-pagination-item.s-pagination-next", {
        visible: true,
      });
      const is_disabled =
        (await page.$(
          ".s-pagination-item.s-pagination-next.s-pagination-disabled"
        )) !== null;
      isBtnDisabled = is_disabled;

      if (!is_disabled) {
        await Promise.all([
          await page.click(".s-pagination-item.s-pagination-next"),
        ]);
      }
      // pass the single handle below
    }

    // Store screenshot, do something else
  });
  for (const url of urls) {
    await cluster.queue(url);
  }

  // many more pages

    await cluster.idle();
    await cluster.close();
})();
