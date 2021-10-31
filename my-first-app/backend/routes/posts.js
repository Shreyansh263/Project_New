const { registerLocaleData } = require('@angular/common');
const express=require('express');
const multer=require('multer');

const router=express.Router();

const Post=require('../models/post');
const auth=require('../middleware/auth');

const MIME_TYPE_MAP={
    'image/png' : 'png',
    'image/jpeg' : 'jpeg',
    'image/jpg' : 'jpg'
}

const storage=multer.diskStorage({
    destination: (req,file,cb)=>{
        const isValid=MIME_TYPE_MAP[file.mimetype];
        let err=new Error('Invalid Mime Type');
        if(isValid){
            err=null;
        }
        cb(err,'backend/images');
    },
    filename : (req,file,cb) =>{
        const name=file.originalname.toLowerCase().split(' ').join('-');
        const ext=MIME_TYPE_MAP[file.mimetype];
        cb(null,name+'-'+Date.now()+'.'+ext);
    }
})


router.post('',auth,multer({storage : storage}).single('image'),(req,res,next)=>{
    const url=req.protocol+"://"+req.get("host");
    const post=new Post({
        title : req.body.title,
        content : req.body.content,
        imagePath : url+"/images/"+req.file.filename,
        creator : req.userData.userId
    });
    post.save()
      .then(result=>{
        res.status(201).json({
            message : "Post Added Successfully",
            post : {
                _id : result._id,
                title: result.title,
                content : result.content,
                imagePath : result.imagePath
            }
        });
    }); 
});

router.put('/:id',auth,multer({storage : storage}).single('image'),(req,res,next)=>{
    let imagePath = req.body.imagePath;
    if(req.file)
    {
       const url=req.protocol+"://"+req.get("host");
       imagePath = url+"/images/"+req.file.filename
    }
    
    const post=new Post({
        _id : req.body._id,
        title : req.body.title,
        content : req.body.content,
        imagePath : imagePath,
        creator : req.userData.userId
    })
    Post.updateOne({_id: req.params.id,creator : req.userData.userId},post)
      .then(result=>{
          console.log(result);
          if(result.modifiedCount>0)
          {
            res.status(200).json({message : "Update Successful"});
          }
          else{
            res.status(401).json({message : "Not Authorized to delete or edit this post!"});  
          }
         
      });
});

router.get('',(req,res,next)=>{
    const pageSize=+req.query.pagesize;
    const currentPage=+req.query.page;
    let fetchedPosts;
    const postQuery=Post.find();
    if(pageSize&&currentPage)
    {
      postQuery.skip(pageSize*(currentPage-1)).limit(pageSize)
    }
    postQuery
      .then(posts=>{
        fetchedPosts=posts;
        return Post.count();
      })
      .then(count=>{
        res.status(200).json({
            message : "Posts Fetched Successfully",
            posts : fetchedPosts,
            count : count
        });
      })   
});

router.delete('/:id',auth,(req,res,next)=>{
    Post.deleteOne({_id : req.params.id,creator : req.userData.userId})
       .then((result)=>{
        if(result.deletedCount>0)
        {
          res.status(200).json({message : "Post Deleted Successfully"});
        }
        else{
          res.status(401).json({message : "Not Authorized to delete or edit this post!"});  
        }
       });
});

module.exports=router;