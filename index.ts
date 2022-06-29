import express, { Request, Response } from "express";
import clr from "./defaultColors.json";
import { config } from "dotenv";
import { getText, list } from "./supabase";
config();

const app = express();
app.use(express.static("./static"));

app.get("/api", async (req: Request, res: Response) => {
  const errImg = await getText("error");
  let img = req.query.img;
  res.set("Content-Type", "image/svg+xml");

  if (img === undefined) {
    res.status(400).end(errImg!);
    return null;
  }
  try {
    const data = await getText(img as string);
    if (data === null) {
      res.status(400).end(errImg!);
      return null;
    }

    // === ARRAY OF THE NUMBER OF COLORS IN SVG === //
    let colors: string[] = [];
    Array.from(data.matchAll(/#_[1-9]/g)).forEach((item, index) => {
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
    res.status(200).end(output);
  } catch (e) {
    console.log("api route error: ", e);
    res.status(500).end(errImg!);
  }
});

app.get("/list", async (req: Request, res: Response) => {
  const images = await list();
  if (images === null) {
    res.set("Content-Type", "image/svg+xml");
    res.end(await getText("error"));
    return null;
  }
  let val = "";
  for (let i = 0; i < images.length; i++) {
    if (images.at(i) === "error.svg") continue;
    val += `<a href=/api?img=${images.at(i)?.slice(0, -4)}>${images
      .at(i)
      ?.slice(0, -4)}</a><br/>`;
  }
  res.end(val);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
