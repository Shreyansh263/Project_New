import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from 'rxjs';
import { Router } from "@angular/router";

/*Making PostsService injectable means that only one instance of PostsService would be used throughout the session
 This ensures that only one copy of all variables and methods of PostsService exist and thus changes would be 
 reflected throughout the session. We can also add PostsService in providers[] at app.component, this would do the same*/
@Injectable({providedIn:'root'}) 
export class PostsService
{
    private posts =[];
    private postsUpdated=new Subject<{posts: any, postCount : number}>();

    constructor(private http : HttpClient,private router : Router){}

    getPost(id:String){
        return {...this.posts.find(p=>p._id===id)}
    }
    
    updatePost(id : string, title : string, content : string, image : File | string)
    {  
       let postData; 
       if(typeof image=="object")
       {
        postData=new FormData();
        postData.append('_id',id);
        postData.append('title', title);
        postData.append('content',content);
        postData.append('image',image, title);
       }

       else{
        postData={_id : id,title : title, content : content, imagePath : image};
       }
       
       this.http.put('http://localhost:5000/api/posts/'+id,postData)
              .subscribe((response)=>{
                  this.router.navigate(['/']);
              })
    }

    getPosts(pageSize : number,pageNumber : number)
    { 
      const queryParams=`?pagesize=${pageSize}&page=${pageNumber}`;
      /* HttpClient internally uses observables, so until we call subscribe(), it wont send a request to fetch anything
       we do not need to unsubscribe as for observables connected to features built in Angular like HttpClient, unsubscription
       is handled by Angular itself */
       //get method automatically changes json data into normal string format
      this.http.get<{message : String, posts : [], count : number}>('http://localhost:5000/api/posts'+queryParams)
            .subscribe((postData=>{
                this.posts=postData.posts;
                this.postsUpdated.next({posts : [...this.posts],postCount : postData.count});
            })) 
    }
    
    getPostsUpdated()
    {   
        //This can only be observed i.e listened from outside, not modified
        return this.postsUpdated.asObservable();    
    }
    addPost(title : string, content : string,image : File)
    {   
        console.log("Reached here");
        const postData=new FormData();
        postData.append('title', title);
        postData.append('content',content);
        postData.append('image',image, title);

        this.http.post<{message : String, post : any}>('http://localhost:5000/api/posts',postData)
            .subscribe((responseData)=>{
                this.router.navigate(['/']);
              });  
    }
    deletePost(id : String){
        return this.http.delete('http://localhost:5000/api/posts/'+id);         
    }
}