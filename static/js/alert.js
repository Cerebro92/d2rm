// JavaScript Document
(function ($) {
  $.alertTrackerAjax = function(parameters){	
	this.error = false;
	this.firstRun = true;
	var defaults = {  
			  /*Target container where all alerts will be added/updated to ui.*/
			  targetContainer: null,
			  alertTypes : "CRITICAL,WARNING",
			  updateInterval : 7000,
			  alertSourceCategory : null,
			  alertSourceID : null,
			  callbackFunction:null /* function reference to receive alert responses, to do some decision making or update ui by self.*/
	};
	
	this.getDefaults =function(){ return defaults;};
	this.alerts = {};
	this.alertIDForIndexing = [];
    this.params = $.extend(defaults,parameters);	
	//console.log("this.params : ");
	//console.log(this.params);
	this.me = this;
	this.validateParams();	
	this.ajaxToGetRequests();	
};


$.alertTrackerAjax.prototype.validateParams = function() {

	if(this.params['targetContainer'] == null || typeof this.params['targetContainer'] === 'undefined' || $.trim(this.params['targetContainer'])==""){
	 	this.params['targetContainer']=null;
	}	
	
	if(this.params['alertSourceCategory'] == null || typeof this.params['alertSourceCategory'] === 'undefined' || $.trim(this.params['alertSourceCategory'])==""){
	 	this.params['alertSourceCategory']=null;
	}	
	
	if(this.params['alertSourceID'] == null || typeof this.params['alertSourceID'] === 'undefined' || $.trim(this.params['alertSourceID'])==""){
	 	this.params['alertSourceID']=null;
	}	
	
	if(this.params['alertTypes'] == null || typeof this.params['alertTypes'] === 'undefined' || $.trim(this.params['alertTypes'])==""){
	 	this.params['alertTypes']= "CRITICAL,WARNING";
	}else{
		this.params['alertTypes'] = $.trim(this.params['alertTypes']).toUpperCase();
		if(this.params['alertTypes'] != "WARNING" && this.params['alertTypes'] != "CRITICAL" && this.params['alertTypes'] != "CRITICAL,WARNING" && this.params['alertTypes'] != "WARNING,CRITICAL"){
			this.params['alertTypes']= "CRITICAL,WARNING";
		}
	}
};

$.alertTrackerAjax.prototype.extractData = function(jData){	
	//console.log("Extracting data : ");
	
	var newlyAddedAlertsID =[];
	var removableAlertsID =[];
	var rObj;
	var receivedAlerts = AppJS.readValueInObject(jData,"content.alerts",[]);
	var receivedAlertIDs = [];
	if(AppJS.readValueInObject(jData,"content.alerts",null)!= null){
		
		if(receivedAlerts.length>0){
			var pos = -1;
			console.log("Extracting data as not null: ");
			console.log(receivedAlerts);
			for(var x = 0; x < receivedAlerts.length; x++){
				receivedAlertIDs.push(this.getAlertID(receivedAlerts[x]));				
				alertObj = receivedAlerts[x]; 
				pos = this.alertIDForIndexing.indexOf(this.getAlertID(alertObj));
				console.log("Handling alert with id: "+alertObj.alert_id+" found position : "+pos);
				if(pos == -1){
					//Add
					//console.log("Adding with id:");
					this.addAlert(alertObj);
					
				}else{
					//Update
					//console.log("Updating :");
					this.updateAlert(alertObj);
				}
			}
			
			removableAlertsID = $(this.alertIDForIndexing).not(receivedAlertIDs).get();
			console.log("Items to be removed : ");
			console.log(removableAlertsID);
		}
	}else{
		removableAlertsID = this.alertIDForIndexing;
	}
	
	this.removeAlerts(removableAlertsID);
	
	
};

$.alertTrackerAjax.prototype.getAlertID = function(aObj){
	var aid = "alert_" + AppJS.readValueInObject(aObj,"alert_id","");
	return aid;
}


$.alertTrackerAjax.prototype.addAlert = function(aObj){	
	var aid = "alert_" + AppJS.readValueInObject(aObj,"alert_id","");
	//console.log("Alert iud : "+aid);
	var alertObj;
	var cssSelectorToApply = "";
	var iconSet = "";
	var message = this.retrieveMessage(aObj);
	this.alertIDForIndexing.push(aid);
	this.alerts[aid] = aObj;
	//console.log("Message: "+message);
	cssSelectorToApply = "system-alert-" + AppJS.readValueInObject(aObj,"status","warning");
	iconSet = (AppJS.readValueInObject(aObj,"status","warning").toLowerCase() == "warning")? "glyphicon glyphicon-warning-sign":"glyphicon glyphicon-exclamation-sign";
	//console.log("Adding alert to ui.");
	var alertHTML = "<div id=\""+aid+"\" class=\"system-alert "+cssSelectorToApply.toLowerCase()+"\"  data-original-title=\""+message+"\"   data-html=\"true\" rel=\"tooltip\"  data-placement=\"auto\">"
					+"<div class=\"pic\"><span id=\""+aid+"_icon\" class=\""+iconSet+"\" aria-hidden=\"true\"></span></div>"
					+"<div class=\"details\">"
					+"	<p id=\""+aid+"_msg\" style=\"padding-top:3px; white-space:nowrap;\">"+message+"</p>"
					+"</div>"
					+"</div>";
	$("#"+this.params.targetContainer).prepend(alertHTML);
	$("[rel=tooltip]").tooltip({html:true});
	this.setToolTipMessage(aid, message);
	//update ui
};

$.alertTrackerAjax.prototype.updateAlert = function(aObj){
	var cssSelectorToApply = "";
	var aid = "alert_" + AppJS.readValueInObject(aObj,"alert_id", "");
	var message = this.retrieveMessage(aObj);
	var iconSet = (AppJS.readValueInObject(aObj,"status","warning").toLowerCase() == "warning")? "glyphicon glyphicon-warning-sign":"glyphicon glyphicon-exclamation-sign";
	cssSelectorToApply = "system-alert system-alert-" +AppJS.readValueInObject(aObj,"status","warning").toLowerCase();
			  
	this.alerts[aid]['alert_id'] = AppJS.readValueInObject(aObj,"alert_id", "");
	this.alerts[aid]['alert_type'] = AppJS.readValueInObject(aObj,"alert_type", {});
	this.alerts[aid]['hostname'] = AppJS.readValueInObject(aObj,"hostname", "");
	this.alerts[aid]['parameter_value'] = AppJS.readValueInObject(aObj,"parameter_value", "");
	this.alerts[aid]['status'] = AppJS.readValueInObject(aObj,"status", "");
	this.alerts[aid]['last_modified_time'] = AppJS.readValueInObject(aObj,"last_modified_time", "");
	this.alerts[aid]['ui_message'] = AppJS.readValueInObject(aObj,"ui_message", {});
	
	$("#"+aid).removeClass();
	$("#"+aid).addClass(cssSelectorToApply);
	$("#"+aid+"_icon").removeClass();
	$("#"+aid+"_icon").addClass(iconSet);
	
	$("#"+aid+"_msg").html(message);
	$("[rel=tooltip]").tooltip({html:true});
	this.setToolTipMessage(aid, message);
	//update ui
};

$.alertTrackerAjax.prototype.removeAlerts = function(aObjArray){	
	var aid;
	var pos = -1;
	if(aObjArray!=null && typeof aObjArray != 'undefined' && aObjArray.length>0){
		for(var n = 0; n < aObjArray.length; n++){
			
			aid = aObjArray[n];			
			console.log("Removing alert : "+aid);
			$( "#"+aid ).remove();
			try{
				pos = $.inArray(aid, this.alertIDForIndexing);
				console.log("Position : "+pos);
				if(pos>-1){
					this.alertIDForIndexing.splice(pos , 1 );
				}
				delete this.alerts[aid]; 
			}catch(e){
				console.log("Error while deleting :"+aid);
			}
		}
	}
};

$.alertTrackerAjax.prototype.retrieveMessage = function(aObj){
	var message = "Unknown";
	if(AppJS.readValueInObject(aObj,"ui_message.message_key",null)!=null){
		var messageKey = AppJS.readValueInObject(aObj,"ui_message.message_key","");
		if(messageKey != ""){
			//console.log("Message key : "+messageKey);
			message = AppJS.getString(messageKey, AppJS.readValueInObject(aObj,"ui_message.params",[]));
			if(message == "["+messageKey+"]"){
				message = AppJS.readValueInObject(aObj,"ui_message.default_message","");				
			}
			//console.log("Message  : "+message);
		}else{
			message = AppJS.readValueInObject(aObj,"ui_message.default_message","");
		}
	}else{
		if(AppJS.readValueInObject(aObj,"ui_message.default_message",null)!=null){
			message = AppJS.readValueInObject(aObj,"ui_message.default_message","");
		}
	}
	
	if(message == ""){
		message = "Unknown";
	}	
	return aObj.alert_id+":"+message;
}

$.alertTrackerAjax.prototype.setToolTipMessage = function(aid, msg){
	var lineBreak = "<br>";	
	if(aid != null && typeof aid != 'undefined' && $.trim(aid)!="" && msg != null && typeof msg != 'undefined' && $.trim(msg)!="" ){
		try{
			$("#"+aid).attr("data-original-title", "<div style='text-align:left;'><strong>Alert : </strong>"+msg+"</div>");
		}catch(e){}
	}
};


$.alertTrackerAjax.prototype.ajaxToGetRequests = function(){
	////console.log("this.params");
	////console.log(this.params);
	var UrlWithQueryString = "";
	var data_structure = {};
	data_structure.api = AppJS.getApiUrl("ALERT_INFO");	
	data_structure.status =  this.params.alertTypes;
	UrlWithQueryString = AppJS.getConstant("apiProxyUrl")+"?api="+data_structure.api+"&status="+data_structure.status;
	if(this.params.alertSourceCategory!=null ){
		data_structure.source_category =  this.params.alertSourceCategory;
		UrlWithQueryString = UrlWithQueryString + "&source_category="+this.params.alertSourceCategory;
	}
	
	if(this.params.alertSourceID!=null ){
		data_structure.source_id =  this.params.alertSourceID;
		UrlWithQueryString = UrlWithQueryString + "&source_id="+this.params.alertSourceID;
	}
	//console.log("apiProxyUrl :");
	//console.log(AppJS.getConstant("apiProxyUrl"));
	//console.log("data_structure :");
	//console.log(data_structure);
	console.log("Calling api : "+UrlWithQueryString);
	var json_Data = null;
	var me = this;
	$.ajax( {
		Type : "GET",
		url  : UrlWithQueryString,
		//data : data_structure,
		jsonpCallback: 'reqCallBack'+AppJS.getRandomIntInRange(600,1000),	
		timeout: me.params.updateInterval,
		mineref : me,
	    success: function(json) {
			
			//console.log("Data received : "+json);
			
			var isValidJson = false;
			try{
				json_Data = JSON.parse(json);
				isValidJson = true;
			}catch(e){ 
				isValidJson = false;
				//console.log(e);
			};
			//console.log(json_Data);
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
					try{
						this.mineref.extractData(json_Data);
					}catch(e){}
				}
				
				setTimeout(function(objRef){objRef.ajaxToGetRequests();}, me.params.updateInterval, me);
			}catch(e){}
		},
		error: function(jqXHR, textStatus){
	       if(textStatus == 'timeout'){
	    	  //// //console.log("Request timeout.");
	       }
		   setTimeout(function(objRef){objRef.ajaxToGetRequests();}, me.params.updateInterval, me);
		}
	 });
};

$.alertTrackerAjax.prototype.getIndexIfObjWithOwnAttr = function(array, attr, value) {
    for(var i = 0; i < array.length; i++) {
        if(array[i].hasOwnProperty(attr) && array[i][attr] === value) {
            return i;
        }
    }
    return -1;
};

})(jQuery);

