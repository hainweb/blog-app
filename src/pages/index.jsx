import db from "../lib/dbConnect";
import collections from "../lib/collections";
import Layout from "../components/layout/Layout";
import Blog from "./home";
import { withSessionSsr } from "../lib/sessions";

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  await db.connect();

  const blogsData = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      { $unwind: "$blogs" },
      {
        $replaceRoot: { newRoot: "$blogs" }, // Flatten so each blog becomes a top-level document
      },
      { $sort: { date: -1 } }, // Optional: sort by date
      { $limit: 10 }, // Get first 5 blog entries
    ])
    .toArray();

  const blogs = blogsData.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    date: blog.date ? new Date(blog.date).toLocaleDateString() : null,
  }));

  console.log("all blogs", blogs);

  const categories = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      {
        $unwind: "$blogs",
      },
      {
        $unwind: "$blogs.tag",
      },
      {
        $group: {
          _id: "$blogs.tag",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          tags: "$alltags",
          tag: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  console.log("categories", categories);

  const userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const now = new Date();

  // Date in YYYY-MM-DD
  const today = now.toISOString().split("T")[0];

  // Time in 12-hour format (e.g. "10:30 AM")
  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  const filter = {
    userIp,
    date: today,
  };

  const update = {
    $inc: { totalViewCount: 1 },
    $setOnInsert: {
      userIp,
      date: today,
      visitTime: timeString,
    },
     $set: {
    lastVisitTime: timeString
  }
  };

  await db
    .get()
    .collection(collections.ANALYTIC_COLLECTIONS)
    .updateOne(filter, update, { upsert: true });

  const user = req.session.user || null;
  return { props: { user, blogs, categories } };
});

export default function Home({ user, blogs, categories }) {
  return (
    <div>
      <Layout user={user}>
        <Blog user={user} blogs={blogs} categories={categories} />
      </Layout>
    </div>
  );
}
