import { exec } from "node:child_process";
import { spawn } from "node:child_process";
import { fork } from "node:child_process";
import { promisify } from "node:util";

const child = fork("./worker-process.js");

app.post("/videos/:filename/thumbnail", (req, res) => {
  const input = `uploads/${req.params.filename}`;
  const output = `uploads/${req.params.filename}.thumb.jpg`;

  const ffmpeg = spawn("ffmpeg", [
    "-i",
    input,
    "-ss",
    "00:00:01",
    "-vframes",
    "1",
    output,
  ]);

  ffmpeg.on("close", (code) => {
    if (code !== 0)
      return res.status(500).json({ error: "Thumbnail generation failed" });
    res.json({ thumbnail: `/uploads/${req.params.filename}.thumb.jpg` });
  });

  ffmpeg.stderr.on("data", (d) => console.error(d.toString())); // ffmpeg logs to stderr by default, even on success
});

child.on("message", (msg) => {
  console.log("Parent received:", msg);
  // Child will exit gracefully after sending
});

child.send({ n: 21 });

const execAsync = promisify(exec);

app.get("/disk-usage", async (req, res) => {
  try {
    const { stdout } = await execAsync("df -h");
    res.type("text/plain").send(stdout);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

exec("ls -la", (err, stdout, stderr) => {
  if (err) {
    console.error("Error:", err.message);
    return;
  }
  console.log("stdout:", stdout);
});

exec("ls -la | grep .js", (err, stdout) => {
  console.log(stdout);
});

exec(`echo user said: ${"'; echo INJECTED ;'"}`, (err, stdout) => {
  console.log(stdout); // you'll see "INJECTED" printed as a separate command
});

child.on("close", (code) => {
  console.log(`Process exited with code ${code}`);
});
