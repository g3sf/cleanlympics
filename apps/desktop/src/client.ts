const DEFAULT_SERVER='http://localhost:4317';

export const session={
  server:localStorage.getItem('cleanlympics.server')||DEFAULT_SERVER,
  token:localStorage.getItem('cleanlympics.token')||'',
  user:JSON.parse(localStorage.getItem('cleanlympics.user')||'null'),
  bootstrap:null as any,
};

export async function request(path:string,options:RequestInit={}){
  const response=await fetch(`${session.server}${path}`,{
    ...options,
    headers:{'Content-Type':'application/json',...(session.token?{Authorization:`Bearer ${session.token}`}:{}) ,...(options.headers||{})},
  });
  const body=await response.json().catch(()=>({}));
  if(!response.ok)throw new Error(body.error||`Request failed (${response.status})`);
  return body;
}

export async function refreshBootstrap(){session.bootstrap=await request('/api/bootstrap');return session.bootstrap}

export function rememberLogin(server:string,token:string,user:any){
  session.server=server.replace(/\/$/,'');session.token=token;session.user=user;
  localStorage.setItem('cleanlympics.server',session.server);
  localStorage.setItem('cleanlympics.token',token);
  localStorage.setItem('cleanlympics.user',JSON.stringify(user));
}

export function signOut(){session.token='';session.user=null;session.bootstrap=null;localStorage.removeItem('cleanlympics.token');localStorage.removeItem('cleanlympics.user')}
