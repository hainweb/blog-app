import React, { useState } from "react";
import Layout from "../../components/layout/Layout";
import db from "../../lib/dbConnect";
import collections from "../../lib/collections";
import { withSessionSsr } from "../../lib/sessions";
import axios from "axios";
import Link from "next/link";

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  await db.connect();

  const user = req.session.user;

  if (!user || !user.Mobile) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
  const userId = req.session.user._id;
  let userBlogs = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      { $match: { userId } },
      {
        $project: {
          userId: 1,
          blogs: {
            $sortArray: {
              input: "$blogs",
              sortBy: { date: -1 },
            },
          },
        },
      },
    ])
    .toArray();

  let blogs = [];
  if (userBlogs.length > 0 && userBlogs[0].blogs) {
    blogs = userBlogs[0].blogs.map((blog) => ({
      ...blog,
      _id: blog._id.toString(),
      date: blog.date ? new Date(blog.date).toLocaleString() : null,
    }));
  }

  return {
    props: {
      blogs,
      user,
    },
  };
});

const index = ({ blogs: initialBlogs, user }) => {
  const [blogs, setBlogs] = useState(initialBlogs);
  // Track which blog ids are currently deleting
  const [deletingIds, setDeletingIds] = useState(new Set());

  const handleDelete = async (_id) => {
    if (window.confirm("Are you sure want to delete")) {
      // Add this id to deleting set
      setDeletingIds((prev) => new Set(prev).add(_id));

      try {
        let deleteBlog = await axios.post("/api/delete-blog", {
          _id,
          userId: user._id,
        });
        if (deleteBlog.data.status) {
          setBlogs((prev) => prev.filter((blog) => blog._id !== _id));
        }
      } catch (error) {
        console.error("Failed to delete blog", error);
      } finally {
        // Remove id from deleting set
        setDeletingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(_id);
          return newSet;
        });
      }
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen bg-gray-100">
        <h2 className="font-semibold text-gray-800 text-center p-5">My blog's</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 p-5 sm:p-8 md:p-8 bg-gray-100 ">
          {blogs.length >= 1 ? (
            <>
              {blogs.map((item) => (
                <div
                  key={item._id}
                  className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-sm hover:shadow-xl transition"
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="absolute top-2 right-2 cursor-pointer text-red-500 hover:text-red-700 flex items-center justify-center"
                    aria-label="Delete blog"
                    disabled={deletingIds.has(item._id)}
                  >
                    {deletingIds.has(item._id) ? (
                      // Spinner SVG or Tailwind spinner
                      <svg
                        className="animate-spin h-5 w-5 text-red-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="lucide lucide-trash-icon lucide-trash"
                      >
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    )}
                  </button>

                  {/* Blog Content */}
                  <p className="text-xs text-gray-500 mb-1">
                    Published on {item.date} by {item.author}
                  </p>
                  <Link href={`blog/${item._id}`}>
                    <h2 className="font-bold text-2xl text-gray-800 truncate cursor-pointer">
                      {item.title}
                    </h2>
                  </Link>
                  <p className="text-gray-600 line-clamp-2">{item.content}</p>
                  <Link href={`blog/${item._id}`}>
                    <p className="text-orange-500 text-xs mt-2 cursor-pointer">
                      Continue reading →
                    </p>
                  </Link>
                  <div className="mt-2 flex flex-wrap">
                    {item.tag.map((tg, i) => (
                      <Link href={`tag/${tg}`} key={i}>
                        <div className="p-2 bg-gray-100 hover:bg-gray-200 rounded ml-1 mb-1 text-gray-600 text-xs cursor-pointer">
                          <h2>{tg}</h2>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center ">
              <h2 className="font-semibold text-gray-800 ">You don't have any blogs</h2>
              <Link href="/create-blog">
                <button className="rounded-md mt-3 px-4 py-2 text-xs md:text-base font-bold bg-blue-500 cursor-pointer hover:bg-blue-600">
                  Create a blog
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default index;
