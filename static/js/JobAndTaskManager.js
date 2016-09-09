// JavaScript Document

var JobAndTaskManager =function(){
var formrenderrer = null;
this.categoryData = {};
this.task = {pageSize : 5, currentPage : 1, totalPages:0, searchFlag : {}, data:[]};
this.job = {pageSize : 5, currentPage : 1, totalPages:0, searchFlag : {}, data:[]}; 
var validRowSelectionControls = ['checkbox','radio'];
var taskAddStepsData = {step1data:{},step2data:{}};

/**********************************Task routines starts here ***********************************/
this.listTask = function(targetContainer, rendererFunction, pageNumber, searchFlag){
	
	if(targetContainer ==null || typeof targetContainer === 'undefined' || rendererFunction ==null || typeof rendererFunction === 'undefined') return;
	if(!$.isFunction(rendererFunction)){ console.log("Renderer function not set, so omitting..."); return;}
	var searchFlagDefined = true;
	if(searchFlag ==null || typeof searchFlag === 'undefined' ||  typeof searchFlag !== "object") 
	{ 
		searchFlag ={}; 
		searchFlagDefined = false;
    }
	
	if(pageNumber ==null || typeof pageNumber === 'undefined' || isNaN(Number(""+pageNumber))){
		pageNumber = this.task.currentPage;
	}
	
	if(searchFlag!=this.task.searchFlag && searchFlagDefined){
		pageNumber = 1;
		totalPages = 1;
		this.task.totalPages = pageNumber;
	}
	this.task.searchFlag = searchFlag;
	this.task.currentPage = pageNumber;
	
	//AppJS.objLength() number of keys a object contains
	//AppJS.getErrorsFromJson();
	var requestData={ api : AppJS.getApiUrl("TASK_LIST"), page:this.task.currentPage};
	if( searchFlag!=null ){
		for(var key in searchFlag){ 
			requestData[key] = searchFlag[key];
		}
	}
	console.log("requestData :");
	console.log(requestData);
	console.log("Getting tasks");
	console.log(targetContainer+"Overlay");
	$(targetContainer+"Overlay").css("display","block");  
    var jsonData = {};
	$.ajax( {
		Type : "GET",
		url : AppJS.getConstant("apiProxyUrl"),
		data:requestData,
		jsonpCallback: 'theCallBack11234',	
		timeout: AppJS.getConstant("timeout"),
		success: function(json) {
			console.log("TASK_LIST : " + AppJS.getApiUrl("TASK_LIST"));
			console.log("Raw data:\n"+json);
			jsonData = JSON.parse(json);
			console.log("Json Data Object");	
			console.log(jsonData);		
			
			
			rendererFunction(jsonData, targetContainer);
			$(targetContainer+"Overlay").css("display","none"); 
		},
		error: function(jqXHR, textStatus){
			var errorMsg = "";
			console.log("Refrence "+targetContainer+"Overlay");
			console.log($(targetContainer+"Overlay"));
			$(targetContainer+"Overlay").css("display","none");  
			errorMsg = (textStatus == 'timeout') ? AppJS.getString("request_timeout_error_message") : AppJS.getString("request_fullfill_error_message");			   
			console.log(errorMsg);
			jsonData = { content : {},
						error:{
							   errors:[
							             {
							            	 uiMessage:
							            	 {
							            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
							            		 params:[],
							            		 default_message:errorMsg,
							            		 paramCSV:""
							            	  },
							            	  errorType:"Network",
							            	  errorkeyName:"",
							            	  errorCode:AppJS.getConstant("genericErrorCode"),
							            	  errorMessage:errorMsg
							              }
							        ]
					   		  }
			};
			
			rendererFunction(jsonData,targetContainer);
			
			
		}
	});
    
   
};


var doTaskPaging = function(pagingTarget, totalpages, curpage){
	var htmlPageStr = "";
	if(totalpages==null || typeof totalpages === 'undefined') totalpages =1;
	if(curpage==null || typeof curpage === 'undefined') curpage =1;
	for(var p=1; p<=totalpages;p++){
		cls = (p==curpage) ? ' class="active" ':'';
		htmlPageStr+='<li'+cls+'><a href="#" onclick="listTasksByPage('+p+');">'+p+'</a></li>';
		//alert(htmlPageStr);
	}
	
	htmlPageStr = '<ul class="pagination">' + htmlPageStr + "</ul>";
	//alert(htmlPageStr);
	$(pagingTarget).html(htmlPageStr);
	
};


var doTaskSearchFlag = function(pagingTarget){
	var htmlPageStr = "";


	
};


this.renderTaskList = function(jsonData,container){
	
	/*jsonData = { content:{
		taskRequestResourceList:[
		{
			taskId:1,
			taskName :"Task 1",
			categories:[{categoryName:"Education"},{categoryName:"Finance"}],
			creationDate:"2015-01-27 :00:00:00",
			user:{"userid":5, username:"Madan"},
			targetServiceName:"PIG"
		},
		{
			taskId:2,
			taskName :"Task 2",
			categories:[{categoryName:"Education"},{categoryName:"Finance"}],
			creationDate:"2015-01-27 :00:00:00",
			user:{"userid":5, username:"Madan"},
			targetServiceName:"PIG"
		},
		{
			taskId:3,
			taskName :"Task 3",
			categories:[{categoryName:"Education"},{categoryName:"Finance"}],
			creationDate:"2015-01-27 :00:00:00",
			user:{"userid":5, username:"Madan"},
			targetServiceName:"PIG"
		},
		{
			taskId:4,
			taskName :"Task 4",
			categories:[{categoryName:"Education"},{categoryName:"Finance"}],
			creationDate:"2015-01-27 :00:00:00",
			user:{"userid":5, username:"Madan"},
			targetServiceName:"PIG"
		},
		{
			taskId:5,
			taskName :"Task 5",
			categories:[{categoryName:"Education"},{categoryName:"Finance"}],
			creationDate:"2015-01-27 :00:00:00",
			user:{"userid":5, username:"Madan"},
			targetServiceName:"PIG"
		}
		]
   },
"error":{"errors":[]}
};*/
	
	var taskItems = AppJS.readValueInObject(jsonData,"content.taskRequestResourceList",[]);	
	console.log("taskItems : ");
	console.log(taskItems);
	$(container).html("");
	var errors = AppJS.getErrorsFromJson(jsonData);
	if(errors.length==0){
		var currentItem = "";
		
		var totalpage = AppJS.readValueInObject(jsonData,"content.paging.totalpages",0);
		console.log("AppJS.readValueInObject(jsonData,\"content.paging.currentpage\",0)"+AppJS.readValueInObject(jsonData,"content.paging.currentpage",0));
		console.log(this.task);
		var curpage = AppJS.readValueInObject(jsonData,"content.paging.currentpage",0);
	  
		this.task.currentPage = curpage;
		this.task.totalPages = totalpage;
		doTaskPaging("#task_pagination",totalpage, curpage);			
		doTaskSearchFlag("#filterTask")
		
		if(this.task.totalPages==0){
			this.task.currentPage = 0;
		}	
		
		if(taskItems.length == 0){
			console.log("notask_found");
			itemWrapperHTML = '<tr id="task0"><td colspan="7" valign="middle" style="height:200px;">No task(s) available.</td></tr>';
			$(container).html(itemWrapperHTML);
			return;
		}
			
		
		
		for(var i=0; i<taskItems.length;i++){
			
			var categories = "";
			if($.isArray(taskItems[i].categories)){
				for(var key in taskItems[i].categories){
					categories+=((categories=="") ? "":"<br/>")+taskItems[i].categories[key].categoryName;
				}
			}
			var control = '';
			
			itemWrapperHTML = '<tr id="task'+AppJS.readValueInObject(taskItems[i],"taskId","")+'">'
									+'<td>'+AppJS.readValueInObject(taskItems[i],"taskId","")+'</td>'
									+'<td>'+AppJS.readValueInObject(taskItems[i],"taskName","")+'</td>'
									+'<td>'+AppJS.readValueInObject(taskItems[i],"creationDate","")+'</td>'
									+'<td>'+AppJS.readValueInObject(taskItems[i],"user.username","Unknown")+'</td>'
									+'<td>'+categories+'</td>'
									+'<td>'+AppJS.readValueInObject(taskItems[i],"targetServiceName","")+'</td>'									
									+'<td>'
									+'<div class="btn-group">'
										  +'<button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
											+'Action <span class="caret"></span>'
										  +'</button>'
										  +'<ul class="dropdown-menu">'
											+'<li class="disabled"><a href="#" onclick="openJobLog('+AppJS.readValueInObject(taskItems[i],"taskId","")+');">Info</a></li>'
											+'<li class="disabled"><a href="#">Modify</a></li>'
											+'<li class="disabled"><a href="#">Delete</a></li>'	
											+'<li><a href="#" onclick="addJob(\''+AppJS.readValueInObject(taskItems[i],"taskId","")+'\', \'createJobFrm\', \'#taskListContainerOverlay\')" >Create Job</a></li>'	
										  +'</ul>'
									+'</div>'
									+'</td>'
								+'</tr>';
			if(currentItem == ""){
				$(container).append(itemWrapperHTML);				
			}else{
				$(currentItem).after(itemWrapperHTML);
			}
			currentItem = 	"#task"+taskItems[i].taskId;			
		}
	}else{ 
		var errMessages = "";
		for( var n in errors){ errMessages+= ((errMessages=="") ? "":"<br/>")+errors[n]; }
		itemWrapperHTML = '<tr id="task0"><td colspan="7" valign="middle" style="height:350px;">'+AppJS.wrapErrorInContainer(errMessages)+'<input type="button" class="btn btn-default" name="Refresh" value="Refresh" onclick="refreshTaskList();"/></td></tr>';
		$(container).html(itemWrapperHTML);
		doTaskPaging("#task_pagination",0, 0);	
	} 
}



this.getTaskInfo = function(taskID, handlerFunction, screenOverlayObj,Jobform){
	
	if(taskID ==null || typeof taskID === 'undefined' || handlerFunction ==null || typeof handlerFunction === 'undefined') return;
	if(Jobform ==null || typeof Jobform === 'undefined') Jobform = null;
	if(!$.isFunction(handlerFunction)){ console.log("Renderer function not set, so omitting..."); return;}
	if(screenOverlayObj ==null || typeof screenOverlayObj === 'undefined') screenOverlayObj = null;
	
	console.log("screenOverlayObj : "+screenOverlayObj);
	
	//AppJS.objLength() number of keys a object contains
	//AppJS.getErrorsFromJson();

	
	if(screenOverlayObj!=null) $(screenOverlayObj).css("display","block");  
    var jsonData = {};
	$.ajax( {
		Type : "GET",
		url : AppJS.getConstant("apiProxyUrl"),
		data:{ api : AppJS.getApiUrl("TASK_INFO",{TASKID:taskID})},
		jsonpCallback: 'theCallBack11234',	
		timeout: AppJS.getConstant("timeout"),
		success: function(json) {
			console.log("TASK_INFO : " + AppJS.getApiUrl("TASK_INFO"));
			console.log("Raw data:\n"+json);
			jsonData = JSON.parse(json);
			console.log("Json Data Object");	
			console.log(jsonData);		
			
			handlerFunction(jsonData, Jobform);
			if(screenOverlayObj!=null) $(screenOverlayObj).css("display","none");  
		},
		error: function(jqXHR, textStatus){
			var errorMsg = "";
			if(screenOverlayObj!=null) $(screenOverlayObj).css("display","none");  
			errorMsg = (textStatus == 'timeout') ? AppJS.getString("request_timeout_error_message") : AppJS.getString("request_fullfill_error_message");			   
			console.log(errorMsg);
			jsonData = { content : {},
						error:{
							   errors:[
							             {
							            	 uiMessage:
							            	 {
							            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
							            		 params:[],
							            		 default_message:errorMsg,
							            		 paramCSV:""
							            	  },
							            	  errorType:"Network",
							            	  errorkeyName:"",
							            	  errorCode:AppJS.getConstant("genericErrorCode"),
							            	  errorMessage:errorMsg
							              }
							        ]
					   		  }
			};
			
			handlerFunction(jsonData, Jobform);
			
			
		}
	});
    
   
};

this.createJobFromTaskID = function(taskID, Jobform, screenOverlayObj){
	this.getTaskInfo(taskID, this.setInputsOnJobAddForm, screenOverlayObj, Jobform);
};

this.setInputsOnJobAddForm = function(jsonData, Jobform){
	
	var errors = AppJS.getErrorsFromJson(jsonData);
	if(errors.length > 0){
		var errMessages = "";
		for( var n in errors){ errMessages+= ((errMessages=="") ? "":"\n")+errors[n]; }
		//errMessages = AppJS.wrapErrorInContainer(errMessages);
		//$(container).html(itemWrapperHTML);
		//alert(errMessages);
		return;
	}
	var jdata = AppJS.readValueInObject(jsonData,"content.inputParameters",{});	
	console.log("setInputsOnJobAddForm : called");
	console.log(jsonData);
	var taskId = AppJS.readValueInObject(jsonData,"content.taskId",0);
	try{
		formrenderrer = new JobFormRenderer("#input_section",'#'+Jobform,'<div class="clearfix"></div><div class="col-lg-12 nopadding nomargin"><strong>{label} :</strong></div><div class="col-lg-5 nopadding nomargin" style="text-align:left;">{control}</div>',jdata,{},false,"#job_form_error_section" , taskId);	 
		formrenderrer.render();	
		
		var prereq = AppJS.readValueInObject(jsonData,"content.targetServiceName","");
		var prereq_min = AppJS.readValueInObject(jsonData,"content.targetServiceMinVersion","");
		var prereq_max = AppJS.readValueInObject(jsonData,"content.targetServiceMaxVersion","");
		
		if($.trim(prereq)!=""){ 
			prereq = "<span style=\"text-transform: uppercase;font-weight:bold;\">"+prereq+"</span>";
			if($.trim(prereq_min)!=""){
				prereq = prereq + "&nbsp; ("+AppJS.getString("prerequisite_min_version",[prereq_min])+")&nbsp;";				
			}
			if($.trim(prereq_max)!=""){
				prereq = prereq + "&nbsp; ("+AppJS.getString("prerequisite_max_version",[prereq_max])+")&nbsp;";				
			}
		}
		
		$("#prerequisites_section").html(prereq);
		
	}catch(e){console.log("Error while rendering form : "); console.log(e);}
	try{
		openTab("job");
	    openTab("create-job");
	}catch(e){console.log("Error while tab switching : "); console.log(e);}
};

this.submitJob = function(){
	
	var overlayObject = $("#jobCreationScreenOverlay");
	if(formrenderrer!=null && typeof formrenderrer!== 'undefined'){
		overlayObject.css("display","block"); 
		console.log("formrenderrer");
		if(!$(formrenderrer.formID).valid()){
			overlayObject.css("display","none"); 
			//
			return;	
		}
		var data = formrenderrer.getValueObject();
		
		$.ajax( {
			type : "POST",
			url : AppJS.getConstant("apiProxyUrl"),
			data:{ api : AppJS.getApiUrl("ADD_JOB"), 
				   jsonBodyData:JSON.stringify({RequestInfo:{actionName:"createJob"}, Body:data})},			
			timeout: AppJS.getConstant("timeout"),
			success: function(json) {
				console.log("Raw data:\n"+json);
				jsonData = JSON.parse(json);
				console.log("Json Data Object");	
				console.log(jsonData);	
				var jobID = AppJS.readValueInObject(jsonData,"content.jobDetail.jobID",null);
				var errors = AppJS.getErrorsFromJson(jsonData);
				if(errors == null || typeof errors ==='undefined' || !$.isArray(errors)){
					errors = [];
				}
				if(jobID == null || isNaN(Number(jobID)) || Number(jobID) == 0){
					errors.push("Failed to create job...");
				}
				overlayObject.css("display","none");
				if(errors.length>0){
					AppJS.renderError(formrenderrer.getErrorContainer(),errors);
				}else{
				    $('#createJob').css("display", "none");			    	  
				    $('#submitSuccess').css("display", "block");
				}
				  	
				
			},
			error: function(jqXHR, textStatus){
				   if(textStatus == 'timeout'){
					   console.log("Cofirming request timeout.");	    	  
					   alert("Request timeout. Failed to get confirmation over task submission. Try again...");
				   }
				   overlayObject.css("display","none");
				   
			}
		});
	
	}
}

/******************************************* Task routines ends here ******************************************/

/******************************************* Job routines starts here ****************************************/
this.listJob = function(targetContainer, rendererFunction, pageNumber ,searchFlag){
	
	if(targetContainer ==null || typeof targetContainer === 'undefined' || rendererFunction ==null || typeof rendererFunction === 'undefined') return;
	if(!$.isFunction(rendererFunction)){ console.log("Renderer function not set, so omitting fetch of jobs..."); return;}
	var searchFlagDefined = true;
	if(searchFlag ==null || typeof searchFlag === 'undefined' ||  typeof searchFlag !== "object") 
	{ 
		searchFlag ={}; 
		searchFlagDefined = false;
    }

	if(pageNumber ==null || typeof pageNumber === 'undefined' || isNaN(Number(""+pageNumber))){
		pageNumber = this.job.currentPage;
	}
	
	
	if(searchFlag!=this.job.searchFlag && searchFlagDefined){
		pageNumber = 1;
		totalPages = 1;
		this.task.totalPages = pageNumber;
	}
	this.job.searchFlag = searchFlag;
	this.job.currentPage = pageNumber;
	
	//AppJS.objLength() number of keys a object contains
	
	//AppJS.getErrorsFromJson();

	console.log("Getting jobs");
	console.log(targetContainer+"Overlay");
	$(targetContainer+"Overlay").css("display","block"); 
	
	var dataToSend = { api : AppJS.getApiUrl("JOB_LIST"), page:this.job.currentPage};
	if(this.job.searchFlag != null ){
		for(searchKey in this.job.searchFlag){
			if($.trim(this.job.searchFlag[searchKey]) != ""){
				dataToSend[searchKey]= $.trim(this.job.searchFlag[searchKey]);
			}
		}
		
	}
	console.log("requestData :");
	console.log(dataToSend);
	console.log("Getting tasks");
    var jsonData = {};
	$.ajax( {
		Type : "GET",
		url : AppJS.getConstant("apiProxyUrl"),
		data:dataToSend,
		jsonpCallback: 'theCallBack11234',	
		timeout: AppJS.getConstant("timeout"),
		success: function(json) {
			console.log("JOB_LIST : " + AppJS.getApiUrl("JOB_LIST"));
			console.log("JOB_LIST Raw data:\n"+json);
			jsonData = JSON.parse(json);
			
			/*jsonData = { "content":{
		        						"paging":{"pagesize" : 5 ,"currentpage" : 1,     "totalpages" : 1},
										"jobdetailitems":[
										{
										"jobID":1,
										"clusterName":"alethe01",
										"userID":{userid:1,"username":"Rupesh"},
										"jobName":"Education",
										"sourceId":1,
										"sourceType":"workflow",
										"status":"stop",
										"totalExecutionTimeInMillisecond":0
										},
										{
											"jobID":2,
											"clusterName":"alethe01",
											"userID":{userid:1,"username":"kamlesh"},
											"jobName":"Education",
											"sourceId":1,
											"sourceType":"workflow",
											"status":"stop",
											"totalExecutionTimeInMillisecond":0
											},
											{
												"jobID":3,
												"clusterName":"alethe01",
												"userID":{userid:1,"username":"suresh"},
												"jobName":"Education",
												"sourceId":1,
												"sourceType":"workflow",
												"status":"stop",
												"totalExecutionTimeInMillisecond":0
												}
										]
								   },
				"error":{"errors":[]}
			   };
			*/
			
			console.log("Job Json Data Object");	
			console.log(jsonData);	
			$(targetContainer+"Overlay").css("display","none"); 			
			rendererFunction(jsonData, targetContainer);
			
		},
		error: function(jqXHR, textStatus){
			var errorMsg = "";
			$(targetContainer+"Overlay").css("display","none");  
			errorMsg = (textStatus == 'timeout') ? AppJS.getString("request_timeout_error_message") : AppJS.getString("request_fullfill_error_message");			   
			console.log(errorMsg);
			jsonData = { content : {},
						error:{
							   errors:[
							             {
							            	 uiMessage:
							            	 {
							            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
							            		 params:[],
							            		 default_message:errorMsg,
							            		 paramCSV:""
							            	  },
							            	  errorType:"Network",
							            	  errorkeyName:"",
							            	  errorCode:AppJS.getConstant("genericErrorCode"),
							            	  errorMessage:errorMsg
							              }
							        ]
					   		  }
			};
			
			rendererFunction(jsonData, targetContainer);
			
			
		}
	});
    
   
};

this.renderJobList = function(jsonData, container){
	
	var jobItems = AppJS.readValueInObject(jsonData,"content.jobdetailitems",[]);	
	console.log("jobItems : ");
	console.log(jobItems);
	$(container).html("");
	var errors = AppJS.getErrorsFromJson(jsonData);
	if(errors.length==0){
		var currentItem = "";
		
		var totalpage = AppJS.readValueInObject(jsonData,"content.paging.totalpages",0);
		var curpage = AppJS.readValueInObject(jsonData,"contentW.paging.currentpage",0);
	  
		this.job.currentPage = curpage;
		doJobPaging("#job_pagination", totalpage, curpage);			
		
		
		if(this.task.totalPages==0){
			this.job.currentPage = 0;
		}		
		
		if(jobItems.length == 0){
			console.log("notask_found");
			itemWrapperHTML = '<tr id="task0"><td colspan="8" valign="middle" style="height:350px;">No jobs(s) available.</td></tr>';
			$(container).html(itemWrapperHTML);
			return;
		}
		
		
		this.job.data = jobItems;
		
		for(var i=0; i<jobItems.length;i++){
			var deleteButonStatusClass = ((AppJS.readValueInObject(jobItems[i],"lastJobRunTimeReadableFormat",0) == 0 ) ? "  " : " disabled");
			var runButonStatusClass = ((AppJS.readValueInObject(jobItems[i],"activeRequestId",null) == null ) ? "" : " disabled ");
			var traceRequestIdStatusClass = ((AppJS.readValueInObject(jobItems[i],"activeRequestId",0) == 0 ) ? " disabled " : "  ");
			itemWrapperHTML = '<tr id="job'+AppJS.readValueInObject(jobItems[i],"jobID","")+'">'
									+'<td class="jobid">'+AppJS.readValueInObject(jobItems[i],"jobID","")+'</td>'
									+'<td class="jobname">'+AppJS.readValueInObject(jobItems[i],"jobName","")+'</td>'
									+'<td  class="creationdate">'+AppJS.readValueInObject(jobItems[i],"createdDateInReadableFormat","")+'</td>'
									+'<td class="userName">'+AppJS.readValueInObject(jobItems[i],"user.username","")+'</td>'
									+'<td class="lastJobRunTimeReadableFormat">'+AppJS.readValueInObject(jobItems[i],"lastJobRunTimeReadableFormat","Never")+'</td>'	
									+'<td class="activeRequestId">'+AppJS.readValueInObject(jobItems[i],"activeRequestId","0")+'</td>'
									+'<td class="status">'+AppJS.readValueInObject(jobItems[i],"status","0")+'</td>'
									+'<td>'
									+'	<div class="btn-group">'
									+'	  <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'
									+'	    Action <span class="caret"></span>'
									+'	  </button>'
									+'	  <ul class="dropdown-menu">'
									+'	    <li><a href="#" onclick="openJobDetail('+AppJS.readValueInObject(jobItems[i],"jobID","")+');">Details</a></li>'
									+'	    <li class="delete '+deleteButonStatusClass+'"><a href="#">Delete</a></li>'
									+'	    <li class="runjob '+runButonStatusClass+'" onclick="runJob('+AppJS.readValueInObject(jobItems[i],"jobID",0)+')"><a href="#">Run</a></li>'
									+'	    <li class="tracerequest ' +traceRequestIdStatusClass+'" onclick="traceRequestId(\''+AppJS.readValueInObject(jobItems[i],"activeRequestId",0)+'\')">'
									+'  	<a href="#">Track Job</a></li>'
									+'	    <li class="logs disabled"  ><a href="  #" onclick="openJobLog('+AppJS.readValueInObject(jobItems[i],"jobID","")+');">Logs</a></li>'
									+'	    <li class="makecopy disabled" ><a href="#">Make Copy</a></li>'
									+'	    <li class="visualize" ><a href="#"onclick="visualizeAnalysedData();">Visualize Analysed Data</a></li>'
									+'	  </ul>'
									+'	</div>'
									+'</td>'
									+'</tr>';
			
			if(currentItem == ""){
				$(container).append(itemWrapperHTML);				
			}else{
				$(currentItem).after(itemWrapperHTML);
			}
			currentItem = 	"#job"+AppJS.readValueInObject(jobItems[i],"jobID","");			
		}
	}else{ 
		var errMessages = "";
		for( var n in errors){ errMessages+= ((errMessages=="") ? "":"<br/>")+errors[n]; }
		itemWrapperHTML = '<tr id="task0"><td colspan="7" valign="middle" style="height:350px;">'+AppJS.wrapErrorInContainer(errMessages)+'<input type="button" name="Refresh" value="Refresh" onclick="jManager.listTask(\\"#taskListContainer\\");"/></td></tr>';
		$(container).html(itemWrapperHTML);
		doJobPaging("#job_pagination",0, 0);	
	} 
};

var doJobPaging = function(pagingTarget, totalpages, curpage){
	var htmlPageStr = "";
	if(totalpages==null || typeof totalpages === 'undefined') totalpages =1;
	if(curpage==null || typeof curpage === 'undefined') curpage =1;
	for(var p=1; p<=totalpages;p++){
		cls = (p==curpage) ? ' class="active" ':'';
		htmlPageStr+='<li'+cls+'><a href="#" onclick="listJobsByPage('+p+');">'+p+'</a></li>';
	}
	
	htmlPageStr = '<ul class="pagination">' + htmlPageStr + "</ul>";
	$(pagingTarget).html(htmlPageStr);
};

this.getJobDetails = function(jobID, responseHandler){	
	
	if(responseHandler==null || typeof responseHandler === 'undefined' || !$.isFunction(responseHandler)) responseHandler = jobDetailRceiveHandler;
	AppJS.doAjaxCall(AppJS.getApiUrl("JOB_INFO",{JOBID:jobID}), "GET", {}, responseHandler);
};

var jobDetailRceiveHandler = function(jsonData){
	//Yet to be implemented.
	var responseType = AppJS.readValueInObject(jsonData,"content.ajaxResponseType","");
	
	if(responseType == "statechange"){
		var responseState = AppJS.readValueInObject(jsonData,"content.ajaxResponseState","");
		if(responseState == "start"){
			//$("#myoverlayobject").css("display","block");
		}
		
		if(responseState == "complete"){
			//$("#myoverlayobject").css("display","none");
		}
		
	}
	
	if(responseType == "data"){
		//Then do whatever you wat with response object.
		
	}
	
}

this.runjob = function(jobId){
	var overlayObj = $("#jobCreationScreenOverlay");
	overlayObj.css("display","block");
	$.ajax( {
		type : "POST",
		url : AppJS.getConstant("apiProxyUrl"),
		data:{ api : AppJS.getApiUrl("RUN_JOB",{"JOB_ID":jobId})},			
		timeout: AppJS.getConstant("timeout"),
		success: function(json) {
			overlayObj.css("display","none");
			console.log("Raw data:\n"+json);
			jsonData = JSON.parse(json);
			console.log("Json Data Object");	
			console.log(jsonData);	
			
			var requestObj = AppJS.readValueInObject(jsonData,"content.request",{});
			var requestId = null;
			for(var requestItem in requestObj){
				requestId = requestItem;
				break;
			}
			
			var errors = AppJS.getErrorsFromJson(jsonData);
			
			if(errors == null || typeof errors ==='undefined' || !$.isArray(errors)){
				errors = [];
			}
			
			if(requestId == null ){
				errors.push("Failed to run job...");
			}
			if(errors.length>0){
				AppJS.renderError("#job_form_list_error_section",errors);
			}else{
				alert("job is successfully run.")
				$("#job"+jobId).find("td.activeRequestId").html(requestId);
				$("#job"+jobId).find("td.status").html("Running");
				$("#job"+jobId).find("td.lastJobRunTimeReadableFormat").html(AppJS.readValueInObject(requestObj[requestId],"requestCreationTimeInReadableFormat","Never"));
				
				
				$("#job"+jobId).find(".delete").addClass("disabled");
				var activeStatus = ["details" , "runjob" ,"tracerequest"];
				
				for(objectName in activeStatus){
					
					$("#job"+jobId).find("."+objectName).removeClass("disabled");
				}
				$("#job"+jobId).find(".tracerequest").removeClass("disabled");
			}
		},
		error: function(jqXHR, textStatus){
			   overlayObj.css("display","none");
			   if(textStatus == 'timeout'){
				   console.log("Cofirming request timeout.");	    	  
				   alert("Request timeout. Failed to get confirmation over task submission. Try again...");
			   }
			   
		}
	});
	
}

/******************************************* Job routines ends here ****************************************/

/*****************************Prepare task registration section required script*************************************************************/

var getCategories = function(handlerFunction,overlayID,refresh){
		if(overlayID == null || typeof overlayID === 'undefined') overlayID = null;
		if(refresh == null || typeof refresh === 'undefined') refresh = false;
		// if(!$.isFunction(handlerFunction)){ console.log("Renderer function not set, so omitting..."); return;}
		console.log("Getting categories");
		if(overlayID != null) $(overlayID).css("display","block"); 
		if(!refresh && AppJS.objLength(this.categoryData)>0){
			 if($.isFunction(handlerFunction)) handlerFunction(this.categoryData);
			 if(overlayID != null) $(overlayID).css("display","none");
			 return;
		}
		$.ajax( {
			Type : "GET",
			url : AppJS.getConstant("apiProxyUrl"),
			data:{ api : AppJS.getApiUrl("TASK_CATEGORIES")},
			jsonpCallback: 'theCallBack1123',	
			timeout: AppJS.getConstant("timeout"),
			success: function(json) {
				console.log("TASK_CATEGORIES : " + AppJS.getApiUrl("TASK_CATEGORIES"));
				console.log("Raw data:\n"+json);
				jsonData = JSON.parse(json);
				console.log("Json Data Object");	
				console.log(jsonData);	
				
				 var error = 0;
				
				 
				
				 if(jsonData!=null){
					 var categoriesReceived = AppJS.readValueInObject(jsonData,"content.taskCategory",[]);
					 if(categoriesReceived.length>0){
						 this.categoryData = jsonData;						 
					 }else{
						 error = 1;
					 }
					
				 }else{
					 error = 1;
				 }
				 
				 if(error == 1){
					    this.categoryData = {};  
						jsonData = { content : {},
									error:{
										   errors:[
										             {
										            	 uiMessage:
										            	 {
										            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
										            		 params:[],
										            		 default_message:AppJS.getString("adam_task_submission_error_message"),
										            		 paramCSV:""
										            	  },
										            	  errorType:"Network",
										            	  errorkeyName:"",
										            	  errorCode:AppJS.getConstant("genericErrorCode"),
										            	  errorMessage:errorMsg
										              }
										        ]
								   		  }
						};
						
					
				 }
				 if(overlayID != null) $(overlayID).css("display","none"); 
				 console.log("Handler function called...");
				 if($.isFunction(handlerFunction)) handlerFunction(jsonData);
				 
				//Now render
				
				
			},
			error: function(jqXHR, textStatus){
					var errorMsg = "";
					if(overlayID != null) $(overlayID).css("display","none");  
					errorMsg = (textStatus == 'timeout') ? AppJS.getString("request_timeout_error_message") : AppJS.getString("request_fullfill_error_message");			   
					jsonData = { content : {},
								error:{
									   errors:[
									             {
									            	 uiMessage:
									            	 {
									            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
									            		 params:[],
									            		 default_message:errorMsg,
									            		 paramCSV:""
									            	  },
									            	  errorType:"Network",
									            	  errorkeyName:"",
									            	  errorCode:AppJS.getConstant("genericErrorCode"),
									            	  errorMessage:errorMsg
									              }
									        ]
							   		  }
					};
					this.categoryData = {};  
					if($.isFunction(handlerFunction)) handlerFunction(jsonData);
				   
			}
		});
};

var populateCategoriesInTaskAddScreen = function(jsonData){
	var errors = AppJS.getErrorsFromJson(jsonData);
	if(errors.length == 0){
		if(jsonData!=null){
			 $('#categories').empty();
			 
			 var taskJsonData = AppJS.readValueInObject(taskAddStepsData['step2data']['json'],"content.taskValues",{});			 
			 if(taskJsonData == null || typeof taskJsonData === 'undefined') taskJsonData={};
			 var categories = AppJS.readValueInObject(taskJsonData,"associatedCategories","");
			 categories = ($.trim(categories) == "") ? [] : categories.split(",");
			 $.each(categories, function (indx, val) { categories[indx] = Number($.trim(val));});
			 
			 var categoriesReceived = AppJS.readValueInObject(jsonData,"content.taskCategory",[]);
			 if(categoriesReceived.length>0){
				 
				 for(i=0; i<categoriesReceived.length;i++){
					 parentCatName = AppJS.readValueInObject(categoriesReceived[i],"categoryName","");
					 parentCatID = AppJS.readValueInObject(categoriesReceived[i],"categoryId","");
					 children = AppJS.readValueInObject(categoriesReceived[i],"childCategory",[]);
					 var selectedFlag = (categories.indexOf(Number($.trim(""+parentCatID)))>-1) ? " selected=\"selected\" " : "";
					 $('#categories').append('<option '+selectedFlag+' value="'+parentCatID+'" class="selectOptionParent">&#9654;&nbsp;'+parentCatName+'</option>');  
					 for(j=0; j<children.length;j++){
						 childCatName = AppJS.readValueInObject(children[j],"categoryName","");
						 childCatID = AppJS.readValueInObject(children[j],"categoryId","");
						 var jselectedFlag = (categories.indexOf(Number($.trim(childCatID)))>-1) ? " selected=\"selected\" " : "";
						 $('#categories').append('<option '+jselectedFlag+' value="'+childCatID+'" class="selectOptionChild">&nbsp;&nbsp;&nbsp;&nbsp;&#9642;&nbsp;'+childCatName+'</option>');   
					 }
				 }
			 }
		 }
		  $("#step2overlay").css("display","none");  
	}else{
		var errMessages = "";
		for( var n in errors){ errMessages+= ((errMessages=="") ? "":"<br/>")+errors[n]; }
		var itemWrapperHTML = AppJS.wrapErrorInContainer(errMessages);
		$("errorstep1").html(itemWrapperHTML);
		console.log("Request timeout. yes");
	    $('#step1').css("display", "block");			    	  
	    $("#step2overlay").css("display","none");  
	    $('#step2').css("display", "none");
	    $("#uploadFileName").val("");
	    taskFileToUpload = null;
	    document.step1form.reset();
	}
	
	 
	 
	 
};


this.setupRegistrationScript = function(){
	var taskFileToUpload = null;
	var taskUploadToApi = null;
	var uploadPathField = "";
	var uiniqueTaskIDThatHasBeenInitiated = "";
	
	
	
	$(document).ready(function(){	
		
		$('#step1').css("display", "block");
		
		$('#step1iframe').load(function(){
			//Wait for sometime for fully load data.
			setTimeout(onStep1Data(),1500);   		
		});
	
		$("#submitArchive").click(function(){
			//uploadTaskArchive();		
			if(taskFileToUpload==null){			
				renderError("errorstep1",AppJS.getString("invalid_zip_error_message"));	
				return;
			}else{
				var ext = uploadPathField.value;		
				ext = ext.split(".");
				ext = ext[ext.length-1].toLowerCase();
				if($.trim(ext) != "zip"){
					renderError("errorstep1",AppJS.getString("task_validzip_error_message"));					
					return;
				}
			}
			$("#step1overlay").css("display","block");  
			$("#progressstep1").html("");
			document.step1form.api.value = AppJS.getApiUrl("REGISTER_TASK_STEP1");
			document.step1form.action = AppJS.getConstant("apiProxyUrl");
			document.step1form.submit();	        
			   
		});
		
		$("#confirm").click(function(){
			confirmTask();
		});
		
		
		$("#cancelconfirm").click(function(){
			if(confirm(AppJS.getString("task_register_confirm_message"))){				
				$("#uploadFileName").val("");
				taskFileToUpload = null;
				document.step1form.reset();
				$('#step2').css("display", "none");
				$('#step1').css("display", "block");
			}
		});
		
		$("#addanothertask").click(function(){
			
				$("#uploadFileName").val("");
				taskFileToUpload = null;
				document.step1form.reset();
				$('#step3').css("display", "none");
				$('#step2').css("display", "none");
				$('#step1').css("display", "block");
				$('#errorstep1').html("");
				$('#errorstep2').html("");
				$("#step1overlay").css("display","none"); 
				$("#step2overlay").css("display","none");  
			
		});
		
		/* task bundle file selection and related activities */
		uploadPathField = document.getElementById('uploadFileName');
		var uploader = document.getElementById('uploadfld');
		uploader.onchange = function() {
			console.log(uploader);
			uploadPathField.value = uploader.files[0].name;	 
			taskFileToUpload = uploader.files[0];
			if($.trim(uploadPathField.value)=="") {
				$("#submitArchive").attr("enabled",false);
			}else{
				$("#submitArchive").attr("enabled",true);
			}
		}
		
		$(window).on('beforeunload', function(){
			if(taskFileToUpload!=null)
			 return AppJS.getString("task_register_warning_message");			
		});
	
		
	});
	
	var onStep1Data = function(){
		var data = ""+$.trim($("#step1iframe").contents().find("body").text() + "");	
		data = data.replace(/\r/g, "");
		data = data.replace(/\n/g, "");	
		console.log("Data received : "+data);
		var jsonData = JSON.parse(data);
		jsonData = JSON.parse(jsonData);		
		console.log(jsonData);
		//jsonData = AppJS.readValueInObject(jsonData,"content",null);
		$("#step1overlay").css("display","none");  
		$("#progressstep1").html("");
		if(jsonData == null){
			renderError("errorstep1",AppJS.getString("task_register_invalid_response_error_message"));
			
		}else{
			moveToStep2(jsonData);
		}
	}
	
	var moveToStep2 = function(jsonData){
		if(jsonData == null || typeof jsonData === 'undefined') return;
		console.log(jsonData);
		
		var errors = AppJS.getErrorsFromJson(jsonData);
		if(errors.length>0){
			var errMessages = "";
			for( var n in errors){ errMessages+= ((errMessages=="") ? "":"<br/>")+errors[n]; }
			renderError("errorstep1",errMessages);
			return;
		}
		
		if(AppJS.readValueInObject(jsonData,"content.taskValues.taskName",null)==null){
			renderError("errorstep1",AppJS.getString("task_register_invalid_response_error_message"));
			return;
		}
		
		taskAddStepsData['step2data']['json'] =jsonData; 
		jsonData = AppJS.readValueInObject(jsonData,"content.taskValues",{});
		$("#taskname").val(AppJS.readValueInObject(jsonData,"taskName",""));
		if(AppJS.readValueInObject(jsonData,"taskNameExist",false)){
			$("#tasknameerror").css("display","block");
		}else{
			$("#tasknameerror").css("display","none");
		}
		
		
		
		$("#displayname").html(getLocalizedString(jsonData,"metaInforamtion.ui_string_default_label"));
		$("#taskversion").html(AppJS.readValueInObject(jsonData,"taskVersion","0.0"));
		$("#taskidentifier").html(AppJS.readValueInObject(jsonData,"taskIdentificationId","-"));
		$("#packageuri").html(AppJS.readValueInObject(jsonData,"metaInforamtion.package_path.value","-"));
		$("#keywords").html(AppJS.readValueInObject(jsonData,"keyWords","-"));
		$("#description").html(getLocalizedString(jsonData,"metaInforamtion.description"));
				
		var prereq = AppJS.readValueInObject(jsonData,"targetServiceName","");
		var prereq_min = AppJS.readValueInObject(jsonData,"targetServiceMinVersion","");
		var prereq_max = AppJS.readValueInObject(jsonData,"targetServiceMaxVersion","");
		if($.trim(prereq)!=""){
			prereq = "<span style=\"text-transform: uppercase;font-weight:bold;\">"+prereq+"</span>";
			if($.trim(prereq_min)!=""){
				prereq = prereq + "&nbsp; ("+AppJS.getString("prerequisite_min_version",[prereq_min])+")&nbsp;";	
			}
			if($.trim(prereq_max)!=""){
				prereq = prereq + "&nbsp; ("+AppJS.getString("prerequisite_max_version",[prereq_max])+")&nbsp;";
			}
		}
		$("#prerequisites").html(prereq);
		
		//SL	Name	Label	Type	Required	Max Len.	Default Value	Validation Type	Validation Value	JS Event	Place Holder	Hint	Input Source
		var inputHtml = "";
		var inputObj = AppJS.readValueInObject(jsonData,"inputParameters",null);
		if(inputObj!=null){
			for(var obj in inputObj){
				var inputName = obj;
				var inputType = AppJS.readValueInObject(inputObj,obj+".input_type.attribute.type","text");
				var inputSource = AppJS.readValueInObject(inputObj,obj+".input_source.value","user");
				var inputPlaceholder = getLocalizedString(inputObj,obj+".input_type_palceholder");
				var inputHint = getLocalizedString(inputObj,obj+".hint_label");
				var inputMaxLength = AppJS.readValueInObject(inputObj,obj+".max_length.value","");
				var inputIsRequired = (AppJS.readValueInObject(inputObj,obj+".is_required.value",false)) ? "Y":"N";
				var sl = AppJS.readValueInObject(inputObj,obj+".input_sequence_number.value",1);
				var label = getLocalizedString(inputObj,obj+".label_name");
				var defaultValue = AppJS.readValueInObject(inputObj,obj+".default_value.value","");
				var validationType = AppJS.readValueInObject(inputObj,obj+".validation_type.value","");
				var validationValue = AppJS.readValueInObject(inputObj,obj+".validation_type.attribute.validation_value","");
				
				if($.trim(inputSource).toLowerCase()!= 'user'){
					inputType = "readonly";
				}
				
				var jsattached = "<span style=\"text-transform: uppercase;font-weight:bold;\">"+AppJS.readValueInObject(inputObj,obj+".javascipt_snippet.attribute.jsEvent","")+"</span>:"+AppJS.readValueInObject(inputObj,obj+".javascipt_snippet.value","");
				var inputRow = "<tr>"
				+"<td scope=\"row\">"+sl+"</td>"
				+"<td>"+inputName+"</td>"
				+"<td>"+label+"</td>"
				+"<td>"+((inputType == "readonly") ? "(Read Only)" : inputType)+"</td>"
				+"<td>"+inputIsRequired+"</td>"
				+"<td>"+inputMaxLength+"</td>"
				+"<td>"+defaultValue+"</td>"
				+"<td>"+validationType+"</td>"
				+"<td>"+((inputType == "readonly") ? "":validationValue)+"</td>"
				+"<td>"+((inputType == "readonly") ? "":jsattached)+"</td>"
				+"<td>"+((inputType == "readonly") ? "" : inputPlaceholder)+"</td>"
				+"<td>"+((inputType == "readonly") ? "" : inputHint)+"</td>"
				+"<td>"+inputSource+"</td></tr>";
				inputHtml = inputHtml + inputRow;
			}
		}
		$("#inputs").html(inputHtml);
		
		getCategories(populateCategoriesInTaskAddScreen,"#step2overlay" );
		$('#step1').css("display", "none");
		$('#step2').css("display", "block");
		$("#step2overlay").css("display","block");  
		
	};
	
	//var onCatDataReceive = function(da)
	
	
	
	
	var confirmTask = function (){
	   console.log("Sending updated data of task to confirm the task submission in repo.");
	  
	   var categories = $('#categories').val(); 
	   if(categories == null || typeof categories === 'undefined') categories = '';
	   console.log("categories : "+categories);
	   
	   var tempraroryFileUUID = AppJS.readValueInObject(taskAddStepsData['step2data']['json'],"content.taskValues.tempraroryFileUUID",null);
	   
	   //Validate form
	   var msg = "";
	   var moveback = false;
	   var validationErrors = [];
	   if($.trim($("#taskname").val()) == ""){
		  validationErrors.push(AppJS.getString("task_name_required_error_message"));
	   }
	   
	   if($.trim(categories) == ""){	   
		   validationErrors.push( AppJS.getString("task_category_not_selected_error_message"));
		   AppJS.getString("task_category_not_selected_error_message")
	   }
	   
	   if(tempraroryFileUUID == null || $.trim(""+tempraroryFileUUID) == ""){
		   validationErrors.push(AppJS.getString("task_transaction_uniqueid_invalid_error_message"));
	   }
	   
	   if(validationErrors.length>0){
		   renderError("errorstep2",validationErrors);
		   return;
	   }
	   
		$("#step2overlay").css("display","block");  
		
		var taskNameValue = $.trim($("#taskname").val());
		var categoryList = $.trim(categories);
		$.ajax( {
			type : "POST",
			url : AppJS.getConstant("apiProxyUrl"),
			data:{ api : AppJS.getApiUrl("REGISTER_TASK_CONFIRMATION_STEP2"), 
				   jsonBodyData:JSON.stringify({RequestInfo:{actionName:"confirmtaskdetails"}, Body:{taskName : taskNameValue, categoryDetails:categoryList, tempraroryFileUUID:tempraroryFileUUID}})},			
			timeout: AppJS.getConstant("timeout"),
			success: function(json) {
				console.log("REGISTER_TASK_CONFIRMATION_STEP2 : " + AppJS.getApiUrl("REGISTER_TASK_CONFIRMATION_STEP2"));
				console.log("Raw data:\n"+json);
				jsonData = JSON.parse(json);
				console.log("Json Data Object");	
				console.log(jsonData);	
				var taskId = AppJS.readValueInObject(jsonData,"content.taskValues.taskId",null);
				var errors = AppJS.getErrorsFromJson(jsonData);
				if(errors == null || typeof errors ==='undefined' || !$.isArray(errors)){
					errors = [];
				}
				if(taskId == null || isNaN(Number(taskId)) || Number(taskId) == 0){
					errors.push(AppJS.getString("registertask_error_message"));					
				}
				$("#step2overlay").css("display","none");    
				if(errors.length>0){
					renderError("errorstep2",errors);
				}else{
				   $("#step1overlay").css("display","none"); 
				   $('#step1').css("display", "none");			    	  
				   $("#step2overlay").css("display","none");  
				   $('#step2').css("display", "none");
				   $('#step3').css("display", "block");
				   
				}
					
				
			},
			error: function(jqXHR, textStatus){
				   if(textStatus == 'timeout'){
					   console.log("Cofirming request timeout.");	    	  
					   $("#step2overlay").css("display","none");
					   alert(AppJS.getString("request_timeout_for_task_submission_error_message"));					   
				   }
				   $("#step2overlay").css("display","none");  
			}
		});
	}
	
	var getLocalizedString = function(jsonData,key){
		if(jsonData == null || typeof jsonData === 'undefined') return "";
		var currentLang = "en";//AppJS.getConstant("lang");	
		var stringObj = AppJS.readValueInObject(jsonData,key,null);
		if(stringObj == null) return "";
		var localeKey = AppJS.readValueInObject(stringObj,"attribute.message_key",null);
		var defaultString = AppJS.readValueInObject(stringObj,"value",null);
		if(localeKey== null && defaultString==null) return "";
		var localeString = AppJS.readValueInObject(stringObj,"attribute."+localeKey+"_"+currentLang,null);
		//alert("Key : attribute."+localeKey+"_"+currentLang+" : "+localeString);
		if(localeString==null){
			return ((defaultString!=null) ? defaultString : "");
		}else{
			return localeString;
		}
	}
	
	var renderError = function(renderTarget, errors, toAppend){
		
		if(renderTarget == null || typeof renderTarget === 'undefined' || errors == null || typeof errors === 'undefined'){
			return;
		}
		if(toAppend == null || typeof toAppend === 'undefined') toAppend = false;
		if($.isArray(errors)){
			if(toAppend){
				$("#"+renderTarget).prepend(AppJS.wrapErrorInContainer(errors.join("<br />")));			
			}else{
				$("#"+renderTarget).html(AppJS.wrapErrorInContainer(errors.join("<br />")));
			}
		   
		}else{
			if(toAppend){
				$("#"+renderTarget).prepend(AppJS.wrapErrorInContainer(errors));
			}else{
				$("#"+renderTarget).html(AppJS.wrapErrorInContainer(errors));
			}
				
		}
	}
	
	
};


/*****************************Prepare task registration section required script ends here*************************************************************/


this.openTab = function(tab){
	console.log("coming in called : "+tab);
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
    console.log("openTab called : "+tab);
};

}

function openTab(tab){
	console.log("opening tab = "+tab);
    $('.nav-tabs a[href="#' + tab + '"]').tab('show');
};

var jm = null;
function addJob(taskID, formID, screenOverlay){
	$('#createJob').css("display", "block");			    	  
    $('#submitSuccess').css("display", "none");
	jm = new JobAndTaskManager();
	jm.createJobFromTaskID(taskID, formID, screenOverlay);
}


function submitJobForm(){
	if(jm != null){
		jm.submitJob();
	}else{
		console.log("JobAndTaskManager Object is null so we can't  create job.");
	}
}

function listTasksByPage(pageNumber){
	if(jManagerTask!=null && typeof jManagerTask !=='undefined'){		
		jManagerTask.listTask("#taskListContainer", jManagerTask.renderTaskList,pageNumber);
	}else{
		var jManagerTask =  new JobAndTaskManager();	
		jManagerTask.listTask("#taskListContainer", jManagerTask.renderTaskList,pageNumber);
	}
}

function listJobsByPage(pageNumber){
	if(jManager!=null && typeof jManager !=='undefined'){		
		jManager.listJob("#jobListContainer", jManager.renderJobList,pageNumber);
	}else{
		var jManager =  new JobAndTaskManager();	
		jManager.listJob("#jobListContainer", jManager.renderJobList, pageNumber);
	}
}

function refreshTaskList(){	
	if(jManagerTask!=null && typeof jManagerTask !=='undefined'){
		jManagerTask.listTask("#taskListContainer",jManagerTask.renderTaskList);
	}	
	else{
		try{
			jManagerTask = new JobAndTaskManager();
			jManagerTask.listTask("#taskListContainer",jManagerTask.renderTaskList);
		}catch(e){
			alert(AppJS.getString("refresh_tasklist_error_message"));			
		}
	}
}

//================Task search flag==================//

function filterTask(keyWorkFiledName){
	var searchFlag = null;
	inputFieldObject = $("[name='"+keyWorkFiledName+"']");
	if($.trim(inputFieldObject.val()) !="" ){
		searchFlag = {};
		if( $.trim(inputFieldObject.val())!="") {
			searchFlag.keyword = $.trim(inputFieldObject.val());
		}
		
	}
	
	
	if(jManagerTask!=null && typeof jManagerTask !=='undefined'){		
		jManagerTask.listTask("#taskListContainer", jManagerTask.renderTaskList,1,searchFlag);
	}else{
		var jManagerTask =  new JobAndTaskManager();	
		jManagerTask.listTask("#taskListContainer", jManagerTask.renderTaskList,1,searchFlag);
	}
	
}

function filterJobs(keyWorkFiledName){
	var searchFlag = null;
	inputFieldObject = $("[name='"+keyWorkFiledName+"']");
	
	if(inputFieldObject == null || inputFieldObject.length == 0){
		console.log("keyWord field name on not exist fieldName = "+inputFieldObject);
		return;
	}
	
	if($.trim(inputFieldObject.val()) != "" ){
		searchFlag = {};
		if( $.trim(inputFieldObject.val())!=""){
			searchFlag.keyword = $.trim(inputFieldObject.val());
		}
	}

	if(jManager!=null && typeof jManager !=='undefined'){		
		jManager.listJob("#jobListContainer", jManager.renderJobList,1,searchFlag);
	}else{
		var jManager =  new JobAndTaskManager();	
		jManager.listJob("#jobListContainer", jManager.renderJobList,1,searchFlag);
	}
	
	
}

function traceRequestId(requestId){
	//alert(requestId);
	if(requestId == null  || typeof requestId === "undefined"){
		requestId = "102025255263645";
	}
	openUrlInDialog('jmWin', AppJS.getConstant("contextPath")+'/request-view?requestId='+requestId, "Request",true, "50%", 600, false,false);
}

function openJobDetail(jobId){
	openUrlInDialog('jmWin', AppJS.getConstant("contextPath")+'/job-detail?jobid='+jobId, "Job Details",true, "50%", 600, false,false);
	

}

function submitSuccess(){
	 $( "#step1" ).css( "display", "none" );
	 $( "#step2" ).css( "display", "none" );
	 $( "#step3" ).css( "display", "block");
	
}

function backToTaskListAfterJobAdding(){
	openTab('job-list');
	listJobsByPage(1);
}

function backToTaskListAfterTaskAdding(){
	openTab('task-list');
	listTasksByPage(1);
}


function runJob(jobId){
	if(jobId == null || jobId == 0){
		console.log("job id is invalid jobId = " + jobId);
		alert("job id is invalid jobId = " + jobId);
		return ; 
	}
	var jManager =  new JobAndTaskManager();
	jManager.runjob(jobId);
	
}

function renderChart(chartType){
	var chart = new CanvasJS.Chart("chrt",{
		height: 300,
		width:300,
		title:{
			text: "Medanta Reviews:",
			verticalAlign: "top",//top, center, bottom
			horizontalAlign: "left",//left, center, right
			fontSize: 20,//in pixels
			fontFamily: "Calibri",
			fontWeight: "bold", //normal, bold, bolder, lighter,
			fontColor: "black",
			margin: 0,
			padding: 0			
		},
		axisY: {
			title: "Reviews(%)"
		  },
        animationEnabled: true,
		legend:{		
			verticalAlign: "bottom",
			horizontalAlign: "center",		
			fontSize: 13,
			fontFamily: "Helvetica",
			fontColor: "black",
			reversed: true
		},
		theme: "theme1",
		DataSeries: {indexLabelFontColor: "black"},
		data: [
		{        
			type: chartType,       
			indexLabelFontFamily: "Garamond",       
			indexLabelFontSize: 13,
			indexLabelFontColor: "black",
			indexLabel: "{label} {y}%",
			startAngle:-20,      
			showInLegend: (chartType=="pie" || chartType=="doughnut"),
			legendText: "{label}",
			toolTipContent:"{legendText} {y}%",
			click:onClick,
			dataPoints: cdata
		}
		]
	});
	chart.render();
	function onClick(e) {
		$('#reviewDataTD').html();
		$('#reviewDataTD').html(tableData);
		$('#reviewTable tr td:nth-child(4)').filter(function() {if($(this).text()!=e.dataPoint.label) {return true;}}).parent().remove();
		//getReviews();
		//alert( e.dataPoint.label+'-'+ e.dataSeries.type + ", dataPoint { x:" + e.dataPoint.x + ", y: "+ e.dataPoint.y + " }" );
	}
}
  /**********************************************************/
/* Used for fetching data for MEDANTA-POC ******/
function getReviews(){	
	try {		
			
			//alert('here');
			//directorystring=defaultDirectory+"/"+defaultuser+"/"+datastructureType;	
			directorystringpath="{\"path\":\"/user/hduser/medanta/MouthShut-Reviews/ReviewsOnly.html\"}";
			method="POST";
			currentCluster="alethe01";
			apistring= "/clusters/"+currentCluster+"/datasupport";
			//alert(directorystring);
			getresponse=ajaxcallfunction(method,apistring,directorystringpath,"filepreview");
			//alert(getresponse.content.previewdata);
			//$("#browser").prepend('<li id="defaultdirectoryLI"><span class="folder">'+datastructureType+'</span><ul></ul></li>');
			/*$.each(getresponse.content.connectionsource.directoryList, function(idx, obj) {
				if(obj.type.trim()=='DIRECTORY')
				$("#defaultdirectoryLI ul").first().prepend('<li><span class="folder">'+obj.pathSuffix+'</span><ul></ul></li>');
				else{
				$("#defaultdirectoryLI ul").first().prepend('<li><span class="file">'+obj.pathSuffix+'</span><ul></ul></li>');	
				}
			});*/
		
			$("#browser li").removeClass('collapsable');
			$("#browser li").addClass('expandable');
	}
	catch(err) {
	alert('Unable to fetch HDFS Directory.'+err);
	}
}
var apiBase = "/edb-adminconsole/proxy-api";
function ajaxcallfunction(method,apistring, bodydata, actionname){
	var getresponse='';
	try {
		var dataToSet = {api:apistring};
		if(method.toLowerCase()=="get"){ dataToSet.body=bodydata; dataToSet.action=actionname;}
		if(method.toLowerCase()=="post") dataToSet.jsonBodyData = JSON.stringify({RequestInfo:{actionName:actionname}, Body:JSON.parse(bodydata)});

			//console.log("called : "+"/clusters/"+currentCluster+"/datasupport");
			$.ajax( {
				type : method,
				url : apiBase,
				data:dataToSet,
				jsonpCallback: 'theCallBack32',	
				timeout: 30000,
				async: false,
			    success: function(json) {
			    	//console.log(json);
			    	jsonData = JSON.parse(json);
			    	//console.log(jsonData);	
			    	getresponse= jsonData;
			    	//console.log(json);
			    },
			    error: function(jqXHR, textStatus){
				       if(textStatus == 'timeout'){
				    	   //console.log("Request timeout. yes");
				       }
				       getresponse= 'ERROR:'+textStatus;
				      console.log(textStatus);
				}
			    });
	
	}
	catch(err) {
		alert('Error while calling ajax function'+err);
	}
	return getresponse;
}




/**********************************************************/
/* Used for fetching data for MEDANTA-POC ******/




















function visualizeAnalysedData(){
	openTab('analyse-job-result');	
}


function clearfilterContent(currentObject){
	$(".clear-filters").remove();
	
	inputFileName = $(currentObject).data("keywordfieldname");
	inputFieldObject = $("[name='"+inputFileName+"']");

	
	if(inputFieldObject != null && inputFieldObject.length > 0){
		inputFieldObject.val("");
	}
	var myfunction = eval(functionName);
	if(myfunction == null  || typeof myfunction === "undefined" ||  !$.isFunction(myfunction)){
		console.log("function is not exist, name =" + functionName);
		return ;
	}
	inputFieldObject = $("[name='"+inputFileName+"']");
	myfunction(""+inputFileName);
}



$(document).ready(function(){
	$(".filter").click(function(event){
		event.preventDefault();
		
		currentObject = this;
		inputFileName = $(currentObject).data("keywordfieldname");
		functionName = $(currentObject).data("functionname");
		if(functionName == null  || inputFileName == null){
			console.log("functionName =" + functionName + " inputFileName =" + inputFileName + " is not valid");
			return ;
		}
		var myfunction = eval(functionName);
		if(myfunction == null  || typeof myfunction === "undefined" ||  !$.isFunction(myfunction)){
			console.log("function is not exist, name =" + functionName);
			return ;
		}
		
		inputFieldObject = $("[name='"+inputFileName+"']");
		
		if(inputFieldObject == null || inputFieldObject.length == 0){
			console.log("keyWord field name on not exist fieldName = "+inputFieldObject)
			return;
		}
		myfunction(""+inputFileName);
		
		if(inputFieldObject.val().trim() !=  ""){
			$(".clear-filters").remove();
			var clearFilterHtml = '<input type="button"  class="btn btn-default pull-right clear-filters" name="" value="Clear Filter " style="margin-right: 5px;">';
			$(this).parent("div").append(clearFilterHtml);
			$(".clear-filters").unbind( "click" );
			$(".clear-filters").bind("click",function(event){clearfilterContent(currentObject)});
		}else{
			$(".clear-filters").remove();
		}
		
	});
})

