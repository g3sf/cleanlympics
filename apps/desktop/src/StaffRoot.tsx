import {useEffect,useState} from 'react';
import App from './App';
import {rememberLogin,refreshBootstrap,request,session,signOut} from './client';

export default function StaffRoot(){
 const [ready,setReady]=useState(false),[loggedIn,setLoggedIn]=useState(Boolean(session.token)),[error,setError]=useState('');
 useEffect(()=>{if(!session.token){setReady(true);return}refreshBootstrap().then(()=>setReady(true)).catch(()=>{signOut();setLoggedIn(false);setReady(true)})},[]);
 async function login(event:any){event.preventDefault();setError('');const data=new FormData(event.currentTarget);try{const result=await request('/api/auth/login',{method:'POST',body:JSON.stringify({username:data.get('username'),password:data.get('password')})});rememberLogin(result.token,result.user);await refreshBootstrap();setLoggedIn(true)}catch(reason:any){setError(reason.message||'Unable to sign in')}}
 if(!ready)return <div className="desktop-loading"><img src="./cleanlympics-logo.png"/><b>Opening Cleanlympics…</b></div>;
 if(!loggedIn)return <main className="desktop-login"><section><img src="./cleanlympics-logo.png" alt="Cleanlympics mop torch"/><p className="eyebrow">STAFF BETA</p><h1>Cleanlympics</h1><p>Sign in to your local Cleanlympics workspace.</p>{error&&<div className="login-error">{error}</div>}<form onSubmit={login}><label>Username<input name="username" required/></label><label>Password<input name="password" type="password" required/></label><button>Sign in</button></form><small>Your checklists are stored securely on this computer.</small></section></main>;
 return <><button className="desktop-signout" onClick={()=>{signOut();setLoggedIn(false)}}>Sign out</button><App/></>;
}
