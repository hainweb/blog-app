import db from "../../lib/dbConnect";
import collections from "../../lib/collections";
import Link from "next/link";
import Layout from "../../components/layout/Layout";
import { withSessionSsr } from "../../lib/sessions";

export const getServerSideProps = withSessionSsr(async (content) => {
  await db.connect();
  const { req, params } = content;
  const { id } = content.params;
  console.log("id is ", id);

  const user = req.session.user;

  if (!user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  let blogs = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .aggregate([
      {
        $unwind: "$blogs",
      },
      {
        $match: { "blogs.tag": id },
      },
      {
        $project: {
          _id: "$blogs._id",
          title: "$blogs.title",
          author: "$blogs.author",
          tag: "$blogs.tag",
          content: "$blogs.content",
          date: "$blogs.date",
        },
      },
    ])
    .toArray();

  blogs = blogs.map((blog) => ({
    ...blog,
    _id: blog._id.toString(),
    date: blog.date ? blog.date.toLocaleDateString() : null,
  }));

  return {
    props: {
      user,
      blogs,
      id
    },
  };
});

const tag = ({ user, blogs,id }) => {
  return (
    <div>
      <Layout user={user}>
        <div className="p-4 md:p-2 min-h-screen bg-gray-100 mt-15">
          <div className="relative p-5 text-sm ">
            {/* Blog Content */}
            <h2 className="text-orange-500 mb-1"># {id}</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-3">
              {blogs.length > 0 ? (
                <>
                  {blogs.map((item) => (
                    <div
                      key={item._id}
                      className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-3 text-sm hover:shadow-md transition"
                    >
                      {/* Blog Content */}
                      <p className="text-xs text-gray-500 mb-1">
                        Published on {item.date} by {item.author}
                      </p>
                      <Link href={`/blog/${item._id}`} key={item._id}>
                        <h2 className="font-bold text-2xl text-gray-800 truncate">
                          {item.title}
                        </h2>
                      </Link>
                      <p className="text-gray-600 line-clamp-2">
                        {item.content}
                      </p>
                      <Link href={`/blog/${item._id}`} key={item._id}>
                        <p className="text-orange-500 text-xs mt-2">
                          Continue reading →
                        </p>
                      </Link>
                      <div className="mt-2 flex">
                        {item.tag.map((tg) => (
                          <div className="p-2 bg-gray-100 rounded ml-1 line-clamp-2 text-gray-600 text-xs">
                            <h2> {tg}</h2>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                
                  <h2 className="text-gray-800 text-center lg:text-end ">No tag found</h2>
                
              )}
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default tag;
