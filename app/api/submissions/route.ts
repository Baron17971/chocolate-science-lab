import {put,get,head} from '@vercel/blob';
export const runtime='nodejs';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const validId=(id:unknown):id is string=>typeof id==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id);
export async function POST(request:Request){try{
 if(Number(request.headers.get('content-length')||0)>150000)return json({error:'נתוני ההגשה גדולים מדי'},413);
 const raw=await request.text();if(raw.length>100000)return json({error:'נתוני ההגשה גדולים מדי'},413);
 const payload=JSON.parse(raw),d=payload.report,id=payload.id;
 if(!validId(id)||!d||!['names','classroom','prediction','model','reflection','videoLink'].every(k=>typeof d[k]==='string')||!d.names.trim()||!d.classroom.trim()||!Array.isArray(d.notes)||d.notes.length!==3||!d.notes.every((n:unknown)=>typeof n==='string')||!Array.isArray(d.checks)||d.checks.length!==4||!d.checks.every((n:unknown)=>n===true))return json({error:'יש למלא פרטי קבוצה ואת רשימת הבדיקה.'},400);
 const hasVideo=payload.hasVideo===true,videoLink=d.videoLink.trim();
 if(!hasVideo&&!videoLink)return json({error:'יש לצרף סרטון או קישור.'},400);
 if(videoLink){try{if(new URL(videoLink).protocol!=='https:')throw Error()}catch{return json({error:'יש להזין קישור HTTPS תקין.'},400)}}
 if(hasVideo){const video=await head('videos/'+id);if(video.size>30*1024*1024||!['video/mp4','video/webm','video/quicktime'].includes(video.contentType))return json({error:'הסרטון אינו תקין'},400)}
 await put('reports/'+id+'.json',JSON.stringify({...d,id,videoLink,hasVideo,submittedAt:new Date().toISOString()}),{access:'private',addRandomSuffix:false,allowOverwrite:false,contentType:'application/json'});
 return json({id});
 }catch{return json({error:'ההגשה לא נשמרה. בדקו את החיבור ונסו שוב.'},500)}}
export async function GET(request:Request){try{const u=new URL(request.url),id=u.searchParams.get('id');if(!validId(id))return json({error:'קישור לא תקין'},400);
 const result=await get(u.searchParams.has('video')?'videos/'+id:'reports/'+id+'.json',{access:'private'});
 if(result?.statusCode!==200)return json({error:'ההגשה לא נמצאה'},404);
 return new Response(result.stream,{headers:{'Content-Type':result.blob.contentType,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return json({error:'לא ניתן לפתוח את ההגשה כרגע'},503)}}
