import express from "express"
import bodyParser from "body-parser"
import axios from "axios";
import cors from "cors";

const port=5000;
const app=express();

app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cors());

app.get("/get/equalizer",(req,res)=>{
  console.log("Inside the get equalizer route");
})

app.listen(port,()=>{
  console.log("The Server is running at: ",port);
})