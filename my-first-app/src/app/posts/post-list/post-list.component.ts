import { Component,OnDestroy,OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls :['./post-list.component.css']
})
export class PostListComponent implements OnInit,OnDestroy {

userIsAuthenticated=false;
private authListenerSubs: Subscription;
posts =[];
userId : string;
postsService : PostsService;

private postSubs : Subscription;

isLoading=true;

totalPosts=0;
postsPerPage=2;
pageNumber=1;
pageSizeOptions=[1,2,5,10];

 constructor(postsService : PostsService,private authService : AuthService)
 {
   this.postsService=postsService;
 }
 ngOnInit(){
  this.postsService.getPosts(this.postsPerPage,this.pageNumber);
  this.userId=this.authService.getUserId();
   /*subscribe is used to register the given observer to the list of observers, When next would be called
    from the subject it is registered with, the value would be fed here */
   this.postSubs=this.postsService.getPostsUpdated()
           .subscribe((postData : {posts : any, postCount : number})=>{
             this.posts=postData.posts;
             this.totalPosts=postData.postCount;
           });
   this.userIsAuthenticated=this.authService.getAuthentication();

   this.authListenerSubs=this.authService
           .getAuthStatusListener()
           .subscribe(isAuthenticated=>{
             this.userIsAuthenticated=isAuthenticated;
             this.userId=this.authService.getUserId();
           })
 }

 onChangedPage(pagedata : PageEvent){
   this.postsPerPage=pagedata.pageSize;
   this.pageNumber=pagedata.pageIndex+1;
   this.postsService.getPosts(this.postsPerPage,this.pageNumber);
 }

 onDeletePost(id : String){
   this.postsService.deletePost(id).subscribe(()=>{
     this.postsService.getPosts(this.postsPerPage,this.pageNumber);
   });
 }

 
 /*Eventually, we'll navigate somewhere else. The router will remove this component from the DOM and destroy it. We need to 
 clean up after ourselves before that happens. Specifically, we must unsubscribe before Angular destroys the component.
 Failure to do so could create a memory leak. */
 ngOnDestroy(){
   this.postSubs.unsubscribe();
   this.authListenerSubs.unsubscribe();
 }
}
