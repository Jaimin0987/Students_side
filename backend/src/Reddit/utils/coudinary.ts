import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: "dn72w95yk",
  api_key: "921914224557582",
  api_secret: "f6EawH94gmUa7uX5mub86HXuSms",
});

export default cloudinary;
