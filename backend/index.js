import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
    res.json({ status: "Flowchain AI backend running" });
});

app.listen(5000, () => {
    console.log("Backend running on port 5000");
});
