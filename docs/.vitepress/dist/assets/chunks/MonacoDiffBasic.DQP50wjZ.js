import{W as i,a,b as c,c as d,d as f,e as o}from"./ts.worker.DeDD3R5n.js";import{d as p,x as u,p as l,Z as m,c as W,o as _}from"./framework.wHMELYSa.js";const w=p({__name:"MonacoDiffBasic",setup(k){const n=u(null);let r=null;return l(async()=>{self.MonacoEnvironment={getWorker(v,e){return e==="json"?new i:e==="css"||e==="scss"||e==="less"?new a:e==="html"||e==="handlebars"||e==="razor"?new c:e==="typescript"||e==="javascript"?new d:new f}},r=o.createDiffEditor(n.value,{readOnly:!0,originalEditable:!1,renderSideBySide:!0,enableSplitViewResizing:!0,renderOverviewRuler:!0});const t=o.createModel(`const x = 1;
const y = 2;
const z = 3;`,"javascript"),s=o.createModel(`const x = 10;
const y = 2;
const z = 30;`,"javascript");r.setModel({original:t,modified:s})}),m(()=>{r?.dispose()}),(t,s)=>(_(),W("div",{ref_key:"diffContainer",ref:n,class:"monaco-diff-container",style:{height:"400px",border:"1px solid #ccc"}},null,512))}});export{w as default};
