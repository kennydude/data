$(document).ready(function(){
	if($("#rawcode").length == 0){ return; }
	var obj = $.parseJSON($("#rawcode").hide().text());

	$.each(obj.fields, function(i){
		field = obj.fields[i];
		t = $("<th>").html(field).appendTo(".datahead");
		$('<i class="icon-plus-sign">').attr("title", "Add to encode box").css("cursor", "pointer").click(function(){
			$("#enter").val( $("#enter").val() + "{{ " + $(this).data("field") + " }}" ).focus();
		}).data("field", field).appendTo(t);
	});

	$.each(obj.data, function(i){
		d = obj.data[i];
		row = $("<tr>").appendTo("#body");
		$.each(d, function(i2){
			item = d[i2];
			$("<td>").html(item).appendTo(row);
		});

	});

	$("#go").click(function(){
		$("#output").html("");
		output = "";
		$.each(obj.data, function(i){
			d = obj.data[i];
			da = {};
			$.each(d, function(i2){
				item = d[i2];
				da[ obj.fields[i2] ] = item;
			});
			output = output += Mustache.render($("#enter").val(), da) + "\n";
		});
		$("#output").html(output);
	});
});
