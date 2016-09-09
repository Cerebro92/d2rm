/* Utility function to open graph inmodal window and in large view*/
function openDialog(element,dialog_title,isModal, w, h, isResizable,isDraggable, okhandler){	
	
	$(function() {
			
		    $( element ).dialog({width: w,
			height:h,
			modal: isModal,
			resizable: isResizable,
			draggable: isDraggable,
			
			title: dialog_title,
			dialogClass: 'dlgfixed',
			position:"center",
			buttons: [
		    {
		      text: "OK",		     
		      click: function() {		    	 
		    	  try{
		    		  if(okhandler==null || typeof okhandler==='undefined'){
		    			  okhandler = null;
		    		  }else{
		    			  try{
		    				  okhandler = eval(okhandler) ; 
		    			  }catch(e){}
		    		  }
		    		 
			    	  if(okhandler!=null && typeof okhandler!=='undefined' && $.isFunction(okhandler)){
			    		  okhandler();	
			    	  }
		    	  }catch(e){} 
		        $( this ).dialog( "destroy" );
		      }
		    }
		  ],
		   
		  close: function() {
			  $( this ).dialog( "destroy" );
		  }
			});
		  });
		  $(".dlgfixed").center(false);
		  
		  $(".ui-widget-overlay").css("z-index",1099);
		  $(".dlgfixed").css("z-index",1100);
}



/* Utility function to open graph inmodal window and in large view*/
function openUrlInDialog(targetDiv, url,dialog_title,isModal, w, h, isResizable,isDraggable,okButton,extraButtons,unit){	
		if(unit==null || (unit.toLowerCase()!="pixel" && unit.toLowerCase()!="percent")){			
			unit = "pixel";
		}
		
		if(unit.toLowerCase()=="percent"){
			var dw = $(window).width();
			var dh = $(window).height();
			w_num = Number(""+w);
			h_num = Number(""+h);
			w_num_str = ""+w;
			h_num_str = ""+h;
			
			if(!isNaN(w_num) && w_num>0){
				w = Math.round(dw *(w/100))-10;
			}
			if($.trim(w_num_str.toLowerCase())=="auto"){
				w = Math.round(dw *(75/100))-10;
			}
			if(!isNaN(h_num) && h_num>0){
				h = Math.round(dh *(h/100))-10;
			}
			if($.trim(h_num_str.toLowerCase())=="auto"){
				h = Math.round(dh *(75/100))-10;
			}
		}
		
		if(unit.toLowerCase()=="pixel"){
			var dw = $(window).width();
			var dh = $(window).height();
			w_num = Number(""+w);
			h_num = Number(""+h);
			w_num_str = ""+w;
			h_num_str = ""+h;
			
			
			if($.trim(w_num_str.toLowerCase())=="auto"){
				w = Math.round(dw *(75/100))-10;
			}			
			if($.trim(h_num_str.toLowerCase())=="auto"){
				h = Math.round(dh *(75/100))-10;
			}
		}
		
		var dialogParams = {
							  width: w,
							  height:h,
							  modal: isModal,
							  resizable: isResizable,
							  draggable: isDraggable,
							  autoOpen: false,
							  title: dialog_title,
							  dialogClass: 'dlgfixed',
							  position:"center",			   
							  close: function() {
								  $( this ).dialog( "destroy" );
								  $( this ).html("");
								  
							  }
							};
		
		dialogParams.buttons= [];
		if(okButton){
			dialogParams.buttons.push({
									      text: "OK",
									      click: function() {
									        $( this ).dialog( "destroy" );
									        $( this ).html("");
									      }
									   });
					 
		}
		

		if(extraButtons!=null){
			try{
				if(extraButtons.length){
					for(var num = 0; num < extraButtons.length;i++){
						dialogParams.buttons.push(extraButtons[num]);
					}
				}
			}catch(e){}
		}
		
		
		var $dialog = $('#'+targetDiv).css("padding","0px").html('<iframe style="border: 1px solid #fff; width:100%; height:100%;" src="' + url + '" width="100%" height="100%"></iframe>')
		   .dialog(dialogParams);
		  
		  $dialog.dialog('open');
		  $(".dlgfixed").center(false);
		  
		  $(".ui-widget-overlay").css("z-index",1099);
		  $(".dlgfixed").css("z-index",1100);
}


$(document).ready(function(){
	
	try{ 
		 $("#selectedCluster").change(function(){
			 window.location.href = "onChangeCluster?selectedCluster="+$("#selectedCluster option:selected").val();
		 });
	}catch(e){}
	
	try{ 
		$("#createClusterBtn").click(function(){
			//cDialog is a empty div referred in topmenu.jsp
		   openUrlInDialog('cDialog',AppJS.getConstant('contextPath')+'/start-cluster-creation','Create Cluster',true,85,95,false,false,false,null,'percent');
		});
	}catch(e){} 
	
	
	
});