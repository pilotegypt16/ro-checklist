(function(){
var DN=["Done","Not Done"];
var F=[
{k:"site",l:"Site ID",t:"text"},
{k:"action",l:"Action",t:"sel",o:["RO","L2600","MM","Feeder to fiber","Add sector","Etc"]},
{k:"contractor",l:"Contractor",t:"sel",o:["Lm+","Merc","New Era","Phenomena","Alkan","OR","HOI","Integra","Platinum","Stepway","Signtel","Ericsson"]},
{k:"dvisit",l:"Date of visit",t:"date"},
{k:"dclear",l:"Date of clearance",t:"date"},
{k:"nss",l:"NSS mail",t:"sel",o:DN,s:1},
{k:"psrc",l:"Power source",t:"sel",o:["Grid","Hybrid","Solar"]},
{k:"sf6",l:"Power SF6",t:"sel",o:["Done","Not matching"],s:1},
{k:"sta",l:"STA",t:"sel",o:DN,s:1},
{k:"snags",l:"Physical snags",t:"sel",o:DN,s:1},
{k:"i1",l:"1- Outdoor Package / after clearance Package",t:"sel",o:DN,s:1},
{k:"i2",l:"2- Alarms TT / Enic mail",t:"sel",o:DN,s:1,c:"i2c"},
{k:"i3",l:"3- Power distribution (BLVD/LLVD)",t:"sel",o:DN,s:1,c:"i3c"},
{k:"i4",l:"4- All Cables thickness / Type / connectors",t:"sel",o:DN,s:1},
{k:"i5",l:"5- All CB rating according to Load",t:"sel",o:DN,s:1},
{k:"i6",l:"6- Smart meter installation",t:"sel",o:DN,s:1},
{k:"i7",l:"7- Hybrid system performance / software / self check",t:"sel",o:DN,s:1},
{k:"c9",l:"9- Comment",t:"area"},{k:"c10",l:"10- Comment",t:"area"},{k:"c11",l:"11- Comment",t:"area"},
{k:"c12",l:"12- Comment",t:"area"},{k:"c13",l:"13- Comment",t:"area"},{k:"c14",l:"14- Comment",t:"area"},
{k:"i15",l:"15- Notes for needed emails (NFM/Access)",t:"sel",o:["Done","Not Done","No Need"],s:1},
{k:"vrep",l:"Vodafone rep",t:"sel",o:["Mina Mishriky","Mohamed Adel","Bassem El Shimy","Mostafa Abd Elrazek","Ahmed Hegazy","Ahmed Abdel Samad","Sayed Hussien","Nady Yehia"]},
{k:"crep",l:"Contractor rep",t:"text"},
{k:"qual",l:"Site Quality",t:"sel",o:["A (standard installation)","B (good quality)","C (Bad Installation)"]}
];
var CM={i2c:1,i3c:1};
var $=function(i){return document.getElementById(i)};
var DK="ro_draft",SK="ro_saved";
function load(k,d){try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}}
function store(k,v){localStorage.setItem(k,JSON.stringify(v))}
var cur=load(DK,{});
function toast(m){var t=$("toast");t.textContent=m;t.style.display="block";setTimeout(function(){t.style.display="none"},2500)}
function colorize(s){s.className=s.value==="Done"?"done":(s.value==="Not Done"||s.value==="Not matching"?"bad":"")}
function build(){
 var h="";
 F.forEach(function(f){
  h+='<div class="row"><label>'+f.l+'</label>';
  if(f.t==="sel"){h+='<select data-k="'+f.k+'"><option value="">Choose...</option>'+f.o.map(function(o){return '<option>'+o+'</option>'}).join("")+'</select>';
   if(f.c)h+='<div class="note">If not done put a comment:</div><textarea rows="2" data-k="'+f.c+'"></textarea>';}
  else if(f.t==="area")h+='<textarea rows="2" data-k="'+f.k+'"></textarea>';
  else h+='<input type="'+(f.t==="date"?"date":"text")+'" data-k="'+f.k+'" autocomplete="off">';
  h+='</div>';
 });
 $("form").innerHTML=h;
 fill();
 $("form").addEventListener("input",function(e){var k=e.target.getAttribute("data-k");if(!k)return;cur[k]=e.target.value;store(DK,cur);if(e.target.tagName==="SELECT")colorize(e.target)});
}
function fill(){
 [].forEach.call($("form").querySelectorAll("[data-k]"),function(e){e.value=cur[e.getAttribute("data-k")]||"";if(e.tagName==="SELECT")colorize(e)});
}
// ---- minimal PDF writer (Helvetica, WinAnsi) ----
function esc(s){return s.replace(/[\\()]/g,"\\$&")}
function clean(s){return String(s).replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[^\x20-\x7e]/g,"?")}
var W=595,H=842,M=40;
function wrap(s,max){var out=[];String(s).split(/\r?\n/).forEach(function(p){var line="";p.split(" ").forEach(function(w){while(w.length>max){if(line){out.push(line);line=""}out.push(w.slice(0,max));w=w.slice(max)}var t=line?line+" "+w:w;if(t.length>max){out.push(line);line=w}else line=t});out.push(line)});return out}
function makePdf(rec,title){
 var pages=[],ops=[],y=H-M;
 function np(){if(ops.length)pages.push(ops.join("\n"));ops=[];y=H-M}
 function txt(s,x,size,bold){ops.push("BT /"+(bold?"F2":"F1")+" "+size+" Tf "+x+" "+y+" Td ("+esc(clean(s))+") Tj ET")}
 function rule(){ops.push("0.8 G "+M+" "+(y)+" m "+(W-M)+" "+(y)+" l S")}
 txt("RO Site Checklist",M,18,1);y-=24;
 txt("Saved: "+title,M,9,0);y-=14;rule();y-=16;
 F.forEach(function(f){
  var v=rec[f.k]||"-";
  var ls=wrap(v,46);
  var extra=[];
  if(f.c&&rec[f.c])extra=wrap("Comment: "+rec[f.c],50);
  var need=14+ls.length*13+extra.length*12+6;
  if(y-need<M+10)np();
  var lab=wrap(f.l,50);
  if(lab.length===1&&f.t!=="area"){txt(f.l,M,10,1)}else{txt(lab[0],M,10,1)}
  var yy=y;
  ls.forEach(function(l,i){ if(lab.length===1||true){ ops.push("BT /F1 11 Tf "+(M+230)+" "+(yy-i*13)+" Td ("+esc(clean(l))+") Tj ET")}});
  y=yy-Math.max(ls.length*13,lab.length*12)-2;
  if(lab.length>1)for(var i=1;i<lab.length;i++){ops.push("BT /F2 10 Tf "+M+" "+(yy-i*12)+" Td ("+esc(clean(lab[i]))+") Tj ET")}
  extra.forEach(function(l){ops.push("BT /F1 10 Tf "+(M+230)+" "+y+" Td ("+esc(clean(l))+") Tj ET");y-=12});
  y-=4;
 });
 np();
 var objs=[],n=0;
 function add(s){objs.push(s);return ++n}
 add("<< /Type /Catalog /Pages 2 0 R >>");
 add("");
 add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
 add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
 var kids=[];
 pages.forEach(function(c,i){
  var cid=add("<< /Length "+c.length+" >>\nstream\n"+c+"\nendstream");
  var pid=add("<< /Type /Page /Parent 2 0 R /MediaBox [0 0 "+W+" "+H+"] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents "+cid+" 0 R >>");
  kids.push(pid+" 0 R");
 });
 objs[1]="<< /Type /Pages /Kids ["+kids.join(" ")+"] /Count "+kids.length+" >>";
 var out="%PDF-1.4\n",offs=[];
 objs.forEach(function(o,i){offs.push(out.length);out+=(i+1)+" 0 obj\n"+o+"\nendobj\n"});
 var x=out.length;
 out+="xref\n0 "+(objs.length+1)+"\n0000000000 65535 f \n"+offs.map(function(o){return ("0000000000"+o).slice(-10)+" 00000 n \n"}).join("")+"trailer\n<< /Size "+(objs.length+1)+" /Root 1 0 R >>\nstartxref\n"+x+"\n%%EOF";
 var b=new Uint8Array(out.length);for(var i=0;i<out.length;i++)b[i]=out.charCodeAt(i)&255;
 return new Blob([b],{type:"application/pdf"});
}
function fname(r){return "Checklist-"+((r.site||"site").replace(/[^\w-]+/g,"_"))+"-"+(r._d||"").slice(0,10)+".pdf"}
function exportPdf(r){
 var blob=makePdf(r,r._d);var name=fname(r);
 var file;try{file=new File([blob],name,{type:"application/pdf"})}catch(e){}
 if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
  navigator.share({files:[file],title:name}).catch(function(){});return}
 var u=URL.createObjectURL(blob);var a=document.createElement("a");a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();
 setTimeout(function(){window.open(u,"_blank")},300);
}
function saved(){return load(SK,[])}
function renderList(){
 var s=saved();$("cnt").textContent=s.length;
 if(!s.length){$("list").innerHTML='<div class="empty">No saved checklists yet.</div>';return}
 $("list").innerHTML=s.map(function(r,i){return '<div class="item"><div class="t"><b>'+(r.site||"(no site ID)").replace(/</g,"&lt;")+'</b><small>'+r._d+(r.action?" - "+r.action:"")+'</small></div><button data-a="open" data-i="'+i+'">Open</button><button data-a="pdf" data-i="'+i+'">PDF</button><button class="r" data-a="del" data-i="'+i+'">Delete</button></div>'}).join("");
}
$("list").addEventListener("click",function(e){
 var a=e.target.getAttribute("data-a");if(!a)return;var i=+e.target.getAttribute("data-i");var s=saved();
 if(a==="pdf")exportPdf(s[i]);
 if(a==="del"){if(confirm("Delete this saved checklist?")){s.splice(i,1);store(SK,s);renderList()}}
 if(a==="open"){cur=JSON.parse(JSON.stringify(s[i]));delete cur._d;store(DK,cur);fill();tab(1);toast("Opened. Save again to keep changes as a new copy.")}
});
function tab(n){
 $("t1").className=n===1?"on":"";$("t2").className=n===2?"on":"";
 $("form").style.display=n===1?"":"none";$("list").style.display=n===2?"":"none";$("bar").style.display=n===1?"flex":"none";
 if(n===2)renderList();window.scrollTo(0,0);
}
$("t1").onclick=function(){tab(1)};$("t2").onclick=function(){tab(2)};
$("clr").onclick=function(){if(confirm("Clear all fields?")){cur={};store(DK,cur);fill()}};
$("save").onclick=function(){
 var r=JSON.parse(JSON.stringify(cur));
 var d=new Date();var p=function(n){return ("0"+n).slice(-2)};
 r._d=d.getFullYear()+"-"+p(d.getMonth()+1)+"-"+p(d.getDate())+" "+p(d.getHours())+":"+p(d.getMinutes());
 var s=saved();s.unshift(r);store(SK,s);renderList();
 toast("Saved to Saved checklists");exportPdf(r);
};
build();renderList();
if("serviceWorker" in navigator)navigator.serviceWorker.register("sw.js").catch(function(){});
})();
