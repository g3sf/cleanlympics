const {app,BrowserWindow,ipcMain}=require('electron');
const path=require('path');
const Store=require('electron-store').default;
const store=new Store({defaults:{serverUrl:'http://localhost:4317'}});
function createWindow(){const win=new BrowserWindow({width:1440,height:900,minWidth:1050,minHeight:700,icon:path.join(__dirname,'../build/icon.ico'),backgroundColor:'#dfe4e8',webPreferences:{preload:path.join(__dirname,'preload.cjs'),contextIsolation:true,nodeIntegration:false}});if(!app.isPackaged)win.loadURL('http://localhost:5173');else win.loadFile(path.join(__dirname,'../dist/index.html'));}
ipcMain.handle('settings:get',()=>({serverUrl:store.get('serverUrl')}));
ipcMain.handle('settings:set',(_,settings)=>{if(settings.serverUrl)store.set('serverUrl',settings.serverUrl);return {serverUrl:store.get('serverUrl')}});
app.whenReady().then(()=>{createWindow();app.on('activate',()=>{if(BrowserWindow.getAllWindows().length===0)createWindow()})});
app.on('window-all-closed',()=>{if(process.platform!=='darwin')app.quit()});
