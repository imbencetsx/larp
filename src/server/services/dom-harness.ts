// Only this model is exposed to learner JavaScript. It has no browser, Node,
// networking, timers, navigation, storage, or host function capabilities.
export const domHarness = `
var __domNodes=[];
class __Element {
  constructor(tag,props={},children=[]){this.tag=tag;this.props={...props};this.children=[];this.parentNode=null;this._value=String(props.value||'');this.checked='checked' in props;this.disabled='disabled' in props;this.listeners={};this.simId=__domNodes.push(this)-1;this.append(...children);if(tag==='select'&&!this._value){const first=this.children.find(child=>child.tag==='option');this._value=first?String(first.props.value||first.textContent):'';}}
  get id(){return this.props.id||''} set id(value){this.props.id=String(value)}
  get className(){return this.props.class||''} set className(value){this.props.class=String(value)}
  get value(){return this._value} set value(value){this._value=String(value)}
  get textContent(){return this.children.map(child=>typeof child==='string'?child:child.textContent).join('')}
  set textContent(value){this.replaceChildren(String(value))}
  append(...items){for(const item of items){if(item&&typeof item==='object'){item.parentNode=this;this.children.push(item)}else this.children.push(String(item??''));}}
  appendChild(item){this.append(item);return item}
  replaceChildren(...items){for(const child of this.children){if(child&&typeof child==='object')child.parentNode=null;}this.children=[];this.append(...items)}
  remove(){if(this.parentNode){this.parentNode.children=this.parentNode.children.filter(child=>child!==this);this.parentNode=null}}
  setAttribute(name,value){this.props[String(name)]=String(value);if(name==='value')this.value=value;}
  getAttribute(name){return this.props[name]??null}
  addEventListener(type,handler){(this.listeners[type]??=[]).push(handler)}
  querySelector(selector){return __query(this,selector)}
}
function __matches(node,selector){return selector[0]==='#'?node.id===selector.slice(1):selector[0]==='.'?node.className.split(/\\s+/).includes(selector.slice(1)):node.tag===selector;}
function __query(node,selector){if(__matches(node,selector))return node;for(const child of node.children){if(child&&typeof child==='object'){const found=__query(child,selector);if(found)return found}}return null}
function __build(seed){if(typeof seed==='string')return seed;return new __Element(seed.tag,seed.props,seed.children.map(__build))}
var __domRoot=__build(__seed);
var document={getElementById:id=>__query(__domRoot,'#'+id),querySelector:selector=>__query(__domRoot,selector),createElement:tag=>new __Element(String(tag).toLowerCase()),createTextNode:text=>String(text)};
var __clock=1700000000000;Date.now=()=>++__clock;
function __attached(node){let depth=0;while(node&&depth++<100){if(node===__domRoot)return true;node=node.parentNode}return false}
function __dispatch(action){
  for(const field of action.fields){const node=__domNodes[field.id];if(node&&__attached(node)&&['input','textarea','select'].includes(node.tag)){node.value=field.value;node.checked=field.checked;}}
  const node=__domNodes[action.id];if(!node||!__attached(node))throw Error('That control changed. Run the preview again.');
  if(node.disabled)return;
  const event={target:node,currentTarget:node,preventDefault(){},stopPropagation(){}};
  const handler=node['on'+action.type];if(typeof handler==='function')handler(event);
  for(const listener of node.listeners[action.type]||[])listener(event);
}
function __domTree(node){if(typeof node==='string')return node;const props={...node.props,'data-sim-id':String(node.simId)};if(typeof node.oninput==='function'||node.listeners.input?.length)props['data-sim-input']='true';if(typeof node.onchange==='function'||node.listeners.change?.length)props['data-sim-change']='true';if(['input','textarea','select'].includes(node.tag))props.value=node.value;if(node.checked)props.checked='';if(node.disabled)props.disabled='';return {tag:node.tag,props,children:node.children.map(__domTree)}}
`;
