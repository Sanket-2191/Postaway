// import dotenv from "dotenv";
// dotenv.config({ path: './.env' }); //loading env variables from .env file during startup command.
// console.log("Server: ", process.env.PORT);

import { connectDB } from "./src/db/dbconfig.js";
import { app } from "./src/server.js";



// console.log("in index.js Cloudinary API Key: ", process.env.CLOUDINARY_API_KEY ? "loaded" : "not loaded");
// console.log("in index.js Cloudinary API Secret: ", process.env.CLOUDINARY_API_SECRET ? "loaded" : "not loaded");

// console.log("cwd: ", process.cwd());

app.listen(process.env.PORT || 3500, () => {
    console.log("Running server on port: ", process.env.PORT);
    connectDB()
})