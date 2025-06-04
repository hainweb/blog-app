import db from "../../../lib/dbConnect";
import collections from "../../../lib/collections";
import { ObjectId } from "mongodb";
export default async function addBlog(req, res) {
  await db.connect();

  console.log("Dats ", req.body.formdata);

  let tagsArray = req.body.formdata.tag.split(",").map((tag) => tag.trim());
  req.body.formdata.tag = tagsArray;
  console.log("Tag array", tagsArray);

  const id = req.body.id;

  let userBlog = await db
    .get()
    .collection(collections.BLOG_COLLECTIONS)
    .findOne({ userId: id });

  if (userBlog) {
    console.log("User blog", userBlog);
    let addBlog = await db
      .get()
      .collection(collections.BLOG_COLLECTIONS)
      .updateOne(
        { userId: id },
        {
          $push: {
            blogs: {
              _id: new ObjectId(),
              date:new Date(),
              ...req.body.formdata,
            },
          },
        }
      );

    res.status(200).json({ status: true });
  } else {
    console.log("No user");

    let addBlog = await db
      .get()
      .collection(collections.BLOG_COLLECTIONS)
      .insertOne({
        userId: id,
        blogs: [
          {
            _id: new ObjectId(),
            ...req.body.formdata,
          },
        ],
      });
    res.status(200).json({ status: true });
  }
}
