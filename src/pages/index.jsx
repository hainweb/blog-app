import db from "../lib/dbConnect";
import collections from "../lib/collections";
import Layout from "../components/layout/Layout";
import Blog from "./home";
import { withSessionSsr } from "../lib/sessions";

export const getServerSideProps = withSessionSsr(async ({ req }) => {

   const apiUrl =
    "https://hain-analytics-backend.onrender.com/api/analytics/log";

  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform: "blogapp" }),
  });

  await db.connect();
  
// Get user data from session
const user = req.session.user || null;
  // Fetch latest 10 blogs
  const blogsData = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      { $unwind: "$blogs" },
      { $replaceRoot: { newRoot: "$blogs" } },
      { $sort: { date: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  const blogs = blogsData.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    date: blog.date ? new Date(blog.date).toLocaleDateString() : null,
  }));

  // Fetch categories with tag counts
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

  // Extract IP and user-agent
  const userAgent = req.headers["user-agent"] || "Unknown Agent";
  const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection.remoteAddress ||
    "Unknown IP";

  // Block bots/crawlers
  const isBot = /bot|crawler|spider|crawling|vercel|facebookexternalhit|preview/i.test(userAgent);
  if (isBot) {
    return { props: { user: null, blogs, categories } };
  }

  // Determine OS
  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac")
    ? "Mac"
    : userAgent.includes("Linux")
    ? "Linux"
    : userAgent.includes("Android")
    ? "Android"
    : userAgent.includes("iPhone")
    ? "iOS"
    : "Other";

  // Date & Time setup
  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Basic insert or update query
  const filter = {
    userIp,
    userAgent,
    date: today,
  };

  const update = {
    $inc: { totalViewCount: 1 },
    $setOnInsert: {
      userIp,
      os,
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
