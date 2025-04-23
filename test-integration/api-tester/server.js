const express = require("express");
const cors = require("cors");
const app = express();
const cookieParser = require("cookie-parser");
const { sequelize } = require("./models");
const testRouter = require("./routes/test.route");

require("dotenv").config();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);
app.use(cookieParser());

app.use("/api/v1", testRouter);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    await sequelize.sync();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
})();
