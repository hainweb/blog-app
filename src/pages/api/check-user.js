import { withSessionRoute } from '../../lib/sessions'

export default withSessionRoute(async function checkUser(req, res) {

  const action = req.body.action;
  console.log("logout sess", action);

  switch (action) {

    case "logout":
      req.session.user = null;
      await req.session.save();
      console.log("Sess logout", req.session.user);

      return res.status(200).json({ status: true })

    default:

      const user = req.session.user;

      console.log("user from session:", user);

      if (user) {
        return res.status(200).json({ user });
      } else {
       return res.status(200).json({ user: null });
      }

  }


});
