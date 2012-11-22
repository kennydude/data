function SimpleModal(opt){
	addButton = function(btn, cls){
		return $("<a>").addClass("btn " + cls).html(btn).appendTo("#simpleModal .simple-modal-footer");
	};

	opt = $.extend({
		"width" : 400,
		"closeButton" : true,
		"btn_ok" : "OK",
		"btn_cancel" : "Cancel",
		"onOkay" : function(){}
	}, opt);

	$("#simpleModal").html('<div class="simple-modal-header"><h1 class="title">{_TITLE_}</h1></div>' + 
							'<div class="simple-modal-body"><div class="contents">{_CONTENTS_}</div></div>' +
							'<div class="simple-modal-footer"></div>');

	$("#simpleModal").show().css("opacity", "1").css("width", opt.width  +"px");
	$("#simpleModal .title").html(opt['title']);
	$("#simpleModal .contents").html(opt.contents+"");
	$("#simple-modal-overlay").show().animate({ "opacity" : 0.3 }, 300);

	if(opt.closeButton == true){
		$("<a>").addClass("close").attr("href", "#").html("x").prependTo("#simpleModal").on("click", hideSimpleModal);
	}
	$("#simpleModal").css("top", "50px")
					 .css("left", (($(window).width() / 2) - ($("#simpleModal").width()/2)) + "px");

	switch( opt.model ){
		case "confirm":
			addButton(opt.btn_ok, "primary btn-margin");
			addButton(opt.btn_cancel, "secondary");
			break;
		default:
			addButton(opt.btn_ok, "primary").on("click", function(){ hideSimpleModal(); opt.onOkay(); });
	}
}
function hideSimpleModal(){
	$(".simple-modal, #simple-modal-overlay").animate({ "opacity" : 0 }, 300, function(){
		$(".simple-modal, #simple-modal-overlay").hide();
	});
}

$(document).ready(function(){
	$("#simple-modal-overlay").hide().css("display", "none").on("click", function(){
		hideSimpleModal();
	});
	$(window).on("resize", function(){
		$("#simpleModal").css("top", "50px")
						 .css("left", (($(window).width() / 2) - ($("#simpleModal").width()/2)) + "px");
	});
});