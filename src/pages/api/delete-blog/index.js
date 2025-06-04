import db from '../../../lib/dbConnect'
import collections from '../../../lib/collections'
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    await db.connect()
    console.log("id is ", req.body);
    const { _id, userId } = req.body

    console.log("id is ", _id, 'userid', userId);

    let deleteBlog = await db.get().collection(collections.BLOG_COLLECTIONS).updateOne({ userId },
        {
            $pull: {
                blogs: { _id: new ObjectId(_id) }
            }
        }
    )

    if (deleteBlog.acknowledged) {
        return (
            res.status(200).json({ status: true }) 
        )
    }else{
        res.status(200).json({ status: false })
    }

    console.log("Blog deleted ", deleteBlog);


}