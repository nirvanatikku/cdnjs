;(function(root, factory) {
	var JSLite = factory(root);
	if (typeof define === 'function' && define.amd) {
		// AMD
		define('JSLite', function() {
			return JSLite;
		});
	} else if (typeof exports === 'object') {
		// Node.js
		module.exports = JSLite;
	} else {
		// Browser globals
		var _JSLite = root.JSLite;
		var _$ = root.$;
		JSLite.noConflict = function(deep) {
			if (deep && root.JSLite === JSLite) {
				root.JSLite = _JSLite;
			}
			if (root.$ === JSLite) root.$ = _$;
			return JSLite;
		};
		root.JSLite = root.$ = JSLite;
	}
}(this, function(root, undefined) {
	"use strict";
	var emptyArray = [],slice = emptyArray.slice,filter = emptyArray.filter,elementTypes = [1, 9, 11],P={},handlers = {},_jid = 1,
	JSLite = (function(){
		var JSLite = function( selector ) {
		    return new JSLite.fn.init(selector);
		};
		JSLite.fn = JSLite.prototype = {
			init:function( selector ){
				var dom ;
				if (!selector) 
					dom = emptyArray,dom.selector = selector || '',dom.__proto__ = JSLite.fn.init.prototype;
				else if (typeof selector == 'string' && (selector = selector.trim()) && selector[0] == '<'  && /^\s*<(\w+|!)[^>]*>/.test(selector))
					dom = P.fragment(selector),selector=null;
				else if (JSLite.isFunction(selector)) return JSLite(document).ready(selector)
				else {
					if (JSLite.isArray(selector))
						dom = selector;
					else if (JSLite.isObject(selector))
						dom = [selector], selector = null
					else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window)
						dom = [selector], selector = null;
					else dom = (function(){
						var found;
						return (document && /^#([\w-]+)$/.test(selector))?
						((found = document.getElementById(RegExp.$1)) ? [found] : [] ):
						slice.call(
							/^\.([\w-]+)$/.test(selector) ? document.getElementsByClassName(RegExp.$1) :
							/^[\w-]+$/.test(selector) ? document.getElementsByTagName(selector) :
							document.querySelectorAll(selector)
						);
					})();
				}
				dom = dom || emptyArray;
				JSLite.extend(dom, JSLite.fn);
				dom.selector = selector || '';
				return dom;
			},
			size:function(){return this.length;}
		}
		JSLite.fn.init.prototype = JSLite.fn;
		JSLite.extend = JSLite.fn.extend = function () {
			var options, name, src, copy,
			target = arguments[0],i = 1,
			length = arguments.length,
			deep = false;
			//处理深拷贝的情况
			if (typeof (target) === "boolean")
				deep = target,target = arguments[1] || {},i = 2;
			//处理时，目标是一个字符串或（深拷贝可能的情况下）的东西
			if (typeof (target) !== "object" && !JSLite.isFunction(target)) 
				target = {};
			//扩展JSLite的本身，如果只有一个参数传递
			if (length === i) target = this,--i;
			for (; i < length; i++) {
				if ((options = arguments[i]) != null) {
					for (name in options) {
						src = target[name],copy = options[name];
						if (target === copy) continue;
						if (copy !== undefined) target[name] = copy;
					}
				}
			}
			return target;
		};
		return JSLite;
	})();

	JSLite.fn.extend({
		forEach: emptyArray.forEach,
		concat: emptyArray.concat,
		indexOf: emptyArray.indexOf,
		ready: function(callback){
			if (/complete|loaded|interactive/.test(document.readyState) && document.body) callback(JSLite)
			else document.addEventListener('DOMContentLoaded', function(){callback(JSLite) }, false)
			return this
		},
		each: function(callback){
			return JSLite.each(this,callback);
		},
		map: function(fn){
			return JSLite(JSLite.map(this, function(el, i){ return fn.call(el, i, el) }));
		},
		get: function(index){
			return index === undefined ? slice.call(this) : this[index >= 0 ? index : index + this.length];
		},
		index: function(element){
			return element ? this.indexOf(JSLite(element)[0]) : this.parent().children().indexOf(this[0])
		},
		empty: function(){ return this.each(function(){ this.innerHTML = '' }) },
		detach: function(){return this.remove();},
		remove: function(){
			return this.each(function(){
				if (this.parentNode != null) this.parentNode.removeChild(this)
			})
		},
		text: function(text){
			return text === undefined ?
				(this.length > 0 ? this[0].textContent : null) :
				this.each(function(){this.textContent = funcArg(this, text)});
		},
		html:function(html){
			return 0 in arguments ? this.each(function(idx){
				JSLite(this).empty().append(funcArg(this, html))
			}) : (0 in this ? this[0].innerHTML : null)
		},
		val:function(value){
			return 0 in arguments ?
			this.each(function(idx){this.value = funcArg(this, value, idx, this.value)}) :
			(this[0] && (this[0].multiple ? 
				JSLite(this[0]).find('option').filter(function(){ return this.selected }).pluck('value') :
				this[0].value))
		},
		css:function(property, value){
			if (!this[0]) return [];
			var computedStyle = getComputedStyle(this[0], '')
			if(value === undefined && typeof property == 'string') return computedStyle.getPropertyValue(property);
			var css="",k;
			for(k in property) css += k+':'+property[k]+';';
			if(typeof property == 'string') css = property+":"+value;
			return this.each(function(el){
				css ? this.style.cssText += ';' + css :"";
			});
		},
		hide:function(){ return this.css("display", "none")},
		show:function(){
			return this.each(function(){
				this.style.display == "none" && (this.style.display = '');
				var CurrentStyle = function(e){
					return e.currentStyle || document.defaultView.getComputedStyle(e, null);
				}
				function defaultDisplay(nodeName) {
					var elm=document.createElement(nodeName),display
					JSLite('body').append(JSLite(elm));
					display = CurrentStyle(elm)['display'];
					elm.parentNode.removeChild(elm)
					return display
				}
				if (CurrentStyle(this)['display']=='none') {
					this.style.display = defaultDisplay(this.nodeName)
				}
			})
		},
		toggle:function(setting){
			return this.each(function(){
				var el = $(this);(setting === undefined ? el.css("display") == "none" : setting) ? el.show() : el.hide()
			})
		},
		offset:function(){
			if(this.length==0) return null;
			var obj = this[0].getBoundingClientRect();
			return {
				left: obj.left + window.pageXOffset,
				top: obj.top + window.pageYOffset,
				width: obj.width,
				height: obj.height
			};
		},
		attr: function(name,value){
			var result,k;
			return (typeof name == 'string' && !(1 in arguments)) ?
				(!this.length || this[0].nodeType !== 1 ? undefined :
					(!(result = this[0].getAttribute(name)) && name in this[0]) ? this[0][name] : result
				) : this.each(function(n){
					if (JSLite.isObject(name)) for(k in name) this.setAttribute(k, name[k]);
					else this.setAttribute(name,funcArg(this, value));
				});
		},
		removeAttr:function(name){
			return this.each(function(){ this.nodeType === 1 && this.removeAttribute(name)});
		},
		hasClass:function(name){
			if (!name) return false
			return emptyArray.some.call(this, function(el){
				return this.test(el.className)
			}, new RegExp('(^|\\s)' + name + '(\\s|$)'));
		},
		addClass:function(name){
			if (!name) return this;
			var classList,cls,newName;
			return this.each(function(idx){
				classList=[],cls = this.className,newName=funcArg(this, name).trim();
				newName.split(/\s+/).forEach(function(k){
					if (!JSLite(this).hasClass(k)) classList.push(k);
				},this);
				if (!newName) return this;
				classList.length ? this.className = cls + (cls ? " " : "") + classList.join(" "):null;
			})
		},
		removeClass:function(name){
			var cls;
			if (name === undefined) return this.removeAttr('class');
			return this.each(function(idx){
				cls = this.className; 
				funcArg(this, name, idx, cls).split(/\s+/).forEach(function(k){
					cls=cls.replace(new RegExp('(^|\\s)'+k+'(\\s|$)')," ").trim();
				},this);
				cls?this.className = cls:this.className = "";
			})
		},
		toggleClass:function(name){
			if(!name) return this;
			return this.each(function(idx){
				var w=JSLite(this),names=funcArg(this, name);
				names.split(/\s+/g).forEach(function(cls){
					w.hasClass(cls)?w.removeClass(cls):w.addClass(cls);
				})
			})
		},
		filter:function(selector){
			if (JSLite.isFunction(selector)) return this.not(this.not(selector))
			return JSLite(filter.call(this, function(element){
				return JSLite.matches(element, selector)
			}))
		},
		is: function(selector){
			if (this.length > 0 && JSLite.isObject(selector)) return this.indexOf(selector)>-1?true:false;
			return this.length > 0 && JSLite.matches(this[0], selector);
		},
		not:function(selector){
			var nodes = [];
			if (JSLite.isFunction(selector)&& selector.call !== undefined){
				this.each(function(idx){
					if (!selector.call(this,idx)) nodes.push(this);
				});
			}else {
				var excludes = typeof selector == 'string' ? this.filter(selector):
				(JSLite.likeArray(selector) && JSLite.isFunction(selector.item)) ? slice.call(selector) : JSLite(selector)  		
				this.forEach(function(el){
					if (excludes.indexOf(el) < 0) nodes.push(el)
				})
			}
			return JSLite(nodes)
		},
		pluck: function(property){ return JSLite.map(this, function(el){ return el[property] })},
		find: function(selector){
			var nodes = this.children(),ancestors=[];
			while (nodes.length > 0)
			nodes=JSLite.map(nodes, function(node,inx){
				if (ancestors.indexOf(node)<0) ancestors.push(node);
				if ((nodes = JSLite(node).children())&&nodes.length>0 ) return nodes;
			});
			return JSLite(ancestors).filter(selector || '*');
		},
		clone: function(){return this.map(function(){ return this.cloneNode(true)})},
		add: function(selector){return JSLite.unique(this.concat($(selector)));},
		eq: function(idx){return idx === -1 ? JSLite(this.slice(idx)) : JSLite(this.slice(idx, + idx + 1))},
		children:function(selector){
			var e=[];
			filter.call(this.pluck('children'), function(item, idx){
				JSLite.map(item,function(els){ if (els&&els.nodeType == 1) e.push(els) })
			});
			return JSLite(e).filter(selector || '*');
		},
		contents: function() {
			return this.map(function() { return this.contentDocument || slice.call(this.childNodes) })
		},
		parent: function(selector){return JSLite(JSLite.unique(this.pluck('parentNode'))).filter(selector||'*')},
		parents: function(selector){
			var ancestors=JSLite.sibling(this,'parentNode');
			return selector == null ? JSLite(ancestors) : JSLite(ancestors).filter(selector);
		},
		closest: function(selector, context){
			var node = this[0], collection = false
			if (typeof selector == 'object') collection = JSLite(selector)
			while (node && !(collection ? collection.indexOf(node) >= 0 : JSLite.matches(node, selector)))
				node = node !== context && !JSLite.isDocument(node) && node.parentNode
			return JSLite(node)
		},
		prev: function(selector){ 
			return JSLite(this.pluck('previousElementSibling')).filter(selector || '*') 
		},
		next: function(selector){
			return JSLite(this.pluck('nextElementSibling')).filter(selector || '*') 
		},
		nextAll: function (selector) {
			return JSLite(JSLite.sibling(this,'nextElementSibling')).filter(selector || '*');
		},
		prevAll: function (selector) {
			return JSLite(JSLite.sibling(this,'previousElementSibling')).filter(selector || '*');
		},
		siblings: function(selector){
			var n=[];this.map(function(i,el){
				filter.call(el.parentNode.children, function(els, idx){ 
					 if (els&&els.nodeType == 1&&els!=el) n.push(els)
				});
			})
			return JSLite(n).filter(selector || '*');
		}
	});

	JSLite.extend({
		isDocument:function (obj) { return obj = obj ? obj != null && obj.nodeType ? obj.nodeType == obj.DOCUMENT_NODE : false : undefined;},
		isFunction:function (value) { return ({}).toString.call(value) == "[object Function]" },
		isObject:function (value) { return value instanceof Object },
		isArray:function (value) { return value instanceof Array },
		isString:function(obj){ return typeof obj == 'string' },
		isWindow:function(obj){ return obj != null && obj == obj.window },
		isPlainObject:function(obj){
			return this.isObject(obj) && !this.isWindow(obj) && Object.getPrototypeOf(obj) == Object.prototype
		},
		isJson: function (obj) {
			var isjson = typeof(obj) == "object" && 
			Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
			return isjson;
		},
		parseJSON:JSON.parse,
		likeArray:function (obj) {return obj? typeof obj.length == 'number' :null },
		type: function (obj) {
			if(!obj) return undefined;
			var type="";
			JSLite.each("Boolean Number HTMLDivElement String Function Array Date RegExp Object Error".split(" "), function(i, name) {
				if(Object.prototype.toString.call(obj).indexOf(name) > -1) type = name == "HTMLDivElement"?"Object":name;
			})
			return type;
		},
		trim:function(str){if(str) return str.trim();},
		intersect:function(a,b){
			var array=[];
			a.forEach(function(item){
				if(b.indexOf(item)>-1) array.push(item);
			})
			return array;
		},
		error:function(msg) {throw msg;},
		getUrlParam:function (name) {
			var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
			r = window.location.search.substr(1).match(reg);
			if (r != null) return unescape(r[2]); return null;
		},
		each:function(elements, callback){
			var i, key
			if (this.likeArray(elements)) {
				for (i = 0; i < elements.length; i++)
					if (callback.call(elements[i], i, elements[i]) === false) return elements
				} else {
				for (key in elements)
					if (callback.call(elements[key], key, elements[key]) === false) return elements
			}
			return elements
		},
		map:function(elements, callback){
			var value, values = [], i, key
			if (this.likeArray(elements))
			for (i = 0; i < elements.length; i++) {
				value = callback(elements[i], i)
				if (value != null) values.push(value)
			}
			else
			for (key in elements) {
				value = callback(elements[key], key)
				if (value != null) values.push(value)
			}
			return values.length > 0 ? JSLite.fn.concat.apply([], values) : values;
		},
		grep:function(elements, callback){
			return filter.call(elements, callback)
		},
		matches:function(element, selector){
			if (!selector || !element || element.nodeType !== 1) return false;
			var matchesSelector = element.webkitMatchesSelector || element.mozMatchesSelector ||
								element.oMatchesSelector || element.msMatchesSelector || element.matchesSelector;
			if (matchesSelector) return matchesSelector.call(element, selector);
		},
		unique:function(array){return filter.call(array, function(item, idx){ return array.indexOf(item) == idx })},
		inArray:function(elem, array, i){
			return emptyArray.indexOf.call(array, elem, i)
		},
		sibling:function(nodes,ty){
			var ancestors = [];
			while (nodes.length > 0)
			nodes = JSLite.map(nodes, function(node){
				if ((node = node[ty]) && !JSLite.isDocument(node) && ancestors.indexOf(node) < 0) 
					ancestors.push(node)
					return node
			});
			return ancestors;
		},
		contains:function(parent, node){
			if(parent&&!node) return document.documentElement.contains(parent)
			return parent !== node && parent.contains(node)
		}
	});
	//Ajax start
	JSLite.extend({
		ajaxSettings:{
			// 默认请求类型
			type:'GET',
			// 如果请求成功时执行回调
			success:function(){},
			// 如果请求失败时执行回调
			error:function(){},
			xhr:function () {
			  return new window.XMLHttpRequest();
			},
			async:true,
			// MIME类型的映射
			accepts:{
				script:'text/javascript, application/javascript',
				json:  'application/json',
				xml:   'application/xml, text/xml',
				html:  'text/html',
				text:  'text/plain'
			}
		},
		param:function(obj,traditional,scope){
			if(JSLite.type(obj) == "String") return obj;
			var params = [],str='';
			params.add=function(key, value){
				this.push(encodeURIComponent(key) + '=' + encodeURIComponent(value== null?"":value))
			};
			if(scope==true&&JSLite.type(obj)=='Object') params.add(traditional,obj)
			else {
				for(var p in obj) {
					var v = obj[p],str='',
						k = (function(){
							if (traditional) {
								if (traditional==true) return p;
								else{
									if(scope&&JSLite.type(obj)=='Array'){
										return traditional
									}
									return traditional + "[" + (JSLite.type(obj)=='Array'?"":p) + "]";
								};
							};
							return p
						})();
					if (typeof v=="object") {
						str=this.param(v, k ,traditional);
					}else str=params.add(k,v);

					if (str) params.push(str);
				};
			}
			return params.join('&');
		},
		get:function(url, success){ JSLite.ajax({type:'GET',url: url, success: success}) },
		post:function(url, data, success, dataType){
			if (data instanceof Function) dataType = dataType || success, success = data, data = null;
			JSLite.ajax({type: 'POST', url: url, data: data, success: success, dataType: dataType });
		},
		ajax:function(options){
			var key,settings,
				setHeader = function(name, value) { headers[name.toLowerCase()] = [name, value] };
				options = options || {};
				if (JSLite.isString(options)) {
					if (arguments[0]=="GET") {
						var  urls=arguments[1];
						if (arguments[2]&&JSLite.isFunction(arguments[2])) {
							JSLite.get(urls,arguments[2])
						}else if(arguments[2]&&JSLite.isJson(arguments[2])){
							JSLite.get(urls.indexOf('?')>-1?urls+'&'+this.param(arguments[2]):urls+'?'+this.param(arguments[2]),arguments[3])
						};
					}else if(arguments[0]=="POST"){
						JSLite.post(arguments[1],arguments[2],arguments[3],arguments[4])
					};
					return;
				};
				settings=$.extend({}, options || {});
				for (key in $.ajaxSettings) if (settings[key] === undefined) settings[key] = $.ajaxSettings[key];
				//{ type, url, data, success, dataType, contentType }
			var data = settings.data,
				callback = settings.success || function(){},
				errback = settings.error || function(){},
				mime = $.ajaxSettings.accepts[settings.dataType],
				content = settings.contentType,
				xhr = new XMLHttpRequest(),
				nativeSetHeader = xhr.setRequestHeader,
				headers={};
				if (!settings.crossDomain) setHeader('X-Requested-With', 'XMLHttpRequest'),setHeader('Accept', mime || '*/*');
				if (settings.headers) for (name in settings.headers) setHeader(name, settings.headers[name]);
				if (settings.contentType || (settings.contentType !== false && settings.data && settings.type.toUpperCase() != 'GET'))
					setHeader('Content-Type', settings.contentType || 'application/x-www-form-urlencoded');
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 0) {
						if (mime == 'application/json'&&!(/^\s*$/.test(xhr.responseText))) {
							var result, error = false;
								result = xhr.responseText
							try {
								if (settings.dataType == 'script')    (1,eval)(result)
								else if (settings.dataType == 'xml')  result = xhr.responseXML
								else if (settings.dataType == 'json') result = /^\s*$/.test(result) ? null : JSON.parse(result)
							} catch (e) { error = e }

							if (error) errback(error, 'parsererror', xhr, settings);
							else callback(result, 'success', xhr);
						} else {
							callback(xhr.responseText, 'success', xhr)
						};
					} else {
						errback(xhr, 'error');
					}
				}
			};
			data=this.param(data);
			if (data&&data instanceof Object&&settings.type=='GET'){
				data?settings.url =(settings.url.indexOf('?')>-1?settings.url +'&'+ data:settings.url +'?'+ data) :null;
			}
			xhr.open(settings.type || 'GET', settings.url || window.location, settings.async);
			if (mime) xhr.setRequestHeader('Accept', mime);
			if (data instanceof Object && mime == 'application/json' ) data = JSON.stringify(data), content = content || 'application/json';
			for (name in headers) nativeSetHeader.apply(xhr, headers[name]);

			xhr.send(data);
		}
	});
	//Ajax end
	JSLite.fn.extend({
		serializeArray:function(){
			var result = [], el,type;
			if(this[0]) return result
			$([].slice.call(this.get(0).elements)).each(function(){
				el = $(this),type = el.attr('type')
				if (this.nodeName.toLowerCase() != 'fieldset' && !this.disabled && type != 'submit' && type != 'reset' && type != 'button' && ((type != 'radio' && type != 'checkbox') || this.checked)) {
					result.push({name: el.attr('name'), value: el.val() }) 
				}
			});
			return result
		},
		serialize:function(result){
			result = [],this.serializeArray().forEach(function(elm){
			  result.push(encodeURIComponent(elm.name) + '=' + encodeURIComponent(elm.value))
			})
			return result.join('&')
		}
	});

	P = {
		singleTagRE:/^<(\w+)\s*\/?>(?:<\/\1>|)$/,
		fragmentRE:/^\s*<(\w+|!)[^>]*>/,
		tagExpanderRE:/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/ig,
		table: document.createElement('table'),
		tableRow: document.createElement('tr'),
		containers:{
			'*': document.createElement('div'),
			'tr': document.createElement('tbody'),
			'tbody': P.table,'thead': P.table,'tfoot': P.table,
			'td': P.tableRow,'th': P.tableRow
		},
		fragment:function(html,name){
			var dom, container
			if (this.singleTagRE.test(html)) dom = JSLite(document.createElement(RegExp.$1));
			if (!dom) {
				if (html.replace) html = html.replace(this.tagExpanderRE, "<$1></$2>")
				if (name === undefined) name = this.fragmentRE.test(html) && RegExp.$1
				if (!(name in this.containers)) name = '*'
				container = this.containers[name]
				container.innerHTML = '' + html
				dom = JSLite.each(slice.call(container.childNodes), function(){
					container.removeChild(this)
				});
			}
			return dom;
		}
	};
	;['width', 'height'].forEach(function(dimension){
		var dimensionProperty = dimension.replace(/./,dimension[0].toUpperCase())
		JSLite.fn[dimension]=function(value){
			var offset, el = this[0]
			if (value === undefined) return JSLite.isWindow(el) ? el['inner' + dimensionProperty] :
			JSLite.isDocument(el) ? el.documentElement['scroll' + dimensionProperty] :
			(offset = this.offset()) && offset[dimension]
			else return this.each(function(idx){
				el = $(this)
				el.css(dimension, funcArg(this, value, idx, el[dimension]()))
			})
		}
	})
	;['after','prepend','before','append'].forEach(function(operator, operatorIndex) {
		var inside = operatorIndex % 2;
		JSLite.fn[operator] = function(){
			var argType, nodes = JSLite.map(arguments, function(arg) {
					argType = JSLite.type(arg)
	    	    	if(argType=="Function") arg = funcArg(this, arg)
					return argType == "Object" || argType == "Array" || arg == null ? arg : P.fragment(arg)
				}),parent,script,copyByClone = this.length > 1
			if (nodes.length < 1) return this
			return this.each(function(_, target){
				parent = inside ? target : target.parentNode
				target = operatorIndex == 0 ? target.nextSibling :
						operatorIndex == 1 ? target.firstChild :
						operatorIndex == 2 ? target :
						null;

				var parentInDocument = JSLite.contains(document.documentElement, parent)

				nodes.forEach(function(node){
					var txt
					if (copyByClone) node = node.cloneNode(true)
					parent.insertBefore(node, target);
					if(parentInDocument && node.nodeName != null && node.nodeName.toUpperCase() === 'SCRIPT' &&
						(!node.type || node.type === 'text/javascript') && !node.src) txt=node.innerHTML;
					else if(parentInDocument &&node.children && node.children.length>0&&JSLite(node)&&(script=JSLite(node).find("script")))
						if(script.length>0) script.each(function(_,item){
							txt=item.innerHTML
						});
						txt?window['eval'].call(window, txt):undefined;
				});
			})
		}
		JSLite.fn[inside ? operator+'To' : 'insert'+(operatorIndex ? 'Before' : 'After')] = function(html){
			JSLite(html)[operator](this)
			return this
		}
	});
	
	function funcArg(context, arg, idx, payload) {
		return JSLite.isFunction(arg) ? arg.call(context, idx, payload) : arg;
	}

	/* 绑定事件 start */
	JSLite.fn.extend({
		bind: function(event, func) {return this.each(function(){add(this, event, func)})},
		unbind:function(event, func) {return this.each(function(){remove(this, event, func)})},
		on:function(event, selector, data, callback){
			var self = this
			if (event && !JSLite.isString(event)) {
				JSLite.each(event, function(type, fn){
					self.on(type, selector, data, fn)
				})
				return self
			}
			if (!JSLite.isString(selector) && !JSLite.isFunction(callback) && callback !== false)
				callback = data, data = selector, selector = undefined
			if (JSLite.isFunction(data) || data === false)
				callback = data, data = undefined
			if (callback === false) callback = function(){return false;}
			return this.each(function(){ 
				add(this, event, callback, data, selector) 
			})
		},
		off:function(event, selector, callback){
			var self = this
			if (event && !JSLite.isString(event)) {
				JSLite.each(event, function(type, fn){
					self.off(type, selector, fn)
				})
				return self
			}
			if (!JSLite.isString(selector) && !JSLite.isFunction(callback) && callback !== false)
				callback = selector, selector = undefined
			if (callback === false) callback =  function(){return false;}
			return self.each(function(){
				remove(this, event, callback, selector)
			})
		},
		delegate: function(selector, event, callback){
			return this.on(event, selector, callback)
		},
		trigger:function(event, data){
			var type = event,specialEvents={}
			specialEvents.click = specialEvents.mousedown = specialEvents.mouseup = specialEvents.mousemove = 'MouseEvents';
			if (typeof type == 'string') {
				event = document.createEvent(specialEvents[type] || 'Events');
				event.initEvent(type,true, true);
			}else return;
			event._data = data;
			return this.each(function(){
				if('dispatchEvent' in this) this.dispatchEvent(event);
			});
		}
	});
	JSLite.event={add:add,remove:remove};
	function add(element, events, func, data, selector){
		var self=this,id=jid(element),set=(handlers[id] || (handlers[id] = []));
		events.split(/\s/).forEach(function(event){
			var handler = JSLite.extend(parse(event), {fn: func,sel: selector, i: set.length});
			var proxyfn = handler.proxy = function (e) {
				e.data = data;
				var result = func.apply(element,e._data == undefined ? [e] : [e].concat(e._data));
				if (result === false) e.preventDefault(), e.stopPropagation();
				return result;
			};
			set.push(handler)
			if (element.addEventListener) element.addEventListener(handler.e,proxyfn, false);
		})
	}
	function remove(element, events, func, selector){
		;(events || '').split(/\s/).forEach(function(event){
			JSLite.event = parse(event)
			findHandlers(element, event, func, selector).forEach(function(handler){
				delete handlers[jid(element)][handler.i]
				if (element.removeEventListener) element.removeEventListener(handler.e, handler.proxy, false);
			})
		})
	}
	function jid(element) {return element._jid || (element._jid = _jid++)}
	function parse(event) {
		var parts = ('' + event).split('.');
		return {e: parts[0], ns: parts.slice(1).sort().join(' ')};
	}
	function findHandlers(element, event, func, selector){
		var self=this,event = parse(event),id = jid(element);
		return (handlers[jid(element)] || []).filter(function(handler) {
			return handler 
			&& (!event.e  || handler.e == event.e) 
			&& (!func || handler.fn.toString()===func.toString())
			&& (!selector || handler.sel == selector);
		})
	}
	;("blur focus focusin focusout load resize scroll unload click dblclick " +
	"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
	"change select submit keydown keypress keyup error paste drop dragstart dragover").split(' ').forEach(function(event) {
		JSLite.fn[event] = function(callback) {
			return callback ? this.bind(event, callback) : this.trigger(event);
		}
	});
	/* 绑定事件 end */

	//字符串处理
	JSLite.extend(String.prototype,{
		trim: function () {return this.replace(/(^\s*)|(\s*$)/g, "");},
		leftTrim: function () {return this.replace(/(^\s*)/g, "");}
	});
	return JSLite;
}));