// A deliberately small isolated React model, not a Next.js runtime.
export const reactHarness = `
var exports={}; var __state=[]; var __cursor=0;
var React={Fragment:'section',createElement:(tag,props,...children)=>{
  const flat=children.flat(Infinity).filter(child=>child!==null&&child!==undefined&&typeof child!=='boolean');
  if(typeof tag==='function')return tag({...props,children:flat.length===1?flat[0]:flat});
  return {tag,props:props||{},children:flat};
}};
function require(name){
  if(name!=='react')throw Error('Only react and local project modules are available in this simulator');
  return {useState:(initial)=>{const i=__cursor++;if(!(i in __state))__state[i]=initial;return [__state[i],value=>{__state[i]=typeof value==='function'?value(__state[i]):value}]} };
}
function __render(){__cursor=0;return typeof exports.default==='function'?exports.default({}):null}
function __text(node){return node==null?'':typeof node==='object'?(node.children||[]).map(__text).join(''):String(node)}
function __find(node,tag){if(!node||typeof node!=='object')return null;if(node.tag===tag)return node;for(const child of node.children||[]){const found=__find(child,tag);if(found)return found}return null}
function __findButton(node,label){if(!node||typeof node!=='object')return null;if(node.tag==='button'&&(!label||__text(node).includes(label)))return node;for(const child of node.children||[]){const found=__findButton(child,label);if(found)return found}return null}
function __safeTree(node){if(node==null||typeof node==='boolean')return '';if(typeof node!=='object')return String(node);const props={};for(const key of ['id','className','htmlFor','type','value','role','aria-label','aria-pressed','aria-busy']){if(typeof node.props?.[key]==='string'||typeof node.props?.[key]==='number'||typeof node.props?.[key]==='boolean')props[key]=String(node.props[key]);}return {tag:typeof node.tag==='string'?node.tag:'div',props,children:(node.children||[]).map(__safeTree)}}
`;
