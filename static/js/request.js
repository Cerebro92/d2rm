// JavaScript Document
(function ($) {
  $.requestTrackerAjax = function(parameters){	
	this.error = false;
	this.firstRun = true;
	var defaults = {  
			  /*Target container where all requests will be added/updated to ui. Make sense if canUpdateUI = true.*/
			  targetContainer: null,
			  /* requestID may be null if you need to manage all requests,
			  	 may be a single request id as string,
				 or may be multiple request ids in form of array.
			  */
			  requestID : null, 			  
			  checkForNew: true,
			  statusUpdateToUI: true,
			  updateInterval : 7000,
			  callbackFunction:null /* function reference to receive request responses, to do some decision making or update ui by self.*/
	};
	this.requestIDsForIndexing =[];
	this.requests =[]; /* All request responses received yet resides in.*/
	this.newlyAddedReqID =[];
	this.statusIconCss = {failure:"glyphicon glyphicon-off",success:"glyphicon glyphicon-ok",timeout:"glyphicon glyphicon-time",unknown:"glyphicon glyphicon-off",inprogress:"glyphicon glyphicon-flag",initiated:"glyphicon glyphicon-flag"};
	this.getDefaults =function(){ return defaults;};	
    this.params = $.extend(defaults,parameters);
	this.reqLastTimestamp = 0;
	this.maxTimesToCheckIfRequestIsTimeout = 10;
	this.me = this;
	this.validateParams();	
	this.ajaxToGetRequests();	
};

$.requestTrackerAjax.prototype.isParamSet = function(param){
	return !(this.params[param] === null || typeof this.params[param] === 'undefined')
};

$.requestTrackerAjax.prototype.validateParams = function() {

	if(this.params['targetContainer'] == null || typeof this.params['targetContainer'] === 'undefined' || $.trim(this.params['targetContainer'])==""){
	 this.params['targetContainer']=null;
	}
	
	if(this.params['requestID'] == null || typeof this.params['requestID'] == 'undefined'){
		this.params['requestID']=null;
	}else{
		
		if(Object.prototype.toString.call(this.params['requestID']) === '[object Array]' && this.params['requestID'].length ==0) {
			this.params['requestID']=null;
			this.params.fetchRequests = "all";
		}else if(Object.prototype.toString.call(this.params['requestID']) === '[object Array]' && this.params['requestID'].length ==1){
			this.params.fetchRequests = "single";		
		}else if(Object.prototype.toString.call(this.params['requestID']) === '[object Array]' && this.params['requestID'].length >1){
			this.params.fetchRequests = "multiple";		
		}
		
		if(Object.prototype.toString.call(this.params['requestID']) === '[object String]' && $.trim(this.params['requestID']).length == 0) {
			this.params['requestID']=null;
			this.params.fetchRequests = "all";
		}else if (Object.prototype.toString.call(this.params['requestID']) === '[object String]' && $.trim(this.params['requestID']).length>0){
			this.params['requestID'] = [this.params['requestID']];
			this.params.fetchRequests = "single";			
		}
	}
	
	if(this.params.requestID == null){
		this.params.fetchRequests = "all";		
	}
	
	if(this.params.fetchRequests!="all"){
		this.checkForNew = false;
	}
			  
};

$.requestTrackerAjax.prototype.getActiveRequest = function(reqIDOnly) {
	if(reqIDOnly == null || typeof reqIDOnly === 'undefined'){
		reqIDOnly = true;
	}
	var filteredRequests = [];	
	filteredRequests = $.grep(this.requests, function(e){ return e.status != "Success" && e.status != "Failure"  && e.status != "Unknown"; });
	
	if(filteredRequests.length>0){
		var lstID = [];
		for(c=0; c<filteredRequests.length; c++){
			lstID.push(filteredRequests[c].requestID);
		}
		return lstID.join(",");
	}
	return filteredRequests;
};

$.requestTrackerAjax.prototype.extractData = function(jData){	
	this.newlyAddedReqID =[];
	var rObj;
	var hasChild;
	if(AppJS.readValueInObject(jData,"content.RequestResource",null)== null && AppJS.readValueInObject(jData,"content.requestID",null)!=null){
	 	rObj = AppJS.readValueInObject(jData,"content",null);
		
		hasChild = false;
		if(rObj!=null){
			var keyCounter = 0;
			for(var ky in rObj.childRequest){
				keyCounter++;
				break;
			}
			hasChild = (keyCounter > 0) ? true : false;
			if(hasChild){
				for(var ky in rObj.childRequest){
					this.setRequestData(rObj.childRequest[ky]);
				}
			}else{				
				this.setRequestData(rObj);
			}
		}		
	}
	
	if(AppJS.readValueInObject(jData,"content.RequestResource",null)!= null){
		var listOfRequest = AppJS.readValueInObject(jData,"content.RequestResource",[]);
		
		if(listOfRequest.length>0){
			for(var ctr = 0; ctr<listOfRequest.length; ctr++){
				rObj = listOfRequest[ctr];
				hasChild = false;
				if(rObj!=null){
					var keyCounter = 0;
					for(var ky in rObj.childRequest){
						keyCounter++;
						break;
					}
					hasChild = (keyCounter > 0) ? true : false;
					if(hasChild){
						for(var ky in rObj.childRequest){
							this.setRequestData(rObj.childRequest[ky]);
						}
					}else{
						this.setRequestData(rObj);
					}
				}
				
			}
		}
	}
	
	
	//Status update to data and UI has been done. Now added new items to ui at proper place.
	if(this.newlyAddedReqID.length>0){		
		this.newlyAddedReqID.sort(function(a, b){
					var a1= a.requestCreationTime, b1= b.requestCreationTime;
					if(a1== b1) return 0;
					return a1> b1? 1 : -1;
		});		
		this.addNewRequestToUI();
		if(this.params.targetContainer!=null){
			
			$("#"+this.params.targetContainer).animate({ scrollTop: 0 }, "fast");
		}
		
		this.newlyAddedReqID=[];
	}
};

$.requestTrackerAjax.prototype.addNewRequestToUI = function(){
	var itemHtml = "";
	
	for(var n = 0; n<this.newlyAddedReqID.length; n++){
		this.requests.unshift(this.newlyAddedReqID[n]);
		this.requestIDsForIndexing.unshift(this.newlyAddedReqID[n].requestID);
		
		if(this.params.targetContainer!= null && $("#"+this.params.targetContainer).length>0){
			var statusdata = "initiated";
			var progress = 0;
				try{
					statusdata = this.newlyAddedReqID[n].status.toLowerCase();
					progress = this.newlyAddedReqID[n].progress;
				}catch(e){ statusdata = "initiated"; };
			
			if(statusdata =="success" || statusdata =="failure" || statusdata =="timeout" || statusdata =="unknown"){
				progress = 100;				
			}
		   
			var tootltip = this.prepareToolTipMessage(this.newlyAddedReqID[n],true);
			//"ID : "+this.newlyAddedReqID[n].requestID+"&#13;Initiated by : Admin&#13;"+this.newlyAddedReqID[n].tasks.join("&#13;");	
			itemHtml = '<div  id="'+this.newlyAddedReqID[n].requestID+'" class="req-container req-'+statusdata+'" data-original-title="'+tootltip+'"   data-html="true" rel="tooltip"  data-placement="auto">'
					  +'<div id="'+this.newlyAddedReqID[n].requestID+'-action" class="req-info-section"><span class="'+AppJS.readValueInObject(this.statusIconCss,statusdata,"glyphicon glyphicon-flag")+'"></span>&nbsp;'+this.newlyAddedReqID[n].action+'</div>'
					  +'<div class="req-progress-section">'
						  +'<div class="req-progress-bar">'
							+'<div id="'+this.newlyAddedReqID[n].requestID+'-progress"  class="req-progress-filler" style="width:'+progress+'%;">&nbsp;</div>'
						  +'</div>'
					  +'</div>'
					  +'<div  class="req-status-section"><span id="'+this.newlyAddedReqID[n].requestID+'-status"><b>Status : </b>'+this.newlyAddedReqID[n].status+'</span>  &nbsp; <span id="'+this.newlyAddedReqID[n].requestID+'-creation"><b>Submitted on :</b> '+this.newlyAddedReqID[n].requestCreationTimeInReadableFormat+'</span> &nbsp; <span id="'+this.newlyAddedReqID[n].requestID+'-timetaken"></span></div>'
					  +'</div>';
			
			$("#"+this.params.targetContainer).prepend(itemHtml);
			$("[rel=tooltip]").tooltip({html:true});
		}
	}
	if(this.requests.length > 0){
		this.reqLastTimestamp = this.requests[0].requestCreationTime;
	}
	
};

$.requestTrackerAjax.prototype.setRequestData = function(obj){
	var pos = this.requestIDsForIndexing.indexOf(obj.requestID);
	
	if(pos>-1){
		//Request already available just need to update
		var theObjRef = this.requests[pos];
		if(theObjRef.requestID !== obj.requestID){
			pos = this.getIndexIfObjWithOwnAttr(this.requests,"requestID",obj.requestID);			
			
		}
		if(pos>-1){
			this.requests[pos].status = obj.status;
			this.requests[pos].progress = Math.floor(Number(''+obj.progressStatus));
			this.requests[pos].totalExecutionTimeInMillisecond = AppJS.readValueInObject(obj,"totalExecutionTimeInMillisecond",0);
		 	this.requests[pos].totalExecutionTimeAsReadableFormat = AppJS.readValueInObject(obj,"totalExecutionTimeAsReadableFormat","");
			this.requests[pos].tasks = AppJS.readValueInObject(obj,"requestType.taskList",{});
			if(this.params.statusUpdateToUI){
				this.prepareToolTipMessage(this.requests[pos]);
				//$("#"+this.requests[pos].requestID).attr("title", "ID : "+this.requests[pos].requestID+"\r\nInitiated by : Admin\r\n"+this.requests[pos].tasks.join("\r\n"));
				$("#"+this.requests[pos].requestID+'-progress').css("width",this.requests[pos].progress+"%");
				$("#"+this.requests[pos].requestID).removeClass();
				var statusdata = "";
				try{
					statusdata =this.requests[pos].status.toLowerCase();
				}catch(e){ statusdata = ""; };
				if(statusdata!=""){
					
					if(statusdata =="success" || statusdata =="failure" || statusdata =="timeout" || statusdata =="unknown"){
						$("#"+this.requests[pos].requestID+'-progress').css("width","100%");
						
					}
					$("#"+this.requests[pos].requestID).addClass("req-container req-"+statusdata);
					$("#"+this.requests[pos].requestID+"-action span").addClass(this.statusIconCss[statusdata]);
					$("#"+this.requests[pos].requestID+'-status').html("<b>Status : </b>"+this.requests[pos].status);
					
					
				}				
			}
		}
		   
	}else{
		////console.log("obj not exist so being marked as new add");
		
		var cObj = {
					requestID : obj.requestID,
					status : obj.status,
					action:obj.actionName,
					cluster: obj.cluster_name,
					userid: obj.user.userid,
					progress : Math.floor(Number(''+obj.progressStatus)),
					requestCreationTime: obj.requestCreationTime,
					username: AppJS.readValueInObject(obj,"user.username","Unknown"),
					tasks:AppJS.readValueInObject(obj,"requestType.taskList",{}),
					requestCreationTimeInReadableFormat:AppJS.readValueInObject(obj,"requestCreationTimeInReadableFormat","Unavailable"),
					totalExecutionTimeInMillisecond:AppJS.readValueInObject(obj,"totalExecutionTimeInMillisecond",0),
		 			totalExecutionTimeAsReadableFormat:AppJS.readValueInObject(obj,"totalExecutionTimeAsReadableFormat","Unavailable")
				   }
					////console.log("Tasks");
					////console.log(AppJS.readValueInObject(obj,"requestType.taskList",{}));
					this.newlyAddedReqID.push(cObj);	
	}
}

$.requestTrackerAjax.prototype.prepareToolTipMessage = function(obj, getPreparedMessage){
	var lineBreak = "<br>";
	if(getPreparedMessage == null || typeof getPreparedMessage == 'undefined') getPreparedMessage = false;
	if(obj != null && typeof obj != 'undefined'){
		try{
			var tasksMsg = "";
			for(var taskKey in obj.tasks){
				if(obj.tasks[taskKey].iscompleted && obj.tasks[taskKey].errorCode == 0) taskStatus = "Completed";
				if(!obj.tasks[taskKey].iscompleted && obj.tasks[taskKey].errorCode == 0 ) taskStatus = Math.floor(obj.tasks[taskKey].progressStatus)+"% Completed";
				if(obj.tasks[taskKey].errorCode > 0) taskStatus = "Failed";
				tasksMsg += "<li style='list-style:square !important;list-style-type:square; margin:15px; padding:auto;'><strong>"+obj.tasks[taskKey].taskName+"</strong> ( "+taskStatus+" )</li>";
			}
			
			var statusdata = "";
			var showTimeTaken = false;
			try{
				statusdata =obj.status.toLowerCase();
			}catch(e){ statusdata = ""; };
			
			if(statusdata =="success" || statusdata =="failure" || statusdata =="timeout" || statusdata =="unknown"){
				progress = 100;
				showTimeTaken = true;
				
			}
			if(!getPreparedMessage){
				$("#"+obj.requestID).attr("data-original-title", "<div style='text-align:left; white-space:nowrap;'><strong>ID : </strong>"+obj.requestID + "<br/><strong>Submitted on : </strong>"+obj.requestCreationTimeInReadableFormat +"<br/><strong>Initiated by : </strong>"+obj.username +"<br/><ul style='list-style-type:square; list-style:square; margin: 15px, padding:auto;'>"+ tasksMsg+"</ul>"+((showTimeTaken) ? "<strong>Request exec. time :</strong>"+obj.totalExecutionTimeAsReadableFormat:"")+"</div>");
			}else{
				return "<div style='text-align:left; white-space:nowrap;'><strong>ID : </strong>"+obj.requestID + "<br/><strong>Submitted on : </strong>"+obj.requestCreationTimeInReadableFormat +"<br/><strong>Initiated by : </strong>"+obj.username +"<br/><ul style='list-style-type:square; list-style:square;margin:15px;'>"+ tasksMsg+"</ul>"+((showTimeTaken) ? "<strong>Request exec. time :</strong>"+obj.totalExecutionTimeAsReadableFormat:"")+"</div>";
			}
			
		}catch(e){}
	}
}


$.requestTrackerAjax.prototype.ajaxToGetRequests = function(){
	////console.log("this.params");
	////console.log(this.params);
	var data_structure = {};
	data_structure.api = AppJS.getApiUrl("REQUESTS_INFO");	
	if(this.firstRun && this.params.fetchRequests == "all"){
		data_structure.recent_max = 100;
	}
	
	if(this.requests.length>0 && this.reqLastTimestamp>0 && this.params.checkForNew){
		data_structure.onward_time = this.reqLastTimestamp;
	}
	data_structure.requests ="";
	if(this.firstRun && this.params.requestID != null && this.params.requestID.length>0){
		data_structure.requests = this.params.requestID.join(",");
	}else{
		data_structure.requests = this.getActiveRequest();

	}
	
	if(data_structure.requests == "" && !this.params.checkForNew){
		////console.log("Tracking session being end as no item remaining to track and also have not to fetch new request items.");
		return;
	}
	console.log(data_structure);
	////console.log("apiProxyUrl :");
	//console.log("Request called : "+AppJS.getConstant("apiProxyUrl")+" with parameters : ");
	//console.log(data_structure);
	var json_Data = null;
	var me = this;
	$.ajax( {
		Type : "POST",
		url  : AppJS.getConstant("apiProxyUrl"),
		data : data_structure,
		jsonpCallback: 'reqCallBack'+AppJS.getRandomIntInRange(500,1000),	
		timeout: me.params.updateInterval,
		mineref : me,
	    success: function(json) {
	    	//console.log("Request data received : \r\n"+json);
			var isValidJson = false;
			try{
				json_Data = JSON.parse(json);
				isValidJson = true;
			}catch(e){ isValidJson = false;  };
			
			try{
				if(isValidJson){
					try{
						if(this.mineref.params.callbackFunction){
							this.mineref.params.callbackFunction(json_Data);
						}
					}catch(e){ 
					////console.log("callback failed as no callback function defined..."); 
					////console.log(this.mineref.params);
					}
					this.mineref.extractData(json_Data);
					
				}
				setTimeout(function(objRef){objRef.ajaxToGetRequests();}, me.params.updateInterval, me);
			}catch(e){}
		},
		error: function(jqXHR, textStatus){
	       if(textStatus == 'timeout'){
	    	  // //console.log("Request timeout.");
	    	  // alert("request timeout");
	       }
		   setTimeout(function(objRef){objRef.ajaxToGetRequests();}, me.params.updateInterval, me);
		}
	 });
};

$.requestTrackerAjax.prototype.getIndexIfObjWithOwnAttr = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
            return i;
        }
    }
    return -1;
};

})(jQuery);