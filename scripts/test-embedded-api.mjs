import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const projectRoot=path.resolve(import.meta.dirname,'..');
const testDir=path.join(projectRoot,'test-data',`run-${Date.now()}`);
fs.mkdirSync(testDir,{recursive:true});
const databasePath=path.join(testDir,'cleanlympics.sqlite');
process.env.DATABASE_PATH=databasePath;
process.env.ADMIN_PASSWORD='Password123!';

const {handleRequest}=await import('../apps/desktop/electron/server/index.js');
const health=await handleRequest({method:'GET',path:'/api/health'});
if(health.status!==200||health.body?.transport!=='electron-ipc')throw new Error('Embedded health request failed');

const login=await handleRequest({method:'POST',path:'/api/auth/login',body:{username:'admin',password:process.env.ADMIN_PASSWORD}});
if(login.status!==200||!login.body?.token)throw new Error(`Embedded login failed (${login.status})`);

const headers={Authorization:`Bearer ${login.body.token}`};
const bootstrap=await handleRequest({method:'GET',path:'/api/bootstrap',headers});
if(bootstrap.status!==200||!Array.isArray(bootstrap.body?.submissions))throw new Error(`Embedded bootstrap failed (${bootstrap.status})`);

const standings=await handleRequest({method:'GET',path:'/api/standings?from=2026-01-01&to=2026-12-31',headers});
if(standings.status!==200||!Array.isArray(standings.body))throw new Error(`Embedded standings failed (${standings.status})`);

console.log(JSON.stringify({
 transport:health.body.transport,
 teams:bootstrap.body.teams.length,
 members:bootstrap.body.members.length,
 submissions:bootstrap.body.submissions.length,
 claims:bootstrap.body.claims.length,
 standings:standings.body.length,
},null,2));
