import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "backend"
  });
});

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "backend is running"
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});