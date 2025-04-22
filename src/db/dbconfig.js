import mongoose from "mongoose"


const DB_Name = 'postaway'

// const url = `${process.env.ATLAS_URI}/${DB_Name}${process.env.ATLAS_URI_tail}`

const url = "mongodb://localhost:27017/postaway"
export const connectDB = async () => {
    try {
        await mongoose.connect(url)
        console.log("Connected to DB.");

    } catch (error) {
        throw new Error("DB Connection failed.")
    }
}