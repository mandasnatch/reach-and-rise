import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import handler from './api/rehab.js';
const root=resolve('public'),types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
createServer(async(req,res)=>{try{const u=new URL(req.url,'http://localhost');if(u.pathname==='/api/rehab'){let body='';for await(const c of req){body+=c;if(body.length>12000){res.writeHead(413);res.end();return}}if(body){try{req.body=JSON.parse(body)}catch{res.writeHead(400);res.end('Invalid JSON');return}}res.status=n=>{res.statusCode=n;return res};res.json=d=>{res.setHeader('Content-Type','application/json');res.end(JSON.stringify(d));return res};return await handler(req,res)}const file=resolve(root,'.'+decodeURIComponent(u.pathname==='/'?'/index.html':u.pathname));if(!file.startsWith(root+'\\')&&!file.startsWith(root+'/')){res.writeHead(403);res.end();return}res.setHeader('Content-Type',types[extname(file)]||'application/octet-stream');res.end(await readFile(file))}catch{res.writeHead(404);res.end('Not found')}}).listen(4173,'127.0.0.1',()=>console.log('Reach & Rise: http://127.0.0.1:4173'));
