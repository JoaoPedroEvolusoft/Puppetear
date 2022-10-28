const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: false,
    userDataDir: "./tmp",
  });
  const page = await browser.newPage();
  await page.goto(
    "https://www.amazon.com.br/s?k=futebol&__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=192D3BJXWZ25Z&qid=1662934159&sprefix=futebo%2Caps%2C216&ref=sr_pg_1"
  );
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
          `${title.replace(/,/g , ".")},${price},${img}\n`,
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

  console.log(items);
    await browser.close();
})();
