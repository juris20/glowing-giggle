const puppeteer = require('puppeteer');
const express = require("express");
const app = express();


async function getContent(link, page) {
  await page.goto(link, {
    // Set timeout cho page
    // timeout: 2000000
  });
  // Chờ 2s sau khi page được load để tránh overload
  // await page.waitFor(1000);

  let content = await page.evaluate(() => {
    let value = document.querySelector("div.entry-content");

    value.querySelectorAll(".ltt-contentbox").forEach(d => {
      d.remove();
    });
    value.querySelector(".post-rating-wrap").remove();
    value.querySelector(".bottom-like-share").remove();
    value.querySelectorAll("#sub-frame-error").forEach(d => {
      d.remove();
    })
    value.querySelectorAll("img").forEach(img => {
      img.removeAttribute("alt");
      img.removeAttribute("title");
    })
    value.querySelector("p strong").remove();
    return value.innerHTML;
  });
  return content;
}



app.get("/", (req, res) => {
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.ivivu.com/blog/category/top-diem-den/');
    // await page.waitFor(2000);
    const dimensions = await page.evaluate(() => {
      let datas = document.querySelectorAll(".one-half");
      let ar_title = [];
      datas.forEach((item, index) => {
        ar_title.push({
          id: index + 1,
          title: item.querySelector("h2 a").innerText,
          link: item.querySelector("h2 a").getAttribute("href"),
          img: item.querySelector(".thumb img").getAttribute("src"),
          time: item.querySelector("div.entry-meta span.date").innerText,
        })
      });
      return ar_title;
    });

    for (data of dimensions) {
      data.content = await getContent(data.link, page);
    }

    // res.send({ status: true, msg: "Success", code: 0, data: dimensions});
    res.send(dimensions[0].content);
    await browser.close();
  })();
})



app.listen(3000, () => {
  console.log("Started at 3000");
})

/*crawler ajax */
/*
const puppeteer = require('puppeteer');
let DOMAIN = 'https://demo.tutorialzine.com/2009/09/simple-ajax-website-jquery';
let URL = DOMAIN + '/demo.html';

(async() => {
    try {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(URL);

        await page.click('#navigation > li:nth-child(3) > a');
        await page.waitForSelector('div#pageContent img');

        const imgUrl = await page.evaluate(() => {
            return document.querySelector('div#pageContent img').getAttribute('src');
        });
       console.log(imgUrl);

        const options = {
            url: DOMAIN + '/' + imgUrl,
            dest: 'images'
        };
        const { filename, image } = await download.image(options);
        browser.close()
    } catch (error) {
        console.log("Catch : " + error);
    }
})();
 */