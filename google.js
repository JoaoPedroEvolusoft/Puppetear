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
    "https://www.google.com/search?q=234898600&tbm=isch&sxsrf=ALiCzsbae5sqGBlMKuhM6-Nw2m_hnbxKxA:1665002505968&source=lnms&sa=X&ved=2ahUKEwjJ-qvX-cn6AhUJu5UCHYFUAQ4Q_AUoA3oECAEQBQ&biw=1366&bih=624&dpr=1"
  );
  //   await page.screenshot({ path: "example.png" });

  // let's just call them productsHandle

    // loop thru all handles

      try {
        title = await page.evaluate(
          (el) => el.querySelectorAll("#islrg > div.islrc > div:nth-child(2) > a.VFACy.kGQAp.sMi44c.d0NI4c.lNHeqe.WGvvNb > span").textContent
        );
      } catch (error) {}
      try {
        img = await page.evaluate(
          (el) => el.querySelectorAll("#islrg > div.islrc > div:nth-child(2) > a.wXeWr.islib.nfEiy > div.bRMDJf.islir > img").getAttribute("src")
        );
        // do whatever you want with the data
      } catch (error) {}


        fs.appendFile(
          "results.csv",
          `${img}\n`,
          function (err) {
            if (err) throw err;
          }
        );
 


    // pass the single handle below
    await browser.close();
  }

  

)();
