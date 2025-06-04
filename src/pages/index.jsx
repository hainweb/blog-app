import db from "../lib/dbConnect";
import collections from "../lib/collections";
import Layout from "../components/layout/Layout";
import Blog from "./home";
import { withSessionSsr } from "../lib/sessions";
import crypto from "crypto"; // Node.js crypto module to hash the identifier

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  await db.connect();

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

  // Get user from session
  const user = req.session.user || null;

  // Get client info
  const userIp =
    req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
    req.connection.remoteAddress ||
    "Unknown IP";

  const userAgent = req.headers["user-agent"] || "Unknown Agent";

  const os = userAgent.includes("Windows")
    ? "Windows"
    : userAgent.includes("Mac")
    ? "Mac"
    : userAgent.includes("Linux")
    ? "Linux"
    : "Other";

  // Build stable identifier: hash(userEmail + IP + user-agent)
  const rawIdentifier = user?.email
    ? `user-${user.email}`
    : `${userIp}-${userAgent}`;

  const identifier = crypto.createHash("sha256").update(rawIdentifier).digest("hex");

  const now = new Date();
  const today = now.toISOString().split("T")[0];

  const timeString = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  // Use date + identifier to prevent duplicate entries
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
