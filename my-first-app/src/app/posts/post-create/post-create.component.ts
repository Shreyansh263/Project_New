import { Component,EventEmitter,OnInit,Output } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls :['./post-create.component.css']
})
export class PostCreateComponent implements OnInit{
  enteredTitle='';
  enteredContent='';
//Output() enables components from outside to listen to our custom event, i.e from the component in which we are using app-post-create
 // @Output() postCreated=new EventEmitter();
  
  postsService : PostsService;
  route:ActivatedRoute;
  mode:String;
  form:FormGroup;
  postId:string;
  post;
  imageUrl;

  constructor(postsService:PostsService,route:ActivatedRoute)       //ActivatedRoute gives info about the route we are currently in
  {
    this.postsService=postsService;
    this.route=route;
  }

  ngOnInit(){
    this.form=new FormGroup({
      title : new FormControl(null,{
        //validators : [Validators.required,Validators.minLength(3)]
      }),
      content : new FormControl(null,{
        //validators : [Validators.required]
      }),
      image : new FormControl(null)
    })
    this.route.paramMap.subscribe((paramMap:ParamMap)=>{
      if(paramMap.has('postId')){
        this.mode='edit';
        this.postId=paramMap.get('postId');
        this.post=this.postsService.getPost(this.postId);
        this.form.setValue({
          title : this.post.title,
          content : this.post.content,
          image : this.post.imagePath
        });
      }
      else{
        this.mode='create';
        this.postId=null;
      }
    });
  }

  onImageUpload(event)
  {
    const file=(event.target as HTMLInputElement).files[0];
    this.form.patchValue({image : file});
    this.form.get('image').updateValueAndValidity();
    const reader=new FileReader();
    reader.onload=()=>{
      this.imageUrl=reader.result;
    }
    reader.readAsDataURL(file);
  }
  onSavePost()
  {
    if(this.form.invalid)
     return;

   /* const post={title : form.value.title, 
                content : form.value.content};  */
//Emitting an event postCreated whenever the user clicks on add post, and passing the info entered by the user through this event emitter
  //  this.postCreated.emit(post);   
    if(this.mode==='create') 
      { 
        console.log(this.form.value.image)
        this.postsService.addPost(this.form.value.title,this.form.value.content,this.form.value.image); 
      }
    else
      this.postsService.updatePost(this.postId,this.form.value.title,this.form.value.content,this.form.value.image);   
    this.form.reset();               
  }
}
