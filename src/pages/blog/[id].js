import Head from "next/head";
import db from "../../lib/dbConnect";
import collections from "../../lib/collections";
import { ObjectId } from "mongodb";
import Layout from "../../components/layout/Layout";
import { withSessionSsr } from "../../lib/sessions";
import Link from "next/link";

export const getServerSideProps = withSessionSsr(async (content) => {
  await db.connect();
  const { req, params } = content;
  const { id } = content.params;
  console.log("id is ", id);

  const blogData = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .findOne(
      { "blogs._id": new ObjectId(id) },
      {
        projection: { "blogs.$": 1, userId: 1 },
      }
    );

  const blog = blogData.blogs[0];
  blog._id = blog._id.toString();
  blog.date = blog.date ? blog.date.toLocaleString() : null;

  const userData = await db
    .get()
    .collection(collections.USER_COLLECTIONS)
    .findOne({ _id: new ObjectId(blogData.userId) });

  const user = {
    Name: userData.Name,
    Mobile: userData.Mobile,
  };

  const sesUser = req.session.user;

  return {
    props: {
      sesUser,
      user,
      blog,
    },
  };
});

const blog = ({ sesUser, user, blog }) => {
  return (
    <div>
      <Head>
        <title>{blog.title} </title>
        <meta name="description" content={blog.content.slice(0, 150)} />
        <meta property="og:title" content={blog.title} />
        <meta property="og:description" content={blog.content.slice(0, 150)} />
        <meta property="og:type" content="article" />
        <meta
          property="og:url"
          content={`https://your-domain.com/blog/${blog._id}`}
        />
        <meta
          property="og:image"
          content="https://your-domain.com/default-image.jpg"
        />

        <meta
          name="google-site-verification"
          content="MSQCeZYAsLEx_Upa9FKWbPSG0hAkhFfUA31Y3QN3SUk"
        />
      </Head>

      <Layout user={sesUser}>
        <div className="p-4 md:p-10 bg-gray-100 min-h-screen flex justify-center">
          <div className="w-full max-w-7xl bg-white shadow-lg rounded-2xl overflow-hidden border mt-15 border-gray-200">
            {/* User Header */}
            <div className="flex items-center gap-4 p-5 bg-gray-50 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center text-white font-bold text-lg">
                {user.Name.charAt(0)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800">
                  {user.Name}
                </h2>
                <p className="text-sm text-gray-500">
                  {"*".repeat(8) + user.Mobile?.slice(-2)}
                </p>
              </div>
            </div>  

            {/* Blog Content */}
            <div className="p-6">
              <p className="text-xs text-gray-500 mb-2">
                Published on <span className="font-medium">{blog.date}</span> by{" "}
                <span className="font-medium">{blog.author}</span>
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mb-3">
                {blog.title}
              </h2>

              <p className="text-gray-700 leading-relaxed">{blog.content}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {blog.tag.map((tg, i) => (
                  <Link href={`/tag/${tg}`} key={i}>
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs rounded-full hover:bg-orange-200 transition">
                      #{tg}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </div>
  );
};

export default blog;
