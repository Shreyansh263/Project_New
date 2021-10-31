const express=require('express');
const path=require('path');

const bodyParser=require('body-parser');

const mongoose=require('mongoose');

const postRouter=require('./routes/posts');
const userRouter=require('./routes/user');

const app=express();

app.use(bodyParser.json());
app.use("/images",express.static(path.join("backend/images")));

mongoose.connect('mongodb+srv://Shrey21:Shrey263@cluster0.ckbig.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',{ useNewUrlParser: true })
     .then(()=>{
         console.log("Connected To Database");
     })
     .catch((err)=>{
         console.log(err);
     })



app.use((req,res,next)=>{
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader("Access-Control-Allow-Headers","Origin,Content-Type,Accept,X-Requested-With,Z-Key,Authorization");
    res.setHeader("Access-Control-Allow-Methods","*");
    next();
});

app.use('/api/posts',postRouter);
app.use('/api/user',userRouter);

module.exports=app;