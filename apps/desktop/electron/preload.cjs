const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('cleanlympics',{
 apiRequest:(request)=>ipcRenderer.invoke('api:request',request),
 savePdf:(name)=>ipcRenderer.invoke('pdf:save',name),
});
