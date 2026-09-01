import {copyFileSync,readdirSync,unlinkSync,readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const releaseDir=path.join(root,'apps','desktop','release');
const appxFiles=readdirSync(releaseDir).filter(name=>name.toLowerCase().endsWith('.appx'));

if(appxFiles.length!==1){
 throw new Error(`Expected exactly one AppX file in ${releaseDir}, found ${appxFiles.length}.`);
}

const source=path.join(releaseDir,appxFiles[0]);
const {version}=JSON.parse(readFileSync(path.join(root,'apps','desktop','package.json'),'utf8'));
const target=path.join(releaseDir,`Cleanlympics-${version}-win-x64.msix`);
copyFileSync(source,target);
unlinkSync(source);
console.log(`Created ${target}`);
