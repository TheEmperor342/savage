import express from "express";
import { readdirSync, readFileSync } from "fs";

const app: express.Application = express();
const port: number = Number(process.env.PORT) || 3001;

//app.use(express.static("./static"));

app.get("/", (req: express.Request, res: express.Response) => {
	res.redirect("https://github.com/TheEmperor342/savage");
});

app.get("/api", (req: express.Request, res: express.Response) => {
	res.set("Content-Type", "image/svg+xml");
	const img: string = req.query.img as string;

	// === CHECK IF IMAGE EXISTS === //
	if (!readdirSync("./images/").includes(`${img}.svg`)) {
		res.status(400).end(readFileSync(`./images/error.svg`, "utf-8"));
		return null;
	}

	let imgText: string = readFileSync(`./images/${img}.svg`, "utf-8");

	// === GET ALL COLORS IN THE SVG === //
	const colorsInImg: string[] = [];
	for (let i of [...new Set(imgText.match(/#([a-f0-9]{6}|[a-f0-9]{3})/gi))])
		colorsInImg.push(`${i.slice(1)}`);

	// === CHECK WHICH COLORS ARE PROVIDED BY THE USER === //
	const colorsByUser: boolean[] = [];
	for (let i = 0; i < colorsInImg.length; i++)
		colorsByUser.push(req.query[`${i + 1}`] !== undefined);

	// === FINAL COLORS TO ADD IN SVG === //
	const colors: string[] = [];
	let index: number, isColorInputted: boolean;
	for ([index, isColorInputted] of colorsByUser.entries())
		colors.push(
			isColorInputted
				? (req.query[`${index + 1}`] as string)
				: colorsInImg[index]!
		);

	// === ADD COLORS TO SVG === //
	let color: string;
	for ([index, color] of colors.entries()) {
		imgText = imgText.replace(
			new RegExp(`#${colorsInImg[index]}`, "g"),
			`#${color}`
		);
	}

	res.status(200).end(imgText);
});

app.get("/list", (req: express.Request, res: express.Response) => {
	const images: string[] = [];
	for (let i of readdirSync("./images/"))
		images.push(
			`<a href='/api?img=${i.slice(0, i.length - 4)}'>${i.slice(
				0,
				i.length - 4
			)}</a> <br/>`
		);
	res.status(400).end(images.join(""));
});

app.listen(port, () => {
	console.log(`App hosted on port ${port}`);
});
