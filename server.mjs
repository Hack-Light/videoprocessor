import express from "express";
import cors from "cors";
import multer from "multer";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import PQueue from "p-queue";

import { createFile } from "./service/file-system.js";

const ffmpegInstance = createFFmpeg({ log: true });

let ffmpegLoadingPromise = ffmpegInstance.load();

const requestQueue = new PQueue({ concurrency: 1 });

async function getFFmpeg() {
  if (ffmpegLoadingPromise) {
    await ffmpegLoadingPromise;
    ffmpegLoadingPromise = undefined;
  }

  return ffmpegInstance;
}

const app = express();
const port = 3900;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

app.use(cors());

app.post("/thumbnail", upload.single("video"), async (req, res) => {
  try {
    const videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.png`;
    let outputData = null;

    await requestQueue.add(async () => {
      ffmpeg.FS("writeFile", inputFileName, videoData);

      await ffmpeg.run(
        "-i",
        inputFileName,
        "-frames:v",
        "fps=fps=8",
        outputFileName
      );

      outputData = ffmpeg.FS("readFile", outputFileName);
      ffmpeg.FS("unlink", inputFileName);
      ffmpeg.FS("unlink", outputFileName);
    });

    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment;filename=${outputFileName}`,
      "Content-Length": outputData.length,
    });
    res.end(Buffer.from(outputData, "binary"));
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

  // res.sendStatus(200);
});

app.post("/setFrame", upload.single("video"), async (req, res) => {
  try {
    // const videoData = req.file.buffer;

    console.log("data");
    console.log(req.file);
    let { name, blockNumber } = req.body;
    let videoData = req.file.buffer;

    const ffmpeg = await getFFmpeg();

    const inputFileName = `input-video`;
    const outputFileName = `output-image.mp4`;
    let outputData = null;

    await requestQueue.add(async () => {
      ffmpeg.FS("writeFile", inputFileName, videoData);

      await ffmpeg.run(
        "-r",
        "8",
        "-i",
        inputFileName,
        // "-frames:v",
        // "fps=8",
        "output-image.mp4"
      );

      outputData = ffmpeg.FS("readFile", "output-image.mp4");
      ffmpeg.FS("unlink", inputFileName);
      ffmpeg.FS("unlink", "output-image.mp4");
    });

    createFile(res, name, outputData, "mp4", "videos");
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }

  // res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`[info] ffmpeg-api listening at http://localhost:${port}`);
});
