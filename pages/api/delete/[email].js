import User from "models/User";
import db from "utils/db";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "DELETE") return res.status(400).send({ message: `Cannot ${req.method}` });

  const verified = jwt.verify(req.headers.authorization.split(" ")[1], process.env.JWT_SIGN);
  if (!verified?.email) return res.status(403).send({ message: "Access denied" });

  db.connect();

  const user = await User.findOneAndDelete({ email: req.query.email }, { new: true });
  if (!user) return res.status(404).send({ message: "user not found" });

  res.status(200).send({
    message: "Successfully deleted"
  });
}