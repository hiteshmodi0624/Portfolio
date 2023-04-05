import ValidateEmail from "@/util/validators";
import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

export default async function handler(req:NextApiRequest, res:NextApiResponse) {
  if (req.method !== "POST") {
    res.status(405).json({ message: "Method not allowed" });
    return;
  }

  const { name, email, message }:{name:string, email:string,message:string} = req.body;

  if (!name || !email  || !message) {
    res.status(403).json({ message: "All fields are required" });
    return;
  }
  if(name.length<2){
    res.status(403).json({ message: "Name must be of atleast 2 characters" });
  }
  if(message.length<10){
    res.status(403).json({ message: "Message must be of atleast 10 characters" });
  }
  if(!ValidateEmail(email)){
    res.status(403).json({ message: "Please enter valid email" });
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: process.env.TO_EMAIL,
    subject: `From:${name} <${email}>`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Email sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({ message: "Error sending email" });
  }
}