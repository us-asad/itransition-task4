import User from "models/User";
import db from "utils/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(400).send({ message: `Cannot ${req.method}` });

  db.connect();

  const data = req.body || {};
  if (!data.name || !data.email || !data.password || !data.email?.includes("@")) return res.status(400).send({ message: "validation error!" });

  const existingUser = await User.findOne({ email: data.email });
  if (existingUser) return res.status(400).send({ message: "email already used!" });

  data.password = await bcrypt.hash(data.password, 12);
  const newUser = User.create(data);

  const jwtData = {
    name: data?.name,
    email: data?.email,
    status: data?.status || "active"
  }

  const token = jwt.sign(jwtData, process.env.JWT_SIGN);
  res.status(201).send({
    message: "User created!",
    token,
    email: data?.email
  })
  
}