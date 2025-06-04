import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const blog = ({ blogs, categories }) => {
  const safeBlogs = blogs || [];
  const [showCategories, setShowCategories] = useState(false);
  const [allBlogs, setAllBlogs] = useState(safeBlogs);
  const [skip, setSkip] = useState(safeBlogs.length);
  const [loading, setLoading] = useState(false);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);
  const containerRef = useRef();

  const loadMoreBlogs = async () => {
    if (!hasMoreBlogs || loading) return;

    setLoading(true);
    try {
      const res = await axios.get(`/api/blog`, {
        params: { skip, limit: 10 },
      });
      const data = res.data;
      if (data.blogs.length > 0) {
        setAllBlogs((prev) => [...prev, ...data.blogs]);
        setSkip((prev) => prev + data.blogs.length);
      } else {
        setHasMoreBlogs(false);
      }
    } catch (error) {
      console.error("Error loading more blogs:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
          container.scrollHeight - 10 &&
        !loading &&
        hasMoreBlogs
      ) {
        loadMoreBlogs();
      }
    };

    if (container) {
      container.addEventListener("scroll", handleScroll);
    }

    return () => container?.removeEventListener("scroll", handleScroll);
  }, [loading, hasMoreBlogs]);

  return (
    <div className="p-5 min-h-screen bg-gray-100 mt-15">
      {/* Top Buttons for Mobile */}
      <div className="md:hidden flex flex-col gap-3 mb-5">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="text-blue-600 font-medium underline w-fit"
        >
          {showCategories ? "Hide Categories" : "Show Categories"}
        </button>

        {showCategories && (
          <div className="bg-white rounded-xl shadow-md border px-4 py-3">
            <h2 className="text-blue-900 font-bold text-lg">Categories</h2>
            <div className="h-0.5 bg-orange-500 w-full mt-1 mb-2 rounded"></div>
            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
              {categories?.map((ctg, i) => (
                <Link href={`tag/${ctg.tag}`} key={i}>
                  <h2 className="text-gray-700 hover:text-orange-600 text-sm">
                    {ctg.tag} ({ctg.count})
                  </h2>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link href="/create-blog">
          <button className="rounded-md px-4 py-2 font-bold bg-blue-500 text-white hover:bg-blue-600 w-full">
            Create a blog
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blog List */}
        <div
          ref={containerRef}
          className="md:col-span-2 grid grid-cols-1 gap-4 p-2 overflow-y-auto max-h-[40rem] hide-scrollbar"
        >
          {allBlogs.length >= 1 ? (
            allBlogs.map((item) => (
              <div
                key={item._id}
                className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-sm hover:shadow-xl transition"
              >
                <p className="text-xs text-gray-500 mb-1">
                  Published on {item.date} by {item.author}
                </p>
                <Link href={`blog/${item._id}`}>
                  <h2 className="font-bold text-2xl text-gray-800 truncate">
                    {item.title}
                  </h2>
                </Link>
                <p className="text-gray-600 line-clamp-2">{item.content}</p>
                <Link href={`blog/${item._id}`}>
                  <p className="text-orange-500 text-xs mt-2">
                    Continue reading →
                  </p>
                </Link>
                <div className="mt-2 flex flex-wrap">
                  {item.tag.map((tg, i) => (
                    <Link href={`tag/${tg}`} key={i}>
                      <div className="p-2 bg-gray-100 hover:bg-gray-200 rounded ml-1 mb-1 text-gray-600 text-xs">
                        <h2>{tg}</h2>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center w-full">
              <h2 className="font-semibold text-gray-800">There are no blogs</h2>
            </div>
          )}

          {loading && (
            <div className="w-full text-center py-4">
              <span className="text-sm text-gray-500">Loading more blogs...</span>
              <div className="flex items-center justify-center mt-2">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          )}

          {!hasMoreBlogs && (
            <div className="w-full text-center py-4">
              <span className="text-sm text-gray-500">
                You've reached the end of the blogs.
              </span>
            </div>
          )}
        </div>

        {/* Sidebar for Desktop */}
        <div className="p-3 w-full hidden md:block">
          <div className="mb-4">
            <Link href="/create-blog">
              <button className="rounded-md px-4 py-2 font-bold bg-blue-500 text-white hover:bg-blue-600 w-full">
                Create a blog
              </button>
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-xl border px-6 py-4">
            <h2 className="text-blue-900 font-bold text-2xl">Categories</h2>
            <div className="h-0.5 bg-orange-500 w-full mt-2 rounded"></div>
            <div className="flex flex-col mt-3 gap-2 overflow-y-auto max-h-60">
              {categories?.map((ctg, i) => (
                <Link href={`tag/${ctg.tag}`} key={i}>
                  <h2 className="text-gray-700 hover:text-orange-600">
                    {ctg.tag} ({ctg.count})
                  </h2>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default blog;
