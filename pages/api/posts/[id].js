import { connectToDatabase } from "../../../db/config/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
  const { db } = await connectToDatabase();
  const { id } = req.query;
  const posts = await db
    .collection("posts")
    .findOne({ _id: ObjectId(id) })
    // .sort({ metacritic: -1 })
  res.json(posts);
};
