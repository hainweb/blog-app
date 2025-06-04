import React, { useState } from "react";
import { withSessionSsr } from "../../lib/sessions";
import Layout from "../../components/layout/Layout";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";

export const getServerSideProps = withSessionSsr(async ({ req }) => {
  const user = req.session.user;

  if (!user || !user.Mobile) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return {
    props: { user },
  };
});

const Index = ({ user }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [formdata, setFormData] = useState({
    title: "",
    author: "",
    tag: "",
    content: "",
  });
  const [loading, setLoading] = useState(false); // <-- loading state

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({
      ...formdata,
      [e.target.name]: e.target.value,
    });

    // Clear error for the field being edited
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: "",
    }));
  };

  const handleNext = () => {
    const newErrors = {};
    if (!formdata.title.trim()) newErrors.title = "Title is required";
    if (!formdata.author.trim()) newErrors.author = "Author name is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setStep(2);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formdata.content.trim()) newErrors.content = "Content is required";
    if (!formdata.tag.trim()) newErrors.tag = "Tag is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setLoading(true); // start loading

    try {
      const response = await axios.post("/api/add-blog", {
        formdata,
        id: user._id,
      });

      if (response.data.status) {
        router.push("/my-blogs");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setLoading(false); // stop loading if error
    }
  };

  return (
    <Layout user={user}>
      <div className="min-h-screen flex items-center justify-center bg-gray-200 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800">
            Create Blog
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Step 1: Title & Author */}
            {step === 1 && (
              <>
                <div>
                  <label className="block text-gray-600 mb-1" htmlFor="title">
                    Title
                  </label>
                  <input
                    value={formdata.title}
                    onChange={handleChange}
                    name="title"
                    type="text"
                    placeholder="Enter blog title"
                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 mb-1" htmlFor="author">
                    Author Name
                  </label>
                  <input
                    value={formdata.author}
                    onChange={handleChange}
                    name="author"
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.author && (
                    <p className="text-red-500 text-sm mt-1">{errors.author}</p>
                  )}
                </div>
                <div className="flex justify-between mt-6">
                  <Link href="/">
                    <button
                      type="button"
                      className="text-yellow-500 px-3 py-1 cursor-pointer rounded-lg hover:bg-yellow-500 hover:text-white transition"
                    >
                      Cancel
                    </button>
                  </Link>

                  <button
                    type="button"
                    className="text-blue-500 px-3 cursor-pointer py-1 rounded-lg hover:bg-blue-500 hover:text-white transition"
                    onClick={handleNext}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {/* Step 2: Content & Tags */}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-gray-600 mb-1" htmlFor="content">
                    Content
                  </label>
                  <textarea
                    value={formdata.content}
                    onChange={handleChange}
                    name="content"
                    rows="5"
                    placeholder="Write your blog content..."
                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.content}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-gray-600 mb-1" htmlFor="tags">
                    Tags / Category
                  </label>
                  <input
                    value={formdata.tag}
                    onChange={handleChange}
                    name="tag"
                    type="text"
                    placeholder="e.g. Tech, Life, Coding"
                    className="w-full px-4 py-2 text-gray-800 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.tag && (
                    <p className="text-red-500 text-sm mt-1">{errors.tag}</p>
                  )}
                </div>

                {/* Submit button with spinner */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex justify-center items-center gap-2 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition ${
                    loading ? "cursor-not-allowed opacity-70" : ""
                  }`}
                >
                  {loading && (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
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
                  )}
                  {loading ? "Creating..." : "Submit"}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
