import { Injectable} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { Router } from "@angular/router";

@Injectable({providedIn : "root"})
export class AuthService{
  private token: string;
  isAuthenticated=false;
  private authStatusListener=new Subject<boolean>();
  userId : string;

  constructor(private http : HttpClient,private router : Router){ }

  getToken(){
      return this.token;
  }

  getAuthStatusListener(){
      return this.authStatusListener.asObservable();
  }

  getAuthentication(){
      return this.isAuthenticated;
  }

  getUserId(){
      return this.userId;
  }

  createUser(email : string, password : string){
    const authData={email : email,password : password};
    this.http.post('http://localhost:5000/api/user/signup',authData)
       .subscribe(response=>{
           console.log(response);
           this.router.navigate(['/login']);
       });
  }

  login(email : string, password : string){
      const loginData={email : email,password : password};
      this.http.post<{token : string, expiresIn : number, userId : string}>('http://localhost:5000/api/user/login',loginData)
       .subscribe(response=>{
           this.token=response.token;
           const expiresInDuration=response.expiresIn;
           this.userId=response.userId;
           if(this.token)
           {   
               setTimeout(()=>{
                 this.logout();
               },expiresInDuration*1000); 
               const now=new Date();
               const expirationDate=new Date(now.getTime()+expiresInDuration*1000);
               this.saveAuthData(this.token,expirationDate,this.userId);
               this.isAuthenticated=true;
               this.authStatusListener.next(true);
           }
           this.router.navigate(['/']);
       });
  }

  logout(){
      this.token=null;
      this.isAuthenticated=false;
      this.authStatusListener.next(false);
      this.userId=null;
      this.router.navigate(['/']);
  }

  autoAuthenticateUser(){
    const authInformation=this.getAuthData();
    if(!authInformation)
    {
        return;
    }
    const now=new Date();
    const expiresIn=authInformation.expires.getTime()-now.getTime();
    if(expiresIn>0)
    {
        this.token=authInformation.token;
        this.isAuthenticated=true;
        this.userId=authInformation.userId;
        setTimeout(()=>{
            this.logout();
          },expiresIn); 
        this.authStatusListener.next(true);
    }
  }

  private saveAuthData(token : string, expirationDate : Date, userId : string){
      localStorage.setItem('token',token);
      localStorage.setItem('expires',expirationDate.toISOString());
      localStorage.setItem('userid',userId);
  }

  private clearAuthData(){
      localStorage.removeItem('token');
      localStorage.removeItem('expires');
      localStorage.removeItem('userid');
  }

  private getAuthData(){
   const token=localStorage.getItem('token');
   const expires=localStorage.getItem('expires');
   const userId=localStorage.getItem('userid');
   if(!token||!expires){
       return;
   }
   return {
       token: token,
       expires : new Date(expires),
       userId : userId
   }
  }
}