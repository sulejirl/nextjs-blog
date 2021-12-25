import { connectToDatabase } from "../../../db/config/mongodb";

export default async (req, res) => {
  const { db } = await connectToDatabase();
  const posts = await db
    .collection("posts")
    .find({})
    // .sort({ metacritic: -1 })
    .limit(20)
    .toArray();
  res.json(posts);
};