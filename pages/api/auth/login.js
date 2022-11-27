import User from "models/User";
import db from "utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(400).send({ message: `Cannot ${req.method}` });

  db.connect();
  const data = req.body || {};
  if (!data.email || !data.password) return res.status(400).send({ message: "validation error" });

  const user = await User.findOne({ email: data.email });
  if (!user) return res.status(404).send({ message: "user not found" });

  const isCorrectPwd = await bcrypt.compare(data.password, user.password);
  if (!isCorrectPwd) return res.status(400).send({
    message: "Incorrect Password!"
  });

  if (user.status !== "active") return res.status(403).send({ message: "User Blocked!" });

  const jwtData = {
    name: user?.name,
    email: user?.email,
    _id: user?._id,
    status: user?.status
  }

  const token = jwt.sign(jwtData, process.env.JWT_SIGN);

  res.status(200).send({
    token,
    email: user?.email
  });
}