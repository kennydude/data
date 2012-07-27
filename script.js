var inEditMode = true;

function setEModeStyle(s){
	$("#eMode").remove();
	$("<style>").attr("id", "eMode").html(s).appendTo($("head"));
}

function toggleEditMode(){
	inEditMode = !inEditMode;
	if(inEditMode){
		$(".editMode").addClass("active");
		setEModeStyle('.noneditmode{ display: none !important; }');
		$("body").addClass("editmode");
	} else{
		$(".editMode").removeClass("active");
		setEModeStyle('.editmode{ display: none !important; }');
		$(".columneditbox").each(function(){
			$("span", $(this).parent()).html($(this).val());
		});
		$("body").show().removeClass("editmode");
	}
}

function doEvents(){
	$(".add-to-encode").click(function(){
		$("#enter").val( $("#enter").val() + "{{ " + $("input", $(this).parent()).val() + " }}" ).focus();
	}).css("cursor", "pointer");
}

var cellTemplate = "<input type='text' value='{{ name }}' class='editmode columneditbox' /><span class='noneditmode'>{{ name }}</span>";
var columnTemplate = cellTemplate + '<i class="icon-plus-sign add-to-encode noneditmode"></i>';

$(document).ready(function(){ setTimeout( start, 400 ); });

function start(){
	if($("#rawcode").length == 0){ return; }
	var obj = $.parseJSON($("#rawcode").hide().text());

	$(".export").click(function(){
		$("#exportModal").modal("show");
		var output = { "fields" : [], "data" : [] };

		$(".datahead.top th.header").each( function(){
			output.fields[output.fields.length] = $(this).text();
		});
		
		$("#body tr.entry").each( function(){
			var myrow = [];
			$("td span", this).each(function(){
				myrow[myrow.length] = $(this).text();
			});
			output.data[output.data.length] = myrow;
		});
		output = formatJson( JSON.stringify(output) );
		$("#exportContent").html(output);
		$(".exportFile").attr("href", "data:text/plain;base64," + base64_encode( output ) );
	});	
	
	toggleEditMode();
	$(".editMode").click(toggleEditMode);
	$(".closeEditMode").click(toggleEditMode);
	$(".addNewColumn").click(function(){
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
	$("#newRowCell").click(function(){
		t = $("<tr class='entry'>").insertBefore(".newrow");
		$(".datahead.top th.header").each(function(){
			ar = {"name": ""};
			$("<td>").html(Mustache.render(cellTemplate, ar)).appendTo(t);
		});
	});
	
	$.each(obj.fields, function(i){
		field = obj.fields[i];
		ar = { "name" : field };
		t = $("<th class='header'>").html(Mustache.render(columnTemplate, ar)).insertBefore(".datahead .addNewColumn");
		$("#newRowCell").attr("colspan", $("#newRowCell").attr("colspan")+1);
	});

	$.each(obj.data, function(i){
		d = obj.data[i];
		row = $("<tr class='entry'>").insertBefore(".newrow");
		$.each(d, function(i2){
			item = d[i2];
			ar = {"name" : item};
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
			$(".datahead.top th.header").each( function(index){
				item = $($("td", row).get(index)).text();
				da[ $(this).text() ] = item;

				console.log(index, row, $(this).text(), item);
			});
			output = output += Mustache.render($("#enter").val(), da) + "\n";
		});
		$("#output").html(output);
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
