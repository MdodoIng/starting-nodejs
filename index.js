import express from "express";
const app = express();
app.use(express.json());

const notes = [
  { id: 1, title: "Buy milk", done: false },
  { id: 2, title: "Finish report", done: true },
  { id: 3, title: "Call mom", done: false },
];

function calculateStats(noteList) {
  let doneCount = 0;
  for (let i = 0; i < noteList.length; i++) {
    debugger; // execution pauses here automatically, but ONLY when run with --inspect
    if (noteList[i].done) doneCount++;
  }
  return { total: noteList.length, done: doneCount };
}

app.get("/stats", (req, res) => {
  const stats = calculateStats(notes);
  res.json(stats);
});

app.listen(3000, () => console.log("Server on http://localhost:3000"));
