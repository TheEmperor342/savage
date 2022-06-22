import express, { Request, Response } from "express";
import { readdirSync, readFile } from "fs";
import clr from "./assets/defaultColors.json";
import { config } from "dotenv";
config();

const app = express();
const images = readdirSync("./assets");

app.get("/api", (req: Request, res: Response) => {
  let img = req.query.img;
  let errImg = `${__dirname}/assets/error.svg`;
  if (img === undefined) {
    res.status(400).sendFile(errImg);
    return null;
  }

  // === CHECK IF QUERIED IMAGE EXISTS === //
  if (!images.includes(`${img as string}.svg`))
    res.status(404).sendFile(errImg);
  else {
    // === READ THE QUERIED FILE === //
    readFile(`assets/${img}.svg`, "utf8", (err, data) => {
      // === IF THERE IS AN ERROR === //
      if (err) {
        res.status(500).sendFile(errImg);
        return null;
      }

      // === ARRAY OF THE NUMBER OF COLORS IN SVG === //
      let colors: string[] = [];
      Array.from(data.matchAll(/#[1-9]/g)).forEach((item, index) => {
        if (!colors.includes(item.at(0)!)) colors.push(item.at(0)!);
      });

      // === CHECK IF COLORS ARE PROVIDED === //
      let clrs: boolean[] = [];
      let compareArr: boolean[] = [];
      for (let i = 0; i < colors.length; i++) {
        clrs.push(req.query[`_${i + 1}`] !== undefined);
        compareArr.push(false);
      }

      let output = data;
      colors!.forEach((item, index) => {
        output = output.replace(
          new RegExp(item, "g"),
          JSON.stringify(clrs) === JSON.stringify(compareArr)
            ? //@ts-ignore
              clr[`#${img}`][`#${index + 1}`]
            : `#${req.query[`_${index + 1}`]}`
        );
      });
      res.set("Content-Type", "image/svg+xml");
      res.status(200).end(output);
    });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
