const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('cleanlympics',{getSettings:()=>ipcRenderer.invoke('settings:get'),saveSettings:(s)=>ipcRenderer.invoke('settings:set',s)});
