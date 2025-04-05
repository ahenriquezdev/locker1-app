require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.routes");
const apiRoutes = require("./config/endpoints");
const responseHandler = require("./middleware/responseHandler");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use(responseHandler);
app.use(apiRoutes.internal.base, authRoutes);

app.listen(PORT, () => {
  console.log(
    `Gateway API running on port ${PORT}. ${apiRoutes.internal.base}${apiRoutes.internal.authApi.auth.me}`,
  );
});
