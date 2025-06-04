import db from "../../../lib/dbConnect";
import collections from "../../../lib/collections";

export default async function handler(req, res) {
  const { skip = 0, limit = 10 } = req.query;
  console.log('API call hit', skip, limit);

  await db.connect();

  const blogsData = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      { $unwind: "$blogs" },
      {
        $replaceRoot: { newRoot: "$blogs" },
      },
      { $sort: { date: -1 } }, // Optional: sort by date or any field
      { $skip: parseInt(skip) },
      { $limit: parseInt(limit) },
    ])
    .toArray();

  const blogs = blogsData.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    date: blog.date ? new Date(blog.date).toLocaleDateString() : null,
  }));

  console.log("New blogs", blogs);

  res.status(200).json({ blogs });
}
