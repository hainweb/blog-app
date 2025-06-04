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
        $replaceRoot: { newRoot: "$blogs" },
      },
      { $sort: { date: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  const blogs = blogsData.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    date: blog.date ? new Date(blog.date).toLocaleDateString() : null,
  }));

  const categories = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      { $unwind: "$blogs" },
      { $unwind: "$blogs.tag" },
      {
        $group: {
          _id: "$blogs.tag",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          tag: "$_id",
          count: 1,
        },
      },
    ])
    .toArray();

  // Get user data from session
  const user = req.session.user || null;

  // Get user IP and user-agent
  const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    "Unknown IP";

  const userAgent = req.headers["user-agent"] || "Unknown Agent";

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const identifier = user?.email || req.session.id || `${userIp}-${userAgent}`;

  const filter = {
    identifier,
    date: today,
  };

  const update = {
    $inc: { totalViewCount: 1 },
    $setOnInsert: {
      identifier,
      userMobile: user?.Mobile || null,
      userIp,
      userAgent,
      date: today,
      visitTime: timeString,
    },
    $set: {
      lastVisitTime: timeString,
    },
  };

  await db
    .get()
    .collection(collections.ANALYTIC_COLLECTIONS)
    .updateOne(filter, update, { upsert: true });

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
