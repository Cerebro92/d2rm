function hostDetail(refreshTime) {
	refreshHostDetails();
	setInterval(refreshHostDetails,refreshTime);

}

function refreshHostDetails() {
				$('#hostdetails').dataTable({
        		"sSearch": false,
				"bScrollCollapse": true,
				"bProcessing": true,
				"bStateSave": true,
				"bServerSide": true,
				"bDestroy": true,
				"sPaginationType":"bootstrap",
				"bFilter": false, 
				"bInfo": true,
				"sAjaxSource":  AppJS.getConstant("contextPath")+"/getAllHost",
				
				"sPaginationType": "full_numbers",
				"aaSorting": [[ 0, "asc" ]],
				"oLanguage": {
						"sLengthMenu": "Page length: _MENU_",
						"sZeroRecords": "No matching records found"
				},
				
				"fnServerData": function ( sSource, aaData, fnCallback ) 
					{
							aaData.push({
									servicecomponent: "host-component"
							        }
							);
				$.ajax({"dataType": 'JSON',
						"type": "POST",
						"url": sSource,
						"data": aaData,
						"success": function(json){
								console.log(json);
								fnCallback(json);
							} 
						});
				}

        });
}

function getRequestType(){
	
	$.ajax( {
		Type : "GET",
		url : "/edb-adminconsole/proxy-api",
		data:{api:"/clusters/"+currentCluster+"/services/HDFS/component/SERVICE_TYPE"},
		jsonpCallback: 'theCallBack78',
		timeout:30000,	   
	    success: function(json) {
	    	jsonData = JSON.parse(json);
	    	
	    },
	    error: function(jXHR,textStatus) {
	       console.log(textStatus);
	       //alert(e);
	    }
	});
}




function getRequestStartTime(){
	
	$.ajax( {
		Type : "GET",
		url : "/edb-adminconsole/proxy-api",
		data:{api:"/clusters/"+currentCluster+"/services/HDFS/component/SERVICE_START_TIME"},
		jsonpCallback: 'theCallBack79',
		timeout:30000,	   
	    success: function(json) {
	    	jsonData = JSON.parse(json);
	    	
	    },
	    error: function(jXHR,textStatus) {
	       console.log(textStatus);
	       //alert(e);
	    }
	});
}

function getRequestStatus(){
	
	$.ajax( {
		Type : "GET",
		url : "/edb-adminconsole/proxy-api",
		data:{api:"/clusters/"+currentCluster+"/services/HDFS/component/SERVICE_STATUS"},
		jsonpCallback: 'theCallBack78',
		timeout:30000,	   
	    success: function(json) {
	    	jsonData = JSON.parse(json);
	    	
	    },
	    error: function(jXHR,textStatus) {
	       console.log(textStatus);
	       //alert(e);
	    }
	});
}




