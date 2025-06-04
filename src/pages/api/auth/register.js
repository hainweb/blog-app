import db from '../../../lib/dbConnect'
import collections from '../../../lib/collections'
import bcrypt from 'bcrypt'
import { withSessionRoute } from '../../../lib/sessions'

export default withSessionRoute(async function register(req, res) {
    await db.connect()

    console.log("data is ", req.body);
    const { Mobile, Name, Password } = req.body
    console.log('Mobile', Mobile);


    let userExist = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Mobile: Mobile })
    if (userExist) {
        res.status(200).json({ status: false, message: "This Mobile is already taken" })
    } else {
        const hashedPassword = await bcrypt.hash(Password, 10)
        console.log("Bc ps", hashedPassword);

        let addUser = await db.get().collection(collections.USER_COLLECTIONS).insertOne({ Name, Mobile, Password: hashedPassword })
        if (addUser.acknowledged) {
           
            const findUser = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Mobile: Mobile })
            
            let user={
                _id:findUser._id.toString(),
                Name:findUser.Name,
                Mobile:findUser.Mobile
            } 
            req.session.user =  user 
            await req.session.save();
            console.log('session is ',req.session.user);
            res.status(200).json({ status: true,user })
            console.log("user created ", user);
             
           
            
        }


    }



})