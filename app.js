const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const http = require("http").Server(app);
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const mongoose = require("mongoose");

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(async () => {
    console.log("Connected to MongoDB!");

    const migrationTracker = mongoose.model(
      "Migration_Tracker",
      new mongoose.Schema({
        migrationName: String,
        executedAt: Date,
      })
    );

    migrationTracker.createIndexes({ migrationName: 1 }, { unique: true });

    // Collect migration files in sorted order
    const migrationsPath = path.join(__dirname, "src/migrations");
    const migrationFiles = fs
      .readdirSync(migrationsPath)
      .filter((file) => file.endsWith(".js"))
      .sort((a, b) => a.localeCompare(b));

    // Execute pending migrations sequentially using async/await
    for (const file of migrationFiles) {
      console.log(`Executing migration ${file}`);

      const migrationName = path.basename(file, ".js");

      try {
        const existingMigration = await migrationTracker.findOne({
          migrationName,
        });
        if (!existingMigration) {
          const migration = require(`./src/migrations/${file}`);
          await migration();
          console.log(`Migration ${file} executed successfully`);
          await new migrationTracker({ migrationName }).save();
        } else {
          console.log(`Migration ${file} already executed, skipping`);
        }
      } catch (error) {
        console.error(`Error executing migration ${file}:`, error);
      }
    }
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

const Role = require("./src/models/role");
const Faculty = require("./src/models/faculty");
const User = require("./src/models/user");
const Contribution = require("./src/models/contribution");
const Event = require("./src/models/event");

require("./src/routes/auth.routes")(app);
require("./src/routes/user.routes")(app);
require("./src/routes/role.routes")(app);
require("./src/routes/faculty.routes")(app);
require("./src/routes/contribution.routes")(app);
require("./src/routes/event.routes")(app);
// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Greenwich Magazine." });
});

http.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
