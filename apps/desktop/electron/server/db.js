import Database from 'better-sqlite3';import fs from 'node:fs';import path from 'node:path';import bcrypt from 'bcryptjs';
import catalog from './catalog.json' with {type:'json'};
const dbPath=path.resolve(process.env.DATABASE_PATH||'./data/cleanlympics.sqlite');fs.mkdirSync(path.dirname(dbPath),{recursive:true});
export const db=new Database(dbPath);db.pragma('journal_mode = WAL');db.pragma('foreign_keys = ON');db.pragma('busy_timeout = 5000');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY,username TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,display_name TEXT NOT NULL,role TEXT NOT NULL CHECK(role IN('admin','leader')),team_id INTEGER,active INTEGER NOT NULL DEFAULT 1,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS teams(id INTEGER PRIMARY KEY,name TEXT NOT NULL,division TEXT NOT NULL CHECK(division IN('Day','Evening')),schedule TEXT NOT NULL,checklist_id INTEGER,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS members(id INTEGER PRIMARY KEY,team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,name TEXT NOT NULL,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS checklists(id INTEGER PRIMARY KEY,name TEXT NOT NULL,icon TEXT NOT NULL DEFAULT 'mop',schedule TEXT NOT NULL DEFAULT 'Daily',active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS checklist_items(id INTEGER PRIMARY KEY,checklist_id INTEGER NOT NULL REFERENCES checklists(id) ON DELETE CASCADE,category TEXT NOT NULL,label TEXT NOT NULL,sort_order INTEGER NOT NULL DEFAULT 0,active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS submissions(id INTEGER PRIMARY KEY,team_id INTEGER NOT NULL REFERENCES teams(id),checklist_id INTEGER NOT NULL REFERENCES checklists(id),submitted_by INTEGER REFERENCES users(id),work_date TEXT NOT NULL,entry_number INTEGER NOT NULL DEFAULT 1,area TEXT,work_shift TEXT NOT NULL DEFAULT 'Morning',completion_percent REAL NOT NULL,base_points REAL NOT NULL,bonus_points REAL NOT NULL DEFAULT 0,penalty_points REAL NOT NULL DEFAULT 0,total_points REAL NOT NULL,status TEXT NOT NULL DEFAULT 'pending',submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(team_id,checklist_id,work_date,entry_number));
CREATE TABLE IF NOT EXISTS submission_items(id INTEGER PRIMARY KEY,submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,checklist_item_id INTEGER NOT NULL REFERENCES checklist_items(id),status TEXT NOT NULL CHECK(status IN('done','notDone','na')),assigned_to INTEGER REFERENCES members(id),UNIQUE(submission_id,checklist_item_id));
CREATE TABLE IF NOT EXISTS submission_photos(id INTEGER PRIMARY KEY,submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,file_name TEXT NOT NULL,mime_type TEXT NOT NULL,image_data BLOB NOT NULL,uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS attendance(id INTEGER PRIMARY KEY,submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,member_id INTEGER NOT NULL REFERENCES members(id),status TEXT NOT NULL,excuse_reason TEXT,uniform_streak INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS estates_alerts(id INTEGER PRIMARY KEY,team_id INTEGER REFERENCES teams(id),created_by INTEGER REFERENCES users(id),category TEXT NOT NULL,priority TEXT NOT NULL DEFAULT 'Routine',location TEXT NOT NULL,discovered_by TEXT,description TEXT NOT NULL,action_taken TEXT,status TEXT NOT NULL DEFAULT 'new',created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS citations(id INTEGER PRIMARY KEY,member_id INTEGER NOT NULL REFERENCES members(id),team_id INTEGER NOT NULL REFERENCES teams(id),issued_by INTEGER REFERENCES users(id),offense_level INTEGER NOT NULL,notes TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE IF NOT EXISTS award_claims(id INTEGER PRIMARY KEY,team_id INTEGER NOT NULL REFERENCES teams(id),claim_type TEXT NOT NULL,period_label TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',requested_by INTEGER REFERENCES users(id),reviewed_by INTEGER REFERENCES users(id),created_at TEXT DEFAULT CURRENT_TIMESTAMP,reviewed_at TEXT);
CREATE TABLE IF NOT EXISTS no_reports(id INTEGER PRIMARY KEY,team_id INTEGER NOT NULL REFERENCES teams(id),work_date TEXT NOT NULL,reason TEXT,created_by INTEGER REFERENCES users(id),created_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(team_id,work_date));
CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT NOT NULL);
`);
const ensureColumn=(table,name,definition)=>{const columns=db.prepare(`PRAGMA table_info(${table})`).all();if(!columns.some(column=>column.name===name))db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${definition}`)};
ensureColumn('estates_alerts','priority',"TEXT NOT NULL DEFAULT 'Routine'");
ensureColumn('estates_alerts','discovered_by','TEXT');
ensureColumn('estates_alerts','action_taken','TEXT');
ensureColumn('submissions','area','TEXT');
ensureColumn('submissions','work_shift',"TEXT NOT NULL DEFAULT 'Morning'");
// Versions before 0.3 allowed only one submission per team/checklist/date. Rebuild
// that table once so a dated schedule can contain multiple separately scored areas.
if(!db.prepare('PRAGMA table_info(submissions)').all().some(column=>column.name==='entry_number')){
 db.pragma('foreign_keys = OFF');
 try{db.exec(`BEGIN;
 CREATE TABLE submissions_new(id INTEGER PRIMARY KEY,team_id INTEGER NOT NULL REFERENCES teams(id),checklist_id INTEGER NOT NULL REFERENCES checklists(id),submitted_by INTEGER REFERENCES users(id),work_date TEXT NOT NULL,entry_number INTEGER NOT NULL DEFAULT 1,area TEXT,work_shift TEXT NOT NULL DEFAULT 'Morning',completion_percent REAL NOT NULL,base_points REAL NOT NULL,bonus_points REAL NOT NULL DEFAULT 0,penalty_points REAL NOT NULL DEFAULT 0,total_points REAL NOT NULL,status TEXT NOT NULL DEFAULT 'pending',submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,UNIQUE(team_id,checklist_id,work_date,entry_number));
 INSERT INTO submissions_new(id,team_id,checklist_id,submitted_by,work_date,entry_number,area,work_shift,completion_percent,base_points,bonus_points,penalty_points,total_points,status,submitted_at) SELECT id,team_id,checklist_id,submitted_by,work_date,1,area,work_shift,completion_percent,base_points,bonus_points,penalty_points,total_points,status,submitted_at FROM submissions;
 DROP TABLE submissions;
 ALTER TABLE submissions_new RENAME TO submissions;
 COMMIT;`)}catch(error){try{db.exec('ROLLBACK')}catch{}throw error}finally{db.pragma('foreign_keys = ON')}
}
// Repair text saved by earlier Windows builds that decoded UTF-8 as Windows-1252.
db.prepare("UPDATE checklists SET name=REPLACE(name,'CafÃ©','Café') WHERE name LIKE '%CafÃ©%'").run();
db.prepare("UPDATE teams SET name=REPLACE(name,'CafÃ©','Café') WHERE name LIKE '%CafÃ©%'").run();
export function seed(){
 const adminCount=db.prepare('SELECT COUNT(*) n FROM users').get().n;if(!adminCount){const pw=bcrypt.hashSync(process.env.ADMIN_PASSWORD||'Password123!',12);db.prepare('INSERT INTO users(username,password_hash,display_name,role) VALUES(?,?,?,?)').run('admin',pw,'Master Administrator','admin')}
 const listCount=db.prepare('SELECT COUNT(*) n FROM checklists').get().n;if(!listCount){const add=db.prepare('INSERT INTO checklists(name,icon,schedule) VALUES(?,?,?)');const addItem=db.prepare('INSERT INTO checklist_items(checklist_id,category,label,sort_order) VALUES(?,?,?,?)');for(const c of catalog){const result=add.run(c.name,c.icon,c.schedule);let order=0;for(const section of c.sections)for(const item of section.items)addItem.run(result.lastInsertRowid,section.title,item.label,order++);}}
 const teamTemplates={
  'Dusting & Cleaning':['Morning Dust Busters','Day','Mon–Fri'],
  'Glass Cleaning':['Crystal Clear Crew','Day','Mon–Fri'],
  'Hard Floor Cleaning':['Floor Force','Evening','Mon–Sun'],
  'Restroom Deep Cleaning & Sanitization':['Restroom Rangers','Evening','Mon–Sun'],
  'Shredding Removal':['Shred Squad','Evening','Mon–Sun'],
  'Trash Removal':['Trash Titans','Evening','Mon–Sun'],
  'Upholstery Cleaning':['Upholstery Unit','Evening','Mon–Sun'],
  'Vacuum Cleaning':['Vacuum Voyagers','Day','Mon–Fri'],
  'Dusting & Cleaning Weekly':['Weekly Dust Detail','Evening','Mon–Sun'],
  'Café Cleaning Daily':['Café Daily Crew','Evening','Mon–Sun · split shifts'],
  'Café Cleaning Weekly':['Café Weekly Crew','Evening','Mon–Sun · split shifts'],
  'Cleaning Operations Monitor':['Cleaning Operations Monitor','Evening','Mon–Sun']
 };
 const addTeam=db.prepare('INSERT INTO teams(name,division,schedule,checklist_id) VALUES(?,?,?,?)');
 for(const checklist of db.prepare('SELECT id,name FROM checklists ORDER BY id').all()){
  if(db.prepare('SELECT 1 FROM teams WHERE checklist_id=?').get(checklist.id))continue;
  const template=teamTemplates[checklist.name]||[`${checklist.name} Team`,'Evening','Mon–Sun'];addTeam.run(template[0],template[1],template[2],checklist.id);
 }
 const dailyDusting=db.prepare("SELECT id FROM checklists WHERE name='Dusting & Cleaning'").get();
 if(dailyDusting&&!db.prepare("SELECT 1 FROM teams WHERE checklist_id=? AND division='Evening'").get(dailyDusting.id))addTeam.run('Nighttime Shine','Evening','Mon–Sun',dailyDusting.id);
 const setting=db.prepare('INSERT OR IGNORE INTO settings(key,value) VALUES(?,?)');
 [['season_name','Launch Season'],['season_theme','The Launch of the Cleanlympics'],['season_start','2026-08-27'],['season_end','2026-10-01'],['season_current_week','1']].forEach(x=>setting.run(x[0],x[1]));
}

// Data-preserving 0.3.2 correction: replace only the untouched beta dates.
// Any season dates already customized by an administrator remain unchanged.
const launchStart=db.prepare("SELECT value FROM settings WHERE key='season_start'").get()?.value;
const launchEnd=db.prepare("SELECT value FROM settings WHERE key='season_end'").get()?.value;
if(launchStart==='2026-09-01'&&launchEnd==='2026-09-30'){
 const saveSetting=db.prepare('INSERT INTO settings(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
 db.transaction(()=>{saveSetting.run('season_start','2026-08-27');saveSetting.run('season_end','2026-10-01');saveSetting.run('season_current_week','1')})();
}
