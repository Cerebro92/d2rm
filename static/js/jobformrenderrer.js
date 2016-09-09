var JobFormRenderer = function(targetContainer, formID, elementHtmlWrapper, jsonFormData, inputClassMap, inline,  errorMessageContainer , taskID){
	
	var parseBool = function(value) {
	  if (typeof value === "string") {
		 value = value.replace(/^\s+|\s+$/g, "").toLowerCase();
		 if (value === "true" || value === "false")
		   return value === "true";
	  }
	 
	  if (typeof value === 'boolean'){
		  return value === true;            
	  } 
	  return false; // returns undefined
	};
	
	var parseNumber = function(value) {
	  if (value!=null && typeof value !== 'undefined') {
		  value = "" + value;
		  value = $.trim(value.replace(/^\s+|\s+$/g, "").toLowerCase());
		  if (value == "") return null;
		  if(isNaN(Number(value))) return null;
		  value = Number(value);
		  return (value == 0) ? null : value;	  
	  } 
	  return null; // returns undefined
	};
	
	
	this.targetContainer = (targetContainer == null || typeof targetContainer === 'undefined') ? "": $.trim(""+targetContainer);
	this.formID = (formID == null || typeof formID === 'undefined') ? "": $.trim(""+formID); 
	this.errorMessageContainer = (errorMessageContainer == null || typeof errorMessageContainer === 'undefined') ? "" : $.trim(""+errorMessageContainer); 
	this.elementHtmlWrapper = (elementHtmlWrapper == null || typeof elementHtmlWrapper === 'undefined') ? "" : $.trim(""+elementHtmlWrapper);  
	this.jsonFormData =(jsonFormData == null || typeof jsonFormData === 'undefined') ? {} : jsonFormData;
	this.inlinemsg =(inline == null || typeof inline === 'undefined') ? false : parseBool(inline);
	console.log("inline : "+inline+",this.inlinemsg : "+this.inlinemsg); 
	this.classMap = inputClassMap;
	var validJqueryEvents = ['click','change','keyup','keydown','keypress','mouseenter','mouseleave','mousedown','mouseup','mousemove','mouseout','mouseover','dblclick','focus','focusin','focusout','blur'];
	var preparedElements = [];
	var currentTaskId = ((taskID == null || typeof taskID === 'undefined')  ? 0 : taskID );
	this.formRulesAndMessage = {
								inlinemsg:this.inlinemsg,
								rules:{jobname:{required:true,regex:new RegExp("[0-9a-z]+" ,"ig")}},
								messages:{jobname:{required:"Job name is required",regex:"Job name can contain only [a-z 0-9].] "}}, 
								invalidHandler: function(form, validator) {
      												var errors = validator.numberOfInvalids();
													try{
													console.log(validator.errorList);
													console.log(validator.successList);
													if(!validator.settings.inlinemsg){
														if(validator.errorList.length>0){
															var messages = "";
															for(var i=0; i< validator.errorList.length;i++){
																messages+=((messages=="")? "":"<br/>")+validator.errorList[i].message;
															}
															console.log(validator);
															$("#"+validator.containers[0].id).html(AppJS.wrapErrorInContainer(messages));
														}
													}else{
														if(validator.errorList.length>0){
															var messages = "";
															var inputname = "";
															for(var i=0; i< validator.errorList.length;i++){
																
																org_inputname = validator.errorList[i].element.name;
																inputname = org_inputname.replace("[]","");
																inputname = "#"+inputname+((org_inputname.lastIndexOf("[]")>-1) ? "0":"");	
																inputytpe = validator.errorList[i].element.type;
																inlinetarget = (inputytpe.toLowerCase()=='checkbox' || inputytpe.toLowerCase()=='radio') ? $(inputname).parent().parent().find('.errtarget').eq(0) : $(inputname).parent().find('.errtarget').eq(0);
																//console.log($(inlinetarget).html());
																console.log(inputname+ "  : validation msg = "+validator.errorList[i].message);
																$(inlinetarget).html(validator.errorList[i].message);
																$(inputname).addClass("error");
															}
															
														}
														if(validator.successList.length>0){
															var messages = "";
															var inputname = "";
															for(var i=0; i< validator.successList.length;i++){
																org_inputname = validator.successList[i].name;
																inputname = org_inputname.replace("[]","");
																inputname = "#"+inputname+((org_inputname.lastIndexOf("[]")>-1) ? "0":"");																
																inputytpe = validator.successList[i].type;
																inlinetarget = (inputytpe.toLowerCase()=='checkbox' || inputytpe.toLowerCase()=='radio') ? $(inputname).parent().parent().find('.errtarget').eq(0) : $(inputname).parent().find('.errtarget').eq(0);
																$(inlinetarget).html("");
																$(inputname).removeClass("error");
																
															}
															
														}
													}
													
													}catch(e){
														//console.log("error"); console.log(e);
													}
												  if (errors) {
													//alert("You have " + errors + " errors that need to be fixed");
												  }
    											}
	};
	
	//console.log("this.errorMessageContainer : "+this.errorMessageContainer);
	if(this.errorMessageContainer!= null && typeof this.errorMessageContainer !== 'undefined'){
		//console.log("this.errorMessageContainer assignment coming");
		this.formRulesAndMessage.errorPlacement = function(error, element){};
		this.formRulesAndMessage.errorContainer = this.errorMessageContainer;
		//this.formRulesAndMessage.errorPlacement = function(error, element){$(this.errorContainer).append("<div>"+error.text()+"</div>");}; 
	}
	
	$.validator.addMethod(
        "regex",
        function(value, element, regexp) {
            var re = new RegExp(regexp);
            return this.optional(element) || re.test(value);
        },
        "Please check your input."
	);
	if(this.classMap == null || typeof this.classMap === 'undefined') this.classMap = {};
	if(this.jsonFormData == null || typeof this.jsonFormData === 'undefined') this.jsonFormData = {};
	if(this.targetContainer == null || typeof this.targetContainer === 'undefined') this.targetContainer = null;
	this.render = function(){
		//this.elementHtmlWrapper ='<div style="clear:both;">&nbsp;</div><div><div style="font-weight:bolder;">{label}</div><div>{control}</div></div>';
		
		var counter = 0;
		if(this.classMap == null || typeof this.classMap === 'undefined') this.classMap = {};
		var htmlAggregator = "";
		for(var inputName in this.jsonFormData){
			counter++;
			var input = this.jsonFormData[inputName];
			var input_type = getInputType(input);
			var input_source = getInputSource(input); 
			if(input_type == null || input_source == null || input_source!="user") continue;
			var inputObject = getInputField(input, counter, this.classMap);
			if(inputObject!=null){
				var rule= getRule(inputObject);
				console.log(rule);
				if(rule!=null){
					this.formRulesAndMessage.rules[inputObject.name] = rule.r;
					this.formRulesAndMessage.messages[inputObject.name] = rule.message;
				}
				htmlAggregator +=renderInputSection(this.elementHtmlWrapper,inputObject.label, inputObject.htmlRepresentation);
				preparedElements.push(inputObject);
			}
		}
		//console.log(this.formRulesAndMessage);
		$(this.targetContainer).html(htmlAggregator);
		
		setTimeout(this.addValidation(),1200); 
	};
	
	this.addValidation = function(){
		console.log("this.formRulesAndMessage");
		console.log(this.formRulesAndMessage);
		$(this.formID).validate(this.formRulesAndMessage);
		setTimeout(this.attachEvents(),500); 
	}
	this.getValueObject = function (){
		var bodyParam = {};
		var data = {};
		console.log("preparedElements");
		try{
			for(var key in preparedElements ){
				obj = preparedElements[key];
				console.log(obj);
				console.log(obj.input_type);
				if(obj.input_type == "checkbox" && obj.name.indexOf('[]') > -1 ){
					var checkboxValue = "";
					$("input[name='"+ obj.name+"']:checked").each(function(){
						checkboxValue += ((checkboxValue == "") ? "" : ",") + $(this).val().trim();
					});
					data[obj.original_name]= checkboxValue
				}else if (obj.input_type == "combobox"){
					console.log("combobox_" +obj.input_type);
					if($("select[name='"+obj.name+"']").val() != null){
						data[obj.original_name]= $("[name='"+obj.name+"']").val().join(",");	
					}else{
						data[obj.original_name]= "";
					}
				}else if(obj.input_type == "radio" ){
					console.log("radio_" +obj.input_type);
					if($("input[name='"+obj.name+"']:checked").val()){
						data[obj.original_name]= $("input[name='"+obj.name+"']:checked").val().trim();
					}	
					
				}else{
					console.log("other _ " +obj.input_type);
					data[obj.original_name]= $("[name='"+obj.name+"']").val().trim();
				}
				console.log(data);
			}
		}catch(e){
			console.log(e);
		}
		
		bodyParam['jobName']= $("#jobname").val().trim();
		bodyParam['sourceId']=currentTaskId;
		bodyParam['inputValues'] = {};
		bodyParam['inputValues'][currentTaskId]=data;
		console.log("Final body params .....");
		return bodyParam;
	}
	
	this.getErrorContainer = function(){
		return this.errorMessageContainer ;
	}
	this.attachEvents = function(){
		console.log("preparedElements");
		console.log(preparedElements);
		for(var n = 0; n<preparedElements.length; n++){
			if($.trim(preparedElements[n].jsEventName)!= "" &&  preparedElements[n].jsEventFunction!=null){
				if(preparedElements[n].arrayOfControlsLength>0){
					for(var ctr=0; ctr<preparedElements[n].arrayOfControlsLength;ctr++){
						$("#"+preparedElements[n].original_name+ctr).bind(preparedElements[n].jsEventName, preparedElements[n].jsEventFunction);
					}
				}else{
					$("#"+preparedElements[n].name).bind(preparedElements[n].jsEventName, preparedElements[n].jsEventFunction);	
				}
			}
		}
	}	

	var getInputType = function(obj){
		var inType = AppJS.readValueInObject(obj, "input_type.attribute.type", null);
		var allowedTypes = ['text','combobox','radio','checkbox','hadoopDir','hadoopdir'];
		if(inType == null){
			return inType;
		}else{
			return (allowedTypes.indexOf($.trim(inType).toLowerCase()) > -1) ? $.trim(inType).toLowerCase() : null;		
		}
	};
	
	var getInputSource = function(obj){
		var sourceType = AppJS.readValueInObject(obj, "input_source.value", null);
		var allowedSourceTypes = ['user','system'];
		if(sourceType == null){
			return sourceType;
		}else{
			return (allowedSourceTypes.indexOf($.trim(sourceType).toLowerCase()) > -1) ? $.trim(sourceType).toLowerCase() : null;		
		}
	};
	
	var renderInputSection = function(wrapperHtml,label,controlHtml){
		wrapperHtml = wrapperHtml.replace("{label}", label); 
		wrapperHtml = wrapperHtml.replace("{control}", controlHtml); 
		return wrapperHtml; 
	};
	
	var getRule = function(obj){
		var rule = {r:{},message:{}};
		if(obj == null || typeof obj === 'undefined') return null;
		
		if(obj.required) {
			rule.r.required = true;
			rule.message.required = AppJS.getString("job_form_render_required_error_message",[obj.label]);
			
		}
		if((obj.input_type == 'text' || obj.input_type == 'password') && obj.maxlength!=null) {
			rule.r.maxlength = obj.maxlength;
			rule.message.maxlength = AppJS.getString("job_form_render_maxlength_error_message",[obj.label],[obj.maxlength]);
		}
		if((obj.input_type == 'text' || obj.input_type == 'password') && obj.minlength!=null) {
			rule.r.minlength = obj.minlength;
			rule.message.minlength = AppJS.getString("job_form_render_minlength_error_message",[obj.label],[obj.minlength]);	
		}
		//console.log("obj.validation_type : "+obj.validation_type);
		if(obj.validation_type!=null && typeof obj.validation_type!== 'undefined' && obj.validation_type!='string' && $.trim(obj.validation_type)!='') {
			switch(obj.validation_type.toLowerCase()){
				case "url":
					rule.r.url = true;
					rule.message.url = AppJS.getString("job_form_render_valid_url_error_message",[obj.label]);						
				break;
				case "date":
					rule.r.date = true;
					rule.message.date = AppJS.getString("job_form_render_valid_date_error_message",[obj.label]);						
				break;
				case "number":
					rule.r.number = true;
					rule.message.number = AppJS.getString("job_form_render_require_number_error_message",[obj.label]);						
				break;
				case "email":
					rule.r.email = true;
					rule.message.email = AppJS.getString("job_form_render_valid_email_error_message",[obj.label]);							
				break;
				case "regex":
					if(obj.validation_value!=null){						
						rule.r.regex = obj.validation_value;
						rule.message.regex = AppJS.getString("job_form_render_valid_string_error_message",[obj.label]);						
					}
				break;
			}
		}
		return rule;
	};
	
	var getInputField = function(inputObj, fieldNumber, classMap){
		if(classMap == null || typeof classMap === 'undefined') classMap = {};
		var fieldCounter = 0;
		var startTags = {text:'<input type="text" ',combobox:'<select ',radio:'<input type="radio" ',checkbox:'<input type="checkbox" '};
		var endTags = {text:' >',combobox:' </select>', radio:' >',checkbox:' >'};
		
		var input_type = getInputType(inputObj);
		var input_source = getInputSource(inputObj); 
		var input_source = getInputSource(inputObj); 
		if(input_type == null || input_source == null || input_source!="user") return null;
		
		var obj = { name:$.trim(AppJS.readValueInObject(inputObj, "input_name.value", 'input'+fieldNumber)),
							original_name:$.trim(AppJS.readValueInObject(inputObj, "input_name.value", 'input'+fieldNumber)),
							id:$.trim(AppJS.readValueInObject(inputObj, "input_name.value", 'input'+fieldNumber)),
							input_type:$.trim(AppJS.readValueInObject(inputObj, "input_type.attribute.type", "")),
							label:$.trim(AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "label_name", {}))),
							placeholder:$.trim(AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "input_type_palceholder", {}))),
							hint:$.trim(AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "hint_label", {}))),
							default_value:$.trim(AppJS.readValueInObject(inputObj, "default_value.value", "")),
							hadoop_target_as:$.trim(AppJS.readValueInObject(inputObj, "hadoop_dir_as.value", "")),
							maxlength:parseNumber(AppJS.readValueInObject(inputObj, "max_length.value", null)),
							minlength:parseNumber(AppJS.readValueInObject(inputObj, "min_length.value", null)),
							multiple:parseBool(AppJS.readValueInObject(inputObj, "multiple.value", false)),
							option_label:[],
							option_value:[],
							sequence: Number(AppJS.readValueInObject(inputObj, "input_sequence_number.value", 1)),
							required: parseBool(AppJS.readValueInObject(inputObj, "is_required.value", false)),
							validation_type:$.trim(AppJS.readValueInObject(inputObj, "validation_type.value", "string")),
							validation_value:$.trim(AppJS.readValueInObject(inputObj, "validation_value.value", "")),
							jsEventName:$.trim(AppJS.readValueInObject(inputObj, "javascipt_snippet.attribute.jsEvent", "")),
							jsEventFunction: null,
							arrayOfControlsLength:0,
							htmlRepresentation : ""						
				};
		if(obj.validation_value == "") obj.validation_value = null;
		if(obj.validation_value!=null){
			try{
						if(obj.validation_type == "regex"){
							switchFlag = "";							
							var lasttwochar =(obj.validation_value.length>=2) ?  obj.validation_value.substring(obj.validation_value.length-2) :"";
							var lastthreechar =(obj.validation_value.length>=3) ?  obj.validation_value.substring(obj.validation_value.length-3) :"";
							if(lasttwochar == "/g" || lasttwochar == "/i"){
								switchFlag = lasttwochar.substring(1);
								obj.validation_value = obj.validation_value.substring(0, obj.validation_value.length-1);
								if(obj.validation_value.indexOf("/")==0 && obj.validation_value.length>1) obj.validation_value = obj.validation_value.substring(1);
								if(obj.validation_value.lastIndexOf("/")==obj.validation_value.length-1) obj.validation_value = obj.validation_value.substring(0,obj.validation_value.length-1);
							}
							if(lastthreechar == "/gi" || lastthreechar == "/ig"){
								switchFlag = lastthreechar.substring(1);
								obj.validation_value = obj.validation_value.substring(0, obj.validation_value.length-2);
								if(obj.validation_value.indexOf("/")==0 && obj.validation_value.length>1) obj.validation_value = obj.validation_value.substring(1);
								if(obj.validation_value.lastIndexOf("/")==obj.validation_value.length-1) obj.validation_value = obj.validation_value.substring(0,obj.validation_value.length-1);
							}
							console.log("obj.validation_value : "+obj.validation_value+", switchFlag : "+switchFlag);
							if($.trim(switchFlag)=="") switchFlag = "g";							
							obj.validation_value = new RegExp(obj.validation_value, switchFlag);
						}
			}catch(e){
				obj.validation_value = null;
			}
		}
		var jsFunctionAsString = AppJS.readValueInObject(inputObj, "javascipt_snippet.value", "");
		var jsFunction = null;
		//validJqueryEvents
		if($.trim(jsFunctionAsString)!="" && $.trim(obj.jsEventName) != "" && validJqueryEvents.indexOf($.trim(obj.jsEventName).toLowerCase())>-1){
			try{
				jsFunction = eval("x = "+jsFunctionAsString);				
				if(typeof jsFunction === 'undefined' || jsFunction == null) {jsFunction = null;}
				console.log(obj.jsEventName+" = "+jsFunctionAsString);
				console.log(jsFunction);
				
			}catch(e){
				console.log("Evaluating javascript error.");
				console.log(obj.jsEventName+" = "+jsFunctionAsString);
				console.log(e);
				obj.jsEventName = "";
			}
		}else{
			obj.jsEventName = "";
		}
		obj.jsEventFunction = jsFunction;
		var inputClass = AppJS.readValueInObject(classMap,input_type,null);
		
		switch($.trim(input_type).toLowerCase()){
			
			case "text":					
				   var inputHtml = startTags[input_type] + ' name="'+obj.name+'" id="'+obj.id+'" placeholder="'+obj.placeholder+'" title="'+obj.hint+'" class="form-control" value = "'+obj.default_value+'" '+((inputClass==null) ? "" : ' class="'+inputClass+'" ')+((obj.minlength!=null && obj.minlength>0) ? ' minlength="'+obj.minlength+'" ' : "")+((obj.maxlength!=null && obj.maxlength>0) ? ' maxlength="'+obj.maxlength+'" ' : "")+((obj.required) ? " required " : "")+endTags[input_type];
				   obj.htmlRepresentation = inputHtml;		
			break;
			
			case "radio":
				   obj.option_label = AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "option_lable", {}));
				   obj.option_label = obj.option_label.split("^");
				   obj.option_value = AppJS.readValueInObject(inputObj, "option_value.value", "");
				   obj.option_value = obj.option_value.split("^");
				    if(obj.option_label.length == obj.option_value.length){
					   var inputHtml ="";
					   obj.arrayOfControlsLength = obj.option_label.length;
					   for(i in obj.option_label){
						   
						   inputHtml += '<div style="float:left; margin-left:30px;">'+startTags[input_type]+' id="'+obj.id+i+'" name="'+obj.name+'"  placeholder="'+obj.placeholder+'" title="'+obj.hint+'"   value="'+$.trim(obj.option_value[i])+'"'+((inputClass==null) ? "" : 'class="'+inputClass+'"')+((obj.required) ? " required " : "")+endTags[input_type]+'<span>&nbsp;&nbsp;'+$.trim(obj.option_label[i])+'</span></div>';
					   }
					   obj.htmlRepresentation = inputHtml;	
					}else{
					   obj = null;
				    }
			break;
			
			case "checkbox":
				   obj.option_label = AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "option_lable", {}));
				   obj.option_label = obj.option_label.split("^");
				   obj.option_value = AppJS.readValueInObject(inputObj, "option_value.value", "");
				   obj.option_value = obj.option_value.split("^");
				   
				   var inputHtml ="";
				   if(obj.option_label.length>1 && obj.option_value.length>1) obj.name= obj.name+"[]";
				   if(obj.option_label.length == obj.option_value.length){
					   obj.arrayOfControlsLength = (obj.option_label.length>1) ? obj.option_label.length : 0;
					   for(i in obj.option_label){
						   inputHtml += '<div class="squaredFour"><div style="float:left; margin-left:20px;">'+startTags[input_type]+' id="'+obj.id+((obj.option_label.length>1) ? i:'')+'" name="'+obj.name+'"  placeholder="'+obj.placeholder+'" title="'+obj.hint+'"  value="'+$.trim(obj.option_value[i])+'"'+((inputClass==null) ? "" : 'class="'+inputClass+'"')+((obj.required) ? " required " : "")+endTags[input_type]+'<span>&nbsp;&nbsp;'+$.trim(obj.option_label[i])+'</span></div></div>';
					   }
					   obj.htmlRepresentation = inputHtml;	
				   }else{
					   obj = null;
				   }
			break;
			
			case "combobox":
				   obj.option_label = AppJS.getLocalizedStringFromJsonNode(AppJS.readValueInObject(inputObj, "option_lable", {}));
				   obj.option_label = obj.option_label.split("^");
				   obj.option_value = AppJS.readValueInObject(inputObj, "option_value.value", "");
				   obj.option_value = obj.option_value.split("^");
				   obj.multiple = AppJS.readValueInObject(inputObj, "multiple.value", false);
				   obj.size = AppJS.readValueInObject(inputObj, "size.value", 0);
				    if(obj.option_label.length == obj.option_value.length){
					   var inputHtml =startTags[input_type]+' id="'+obj.id+'" name="'+obj.name+'" placeholder="'+obj.placeholder+'" class="form-control" title="'+obj.hint+'" '+((obj.multiple) ? ' multiple="multiple" ':'')+((obj.size>0) ? ' size="'+obj.size+'" ':'')+((inputClass==null) ? "" : 'class="'+inputClass+'"')+((obj.required) ? " required " : "")+'>';
					   for(i in obj.option_label){
						   inputHtml += '<option value="'+$.trim(obj.option_value[i])+'">'+$.trim(obj.option_label[i])+'</option>';
					   }
					   inputHtml += endTags[input_type];
					   obj.htmlRepresentation = inputHtml;	
					 }else{
					   obj = null;
				     }
			break;
			
			case "hadoopdir":
				   var inTypeForhadoopDir = "text";
				   obj.hadoop_target_as = obj.hadoop_target_as.toLowerCase();
				   if(obj.option_label.length == obj.option_value.length){
					  var inputHtml =startTags[inTypeForhadoopDir]+' id="'+obj.id+'" name="'+obj.name+'" placeholder="'+obj.placeholder+'" title="'+obj.hint+'" '+((obj.multiple) ? ' multiple="multiple" ':'')+((obj.size>0) ? ' size="'+obj.size+'" ':'')+((inputClass==null) ? "" : 'class="'+inputClass+'"') + ' readOnly="readOnly" ' + ((obj.required) ? " required " : "")+'><input type="button" id="btn'+obj.id+'"  name="btn'+obj.id+'" value="Browse" onclick="browseHDFSDir(\''+obj
					  .id+'\',\''+((obj.hadoop_target_as=='output') ? 'folder':'file')+'\');"/> ';
					  // alert("receivingTarget");
				    
		              inputHtml = '<div class="input-group">'
						+' <input type="text" class="form-control" id="'+obj.id+'" name="'+obj.name+'" placeholder="'+obj.placeholder+'" title="'+obj.hint+'" '+((obj.multiple) ? ' multiple="multiple" ':'')+((obj.size>0) ? ' size="'+obj.size+'" ':'')+((inputClass==null) ? "" : 'class="'+inputClass+'"') + ' readOnly="readOnly" ' + ((obj.required) ? " required " : "")+' readOnly/>'
						+' <span class="input-group-btn">'
						+'<div class="browse-wrap" onclick="browseHDFSDir(\''+obj.id+'\',\''+((obj.hadoop_target_as=='output') ? 'folder':'file')+'\');">'
						+' <div class="title">Browse</div>'
						+'</div>'
						+' </span>'
						+'</div>';
		              
					   obj.htmlRepresentation = inputHtml;	
					 }else{
					   obj = null;
				     }
			break;
			
		}
		
		return obj;
		
	}; 
	 
	
	
	
};

function browseHDFSDir(receivingTarget, browseFor, allowedExtensions){
	var browseForDefaults = ['any','file','folder'];
	if(receivingTarget == null || typeof receivingTarget === 'undefined') return;
	if(browseFor == null || typeof browseFor === 'undefined' || browseForDefaults.indexOf($.trim(browseFor).toLowerCase())==-1) browseFor = "any";
	if(allowedExtensions == null || typeof allowedExtensions === 'undefined') allowedExtensions = null;
	//alert(receivingTarget+","+browseFor+","+allowedExtensions);
	openUrlInDialog("externalPopup",AppJS.constants.contextPath+'/browse-server-file-system?browsetype='+browseFor+'&target_receiver='+receivingTarget,'Browse',true, 650, 350, false,false)
	
}