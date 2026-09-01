export const session={
  token:localStorage.getItem('cleanlympics.token')||'',
  user:JSON.parse(localStorage.getItem('cleanlympics.user')||'null'),
  bootstrap:null as any,
};

export async function request(path:string,options:RequestInit={}){
  if(!window.cleanlympics?.apiRequest)throw new Error('The embedded Cleanlympics data service is unavailable');
  let body:any={};
  if(typeof options.body==='string'&&options.body)body=JSON.parse(options.body);
  const result=await window.cleanlympics.apiRequest({
    method:options.method||'GET',
    path,
    headers:{'Content-Type':'application/json',...(session.token?{Authorization:`Bearer ${session.token}`}:{})},
    body,
  });
  if(result.status<200||result.status>=300)throw new Error(result.body?.error||`Request failed (${result.status})`);
  return result.body;
}

export async function refreshBootstrap(){session.bootstrap=await request('/api/bootstrap');return session.bootstrap}

export function rememberLogin(token:string,user:any){
  session.token=token;session.user=user;
  localStorage.removeItem('cleanlympics.server');
  localStorage.setItem('cleanlympics.token',token);
  localStorage.setItem('cleanlympics.user',JSON.stringify(user));
}

export function signOut(){session.token='';session.user=null;session.bootstrap=null;localStorage.removeItem('cleanlympics.token');localStorage.removeItem('cleanlympics.user')}
