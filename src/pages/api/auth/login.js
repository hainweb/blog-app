import db from '@/lib/dbConnect'
import collections from '@/lib/collections'
import bcrypt from 'bcrypt'
import { withSessionRoute } from '../../../lib/sessions'

export default withSessionRoute(async function login(req, res) {
    await db.connect()
    console.log("Data ", req.body);
    const { Mobile, Password } = req.body
    console.log("sess", req.session);


    const user = await db.get().collection(collections.USER_COLLECTIONS).findOne({ Mobile: Mobile })
    if (user) {
        let match = await bcrypt.compare(Password, user.Password)
        console.log("Pss match", match);
        if(match){
            req.session.user=user
            console.log('Sess',req.session);
            await req.session.save()
            res.status(200).json({status:true})
        }else{
            res.status(200).json({status:false,message:"Incorrect password"})
        }

    } else {
       res.status(200).json({status:false,message:"Invalid Mobile"})
    }

})