'use strict';
String.prototype.replaceAll = function(find, replace) {
	if (typeof find == 'string') return this.split(find).join(replace);
	var t = this, i, j;
	while (typeof(i = find.shift()) == 'string' && typeof(j = replace.shift()) == 'string') t = t.replaceAll(i || '', j || '');
	return t;
};
String.prototype.repeat = function(num) {
	return new Array(++num).join(this);
};
if (!Array.prototype.includes) Array.prototype.includes = function(item) {
	return this.indexOf(item) != -1;
};
Number.prototype.bound = function(l, h) {
	return isNaN(h) ? Math.min(this, l) : Math.max(Math.min(this, h), l);
};
HTMLCollection.prototype.indexOf = NodeList.prototype.indexOf = Array.prototype.indexOf;
HTMLCollection.prototype.forEach = NodeList.prototype.forEach = Array.prototype.forEach;
HTMLElement.prototype.insertAfter = function(newEl, refEl) {
	if (refEl.nextSibling) refEl.parentNode.insertBefore(newEl, refEl.nextSibling);
	else refEl.parentNode.appendChild(newEl);
};
addEventListener('DOMContentLoaded', function() {
	var audio = new Audio('music.mp3');
	document.getElementById('input').addEventListener('keypress', function(e) {
		if (e.keyCode == 13) {
			document.getElementById('coutput').appendChild(document.createTextNode('> ' + this.value + '\n' + respond(this.value)));
			this.value = '';
			this.scrollIntoView();
		}
	});
	function start() {
		document.getElementById('challenges').hidden = false;
		document.getElementById('editor').hidden = false;
		document.getElementById('intro').hidden = true;
		document.getElementById('simulation').hidden = true;
		audio.pause();
		return '';
	}
	function startrun() {
		document.getElementById('challenges').hidden = false;
		document.getElementById('editor').hidden = true;
		document.getElementById('intro').hidden = true;
		document.getElementById('simulation').hidden = false;
		audio.currentTime = 0;
		audio.play();
		run();
		return '';
	}
	var commandList = ['help: shows this', 'start: starts the game', 'launch: start mission'];
	function respond(text) {
		var command = text.split(' ', 2)[0];
		if (command == 'help') return 'Commands:\n- ' + commandList.join('\n- ') + '\n';
		if (['start', 'code', 'end', 'term', 'terminate'].includes(command)) return start();
		if (['run', 'eval', 'launch'].includes(command)) return startrun();
		return '';
	}
	function html(input) {
		return input.toString().replaceAll(['&', '<', '>', '"', '\t', '\n', '\r', '\b'], ['&amp;', '&lt;', '&gt;', '&quot;', '&#9;', '&#10;', '', '']);
	}
	function textareaHandler(e, s) {
		if (this.noHandle) return delete this.nHandle;
		if (!this.hist) this.hist = [{
			body: this.value,
			start: this.selectionStart,
			end: this.selectionEnd
		}];
		if (!this.hIndex) this.hIndex = 0;
		if (!s && e.which == 9 && !e.ctrlKey && !e.altKey && !e.metaKey) {
			if (this.selectionStart == this.selectionEnd) {
				if (e.shiftKey) {
					var cS = this.selectionEnd - 1;
					while (this.value[cS] && this.value[cS] != '\n') {
						if (this.value[cS] == '\t') {
							this.value = this.value.substr(0, cS) + this.value.substr(++cS);
							break;
						} else cS--;
					}
				} else {
					var oS = this.selectionEnd;
					this.value = this.value.substr(0, oS) + '\t' + this.value.substr(oS);
					this.selectionStart = this.selectionEnd = ++oS;
				}
			} else {
				var lines = this.value.split('\n'),
					i = 0,
					start = 0;
				while ((i += lines[start].length) < this.selectionStart - start) start++;
				var end = start;
				i -= lines[start].length;
				while ((i += lines[end].length) < this.selectionEnd - end) end++;
				i = --start;
				while (++i <= end) {
					if (e.shiftKey) lines[i][0] != '\t' || (lines[i] = lines[i].substr(1));
					else lines[i] = '\t' + lines[i];
				}
				this.value = lines.join('\n');
				var nS = lines.slice(0, ++start).join('\n').length;
				this.selectionStart = (nS += nS ? 1 : 0);
				this.selectionEnd = nS + lines.slice(start, ++end).join('\n').length;
			}
			if (this.hist[this.hIndex].body == this.value) return;
			this.hist.push({
				body: this.value,
				start: this.selectionStart,
				end: this.selectionEnd
			});
			this.hIndex = this.hist.length - 1;
			e.preventDefault();
		} else if (e.which == 90 && e.metaKey && !e.altKey) {
			e.preventDefault();
			if (this.hIndex == this.hist.length - 1 && this.hist[this.hIndex].body != this.value) {
				this.hist.push({
					body: this.value,
					start: this.selectionStart,
					end: this.selectionEnd
				});
				this.hIndex = this.hist.length - 1;
			}
			var data = this.hist[e.shiftKey ? ++this.hIndex : --this.hIndex];
			if (data) {
				this.value = data.body;
				this.selectionStart = data.start;
				this.selectionEnd = data.end;
			} else e.shiftKey ? --this.hIndex : ++this.hIndex;
		} else {
			if (this.hist[this.hIndex].body != this.value) this.hist = this.hist.slice(0, this.hIndex + 1);
			if (this.timer) clearTimeout(this.timer);
			this.timer = setTimeout(function(e) {
				if (e.hIndex != e.hist.length - 1) return;
				if (e.hist[e.hIndex].body == e.value) return;
				e.hist.push({
					body: e.value,
					start: e.selectionStart,
					end: e.selectionEnd
				});
				e.hIndex = e.hist.length - 1;
			}, this.lastKeyCode == e.which || [8, 13].indexOf(e.which) == -1 ? 200 : e.metaKey || e.shiftKey ? 100 : 0, this);
		}
		this.lastKeyCode = e.which;
	}
	var e = document.getElementsByTagName('textarea'),
		i = e.length;
	while (i--) {
		e[i].addEventListener('keyup', function() {
			textareaHandler.call(this, true);
		});
		e[i].addEventListener('keydown', textareaHandler);
		e[i].addEventListener('keypress', textareaHandler);
	}
	var canvasJS = document.getElementById('canvas-js').value;
	var code = document.getElementById('code'),
		codeDisplay = document.getElementById('code-display'),
		taCont = document.getElementById('ta-cont'),
		output = document.getElementById('output'),
		fullScreen = false,
		blinkTimeout;
	function insertNodeAtPosition(node, refNode, pos) {
		if (typeof(refNode.nodeValue) == 'string') refNode.parentNode.insertBefore(node, refNode.nodeValue.length == 1 ? refNode : refNode.splitText(pos));
		else {
			for (var i = 0; i < refNode.childNodes.length; i++) {
				var chNode = refNode.childNodes[i];
				if (chNode.textContent.length <= pos && i != refNode.childNodes.length - 1) pos -= chNode.textContent.length;
				else return insertNodeAtPosition(node, chNode, pos);
			}
		}
	}
	highlightJS(codeDisplay, code.lastValue = code.value);
	taCont.dataset.line = codeDisplay.dataset.line;
	codeDisplay.classList.add('code-display');
	taCont.classList.add('ta-cont');
	var caret = document.createElement('span');
	caret.id = 'caret';
	caret.appendChild(document.createTextNode('\xA0'));
	codeDisplay.insertAfter(caret, codeDisplay.firstChild);
	if (navigator.userAgent.indexOf('Mobile') == -1) {
		code.focus();
		taCont.classList.add('focused');
		blinkTimeout = setTimeout(blink, 500);
	} else caret.hidden = true;
	var oldValue;
	handleTAInput();
	addEventListener('keypress', function(e) {
		requestAnimationFrame(function() {
			handleTAInput();
			if (e.which == 13) {
				var caret = document.getElementById('caret');
				if (caret) taCont.scrollTop = Math.max(taCont.scrollTop, caret.getBoundingClientRect().top + caret.offsetHeight + 8 - caret.parentNode.getBoundingClientRect().top - taCont.offsetHeight);
			}
		});
	});
	addEventListener('keyup', soonHandleTAInput);
	addEventListener('keydown', soonHandleTAInput);
	addEventListener('mousedown', soonHandleTAInput);
	addEventListener('mousemove', soonHandleTAInput);
	code.addEventListener('input', handleTAInput);
	code.addEventListener('focus', taFocusHandler);
	code.addEventListener('blur', taBlurHandler);
	if (navigator.userAgent.indexOf('Mobile') == -1) {
		addEventListener('focus', function() {
			(document.getElementById('caret') || {}).hidden = false;
			if (!blinkTimeout) blinkTimeout = setTimeout(blink, 500);
		});
	}
	code.addEventListener('keypress', jsKeypressHandler);
	code.addEventListener('keydown', taKeydownHandler);
	function handleTAInput() {
		if (code.value != code.lastValue) {
			highlightJS(codeDisplay, code.lastValue = code.value);
			taCont.dataset.line = codeDisplay.dataset.line;

		}
		code.style.height = codeDisplay.offsetHeight + 'px';
		if (code.selectionStart != code.lastSelectionStart) {
			code.lastSelectionStart = code.selectionStart;
			code.whichSelection = false;
		}
		if (code.selectionEnd != code.lastSelectionEnd) {
			code.lastSelectionEnd = code.selectionEnd;
			code.whichSelection = true;
		}
		var cursorPos = code.whichSelection ? code.selectionEnd : code.selectionStart;
		var oldCaret = document.getElementById('caret');
		if (navigator.userAgent.indexOf('Mobile') == -1 && code == document.activeElement && (cursorPos != code.lastCursorPos || !oldCaret)) {
			code.lastCursorPos = cursorPos;
			if (oldCaret) oldCaret.parentNode.removeChild(oldCaret);
			var caret = document.createElement('span');
			caret.id = 'caret';
			caret.appendChild(document.createTextNode('\xA0'));
			insertNodeAtPosition(caret, codeDisplay, cursorPos * 2);
			clearTimeout(blinkTimeout);
			blinkTimeout = setTimeout(blink, 500);
		}
	}
	function highlightJS(codeBlock, input) {
		input = typeof(input) == 'string' ? input : codeBlock.textContent;
		var chunk = '',
			warnings = [],
			beforeWord,
			line = 1,
			inVarDec = [],
			d,
			inTemplate = 0,
			fc;
		while (fc = codeBlock.firstChild) codeBlock.removeChild(fc);
		var linenum = document.createElement('span');
		linenum.className = 'line';
		linenum.dataset.linenum = line;
		codeBlock.appendChild(linenum);
		for (var i = 0; i < input.length; i++) {
			var c = input[i],
				l;
			if (c == '"' || c == "'" || c == '`' || (inTemplate && c == '}')) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				var enteringTemplate = false;
				if (c == '}') {
					inTemplate--;
					var punc = document.createElement('span');
					punc.className = 'template punctuation';
					punc.appendChild(createZWSTextNode('}'));
					codeBlock.appendChild(punc);
					chunk = '';
					c = '`';
				} else chunk = c;
				var string = document.createElement('span');
				string.className = 'string';
				while ((d = input[++i]) && d != c) {
					if (d == '\n') {
						if (c != '`') {
							warnings.push([i, 'Unexpected line end with unterminated string literal.']);
							break;
						} else {
							string.appendChild(createZWSTextNode(chunk + '\n'));
							chunk = '';
							var linenum = document.createElement('span');
							linenum.className = 'line';
							linenum.dataset.linenum = ++line;
							string.appendChild(linenum);
						}
					} else if (d == '\\') {
						string.appendChild(createZWSTextNode(chunk));
						chunk = d;
						if (d = input[++i]) chunk += d;
						else warnings.push([i - 1, 'Incomplete escape sequence.']);
						var escape = document.createElement('span');
						escape.className = 'escape';
						if (d == 'u') {
							if (d = input[++i]) chunk += d;
							if (d == '{') {
								while ((d = input[++i]) && d != '}') {
									if (d == '\n' || d == string) {
										warnings.push([i, 'Unclosed bracket escape sequence.']);
										break;
									}
									chunk += d;
								}
								if (d == '}') chunk += '}';
							} else if (input[i + 3]) chunk += input[++i] + input[++i] + input[++i];
							else warnings.push([i, 'Incomplete escape sequence.']);
						} else if (c == 'x') chunk += input[++i] + input[++i];
						escape.appendChild(createZWSTextNode(chunk));
						string.appendChild(escape);
						chunk = '';
						if (d == '\n') {
							var linenum = document.createElement('span');
							linenum.className = 'line';
							linenum.dataset.linenum = ++line;
							string.appendChild(linenum);
						}
					} else if (d == '$' && input[i + 1] == '{') {
						inTemplate++;
						enteringTemplate = true;
						break;
					} else chunk += d;
				}
				if (d && !enteringTemplate) chunk += d;
				string.appendChild(createZWSTextNode(chunk));
				codeBlock.appendChild(string);
				chunk = '';
				if (d == '\n') {
					var linenum = document.createElement('span');
					linenum.className = 'line';
					linenum.dataset.linenum = ++line;
					codeBlock.appendChild(linenum);
				}
				if (enteringTemplate) {
					var punc = document.createElement('span');
					punc.className = 'template punctuation';
					punc.appendChild(createZWSTextNode('${'));
					codeBlock.appendChild(punc);
					i++;
				}
			} else if (c == '/' && input[i + 1] == '/') {
				i++;
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '//';
				var comment = document.createElement('span');
				comment.className = 'inline-comment';
				while ((d = input[++i]) && d != '\n') chunk += d;
				if (d) chunk += '\n';
				comment.appendChild(createZWSTextNode(chunk));
				codeBlock.appendChild(comment);
				chunk = '';
				if (d) {
					var linenum = document.createElement('span');
					linenum.className = 'line';
					linenum.dataset.linenum = ++line;
					codeBlock.appendChild(linenum);
				}
			} else if (c == '/' && input[i + 1] == '*') {
				i++;
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '/*';
				var comment = document.createElement('span');
				comment.className = 'inline-comment';
				input = input.substr(0, i) + ' ' + input.substr(i + 1);
				while ((d = input[++i]) && (d != '/' || input[i - 1] != '*')) {
					chunk += d;
					if (d == '\n') {
						comment.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var linenum = document.createElement('span');
						linenum.className = 'line';
						linenum.dataset.linenum = ++line;
						comment.appendChild(linenum);
					}
				}
				if (d) chunk += d;
				comment.appendChild(createZWSTextNode(chunk));
				codeBlock.appendChild(comment);
				chunk = '';
				if (d == '\n') {
					var linenum = document.createElement('span');
					linenum.className = 'line';
					linenum.dataset.linenum = ++line;
					codeBlock.appendChild(linenum);
				}
			} else if (
					c == '/' &&
					(
						(
							['number', 'regex'].indexOf((codeBlock.lastElementChild || {}).className) == -1 &&
							/(^\s*|[+\-=!~/*%<>&|^(;:[,])\s*$/.test(input.substr(0, i))
						) || (
							codeBlock.lastElementChild &&
							codeBlock.lastElementChild.firstChild &&
							codeBlock.lastElementChild.firstChild.nodeValue == 'return'
						)
					)
				) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var regex = document.createElement('span');
				regex.className = 'regex';
				var regexOpen = document.createElement('span');
				regexOpen.className = 'open';
				regexOpen.appendChild(createZWSTextNode('/'));
				regex.appendChild(regexOpen);
				var d,
					charclass = false;
				while ((d = input[++i]) && d != '/') {
					if (d == '\n') {
						warnings.push([i, 'Unexpected line end with unterminated regex literal.']);
						regex.appendChild(createZWSTextNode(chunk + '\n'));
						chunk = '';
						var linenum = document.createElement('span');
						linenum.className = 'line';
						linenum.dataset.linenum = ++line;
						regex.appendChild(linenum);
						break;
					}
					if (d == '\\') {
						if (charclass) charclass.appendChild(createZWSTextNode(chunk));
						else regex.appendChild(createZWSTextNode(chunk));
						chunk = d + (d = input[++i]);
						var escape = document.createElement('span');
						escape.className = 'escape';
						if (d == 'c') chunk += d = input[++i];
						else if (d == 'x' || d == '0') chunk += input[++i] + input[++i];
						else if (d == 'u') chunk += input[++i] + input[++i] + input[++i] + input[++i];
						else if (/\d/.test(d)) {
							while (/\d/.test(input[++i])) chunk += input[i];
							i--;
							escape.className = 'backreference';
						}
						escape.appendChild(createZWSTextNode(chunk));
						chunk = '';
						if (charclass) charclass.appendChild(escape);
						else regex.appendChild(escape);
						if (d == '\n') {
							warnings.push([i, 'Unexpected line end with unterminated regex literal.']);
							break;
						}
					} else if (charclass) {
						if (d == ']') {
							charclass.appendChild(createZWSTextNode(chunk));
							chunk = '';
							var end = document.createElement('span');
							end.className = 'punctuation';
							end.appendChild(createZWSTextNode(']'));
							charclass.appendChild(end);
							regex.appendChild(charclass);
							charclass = false;
						} else if (input[i + 1] == '-' && input[i + 2] != ']') {
							charclass.appendChild(createZWSTextNode(chunk));
							chunk = '';
							var range = document.createElement('span');
							range.className = 'range';
							range.appendChild(createZWSTextNode(d + input[++i] + input[++i]));
							charclass.appendChild(range);
						} else chunk += d;
					} else if (d == '^' || d == '$' || d == '|' || d == '.') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var special = document.createElement('span');
						special.className = 'special';
						special.appendChild(createZWSTextNode(d));
						regex.appendChild(special);
					} else if (d == '?' || d == '+' || d == '*') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var quantifier = document.createElement('span');
						quantifier.className = 'quantifier';
						quantifier.appendChild(createZWSTextNode(d));
						regex.appendChild(quantifier);
					} else if (d == '?' || d == '+' || d == '*') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var quantifier = document.createElement('span');
						quantifier.className = 'quantifier';
						quantifier.appendChild(createZWSTextNode(d));
						regex.appendChild(quantifier);
					} else if (d == '(' || d == ')') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = d;
						if (d == '(' && input[i + 1] == '?' && ':=!'.indexOf(input[i + 2]) != -1) chunk += input[++i] + input[++i];
						var grouper = document.createElement('span');
						grouper.className = 'grouper';
						grouper.appendChild(createZWSTextNode(chunk));
						regex.appendChild(grouper);
						chunk = '';
					} else if (d == '{') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var quantifier = document.createElement('span');
						quantifier.className = 'quantifier';
						var brace = document.createElement('span');
						brace.className = 'punctuation';
						brace.appendChild(createZWSTextNode('{'));
						quantifier.appendChild(brace);
						while ((d = input[++i]) && d != '}') {
							if (d == '\n') {
								warnings.push([i, 'Unexpected line end with unterminated regex literal.']);
								quantifier.appendChild(createZWSTextNode(chunk + '\n'));
								chunk = '';
								var linenum = document.createElement('span');
								linenum.className = 'line';
								linenum.dataset.linenum = ++line;
								quantifier.appendChild(linenum);
								break;
							}
							if (d == ',') {
								quantifier.appendChild(createZWSTextNode(chunk));
								chunk = '';
								var comma = document.createElement('span');
								comma.className = 'punctuation';
								comma.appendChild(createZWSTextNode(','));
								quantifier.appendChild(comma);
							} else chunk += d;
						}
						quantifier.appendChild(createZWSTextNode(chunk));
						if (d == '}') {
							var brace = document.createElement('span');
							brace.className = 'punctuation';
							brace.appendChild(createZWSTextNode('}'));
							quantifier.appendChild(brace);
						} else warnings.push([i, 'Unclosed regex quantifier.']);
						chunk = '';
						regex.appendChild(quantifier);
					} else if (d == '[') {
						regex.appendChild(createZWSTextNode(chunk));
						chunk = '[';
						if (input[++i] == '^') chunk += '^';
						else i--;
						charclass = document.createElement('span');
						charclass.className = 'charclass';
						var start = document.createElement('span');
						start.className = 'punctuation';
						start.appendChild(createZWSTextNode(chunk));
						charclass.appendChild(start);
						chunk = '';
					} else chunk += d;
				}
				(charclass || regex).appendChild(createZWSTextNode(chunk));
				if (charclass) regex.appendChild(charclass);
				chunk = '';
				if (d && d != '\n') {
					var regexClose = document.createElement('span');
					regexClose.className = 'close';
					regexClose.appendChild(createZWSTextNode('/'));
					regex.appendChild(regexClose);
				} else warnings.push([i, 'Unterminated regex literal.']);
				var modifiers = input.substr(i + 1).match(/^[igm]*/);
				if (modifiers) {
					var regexModifier = document.createElement('span');
					regexModifier.className = 'modifier';
					regexModifier.appendChild(createZWSTextNode(modifiers[0]));
					regex.appendChild(regexModifier);
					i += modifiers[0].length;
				}
				codeBlock.appendChild(regex);
			} else if (input.substr(i, 10) == '.prototype') {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var dot = document.createElement('span');
				dot.className = 'dot';
				dot.appendChild(createZWSTextNode('.'));
				codeBlock.appendChild(dot);
				var proto = document.createElement('span');
				proto.className = 'prototype';
				proto.appendChild(createZWSTextNode('prototype'));
				codeBlock.appendChild(proto);
				i += 9;
			} else if ((beforeWord = (input[i - 1] || ' ').match(/[^\w.]/)) && (
					(input.substr(i, 3) == 'NaN' && !/\w/.test(input[i + 3] || '') && (l = 3)) ||
					(input.substr(i, 4) == 'true' && !/\w/.test(input[i + 4] || '') && (l = 4)) ||
					(input.substr(i, 4) == 'null' && !/\w/.test(input[i + 4] || '') && (l = 4)) ||
					(input.substr(i, 5) == 'false' && !/\w/.test(input[i + 5] || '') && (l = 5)) ||
					(input.substr(i, 8) == 'Infinity' && !/\w/.test(input[i + 8] || '') && (l = 8))
				)) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var keyword = document.createElement('span');
				keyword.className = 'constant';
				keyword.appendChild(createZWSTextNode(input.substr(i, l)));
				codeBlock.appendChild(keyword);
				i += l - 1;
			} else if (beforeWord && c != c.toLowerCase()) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = c;
				var capvar = document.createElement('span');
				capvar.className = 'capvar';
				while ((d = input[++i]) && /[\w\d]/.test(d)) chunk += d;
				i--;
				capvar.appendChild(createZWSTextNode(chunk));
				codeBlock.appendChild(capvar);
				chunk = '';
			} else if (beforeWord && (
					(['do', 'if', 'in', 'of'].indexOf(input.substr(i, 2)) != -1 && !/\w/.test(input[i + 2] || '') && (l = 2)) ||
					(['for', 'get', 'let', 'new', 'try', 'var'].indexOf(input.substr(i, 3)) != -1 && !/\w/.test(input[i + 3] || '') && (l = 3)) ||
					(['case', 'else', 'this', 'void', 'with'].indexOf(input.substr(i, 4)) != -1 && !/\w/.test(input[i + 4] || '') && (l = 4)) ||
					(['break', 'class', 'catch', 'const', 'super', 'throw', 'while', 'yield'].indexOf(input.substr(i, 5)) != -1 && !/\w/.test(input[i + 5] || '') && (l = 5)) ||
					(['delete', 'export', 'import', 'return', 'static', 'switch', 'typeof'].indexOf(input.substr(i, 6)) != -1 && !/\w/.test(input[i + 6] || '') && (l = 6)) ||
					(['default', 'extends', 'finally'].indexOf(input.substr(i, 7)) != -1 && !/\w/.test(input[i + 7] || '') && (l = 7)) ||
					(['continue', 'debugger'].indexOf(input.substr(i, 8)) != -1 && !/\w/.test(input[i + 8] || '') && (l = 8)) ||
					(['instanceof'].indexOf(input.substr(i, 10)) != -1 && !/\w/.test(input[i + 10] || '') && (l = 10))
				)) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var keyword = document.createElement('span');
				keyword.className = 'keyword';
				keyword.appendChild(createZWSTextNode(input.substr(i, l)));
				codeBlock.appendChild(keyword);
				if (input.substr(i, l) == 'var' || input.substr(i, l) == 'let' || input.substr(i, l) == 'const') inVarDec.unshift({
					parens: 0,
					brackets: 0,
					braces: 0,
					equals: false
				});
				if (input.substr(i, l) == 'in' || input.substr(i, l) == 'of') inVarDec.shift();
				i += l - 1;
			} else if (beforeWord && (
					(['enum', 'eval'].indexOf(input.substr(i, 4)) != -1 && !/\w/.test(input[i + 4] || '') && (l = 4)) ||
					(['await'].indexOf(input.substr(i, 5)) != -1 && !/\w/.test(input[i + 5] || '') && (l = 5)) ||
					(['public'].indexOf(input.substr(i, 6)) != -1 && !/\w/.test(input[i + 6] || '') && (l = 6)) ||
					(['package', 'private'].indexOf(input.substr(i, 7)) != -1 && !/\w/.test(input[i + 7] || '') && (l = 7)) ||
					(['continue', 'debugger'].indexOf(input.substr(i, 8)) != -1 && !/\w/.test(input[i + 8] || '') && (l = 8)) ||
					(['interface', 'protected'].indexOf(input.substr(i, 9)) != -1 && !/\w/.test(input[i + 9] || '') && (l = 9)) ||
					(['implements'].indexOf(input.substr(i, 10)) != -1 && !/\w/.test(input[i + 10] || '') && (l = 10))
				)) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var keyword = document.createElement('span');
				keyword.className = 'keyword reserved';
				keyword.appendChild(createZWSTextNode(input.substr(i, l)));
				codeBlock.appendChild(keyword);
				i += l - 1;
			} else if (beforeWord && (
					(['top'].indexOf(input.substr(i, 3)) != -1 && !/\w/.test(input[i + 3] || '') && (l = 3)) ||
					(['self'].indexOf(input.substr(i, 4)) != -1 && !/\w/.test(input[i + 4] || '') && (l = 4)) ||
					(['fetch'].indexOf(input.substr(i, 5)) != -1 && !/\w/.test(input[i + 5] || '') && (l = 5)) ||
					(['window', 'screen', 'crypto', 'status', 'frames', 'opener', 'parent'].indexOf(input.substr(i, 6)) != -1 && !/\w/.test(input[i + 6] || '') && (l = 6)) ||
					(['console', 'history', 'menubar', 'toolbar'].indexOf(input.substr(i, 7)) != -1 && !/\w/.test(input[i + 7] || '') && (l = 7)) ||
					(['document'].indexOf(input.substr(i, 8)) != -1 && !/\w/.test(input[i + 8] || '') && (l = 8)) ||
					(['arguments', 'statusbar', 'navigator', 'indexedDB'].indexOf(input.substr(i, 9)) != -1 && !/\w/.test(input[i + 9] || '') && (l = 9)) ||
					(['scrollbars', 'styleMedia'].indexOf(input.substr(i, 10)) != -1 && !/\w/.test(input[i + 10] || '') && (l = 10)) ||
					(['locationbar', 'personalbar', 'performance'].indexOf(input.substr(i, 11)) != -1 && !/\w/.test(input[i + 11] || '') && (l = 11)) ||
					(['frameElement', 'localStorage'].indexOf(input.substr(i, 12)) != -1 && !/\w/.test(input[i + 12] || '') && (l = 12)) ||
					(['sessionStorage'].indexOf(input.substr(i, 14)) != -1 && !/\w/.test(input[i + 14] || '') && (l = 14)) ||
					(['speechSynthesis'].indexOf(input.substr(i, 15)) != -1 && !/\w/.test(input[i + 15] || '') && (l = 15)) ||
					(['devicePixelRatio', 'applicationCache'].indexOf(input.substr(i, 16)) != -1 && !/\w/.test(input[i + 16] || '') && (l = 16))
				)) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var keyword = document.createElement('span');
				keyword.className = 'browser';
				keyword.appendChild(createZWSTextNode(input.substr(i, l)));
				codeBlock.appendChild(keyword);
				i += l - 1;
			} else if (input.substr(i, 8) == 'function' && !/\w/.test(input[i - 1] || ' ')) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var node,
					nodeNum = codeBlock.childNodes.length,
					fnameNodes = [],
					foundEquals = false,
					foundName = false,
					endNode = false;
				prevNodes: while (node = codeBlock.childNodes[--nodeNum]) {
					if (foundEquals) {
						if (!endNode) {
							if (node.tagName) {
								endNode = node;
							} else {
								var str = node.nodeValue;
								for (var j = str.length - 1; j >= 0; j--) {
									if (/[^\s\u200B]/.test(str[j])) {
										endNode = node.splitText(j + 1);
										nodeNum++;
										break;
									}
								}
							}
							continue;
						}
						if (node.tagName) {
							if (node.className == 'inline-comment' && !foundName) fnameNodes.push(node);
							else if (['capvar', 'dot', 'prototype', 'newvar', 'line'].indexOf(node.className) != -1 && node.dataset.linenum != 1) {
								fnameNodes.push(node);
								foundName = true;
							} else {
								var fname = document.createElement('span');
								fname.className = 'function-name';
								for (var j = fnameNodes.length - 1; j >= 0; j--) fname.appendChild(fnameNodes[j]);
								codeBlock.insertBefore(fname, endNode);
								break;
							}
						} else {
							var str = node.nodeValue;
							for (var j = str.length - 1; j >= 0; j--) {
								if (foundName && /[\s\u200B=(]/.test(str[j])) {
									fnameNodes.push(node.splitText(j + 1));
									var fname = document.createElement('span');
									fname.className = 'function-name';
									for (var j = fnameNodes.length - 1; j >= 0; j--) fname.appendChild(fnameNodes[j]);
									codeBlock.insertBefore(fname, endNode);
									if (endNode.tagName) fname.appendChild(endNode);
									break prevNodes;
								}
							}
							fnameNodes.push(node);
						}
					} else if (node.className == 'equals') {
						foundEquals = true;
						nodeNum++;
					} else if (/[^\s\u200B]/.test(node.textContent)) break;
				}
				var funcKeyword = document.createElement('span');
				funcKeyword.className = 'keyword';
				funcKeyword.appendChild(createZWSTextNode('function'));
				i += 7;
				while ((c = input[++i]) && /\s/.test(c)) {
					chunk += c;
					if (c == '\n') {
						funcKeyword.appendChild(createZWSTextNode(chunk));
						chunk = '';
						var linenum = document.createElement('span');
						linenum.className = 'line';
						linenum.dataset.linenum = ++line;
						funcKeyword.appendChild(linenum);
					}
				}
				funcKeyword.appendChild(createZWSTextNode(chunk));
				chunk = '';
				if (input[i] == '*') {
					var star = document.createElement('span');
					star.className = 'generator-star';
					star.appendChild(createZWSTextNode('*'));
					funcKeyword.appendChild(star);
				} else i--;
				codeBlock.appendChild(funcKeyword);
				var fname = document.createElement('span');
				fname.className = 'function-name';
				var comment = false,
					lineComment;
				while ((c = input[++i]) && (c != '(' || comment)) {
					if (!comment && c == '/' && input[i + 1] == '*') {
						fname.appendChild(createZWSTextNode(chunk));
						chunk = c + input[++i];
						comment = document.createElement('span');
						comment.className = 'inline-comment';
						lineComment = false;
					} else if (!comment && c == '/' && input[i + 1] == '/') {
						fname.appendChild(createZWSTextNode(chunk));
						chunk = c + input[++i];
						comment = document.createElement('span');
						comment.className = 'inline-comment';
						lineComment = true;
					} else if (!lineComment && c == '\n') {
						(fname || comment).appendChild(createZWSTextNode(chunk + '\n'));
						chunk = '';
						var linenum = document.createElement('span');
						linenum.className = 'line';
						linenum.dataset.linenum = ++line;
						(fname || comment).appendChild(linenum);
					} else if (comment && !lineComment && input.substr(i, 2) == '*/') {
						comment.appendChild(createZWSTextNode(chunk + '*/'));
						chunk = '';
						fname.appendChild(comment);
						comment = false;
						i++;
					} else if (lineComment && c == '\n') {
						comment.appendChild(createZWSTextNode(chunk));
						chunk = '';
						fname.appendChild(comment);
						comment = lineComment = false;
						i--;
					} else chunk += c;
				}
				fname.appendChild(createZWSTextNode(chunk));
				codeBlock.appendChild(fname);
				chunk = '';
				if (input[i] != '(') {
					warnings.push([i, 'Arguments not found.']);
					i--;
				} else {
					var paren = document.createElement('span');
					paren.className = 'punctuation';
					paren.appendChild(createZWSTextNode('('));
					codeBlock.appendChild(paren);
					while ((c = input[++i]) && c != ')') {
						if (c == '/') break;
						if (c == ',') {
							var arg = document.createElement('span');
							arg.className = 'argument';
							arg.appendChild(createZWSTextNode(chunk));
							codeBlock.appendChild(arg);
							chunk = '';
							var comma = document.createElement('span');
							comma.className = 'punctuation';
							comma.appendChild(createZWSTextNode(','));
							codeBlock.appendChild(comma);
						} else chunk += c;
					}
					var arg = document.createElement('span');
					arg.className = 'argument';
					arg.appendChild(createZWSTextNode(chunk));
					codeBlock.appendChild(arg);
					chunk = '';
					if (c == '/') {
						i--;
					} else if (c) {
						var paren = document.createElement('span');
						paren.className = 'punctuation';
						paren.appendChild(createZWSTextNode(')'));
						codeBlock.appendChild(paren);
					} else {
						warnings.push([i, 'Unclosed argument list.']);
						i--;
					}
				}
			} else if (c == '(') {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var lastChunk = codeBlock.lastChild.nodeValue;
				if (lastChunk) {
					var call = codeBlock.lastChild.splitText(Math.max(lastChunk.lastIndexOf(' '), lastChunk.lastIndexOf('\t'), lastChunk.lastIndexOf('\n'), 0));
					var callspan = document.createElement('span');
					callspan.className = 'function-call';
					callspan.appendChild(call);
					codeBlock.appendChild(callspan);
				}
				var charspan = document.createElement('span');
				charspan.className = 'punctuation';
				charspan.appendChild(createZWSTextNode('('));
				codeBlock.appendChild(charspan);
				if (inVarDec[0]) inVarDec[0].parens++;
			} else if (input.substr(i, 2) == '=>') {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator';
				operator.appendChild(createZWSTextNode('=>'));
				codeBlock.appendChild(operator);
				i++;
			} else if (['++', '--', '*=', '/=', '%=', '+=', '-=', '&=', '|=', '^='].indexOf(input.substr(i, 2)) != -1) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator assigns';
				operator.appendChild(createZWSTextNode(input.substr(i, 2)));
				codeBlock.appendChild(operator);
				i++;
			} else if (input.substr(i, 4) == '>>>=') {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator assigns';
				operator.appendChild(createZWSTextNode(input.substr(i, 4)));
				codeBlock.appendChild(operator);
				i += 3;
			} else if (input.substr(i, 3) == '<<=' || input.substr(i, 3) == '>>=') {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator assigns';
				operator.appendChild(createZWSTextNode(input.substr(i, 3)));
				codeBlock.appendChild(operator);
				i += 2;
			} else if (input.substr(i, 3) == '===' || input.substr(i, 3) == '!==' || (input.substr(i, 3) == '>>>' && input[i + 3] != '=')) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator';
				operator.appendChild(createZWSTextNode(input.substr(i, 3)));
				codeBlock.appendChild(operator);
				i += 2;
			} else if (['<=', '>=', '==', '!=', '<<', '>>', '&&', '||'].indexOf(input.substr(i, 2)) != -1 && ['=', '<', '>'].indexOf(input[i + 2]) == -1) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator';
				operator.appendChild(createZWSTextNode(input.substr(i, 2)));
				codeBlock.appendChild(operator);
				i++;
			} else if ('?:+-*/%&|^!~'.indexOf(c) != -1) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var operator = document.createElement('span');
				operator.className = 'operator';
				operator.appendChild(createZWSTextNode(c));
				codeBlock.appendChild(operator);
			} else if (beforeWord && /\d/.test(c)) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var start = i;
				if (c == '0' && input[i + 1] != '.' && (c = input[++i])) {
					if (c.toLowerCase() == 'b') {
						while ('01'.indexOf(input[++i]) != -1);
					} else if (c.toLowerCase() == 'o') {
						while ('01234567'.indexOf(input[++i]) != -1);
					} else if (c.toLowerCase() == 'x') {
						while ('0123456789abcdefABCDEF'.indexOf(input[++i]) != -1);
					} else if (/[\d\w]/.test(c)) warnings.push([i, 'Bad number literal.']);
					var num = document.createElement('span');
					num.className = 'number';
					num.appendChild(createZWSTextNode(input.substring(start, i--)));
					codeBlock.appendChild(num);
				} else {
					while ('0123456789.'.indexOf(input[i]) != -1) i++;
					if ((input[i] || '').toLowerCase() == 'e') {
						i++;
						if ('+-'.indexOf(input[i]) != -1) i++;
						if ('0123456789'.indexOf(input[i]) == -1) warnings.push([i, 'No exponent found after "e".']);
						else i++;
						while ('0123456789.'.indexOf(input[i]) != -1) i++;
					}
					var num = document.createElement('span');
					num.className = 'number';
					num.appendChild(createZWSTextNode(input.substring(start, i)));
					codeBlock.appendChild(num);
					i--;
				}
			} else if ('=.,;)[]{}'.indexOf(c) != -1) {
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				var charspan = document.createElement('span');
				charspan.className = ({'=': 'equals', '.': 'dot'})[c] || 'punctuation';
				charspan.appendChild(createZWSTextNode(c));
				codeBlock.appendChild(charspan);
				if (inVarDec[0]) {
					if (Math.max(inVarDec[0].parens, inVarDec[0].brackets, inVarDec[0].braces) == 0) {
						if (c == '=') inVarDec[0].equals = true;
						if (c == ',') inVarDec[0].equals = false;
					}
					if (c == ')') {
						inVarDec[0].parens--;
						if (inVarDec[0].parens < 0) {
							warnings.push([i, 'Unexpected close paren, make sure you use a semicolon after a variable declaration.']);
							inVarDec.shift();
						}
					}
					if (c == '[') inVarDec[0].brackets++;
					if (c == ']') {
						inVarDec[0].brackets--;
						if (inVarDec[0].brackets < 0) {
							warnings.push([i, 'Unexpected close bracket, make sure you use a semicolon after a variable declaration.']);
							inVarDec.shift();
						}
					}
					if (c == '{') inVarDec[0].braces++;
					if (c == '}') {
						inVarDec[0].braces--;
						if (inVarDec[0].braces < 0) {
							warnings.push([i, 'Unexpected close brace, make sure you use a semicolon after a variable declaration.']);
							inVarDec.shift();
						}
					}
					if (c == ';') inVarDec.shift();
				}
			} else if (c == '\n') {
				codeBlock.appendChild(createZWSTextNode(chunk + '\n'));
				chunk = '';
				var linenum = document.createElement('span');
				linenum.className = 'line';
				linenum.dataset.linenum = ++line;
				codeBlock.appendChild(linenum);
			} else if (/\S/.test(c) && inVarDec[0] && !inVarDec[0].equals && Math.max(inVarDec[0].parens, inVarDec[0].brackets, inVarDec[0].braces) == 0) {
				var newvar;
				codeBlock.appendChild(createZWSTextNode(chunk));
				chunk = '';
				if (codeBlock.lastChild.className == 'newvar') newvar = codeBlock.lastChild;
				else {
					newvar = document.createElement('span');
					newvar.className = 'newvar';
				}
				newvar.appendChild(createZWSTextNode(c));
				codeBlock.appendChild(newvar);
			} else chunk += c;
		}
		codeBlock.appendChild(createZWSTextNode(chunk + '\xa0'));
		codeBlock.dataset.line = Math.floor(Math.log10(line));
		var lines = input.split('\n');
		for (var i = 0; i < warnings.length; i++) {
			var line = input.substr(0, warnings[i][0]).split('\n').length - 1,
				lineEl = codeBlock.getElementsByClassName('line')[line];
			lineEl.classList.add('warning');
			if (lineEl.title) lineEl.title += '\n';
			lineEl.title += 'Column ' + (warnings[i][0] - lines.slice(0, line).join('\n').length) + ': ' + warnings[i][1];
		}
	}
	function createZWSTextNode(input) {
		var text = '';
		for (var i = 0; i < input.length; i++) text += input[i] + '\u200B';
		return document.createTextNode(text);
	}
	function blink() {
		document.getElementById('caret').hidden ^= 1;
		blinkTimeout = setTimeout(blink, 500);
	}
	function soonHandleTAInput() {
		requestAnimationFrame(handleTAInput);
	}
	function taFocusHandler() {
		this.parentNode.classList.add('focused');
	}
	function taBlurHandler() {
		delete this.lastCursorPos;
		this.parentNode.classList.remove('focused');
		document.getElementById('caret').hidden = true;
		clearTimeout(blinkTimeout);
	}
	function jsKeypressHandler(e) {
		var oldSelectionStart = this.selectionStart;
		var pairChars = {};
		pairChars[40] = '()';
		pairChars[91] = '[]';
		pairChars[123] = '{}';
		var endChars = {};
		endChars[41] = ')';
		endChars[93] = ']';
		endChars[125] = '}';
		if (e.which == 13) {
			if (e.metaKey) return document.getElementById('title').dispatchEvent(new MouseEvent('click'));
			var cut = /[\n^]\s+$/.test(this.value.substr(0, oldSelectionStart)) ? 0 : (this.value.substr(0, oldSelectionStart).match(/[\t ]+$/) || '').length;
			this.value = this.value.substr(0, oldSelectionStart - cut) + this.value.substr(oldSelectionStart);
			oldSelectionStart = this.selectionStart = this.selectionEnd = oldSelectionStart - cut;
			var tabs = this.value.substr(0, oldSelectionStart)
				.split('\n')[this.value.substr(0, oldSelectionStart).split('\n').length - 1]
				.split('\t').length -
				(
					('{([:,'.indexOf(this.value[oldSelectionStart - 1]) + 1) ?
					0
					: (['}', ')', ']'].indexOf(this.value[oldSelectionStart]) == -1 ? 1 : 2)
				);
				this.value =
					this.value.substr(0, oldSelectionStart) + '\n' + '\t'.repeat(tabs) +
					(
						'{(['.indexOf(this.value[oldSelectionStart - 1]) == -1 || '{([])}'.indexOf(this.value[oldSelectionStart]) == -1 ? '' : '\n' + '\t'.repeat(tabs - 1)
					) + this.value.substr(oldSelectionStart);
			this.selectionEnd = this.selectionStart = ++oldSelectionStart + tabs;
			e.preventDefault();
		} else if (e.which == 34) {
			if (this.value[this.selectionStart] != '"') this.value = this.value.substr(0, this.selectionStart) + '""' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = ++oldSelectionStart;
			e.preventDefault();
		} else if (e.which == 39) {
			if (this.value[this.selectionStart] != "'") this.value = this.value.substr(0, this.selectionStart) + "''" + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = ++oldSelectionStart;
			e.preventDefault();
		} else if (pairChars[e.which]) {
			this.value = this.value.substr(0, this.selectionStart) + pairChars[e.which] + this.value.substr(this.selectionEnd);
			this.selectionEnd = ++oldSelectionStart;
			e.preventDefault();
		} else if (endChars[e.which] && this.value[this.selectionStart] == endChars[e.which] && this.selectionStart == this.selectionEnd) {
			this.selectionStart = ++this.selectionEnd;
			e.preventDefault();
		} else if (this.id != 'css' && e.which == 61 && /(draw|refresh) $/.test(this.value.substr(0, this.selectionStart))) {
			var tabs = this.value.substr(0, oldSelectionStart).split('\n')[this.value.substr(0, oldSelectionStart).split('\n').length - 1].split('\t').length;
			this.value = this.value.substr(0, this.selectionStart) + '= function() {\n' + '\t'.repeat(tabs) + '\n' + '\t'.repeat(tabs - 1) + '}' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = oldSelectionStart + 15 + tabs;
			e.preventDefault();
		} else if (this.id != 'css' && e.which == 116 && /func$/.test(this.value.substr(0, this.selectionStart))) {
			var tabs = this.value.substr(0, oldSelectionStart).split('\n')[this.value.substr(0, oldSelectionStart).split('\n').length - 1].split('\t').length;
			this.value = this.value.substr(0, this.selectionStart) + 'tion () {\n' + '\t'.repeat(tabs) + '\n' + '\t'.repeat(tabs - 1) + '}' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = oldSelectionStart + 5;
			e.preventDefault();
		} else if (e.which == 44) {
			this.value = this.value.substr(0, this.selectionStart) + ', ' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = oldSelectionStart + 2;
			e.preventDefault();
		} else if (this.id != 'css' && e.which == 58) {
			this.value = this.value.substr(0, this.selectionStart) + ': ' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = oldSelectionStart + 2;
			e.preventDefault();
		} else if (e.which == 125 && this.value[this.selectionStart - 1] == '\t') {
			this.value = this.value.substr(0, this.selectionStart - 1) + '}' + this.value.substr(this.selectionEnd);
			this.selectionEnd = this.selectionStart = oldSelectionStart;
			e.preventDefault();
		}
	}
	function taKeydownHandler(e) {
		if (e.which == 8 && this.selectionStart == this.selectionEnd) {
			if (
				(this.value[this.selectionStart - 1] == '"' && this.value[this.selectionStart] == '"') ||
				(this.value[this.selectionStart - 1] == "'" && this.value[this.selectionStart] == "'") ||
				(this.value[this.selectionStart - 1] == '(' && this.value[this.selectionStart] == ')') ||
				(this.value[this.selectionStart - 1] == '[' && this.value[this.selectionStart] == ']') ||
				(this.value[this.selectionStart - 1] == '{' && this.value[this.selectionStart] == '}')
			) {
				var oldSelectionStart = this.selectionStart;
				this.value = this.value.substr(0, this.selectionStart - 1) + this.value.substr(this.selectionStart + 1);
				this.selectionEnd = --oldSelectionStart;
				e.preventDefault();
			}
		}
	}
	function run() {
		var lines = code.value.split('\n');
		for (var i = 0; i < lines.length; i++) {
			if (navigator.userAgent.indexOf('Mobile') == -1 && lines[i].indexOf('requestEnableFullScreen;') == 0) {
				lines[i] = 'requestFullLayoutMode();' + lines[i].substr(25);
				if (navigator.userAgent.indexOf('Mobile') == -1 && !fullScreen) document.body.classList.add('fullscreen');
			}
		}
		var outputBlob = new Blob([
			'<!DOCTYPE html><html xmlns="http://www.w3.org/1999/xhtml"><head><title>Output frame</title></head><style>*{margin:0;max-width:100%;box-sizing:border-box}body{background:#000;color:#fff}#canvas{border:1px solid #fff;-webkit-user-select:none;-moz-user-select:none;cursor:default}#console{height:100px;background:#111;padding:4px;overflow:auto;margin-top:8px}button,canvas{display:block}button{margin-top:6px}</style><body><canvas id="canvas"></canvas><div id="console"></div><button onclick="location.reload()">Restart</button><script>' + html(canvasJS) + '\ntry{this.eval(' + html(JSON.stringify(lines.join('\n'))) + ')}catch (e){error(e)}</script></body></html>'
		], {type: 'application/xhtml+xml'});
		output.src = URL.createObjectURL(outputBlob);
	}
});