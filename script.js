var inEditMode = true;

function setEModeStyle(s){
	$("#eMode").remove();
	$("<style>").attr("id", "eMode").html(s).appendTo($("head"));
}

function goodbye(e) {
	if(!inEditMode) return;
	
	return "You are in Edit Mode. You may loose your changes";
}
window.onbeforeunload=goodbye;

function toggleEditMode(){
	inEditMode = !inEditMode;
	if(inEditMode){
		$(".editMode").addClass("success");
		setEModeStyle('.noneditmode{ display: none !important; }');
		$("body").addClass("editmode");
	} else{
		$(".editMode").removeClass("success");
		setEModeStyle('.editmode{ display: none !important; }');
		$(".columneditbox").each(function(){
			$("span", $(this).parent()).html($(this).val());
		});
		$("body").show().removeClass("editmode");
	}
}

function doAdvModal(){
    new SimpleModal( {
        "title" : "Advanced Edit",
        "contents" : $("#advModModal").html(),
        "btn_ok" : "Save",
        "onOkay" : function(){
            console.log("onokay");
            data = applyFilter( $("#simpleModal .advModScript").val(), $("#simpleModal").data("column") );
            for(k in data){
                ar = {"name" : data[k]};
                $($("td",$("#body tr.entry").get(k)).get( $("#simpleModal").data("column") )).html(Mustache.render(cellTemplate, ar));
            }
            //$("#simpleModal #advModModal").modal("hide");
        }
    });
    $("#simpleModal").data("column", $(".datahead.top th").index($(this).parent().get(0)) );

    $("#simpleModal .advModExample").on("click", function(){
        $("#simpleModal .advModScript").val('value = value + " that\'s funny";');
    });
    $("#simpleModal .advModTest").on("click", function(){
        data = collectColumn( $("#simpleModal").data("column") );
        output = "";
        newdata = applyFilter( $("#simpleModal .advModScript").val(), $("#simpleModal").data("column") );
        for(k in data){
            output += data[k] + " => " + newdata[k] + "\n";
        }
        $("#simpleModal .advTestArea").html( output );
    });
}

function doEvents(){
	$(".add-to-encode").click(function(){
		$("#enter").val( $("#enter").val() + "{{ " + $("input", $(this).parent()).val() + " }}" ).focus();
	}).css("cursor", "pointer");
	$(".datahead.top .icon-filter").click(doAdvModal);
	$(".datahead.bottom .icon-filter").click(doAdvModal);
	$(".datahead.top input").on("keyup", function(){
		$( $(".datahead.bottom input").get( $(".datahead.top th").index( $(this).parent() ) )).val($(this).val());
	});
	$(".datahead.bottom input").on("keyup", function(){
		$( $(".datahead.top input").get( $(".datahead.bottom th").index( $(this).parent() ) )).val($(this).val());
	});
}

function collectColumn(column){
	data = [];
	$("#body tr.entry").each(function(){
		data[data.length] = $($("td", this).get(column)).text();
	});
	return data;
}

function applyFilter(filter, column){
	data = collectColumn(column);
	outdata = [];
	var sortFunc = new Function("value", filter  + ";return value;");
	for(k in data){
		v = data[k];
		v = sortFunc(v);
		outdata[k] = v;
	}
	return outdata;
}

var cellTemplate = "<input type='text' value='{{ name }}' class='editmode columneditbox' /><span class='gone value'>{{ name }}</span><span class='noneditmode'>{{& display }}</span>";
var columnTemplate = cellTemplate + '<img src="img/add.png" class="add-to-encode noneditmode img" /><img class="editmode icon-filter img" src="img/filter.png" style="cursor:pointer" title="Advanced Edit" />';

setTimeout( start, 400 );

function start(){
    $(".editmode").removeClass("hide");
	if($("#rawcode").size() == 0){ return; }
    $("#rawcode").addClass("hide");
	var obj = JSON.parse($("#rawcode").html());

	$(".export").on("click", function(){
		new SimpleModal({ "title" : "Export", "contents" : $("#exportModal").html() });
		var output = { "fields" : [], "data" : [] };

		$(".datahead.top th.header").each( function(){
			output.fields[output.fields.length] = $(this).text();
		});
		
		$("#body tr.entry .value").each( function(){
			var myrow = [];
			$("td .value", this).each(function(){
				myrow[myrow.length] = $(this).text();
			});
			output.data[output.data.length] = myrow;
		});
		output = formatJson( JSON.stringify(output) );
		$("#simpleModal .exportContent").html(output);
		$(".exportFile").attr("href", "data:text/plain;base64," + base64_encode( output ) );
	});	
	
	toggleEditMode();
	$(".editMode").on("click", toggleEditMode);
	$(".closeEditMode").on("click", toggleEditMode);
	$(".addNewColumn").on("click", function(){
		ar = { "name" : "New" };
		t = $("<th class='header'>").html(Mustache.render(columnTemplate, ar)).insertBefore($(".datahead .addNewColumn"));
		i = $(".datahead").index(t);
		ar = { "name" : "" };
		
		n = $("<td class='entry'>").html(Mustache.render(cellTemplate, ar));
		if(i != 0){
			$("#body tr.entry").each(function(){
				n.clone().insertAfter( $("td", this).get(i) );
			});
		} else{ n.prependTo("#body tr.entry"); }
		$("#newRowCell").attr("colspan", $("#newRowCell").attr("colspan")+1);
		doEvents();
	});
	$("#newRowCell").on("click", function(){
		t = $("<tr class='entry'>").insertBefore(".newrow");
		$(".datahead.top th.header").each(function(){
			ar = {"name": "","display":""};
			$("<td>").html(Mustache.render(cellTemplate, ar)).appendTo(t);
		});
	});
	
	$.each(obj.fields, function(i){
        field = obj.fields[i];
		ar = { "name" : field, "display" : htmlentities(field) };
		t = $("<th class='header'>").html(Mustache.render(columnTemplate, ar)).insertBefore(".datahead .addNewColumn");
		$("#newRowCell").attr("colspan", $("#newRowCell").attr("colspan")+1);
	});

    if(obj['display'] == undefined){
        obj['display'] = {};
    }

	$.each(obj.data, function(i){
		d = obj.data[i];
		row = $("<tr class='entry'>").insertBefore(".newrow");
		$.each(d, function(i2){
			item = d[i2];
            display = item;
            if( obj['display'][ obj.fields[i2] ] != undefined ){
                display_opt = obj['display'][ obj.fields[i2] ];
                if(display_opt['display'] == "list"){
                    d = item.split( display_opt['sep'] );
                    display = "";
                    d.forEach(function(x){
                        display += "<span class='label'>" + x + "</span> ";
                    });
                }
            }
			ar = {"name" : item,"display": display };
			$("<td>").html(Mustache.render(cellTemplate, ar)).appendTo(row);
		});
	});
	doEvents();

	$("#go").click(function(){
		$("#output").html("");
		var output = "";
		$("#body tr.entry").each( function(){
			da = {};
			var row = $(this);
			$(".datahead.top th.header .value").each( function(index){
				item = $(".value", $("td", row).get(index)).text();
				da[ $(this).text() ] = item;

				console.log(index, row, $(this).text(), item);
			});
			output = output += Mustache.render($("#enter").val(), da) + "\n";
		});
		$("#output").html(output);
		$(".saveFormatted").show().attr("href", "data:text/plain;base64," + base64_encode( output ) );
	});
	$(".pleasewait").hide();
}

// From JSONLint.com
// https://github.com/umbrae/jsonlintdotcom/blob/master/c/js/jsl.format.js
    function repeat(s, count) {
        return new Array(count + 1).join(s);
    }

    function formatJson(json) {
        var i           = 0,
            il          = 0,
            tab         = "    ",
            newJson     = "",
            indentLevel = 0,
            inString    = false,
            currentChar = null;

        for (i = 0, il = json.length; i < il; i += 1) { 
            currentChar = json.charAt(i);

            switch (currentChar) {
            case '{': 
            case '[': 
                if (!inString) { 
                    newJson += currentChar + "\n" + repeat(tab, indentLevel + 1);
                    indentLevel += 1; 
                } else { 
                    newJson += currentChar; 
                }
                break; 
            case '}': 
            case ']': 
                if (!inString) { 
                    indentLevel -= 1; 
                    newJson += "\n" + repeat(tab, indentLevel) + currentChar; 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ',': 
                if (!inString) { 
                    newJson += ",\n" + repeat(tab, indentLevel); 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ':': 
                if (!inString) { 
                    newJson += ": "; 
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ' ':
            case "\n":
            case "\t":
                if (inString) {
                    newJson += currentChar;
                }
                break;
            case '"': 
                if (i > 0 && json.charAt(i - 1) !== '\\') {
                    inString = !inString; 
                }
                newJson += currentChar; 
                break;
            default: 
                newJson += currentChar; 
                break;                    
            } 
        } 

        return newJson; 
    }

function base64_encode (data) {
    // Encodes string using MIME base64 algorithm  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/base64_encode
    // +   original by: Tyler Akins (http://rumkin.com)
    // +   improved by: Bayron Guevara
    // +   improved by: Thunder.m
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   bugfixed by: Pellentesque Malesuada
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Rafał Kukawski (http://kukawski.pl)
    // -    depends on: utf8_encode
    // *     example 1: base64_encode('Kevin van Zonneveld');
    // *     returns 1: 'S2V2aW4gdmFuIFpvbm5ldmVsZA=='
    // mozilla has this native
    // - but breaks in 2.0.0.12!
    //if (typeof this.window['atob'] == 'function') {
    //    return atob(data);
    //}
    var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
        ac = 0,
        enc = "",
        tmp_arr = [];
 
    if (!data) {
        return data;
    }
 
    data = this.utf8_encode(data + '');
 
    do { // pack three octets into four hexets
        o1 = data.charCodeAt(i++);
        o2 = data.charCodeAt(i++);
        o3 = data.charCodeAt(i++);
 
        bits = o1 << 16 | o2 << 8 | o3;
 
        h1 = bits >> 18 & 0x3f;
        h2 = bits >> 12 & 0x3f;
        h3 = bits >> 6 & 0x3f;
        h4 = bits & 0x3f;
 
        // use hexets to index into b64, and append result to encoded string
        tmp_arr[ac++] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    } while (i < data.length);
 
    enc = tmp_arr.join('');
    
    var r = data.length % 3;
    
    return (r ? enc.slice(0, r - 3) : enc) + '==='.slice(r || 3);
}

function htmlentities (string, quote_style, charset, double_encode) {
  // http://kevin.vanzonneveld.net
  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   improved by: nobbler
  // +    tweaked by: Jack
  // +   bugfixed by: Onno Marsman
  // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +    bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Ratheous
  // +   improved by: Rafał Kukawski (http://blog.kukawski.pl)
  // +   improved by: Dj (http://phpjs.org/functions/htmlentities:425#comment_134018)
  // -    depends on: get_html_translation_table
  // *     example 1: htmlentities('Kevin & van Zonneveld');
  // *     returns 1: 'Kevin &amp; van Zonneveld'
  // *     example 2: htmlentities("foo'bar","ENT_QUOTES");
  // *     returns 2: 'foo&#039;bar'
  var hash_map = this.get_html_translation_table('HTML_ENTITIES', quote_style),
    symbol = '';
  string = string == null ? '' : string + '';

  if (!hash_map) {
    return false;
  }

  if (quote_style && quote_style === 'ENT_QUOTES') {
    hash_map["'"] = '&#039;';
  }

  if (!!double_encode || double_encode == null) {
    for (symbol in hash_map) {
      if (hash_map.hasOwnProperty(symbol)) {
        string = string.split(symbol).join(hash_map[symbol]);
      }
    }
  } else {
    string = string.replace(/([\s\S]*?)(&(?:#\d+|#x[\da-f]+|[a-zA-Z][\da-z]*);|$)/g, function (ignore, text, entity) {
      for (symbol in hash_map) {
        if (hash_map.hasOwnProperty(symbol)) {
          text = text.split(symbol).join(hash_map[symbol]);
        }
      }

      return text + entity;
    });
  }

  return string;
}

function utf8_encode (argString) {
    // Encodes an ISO-8859-1 string to UTF-8  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/utf8_encode
    // +   original by: Webtoolkit.info (http://www.webtoolkit.info/)
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: sowberry
    // +    tweaked by: Jack
    // +   bugfixed by: Onno Marsman
    // +   improved by: Yves Sucaet
    // +   bugfixed by: Onno Marsman
    // +   bugfixed by: Ulrich
    // +   bugfixed by: Rafal Kukawski
    // *     example 1: utf8_encode('Kevin van Zonneveld');
    // *     returns 1: 'Kevin van Zonneveld'
    if (argString === null || typeof argString === "undefined") {
        return "";
    }
 
    var string = (argString + ''); // .replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    var utftext = "",
        start, end, stringl = 0;
 
    start = end = 0;
    stringl = string.length;
    for (var n = 0; n < stringl; n++) {
        var c1 = string.charCodeAt(n);
        var enc = null;
 
        if (c1 < 128) {
            end++;
        } else if (c1 > 127 && c1 < 2048) {
            enc = String.fromCharCode((c1 >> 6) | 192) + String.fromCharCode((c1 & 63) | 128);
        } else {
            enc = String.fromCharCode((c1 >> 12) | 224) + String.fromCharCode(((c1 >> 6) & 63) | 128) + String.fromCharCode((c1 & 63) | 128);
        }
        if (enc !== null) {
            if (end > start) {
                utftext += string.slice(start, end);
            }
            utftext += enc;
            start = end = n + 1;
        }
    }
 
    if (end > start) {
        utftext += string.slice(start, stringl);
    }
 
    return utftext;
}
function get_html_translation_table (table, quote_style) {
  // http://kevin.vanzonneveld.net
  // +   original by: Philip Peterson
  // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
  // +   bugfixed by: noname
  // +   bugfixed by: Alex
  // +   bugfixed by: Marco
  // +   bugfixed by: madipta
  // +   improved by: KELAN
  // +   improved by: Brett Zamir (http://brett-zamir.me)
  // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
  // +      input by: Frank Forte
  // +   bugfixed by: T.Wild
  // +      input by: Ratheous
  // %          note: It has been decided that we're not going to add global
  // %          note: dependencies to php.js, meaning the constants are not
  // %          note: real constants, but strings instead. Integers are also supported if someone
  // %          note: chooses to create the constants themselves.
  // *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
  // *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
  var entities = {},
    hash_map = {},
    decimal;
  var constMappingTable = {},
    constMappingQuoteStyle = {};
  var useTable = {},
    useQuoteStyle = {};

  // Translate arguments
  constMappingTable[0] = 'HTML_SPECIALCHARS';
  constMappingTable[1] = 'HTML_ENTITIES';
  constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
  constMappingQuoteStyle[2] = 'ENT_COMPAT';
  constMappingQuoteStyle[3] = 'ENT_QUOTES';

  useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
  useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

  if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
    throw new Error("Table: " + useTable + ' not supported');
    // return false;
  }

  entities['38'] = '&amp;';
  if (useTable === 'HTML_ENTITIES') {
    entities['160'] = '&nbsp;';
    entities['161'] = '&iexcl;';
    entities['162'] = '&cent;';
    entities['163'] = '&pound;';
    entities['164'] = '&curren;';
    entities['165'] = '&yen;';
    entities['166'] = '&brvbar;';
    entities['167'] = '&sect;';
    entities['168'] = '&uml;';
    entities['169'] = '&copy;';
    entities['170'] = '&ordf;';
    entities['171'] = '&laquo;';
    entities['172'] = '&not;';
    entities['173'] = '&shy;';
    entities['174'] = '&reg;';
    entities['175'] = '&macr;';
    entities['176'] = '&deg;';
    entities['177'] = '&plusmn;';
    entities['178'] = '&sup2;';
    entities['179'] = '&sup3;';
    entities['180'] = '&acute;';
    entities['181'] = '&micro;';
    entities['182'] = '&para;';
    entities['183'] = '&middot;';
    entities['184'] = '&cedil;';
    entities['185'] = '&sup1;';
    entities['186'] = '&ordm;';
    entities['187'] = '&raquo;';
    entities['188'] = '&frac14;';
    entities['189'] = '&frac12;';
    entities['190'] = '&frac34;';
    entities['191'] = '&iquest;';
    entities['192'] = '&Agrave;';
    entities['193'] = '&Aacute;';
    entities['194'] = '&Acirc;';
    entities['195'] = '&Atilde;';
    entities['196'] = '&Auml;';
    entities['197'] = '&Aring;';
    entities['198'] = '&AElig;';
    entities['199'] = '&Ccedil;';
    entities['200'] = '&Egrave;';
    entities['201'] = '&Eacute;';
    entities['202'] = '&Ecirc;';
    entities['203'] = '&Euml;';
    entities['204'] = '&Igrave;';
    entities['205'] = '&Iacute;';
    entities['206'] = '&Icirc;';
    entities['207'] = '&Iuml;';
    entities['208'] = '&ETH;';
    entities['209'] = '&Ntilde;';
    entities['210'] = '&Ograve;';
    entities['211'] = '&Oacute;';
    entities['212'] = '&Ocirc;';
    entities['213'] = '&Otilde;';
    entities['214'] = '&Ouml;';
    entities['215'] = '&times;';
    entities['216'] = '&Oslash;';
    entities['217'] = '&Ugrave;';
    entities['218'] = '&Uacute;';
    entities['219'] = '&Ucirc;';
    entities['220'] = '&Uuml;';
    entities['221'] = '&Yacute;';
    entities['222'] = '&THORN;';
    entities['223'] = '&szlig;';
    entities['224'] = '&agrave;';
    entities['225'] = '&aacute;';
    entities['226'] = '&acirc;';
    entities['227'] = '&atilde;';
    entities['228'] = '&auml;';
    entities['229'] = '&aring;';
    entities['230'] = '&aelig;';
    entities['231'] = '&ccedil;';
    entities['232'] = '&egrave;';
    entities['233'] = '&eacute;';
    entities['234'] = '&ecirc;';
    entities['235'] = '&euml;';
    entities['236'] = '&igrave;';
    entities['237'] = '&iacute;';
    entities['238'] = '&icirc;';
    entities['239'] = '&iuml;';
    entities['240'] = '&eth;';
    entities['241'] = '&ntilde;';
    entities['242'] = '&ograve;';
    entities['243'] = '&oacute;';
    entities['244'] = '&ocirc;';
    entities['245'] = '&otilde;';
    entities['246'] = '&ouml;';
    entities['247'] = '&divide;';
    entities['248'] = '&oslash;';
    entities['249'] = '&ugrave;';
    entities['250'] = '&uacute;';
    entities['251'] = '&ucirc;';
    entities['252'] = '&uuml;';
    entities['253'] = '&yacute;';
    entities['254'] = '&thorn;';
    entities['255'] = '&yuml;';
  }

  if (useQuoteStyle !== 'ENT_NOQUOTES') {
    entities['34'] = '&quot;';
  }
  if (useQuoteStyle === 'ENT_QUOTES') {
    entities['39'] = '&#39;';
  }
  entities['60'] = '&lt;';
  entities['62'] = '&gt;';


  // ascii decimals to real symbols
  for (decimal in entities) {
    if (entities.hasOwnProperty(decimal)) {
      hash_map[String.fromCharCode(decimal)] = entities[decimal];
    }
  }

  return hash_map;
}