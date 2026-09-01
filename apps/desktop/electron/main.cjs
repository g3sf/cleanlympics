const {app,BrowserWindow,dialog,ipcMain}=require('electron');
const fs=require('fs');
const path=require('path');
const {pathToFileURL}=require('url');

app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');
app.commandLine.appendSwitch('disable-gpu-rasterization');
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('in-process-gpu');

let embeddedApi;

function ensureLocalDatabase(){
 const dataDir=path.join(app.getPath('userData'),'data');
 const databasePath=path.join(dataDir,'cleanlympics.sqlite');
 fs.mkdirSync(dataDir,{recursive:true});
 process.env.DATABASE_PATH=databasePath;
 return databasePath;
}

async function initializeEmbeddedApi(){
 ensureLocalDatabase();
 const modulePath=pathToFileURL(path.join(__dirname,'server','index.js')).href;
 embeddedApi=await import(modulePath);
 ipcMain.handle('api:request',async(_,request)=>embeddedApi.handleRequest(request));
}

function createWindow(autoLoad=true){
 const win=new BrowserWindow({width:1440,height:900,minWidth:1050,minHeight:700,icon:path.join(__dirname,'../build/icon.ico'),backgroundColor:'#dfe4e8',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false,sandbox:true}});
 if(autoLoad)loadWindow(win);
 return win;
}

function loadWindow(win){
 return app.isPackaged
  ?win.loadFile(path.join(__dirname,'../dist/index.html'))
  :win.loadURL('http://localhost:5173');
}

ipcMain.handle('pdf:save',async(event,suggestedName)=>{const owner=BrowserWindow.fromWebContents(event.sender);const result=await dialog.showSaveDialog(owner,{title:'Save Cleanlympics PDF',defaultPath:String(suggestedName||'Cleanlympics.pdf').replace(/[^a-z0-9 ._-]/gi,'-'),filters:[{name:'PDF document',extensions:['pdf']}]});if(result.canceled||!result.filePath)return{saved:false};const bytes=await event.sender.printToPDF({printBackground:true,pageSize:'Letter',preferCSSPageSize:true});fs.writeFileSync(result.filePath,bytes);return{saved:true,path:result.filePath}});

app.whenReady().then(async()=>{await initializeEmbeddedApi();if(process.argv.includes('--smoke-test')){const result=await embeddedApi.handleRequest({method:'GET',path:'/api/health'});fs.writeFileSync(path.join(app.getPath('userData'),'smoke-test.json'),JSON.stringify(result));app.quit();return}if(process.argv.includes('--capture-test')){const win=createWindow(false);await loadWindow(win);await new Promise(resolve=>setTimeout(resolve,1000));const image=await win.webContents.capturePage();fs.writeFileSync(path.join(app.getPath('userData'),'capture-test.png'),image.toPNG());win.destroy();app.quit();return}createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})}).catch(error=>{dialog.showErrorBox('Cleanlympics could not start',error?.message||String(error));app.quit()});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
