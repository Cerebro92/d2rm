<%@ page contentType="text/javascript" %>
<%@ taglib prefix="s" uri="/struts-tags"%>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles"%>

	var AppJS = new function(){
	var a = document.createElement('a');
	a.href = window.location.href;
	this.currentPage = a.pathname;
	this.i18nLoaded = false;
	
	this.constants = {
			currentCluster : "<s:property value="#session['selectedCluster']"/>",			
			contextPath    :"<s:property value="#session['CONTEXT_PATH']"/>",
			serverUreachableInfoPageUrl : "<s:property value="#session['CONTEXT_PATH']"/>/proxy-api",
			currentPage : this.currentPage,
			apiProxyUrl    :"<s:property value="#session['CONTEXT_PATH']"/>/proxy-api",
			dashboardUrl    :"<s:property value="#session['CONTEXT_PATH']"/>/dashboard",
			ajaxUpdateInterval : 30000,
			timeout : 30000,
			stringBundleFile : null,
            relativeStringBundleFolderPath: null,
            localeResourceInfoAsJson: '<s:property value="#session['localeResourceInfo']"/>',
            lang : "en",
            genericErrorCode : 1410004		
			
	};
	
	this.initializeLocale = function(){
	  try{
	  
	    //Relative path of current page
	   
	    	   
		if(this.constants.localeResourceInfoAsJson!=null && typeof this.constants.localeResourceInfoAsJson != 'undefined' && this.constants.localeResourceInfoAsJson!=''){
			this.constants.localeResourceInfoAsJson = this.constants.localeResourceInfoAsJson.replace(/&quot;/g ,"\"");
			var localeResourceInfoObj = JSON.parse(this.constants.localeResourceInfoAsJson);
			this.constants.stringBundleFile = this.readValueInObject(localeResourceInfoObj, "files", null);
			this.constants.relativeStringBundleFolderPath = this.constants.contextPath +  this.readValueInObject(localeResourceInfoObj, "resourceFolder", null);
			this.constants.lang = this.readValueInObject(localeResourceInfoObj, "lang", "en");
			console.log("Lang set to :"+this.constants.lang);
			
			if(!this.i18n && this.constants.stringBundleFile != null && this.constants.relativeStringBundleFolderPath != null){
                    jQuery.i18n.properties({
                         name: this.constants.stringBundleFile, 
                         path: this.constants.relativeStringBundleFolderPath, 
                         mode:'map',
                         language : this.constants.lang,
                         cache:true,
                         callback: function() { 
                                  AppJS.i18n = true;           
                         }
                     });
                            
           }
		}
	  }catch(e){}
	};
	
	this.serverApi = {
			CLUSTER_LIST 			   					: "/clusters/",
			HDFS_INFO 				   					: "/clusters/{CLUSTER_NAME}/services/HDFS",
			HDFS_COMPONENTS_INFO 	   					: "/clusters/{CLUSTER_NAME}/services/HDFS/component",
			CLUSTER_HOST_LIST 		   					: "/clusters/{CLUSTER_NAME}/hosts",
			NAMENODE_STATISTICS 	   					: "/clusters/{CLUSTER_NAME}/services/HDFS/component/NAMENODE",
			HOST_INFO				   					: "/clusters/{CLUSTER_NAME}/hosts/{HOST_NAME}",
			HOST_MERICS 			   					: "/clusters/{CLUSTER_NAME}/hosts/{HOST_NAME}/metrices",
			HOST_COMPONENT_LIST		   					: "/clusters/{CLUSTER_NAME}/hosts/{HOST_NAME}/hostcomponent",
			CLUSTER_SERVICE_LIST	   					: "/clusters/{CLUSTER_NAME}/services",
			RESOURCE_MANGER_STATISTICS 					: "/clusters/{CLUSTER_NAME}/services/HDFS/component/RESOURCEMANAGER",
			STACK_LIST				   					: "/stack",
			STACK_VERSION_INFO		   					: "/stack/{STACK_NAME}/masterservices",			
			REQUESTS_INFO		       					: "/clusters/{CLUSTER_NAME}/request",
			ALERT_INFO		       	   					: "/clusters/{CLUSTER_NAME}/alerts",
			HDFS_DEFAULT_DIR       						: "/clusters/{CLUSTER_NAME}/datasupport/directory/defaultdirectory",
   			HDFS_DIR_ITEMS        						: "/clusters/{CLUSTER_NAME}/datasupport/directory",
			REGISTER_TASK_STEP1		   					: "/clusters/{CLUSTER_NAME}/task/register/",
			HDFS_DEFAULT_DIR							: "/clusters/{CLUSTER_NAME}/datasupport/directory/defaultdirectory",
			HDFS_DIR_ITEMS								: "/clusters/{CLUSTER_NAME}/datasupport/directory",
			REGISTER_TASK_CONFIRMATION_STEP2		    : "/clusters/{CLUSTER_NAME}/task/register/confirm",
			TASK_CATEGORIES								: "/taskcategories",
			TASK_LIST									: "/clusters/{CLUSTER_NAME}/task/gettask/all",
			TASK_INFO									: "/clusters/{CLUSTER_NAME}/task/gettask/{TASKID}",
			JOB_LIST									: "/clusters/{CLUSTER_NAME}/job/getalljobs",
			ADD_JOB										: "/clusters/{CLUSTER_NAME}/job/create",
			JOB_INFO									: "/clusters/{CLUSTER_NAME}/job/getjob/{JOBID}",
			RUN_JOB										: "/clusters/{CLUSTER_NAME}/job/runjob/{JOB_ID}",
			MANAGE_LICENSE								: "/managelicense"
	};
	/*REGISTER_TASK_STEP1		   					: "/clusters/{CLUSTER_NAME}/task/register/",*/
	
	
	this.getConstant = function(key){
		var val = "";
		if(key == null || typeof key === 'undefined') return val;
		try{
			val = this.constants[key];
		}catch(e){
			val = "";
		}
		return val;
	};
	
	this.getApiUrl = function(key, obj){
		var val = "";
		if(key == null || typeof key === 'undefined') return val;
		try{
			val = this.serverApi[key];
			var keytoReplace = "{CLUSTER_NAME}";			 
			val = val.replace(new RegExp(keytoReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), this.getConstant("currentCluster"));
			if(obj != null && typeof obj !== 'undefined'){
				for(var i in obj){	
				 keytoReplace = "{"+i.toUpperCase()+"}";			 
				 val = val.replace(new RegExp(keytoReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g'), obj[i]);
				}
			}
		}catch(e){
			val = "";
		}
		return val;
	};
	
	this.readValueInObject = function (obj,path, defaultReturn) {
						 if(defaultReturn == null || typeof defaultReturn == 'undefined'){	
								defaultReturn = null;
						 }   
					
					    try{
						    if (obj === void 0 || obj === null) obj = self ? self : this;
						    if (typeof path !== 'string') path = '' + path;
						    var c = '', pc, i = 0, n = path.length, name = '';
						    if (n) while (i<=n) ((c = path[i++]) == '.' || c == '[' || c == ']' || c == void 0) ? (name?(obj = obj[name], name = ''):(pc=='.'||pc=='['||pc==']'&&c==']'?i=n+2:void 0),pc=c) : name += c;
						    if (i==n+2) {		
							return defaultReturn;
						    }
						    if(typeof obj == 'undefined'){								
								return defaultReturn;
							}else{								
						    	return obj;
							}
					    }catch(e){	
							return defaultReturn;
					    }
	};
	
	this.getString = function(key, valueAsStringOrArray){
              if(!this.i18n){
                   this.initializeLocale();
              }
             if(this.i18n){
                     if(key == null || typeof key == 'undefined') key="";
                     if(valueAsStringOrArray == null || typeof valueAsStringOrArray == 'undefined') valueAsStringOrArray =[];
                     var localeString =  $.i18n.prop(key, valueAsStringOrArray);
                     if(localeString == '['+key+']') localeString = key;
                     return localeString;
             }else{ return key;}
    };
	
	this.getRandomIntInRange = function (min, max) {
		    return Math.random() * (max - min) + min;
	}
	
	this.getUrlParts = function(url) {
		    var a = document.createElement('a');
		    a.href = url;
		
		    return {
		        href: a.href,
		        host: a.host,
		        hostname: a.hostname,
		        port: a.port,
		        pathname: a.pathname,
		        protocol: a.protocol,
		        hash: a.hash,
		        search: a.search
		    };
	};
	
	this.getErrorsFromJson = function(jsonObj) {
		   var errorstrings = [];		   
		   console.log(jsonObj);
		   jsonObj = AppJS.readValueInObject(jsonObj,"error.errors",[]);
		   
		   for(i in jsonObj){
		   	   console.log("Error string : ");
		   	   console.log(i);
		   	   console.log(AppJS.readValueInObject(jsonObj[i],"uiMessage",{}));
		   	   
			   errorstrings.push(this.getLocalizedStringFromJsonNode(AppJS.readValueInObject(jsonObj[i],"uiMessage",{}),AppJS.readValueInObject(jsonObj[i],"errorCode","")));
		   }
		   return errorstrings;
	};
	
	
	
	this.getLocalizedStringFromJsonNode = function(jsonNodeObj, errorCode) {
	   var uistring = "";
	   console.log("error localization called.");
	  
	   if(jsonNodeObj == null || typeof jsonNodeObj == 'undefined') console.log("jsonNodeObj is null");
	   if(jsonNodeObj == null || typeof jsonNodeObj == 'undefined') return uistring;
	   if(errorCode == null || typeof errorCode == 'undefined') errorCode = "";
	   	   
	   errorCode = ($.trim(errorCode)!="") ? "["+$.trim(errorCode)+"]" : "";
       var default_message = AppJS.readValueInObject(jsonNodeObj,"default_message","");
	   if(default_message == ""){
		   default_message = AppJS.readValueInObject(jsonNodeObj,"value","");
	   }
	   console.log("default_message : "+default_message);
	   var message_key = AppJS.readValueInObject(jsonNodeObj,"message_key",null);
	   var attribute_key = AppJS.readValueInObject(jsonNodeObj,"attribute",null);
	   if(message_key == null && attribute_key!=null){
		   jsonNodeObj = attribute_key;
		    message_key = AppJS.readValueInObject(jsonNodeObj,"message_key",null);
	   }
	    console.log(message_key+","+attribute_key);
	   if(message_key!=null && $.trim(message_key)!=""){
	   		console.log("message key defined");
		   var params = AppJS.readValueInObject(jsonNodeObj,"paramCSV","");
		   
		   if($.trim(params)!="" ){
		   		params = params.split(",");
		   		console.log("params");
		   		console.log(params);
		   }else{
		   		params = [];
		   }
		   // Check whether error locale string defined in itself
		   //console.log("Lang = "+AppJS.getConstant("lang"));
		   var localeStringInItSelf = jsonNodeObj[message_key+"_"+AppJS.getConstant("lang")];
		   if(localeStringInItSelf == null || typeof localeStringInItSelf == 'undefined') localeStringInItSelf = null;
		   //console.log("localeStringInItSelf = "+localeStringInItSelf);
		   if(localeStringInItSelf!=null && $.trim(localeStringInItSelf)!=""){
		   		localeStringInItSelf = this.fixPlaceHolders(localeStringInItSelf,params);
		   		uistring = errorCode+" "+localeStringInItSelf;
		   }else{
		   		var localeString = AppJS.getString(message_key,params);
		   		if(localeString == message_key){
		   			if(params.length>0){
		   				localeString = this.fixPlaceHolders(default_message,params);
		   			}else{
		   				localeString = default_message;
		   			}
		   			
		   		}
		   		if($.trim(localeString)!="") uistring = errorCode+" "+localeString;
		   }
		   
		}else{
			if($.trim(default_message)!="") uistring = errorCode+" "+default_message;
		}
		return uistring;
	};
	
	this.checkHostReachability = function(){
		var json_Data = null;
		var me = this;
		console.log("Reachability called : "+AppJS.getApiUrl("CLUSTER_LIST"));
		$.ajax( {
			Type : "POST",
			url  : AppJS.getConstant("apiProxyUrl"),
			data : {api:AppJS.getApiUrl("CLUSTER_LIST")},
			jsonpCallback: 'reqCallBack'+AppJS.getRandomIntInRange(500,1000),	
			timeout: 5000,
			mineref : me,
		    success: function(json) {
				console.log("Reachability data received : \r\n"+json);
				var isValidJson = false;
				try{
				        json_Data = JSON.parse(json);
						isValidJson = true;
						if(Object.keys(json_Data).length>0){
							window.location.href =  AppJS.getConstant("dashboardUrl");
						}else{
							isValidJson = false;
						}
					
				}catch(e){ isValidJson = false;  };
				
				try{
					if(!isValidJson){
						setTimeout(function(objRef){objRef.checkHostReachability();}, 50000, me);						
					}
					
				}catch(e){}
			},
			error: function(jqXHR, textStatus){
		       if(textStatus == 'timeout'){
		    	  // console.log("Request timeout.");		    	 
		       }
			   setTimeout(function(objRef){objRef.checkHostReachability();}, 50000, me);
			}
		 });
	};
	
	
	this.objLength = function(obj) {
		    var count = 0;
		    
		    if (typeof obj == "object") {
		    
		        if (Object.keys) {
		            count = Object.keys(obj).length;
		        } else if (window._) {
		            count = _.keys(obj).length;
		        } else if (window.$) {
		            count = $.map(obj, function() { return 1; }).length;
		        } else {
		            for (var key in obj) if (obj.hasOwnProperty(key)) count++;
		        }
		        
		    }
		    
		    return count;
	};
	
	this.fixPlaceHolders = function(value, placeholderStringOrArray){
		var phvList;
		if(value == null || typeof value == 'undefined' || $.trim(value) == "") return value;
	    if(placeholderStringOrArray != null && typeof placeholderStringOrArray != 'undefined')   
	      phvList = placeholderStringOrArray;
	
	    // Place holder replacement
	    var i;
	    if (typeof(value) == 'string') {
	      // Handle escape characters. Done separately from the tokenizing loop below because escape characters are
	      // active in quoted strings.
	      i = 0;
	      while ((i = value.indexOf('\\', i)) != -1) {
	        if (value.charAt(i + 1) == 't')
	          value = value.substring(0, i) + '\t' + value.substring((i++) + 2); // tab
	        else if (value.charAt(i + 1) == 'r')
	          value = value.substring(0, i) + '\r' + value.substring((i++) + 2); // return
	        else if (value.charAt(i + 1) == 'n')
	          value = value.substring(0, i) + '\n' + value.substring((i++) + 2); // line feed
	        else if (value.charAt(i + 1) == 'f')
	          value = value.substring(0, i) + '\f' + value.substring((i++) + 2); // form feed
	        else if (value.charAt(i + 1) == '\\')
	          value = value.substring(0, i) + '\\' + value.substring((i++) + 2); // \
	        else
	          value = value.substring(0, i) + value.substring(i + 1); // Quietly drop the character
	      }
	
	      // Lazily convert the string to a list of tokens.
	      var arr = [], j, index;
	      i = 0;
	      while (i < value.length) {
	        if (value.charAt(i) == '\'') {
	          // Handle quotes
	          if (i == value.length - 1)
	            value = value.substring(0, i); // Silently drop the trailing quote
	          else if (value.charAt(i + 1) == '\'')
	            value = value.substring(0, i) + value.substring(++i); // Escaped quote
	          else {
	            // Quoted string
	            j = i + 2;
	            while ((j = value.indexOf('\'', j)) != -1) {
	              if (j == value.length - 1 || value.charAt(j + 1) != '\'') {
	                // Found start and end quotes. Remove them
	                value = value.substring(0, i) + value.substring(i + 1, j) + value.substring(j + 1);
	                i = j - 1;
	                break;
	              }
	              else {
	                // Found a double quote, reduce to a single quote.
	                value = value.substring(0, j) + value.substring(++j);
	              }
	            }
	
	            if (j == -1) {
	              // There is no end quote. Drop the start quote
	              value = value.substring(0, i) + value.substring(i + 1);
	            }
	          }
	        }
	        else if (value.charAt(i) == '{') {
	          // Beginning of an unquoted place holder.
	          j = value.indexOf('}', i + 1);
	          if (j == -1)
	            i++; // No end. Process the rest of the line. Java would throw an exception
	          else {
	            // Add 1 to the index so that it aligns with the function arguments.
	            index = parseInt(value.substring(i + 1, j));
	            if (!isNaN(index) && index >= 0) {
	              // Put the line thus far (if it isn't empty) into the array
	              var s = value.substring(0, i);
	              if (s != "")
	                arr.push(s);
	              // Put the parameter reference into the array
	              arr.push(index);
	              // Start the processing over again starting from the rest of the line.
	              i = 0;
	              value = value.substring(j + 1);
	            }
	            else
	              i = j + 1; // Invalid parameter. Leave as is.
	          }
	        }
	        else
	          i++;
	      }
	
	      // Put the remainder of the no-empty line into the array.
	      if (value != "")
	        arr.push(value);
	      value = arr;
	
	      // Make the array the value for the entry.
	      //$.i18n.map[key] = arr;
	    }
	
	    if (value.length == 0)
	      return "";
	    if (value.length == 1 && typeof(value[0]) == "string")
	      return value[0];
	
	    var s = "";
	    for (i = 0; i < value.length; i++) {
	      if (typeof(value[i]) == "string")
	        s += value[i];
	      // Must be a number
	      else if (phvList && value[i] < phvList.length)
	        s += phvList[value[i]];
	      else if (!phvList && value[i] + 1 < arguments.length)
	        s += arguments[value[i] + 1];
	      else
	        s += "{" + value[i] + "}";
	    }
	
	    return s;
  
	};
	
	this.wrapErrorInContainer = function(errString){
		return '<div class="alert alert-danger"  style="width:80%;margin:5px auto;text-align:left;"><a class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></a>'+errString+'</div>';	
	};
	
	this.doAjaxCall = function(url, methodType, dataObjectToSend, responseHandler, validatorFunction){
		
		console.log("Calling doAjaxCall");
		var validMethods = ['GET','POST'];
		if(responseHandler == null || typeof responseHandler ==='undefined' || !$.isFunction(responseHandler)){ 
			// response handler not defined so there is no need to do ajax call.
			return;
		}
		
		
		if(url == null || typeof url ==='undefined' || $.trim(''+url) == ""){
			
			var jsonData =wrapInGenericErrorStructure("Api rest interface must be supplied to do a successful request."); 
			responseHandler(jsonData);
			return;
		}
		
		if(methodType == null || typeof methodType ==='undefined' || $.trim(''+methodType) == "" || validMethods.indexOf($.trim(methodType.toUpperCase()))==-1){
			var jsonData = wrapInGenericErrorStructure("Rest protocol method must be defined and valid one (GET or POST).");
			responseHandler(jsonData);
			return;
		}
		
		if(dataObjectToSend == null || typeof dataObjectToSend ==='undefined'){
			dataObjectToSend = {};
		}		
		
		
		
		if(validatorFunction == null || typeof validatorFunction ==='undefined' || !$.isFunction(validatorFunction)){ 
			validatorFunction = null;
		}
		
		if(validatorFunction!=null){
		  	var errors = validatorFunction(dataObjectToSend);
		  	if(errors!=null &&  errors !== 'undefined' && $.isArray(errors) && errors.length>0 ){
		  		
				var jsonData = this.wrapInGenericErrorStructure(errors);
				jsonData.content.ajaxResponseType = "data";							
				responseHandler(jsonData);
				return;
		  	}
		}
		
		
		
		url = $.trim(url);
		methodType = methodType.toUpperCase();
		dataObjectToSend.api = url;
		$.ajax( {
			type : methodType,
			url  : AppJS.getConstant("apiProxyUrl"),
			data : dataObjectToSend,			
			timeout: AppJS.getConstant("timeout"),
			beforeSend: function(){
			   responseHandler({content:{ajaxResponseType:"statechange",ajaxResponseState:"start"}});
			},
			complete: function(){
			    responseHandler({content:{ajaxResponseType:"statechange",ajaxResponseState:"complete"}});
			},
		    success: function(json) {
				var isValidJson = false;
				try{
				        jsonData = JSON.parse(json);
						isValidJson = true;
						
					
				}catch(e){ isValidJson = false;  };
				
				if(!isValidJson){
					   jsonData = this.wrapInGenericErrorStructure("INVALID_JSON");
					   jsonData.content.raw=json;
					   jsonData.content.ajaxResponseType = "data";					   
					   responseHandler(jsonData);
				}else{
				  	   jsonData.content.ajaxResponseType = "data";		
					   responseHandler(jsonData);
				}
			
			},
			error: function(jqXHR, textStatus){
		        var errorMsg = "";				 
				errorMsg = (textStatus == 'timeout') ? "Request timeout. Try to request again." : "Request cannot be fulfilled due to some network issue or invalid response code from server.";			   
				console.log(errorMsg);
				jsonData = this.wrapInGenericErrorStructure(errorMsg);
				jsonData.content.ajaxResponseType = "data";		
				responseHandler(jsonData);
				
			}
		 });
	};
	
	
	this.wrapInGenericErrorStructure = function(error){
		if(error==null || error==='undefined') error = "";
		
		var jsonData = { 
						content : {},
						error:{
								errors:[]
						   	  }
					   };
		
		if($.isArray(error) && error.length>0){
			
				for(var indx in error){
					jsonData.error.errors.push(
						{
		            	  uiMessage:
		            	  {
		            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
		            		 params:[],
		            		 default_message:error[indx],
		            		 paramCSV:""
		            	  },
		            	  errorType:"Network",
		            	  errorkeyName:"",
		            	  errorCode:AppJS.getConstant("genericErrorCode"),
		            	  errorMessage:error[indx]
		              }
					);
				}
		}else{
			if($.trim(error)!=""){
				jsonData.error.errors.push(
						{
		            	  uiMessage:
		            	  {
		            		 message_key:"ERROR."+AppJS.getConstant("genericErrorCode"),
		            		 params:[],
		            		 default_message:error,
		            		 paramCSV:""
		            	  },
		            	  errorType:"Network",
		            	  errorkeyName:"",
		            	  errorCode:AppJS.getConstant("genericErrorCode"),
		            	  errorMessage:error
		              }
				 );
			}
		}
		
		return jsonData;
	};
	
	this.renderError = function(renderTarget, errors, toAppend){
		if(renderTarget == null || typeof renderTarget === 'undefined' || errors == null || typeof errors === 'undefined'){
			return;
		}
		
		if(toAppend == null || typeof toAppend === 'undefined') toAppend = false;
		
		$(renderTarget).css("display","block");
		if($.isArray(errors)){
			if(toAppend){
				$(renderTarget).prepend(AppJS.wrapErrorInContainer(errors.join("<br />")));			
			}else{
				$(renderTarget).html(AppJS.wrapErrorInContainer(errors.join("<br />")));
			}
		   
		}else{
			if(toAppend){
				$(renderTarget).prepend(AppJS.wrapErrorInContainer(errors));
			}else{
				$(renderTarget).html(AppJS.wrapErrorInContainer(errors));
			}
				
		}
	};
	
	this.initializeLocale();

	
};