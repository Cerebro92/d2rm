var currentCluster = AppJS.getConstant("currentCluster");
var contextPath = AppJS.getConstant("contextPath");
var apiBase = AppJS.getConstant("apiProxyUrl");
var NameNodeHostName = "";
var ajaxUpdateInterval = AppJS.getConstant("ajaxUpdateInterval"); //30 secs set by default. To change this refer AppJS.jsp page.
var dataUnavailableShortMsg = "Unavailable.";
var dataUnavailableDescriptiveMsg = "Data Not Available.";
var palette = new Rickshaw.Color.Palette( { scheme: 'munin' } );
var tileCpuGraph;
var popupCpuGraph;
var tileMemoGraph;
var popupMemoGraph;
var lastCpuTimestamp = 0;
var lastUpdateGotForMemory = 0;

var NameNodeHostName = "";

var cpuSeriesData = [];


function getNameNodeStatistics(){
	//console.log("called naenode: "+AppJS.getApiUrl("NAMENODE_STATISTICS"));
	$.ajax( {
		Type : "GET",
		url : apiBase,
		data:{ api : AppJS.getApiUrl("NAMENODE_STATISTICS")},
		jsonpCallback: 'theCallBack32',	
		timeout: ajaxUpdateInterval,
	    success: function(json) {
	    	console.log("getNameNodeStatistics : " + AppJS.getApiUrl("NAMENODE_STATISTICS"));
	    	console.log(json);
	    	jsonData = JSON.parse(json);
	    	console.log(jsonData);	
	    	//Namenode uptime update
	    	try{
		       //console.log(jsonData.host_components[0].metrics.jvm.StartTime);
		       //alert(jsonData.host_components[0].HostRoles.host_name);
		       //alert(jsonData.ServiceComponentInfo.component_name);
		      
	    	   console.log("getNameNodeStatistics : ");
		       console.log(jsonData);	
		       NameNodeHostName = AppJS.readValueInObject(jsonData,"content.host_components[0].HostRoles.host_name","");
		       console.log("NameNodeHostName : "+NameNodeHostName);
		      
		       if(NameNodeHostName!=null && NameNodeHostName!=""){
		    	   getNameNodeMemoryStats();
		       }else{
		    	   try{
		    	    $("#namenodememorystat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
					$("#namenodememorystat .inner-container .errinfo").css("display","block");
					$("#namenode_memo_usage").css("display","none");	
					$('#namenodememorystat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		 			
					$("#namenodecpustat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
	 				$("#namenodecpustat .inner-container .errinfo").css("display","block");
					$("#namenode_cpu_usage").css("display","none");	
					$('#namenodecpustat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		    	   
					$("#namenodeloadstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
					$("#namenodeloadstat .inner-container .errinfo").css("display","block");
					$("#namenode_load_usage").css("display","none");	
					$('#namenodeloadstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		    	   }catch(e){}
		        
		       }
		     
		       if(AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.StartTime",0)>0){
				   $('#uptime .green-highlight').html(""+AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.startTimeDisplayElapsed","").split(",").join(":")+"");
			   }else{
				   $('#uptime .green-highlight').html("<span style='font-size:20px; color:#FF0000;'>"+dataUnavailableShortMsg+"</span>");  
			   }		      
		       $('#uptime .hidden-info div').html(timeConverter(AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.StartTime",0)));
		      
		       }catch(e){}
	    	
	    	
	    	
	    	//Live and dead nodes count update
	    	try{
	    		   if(AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.liveNodes.length",null)!=null || AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.deadNodes.length",null)!=null){
		    		    totalNodes=AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.liveNodes.length",0);
		    		 	try{	    		 	
		    		 		totalNodes=totalNodes + AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.deadNodes.length",0);
		    		 	}catch(ex){}
		    		 	livenodescount = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.liveNodes.length",0);
		    		 	deadnodescount=0;
	    		 	
						
						if(livenodescount < 0) livenodescount = 0;
						deadnodescount = totalNodes - livenodescount; 
						if(deadnodescount > 0){
						   $('#nodehealth .inner-container h1').html("<span class=\"red-highlight\">"+livenodescount+"/"+totalNodes+"</span>");
						}else{
						   $('#nodehealth .inner-container h1').html("<span class=\"green-highlight\">"+livenodescount+"/"+totalNodes+"</span>");
						}
						$('#nodehealth .hidden-info div').html("Live : "+livenodescount+"<br/>Dead : "+deadnodescount+"<br/><br/><span style=\"font-size:18px;color:#f2b2a9;\"><a href=\"javascript:openHealthWin();\">Click here to see more.</a></span>");
	    		   }else{
		    			$('#nodehealth .inner-container h1').html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");					
						$('#nodehealth .hidden-info div').html("<span class=\"red-highlight\" style=\"color:#FF0000;\">"+dataUnavailableDescriptiveMsg+"</span>");  
	    		   }
		 		 }catch(e){
		 			//console.log("Error step 2");
		 			//console.log(jsonData);
		 			//console.log(e);
		 		 }
	    	
		 		 
		 		//=========================Namenode heap usage update============================
		 		try{
		 			var x=6;
		 			if(AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.HeapMemoryMax",null)!=null){
			 			totalHeapMemory = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.HeapMemoryMax",0);
			 			totalHeapMemory = totalHeapMemory/1024/1024;
						if(isNaN(totalHeapMemory)) totalHeapMemory = 0;
					    usedHeapMemory = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.jvm.HeapMemoryUsed",0);
					    usedHeapMemory=usedHeapMemory/1024/1024;
					    if(isNaN(usedHeapMemory)) usedHeapMemory = 0;
					    percentageHeapUsed =  (100 * usedHeapMemory)/totalHeapMemory;
					    if(isNaN(percentageHeapUsed)) percentageHeapUsed = 0;
					    $("#namenodeheapstat .inner-container .errinfo").css("display","none");
					   	$("#namenode_heap_usage").css("display","block");					   	
						d3donut.update('namenode_heap_usage',Math.round(percentageHeapUsed));
				 		$('#namenodeheapstat .hidden-info div').html(percentageHeapUsed.toFixed(2)+" % Used <br/>"+usedHeapMemory.toFixed(2)+" MB Of "+totalHeapMemory.toFixed(2)+" MB");
		 			}else{
		 				$("#namenodeheapstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
		 				$("#namenodeheapstat .inner-container .errinfo").css("display","block");
						$("#namenode_heap_usage").css("display","none");	
						$('#namenodeheapstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		 			}
		 			}catch(e){}
	   	   
		 		
		 		//==========================DFS Memory stats======================================
		 		try{
		 			console.log("DFS Memory log");
		 			console.log(jsonData);
		 			if(AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.dfs.FSNamesystem.CapacityTotal",null)!=null){
			 			var totalAvailable = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.dfs.FSNamesystem.CapacityTotal",0)/1024/1024/1024;
						var dfsUsed = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.dfs.FSNamesystem.CapacityUsed",0)/1024/1024/1024;		    
						var remaining = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.dfs.FSNamesystem.CapacityRemaining",0)/1024/1024/1024;
						var nonDfsUsed = AppJS.readValueInObject(jsonData,"content.host_components[0].metrics.dfs.FSNamesystem.CapacityNonDFSUsed",0)/1024/1024/1024;
					    
						var percentageNonDfsUsed = (100 * nonDfsUsed)/totalAvailable;
						var percentageDfsUsed = (100 * dfsUsed)/totalAvailable;
						var percentageRemaining = (100 * remaining)/totalAvailable;
						var percentageTotalUsed = percentageNonDfsUsed + percentageDfsUsed;
						if(percentageTotalUsed<0)percentageTotalUsed=0;
						if(isNaN(percentageTotalUsed)) percentageTotalUsed = 0;
						
						$("#hdfsstat .inner-container .errinfo").css("display","none");
						$("#hdfs_disk_usage").css("display","block");				
						d3donut.update('hdfs_disk_usage',Math.round(percentageTotalUsed));
				 		$('#hdfsstat .hidden-info div').html("DFS used<br/>"+dfsUsed.toFixed(2)+" GB ("+percentageDfsUsed.toFixed(2)+"%)<br/>non DFS used<br/>"+nonDfsUsed.toFixed(2)+" GB ("+percentageNonDfsUsed.toFixed(2)+"%)<br/>remaining "+remaining.toFixed(2)+" GB ("+percentageRemaining.toFixed(2)+"%)");
		 			}else{
		 				$("#hdfsstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal;\">"+dataUnavailableShortMsg+"</span>");
		 				$("#hdfsstat .inner-container .errinfo").css("display","block");
						$("#hdfs_disk_usage").css("display","none");	
						$('#hdfsstat .hidden-info div').html("<span class=\"red-highlight\" style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		 			}
		 		}catch(e){
		 			console.log(e);
		 			$("#hdfsstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
	 				$("#hdfsstat .inner-container .errinfo").css("display","block");
					$("#hdfs_disk_usage").css("display","none");	
					$('#hdfsstat .hidden-info div').html("<span class=\"red-highlight\">"+dataUnavailableDescriptiveMsg+"</span>");
		 		}
		 		
	       setTimeout(getNameNodeStatistics,ajaxUpdateInterval);
	      
	    },
	    error: function(jqXHR, textStatus){
	       if(textStatus == 'timeout'){
	    	   console.log("Request timeout. yes");
	       }
	      
 		 
	      //Set name node strated time data receiving error
	       $('#uptime .green-highlight').html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
	       $('#uptime .hidden-info div').html("<span class=\"red-highlight\">"+dataUnavailableDescriptiveMsg+"</span>");
	       
	       //Set node health data receiving error
	       $('#nodehealth .inner-container h1').html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");					
		   $('#nodehealth .hidden-info div').html("<span class=\"red-highlight\">"+dataUnavailableDescriptiveMsg+"</span>");  
	       
		   $("#namenodeheapstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
		   $("#namenodeheapstat .inner-container .errinfo").css("display","block");
		   $("#namenode_heap_usage").css("display","none");	
		   $('#namenodeheapstat .hidden-info div').html("<span class=\"red-highlight\">"+dataUnavailableDescriptiveMsg+"</span>");
		   
		   $("#hdfsstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
		   $("#hdfsstat .inner-container .errinfo").css("display","block");
		   $("#hdfs_disk_usage").css("display","none");	
		   $('#hdfsstat .hidden-info div').html("<span class=\"red-highlight\">"+dataUnavailableDescriptiveMsg+"</span>");
		   
		   setTimeout(getNameNodeStatistics,ajaxUpdateInterval);
	       //alert(e);
	    }
	});
}



function getNameNodeMemoryStats(){
	//console.log("Called host metrics api : "+AppJS.getApiUrl("HOST_MERICS",{HOST_NAME:NameNodeHostName}));
	$.ajax( {
		Type : "GET",
		url : apiBase,
		jsonpCallback: 'theCallBack33',
		data:{api:AppJS.getApiUrl("HOST_MERICS",{HOST_NAME:NameNodeHostName})},
		timeout: ajaxUpdateInterval,		   
	    success: function(json) {
	    	json_Data = JSON.parse(json);
	    	console.log("getNameNodeMemoryStats :");
	    	console.log(json_Data);
	    	
	    	//Namenode memory usage update
	    	try{
	     		
	    		if(AppJS.readValueInObject(json_Data,"content.metrics.memory.mem_total",null)!=null){
		    		totalNamenodeMemory = AppJS.readValueInObject(json_Data,"content.metrics.memory.mem_total",0)/1024/1024/1024;
		    		freeNamenodeMemory = AppJS.readValueInObject(json_Data,"content.metrics.memory.mem_free",0)/1024/1024/1024;
		    		usedNamenodeMemory = totalNamenodeMemory - freeNamenodeMemory;
		    		
		    		percentageTotalUsed = (usedNamenodeMemory/totalNamenodeMemory) * 100;
		    		percentageTotalFree = (freeNamenodeMemory/totalNamenodeMemory) * 100;
					if(percentageTotalUsed<0)percentageTotalUsed=0;
					if(isNaN(percentageTotalUsed)) percentageTotalUsed = 0;
					d3donut.update('namenode_memo_usage', Math.round(percentageTotalUsed));
			 		
		    		
			 		$("#namenodememorystat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
					$("#namenodememorystat .inner-container .errinfo").css("display","none");
					$("#namenode_memo_usage").css("display","block");	
					$('#namenodememorystat .hidden-info div').html("Memory used<br/>"+usedNamenodeMemory.toFixed(2)+" GB ("+percentageTotalUsed.toFixed(2)+"%)<br/>Free memory<br/>"+freeNamenodeMemory.toFixed(2)+" GB ("+percentageTotalFree.toFixed(2)+"%)<br/>Total Memory "+totalNamenodeMemory.toFixed(2)+" GB");
	    		}else{
	    			$("#namenodememorystat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
					$("#namenodememorystat .inner-container .errinfo").css("display","block");
					$("#namenode_memo_usage").css("display","none");	
					$('#namenodememorystat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	    		}
	    	}catch(e){
	    		$("#namenodememorystat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
				$("#namenodememorystat .inner-container .errinfo").css("display","block");
				$("#namenode_memo_usage").css("display","none");	
				$('#namenodememorystat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	    	}	  
	    	
	    	//Namenode cpu stats
	    	
	    	
		     //Namwnode CPU stats
		     try{
		    		   if(AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_wio",null)!=null){
		    			  cpuData =  AppJS.readValueInObject(json_Data,"content.metrics.cpu");
		    			  cpuHTML = "";
		    			  var clrs = ["#546e91", "#8bde95", "#d2ab58", "#273c71", "#98bf6e", "#4daa4b"];
		    			  var ctr = -1;
		    			  for(var cpuDataKey in cpuData){
		    				  //$('#'+cpuDataKey).html(cpuData[cpuDataKey]+'%');
		    				  pVal = cpuData[cpuDataKey];
		    				  barwidth = 2;
		    				  if(pVal>1){ 
		    					  barwidth = Math.floor(50*(pVal/100))+3;
		    				  }
		    				 // $('#'+cpuDataKey+"_bar").css("width",barwidth);
		    				 if(cpuDataKey!= "cpu_num" && cpuDataKey!= "cpu_speed"){
		    				  ctr++;
		    				  cpuHTML+="<tr>"
		    				  +"<td style=\"padding-right:5px; text-align:center;width:50px;\" nowrap>"+cpuDataKey+"</td>"
		    				  +"<td style=\"padding-left:0px; text-align:left; width:60px;\" nowrap>"
		    				  +"<div id=\"cpu_bar\" style=\"width:"+barwidth+"px; height:8px;padding:0;margin:0px;background-color:"+clrs[ctr]+";\">&nbsp;</div>"
		    				  +"</td>"
		    				  +"<td style=\"padding-left:0px; text-align:left;\" nowrap>"
		    				  +"<div id=\"cpu_aidle\">"+cpuData[cpuDataKey]+"%</div>"
		    				  +"</td>"
		    				  +"</tr>";
		    				 }
		    				  
		    			  }	
		    			  cpuHTML = "<table cellspacing=\"0\" cellpadding=\"0\" border=\"0\" height=\"100%\" width=\"70%\" style=\"font-size:14px;color:#333;margin-top:35px;margin-left:15px\">"+cpuHTML+"</table>"
		    			  $("#namenodecpustat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
			 			  $("#namenodecpustat .inner-container .errinfo").css("display","none");
		    			  $("#namenode_cpu_usage").html(cpuHTML);
		    			  $("#namenode_cpu_usage").css("display","block");	
						  $('#namenodecpustat .hidden-info div').html("<span style=\"color:#fff; font-size:16px;\">"+"cpu_wio : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_wio","0.0")+"<br/>"
		    		                +"cpu_idle : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_idle","0.0")+"<br/>"
		    		                +"cpu_nice : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_nice","0.0")+"<br/>"
		    		                +"cpu_num : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_num","0.0")+"<br/>"
		    		                +"cpu_speed : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_speed","0.0")+"<br/>"
		    		                +"cpu_system : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_system","0.0")+"<br/>"
		    		                +"cpu_user : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_user","0.0")+"<br/>"
		    		                +"cpu_wio : "+AppJS.readValueInObject(json_Data,"content.metrics.cpu.cpu_wio","0.0")+"<br/>"+"</span>");
						  
		    		   }else{
		    			    //console.log("CPU data error as not available;");
		    			    $("#namenodecpustat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
			 				$("#namenodecpustat .inner-container .errinfo").css("display","block");
							$("#namenode_cpu_usage").css("display","none");	
							$('#namenodecpustat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		    		   }
	 		 }catch(e){
	 			$("#namenodecpustat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
 				$("#namenodecpustat .inner-container .errinfo").css("display","block");
				$("#namenode_cpu_usage").css("display","none");	
				$('#namenodecpustat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	 			//console.log("CPU data error");
	 			//console.log(jsonData);
	 			//console.log(e);
	 		 }
	 		 
	 		 
	 		
			try{
				var loadHtml = "";
	    		if(AppJS.readValueInObject(json_Data,"content.metrics.load.load_one",null)!=null){
	    			loadHtml = "<table cellspacing=\"5\" cellpadding=\"5\" border=\"0\" height=\"100%\" width=\"100%\" style=\"font-size:14px;color:#0B3B0B;font-weight:normal;\">"
					+"<tr>"
					+"<td style=\"padding-left:5px; text-align:left;\" nowrap>Load_One</td>"
					+"<td id=\"load_one\" style=\"padding-left:5px; text-align:left;\" nowrap>"+AppJS.readValueInObject(json_Data,"content.metrics.load.load_one",0.0)+"</td>"
					+"</tr>"
					+"<tr>"
					+"<td style=\"padding-left:5px; text-align:left;\" nowrap>Load_Five</td>"
					+"<td  id=\"load_five\" style=\"padding-left:5px; text-align:left;\" nowrap>"+AppJS.readValueInObject(json_Data,"content.metrics.load.load_five",0.0)+"</td>"
					+"</tr>"
					+"<tr>"
					+"<td style=\"padding-left:5px; text-align:left;\" nowrap>Load_Fifteen</td>"
					+"<td  id=\"load_fifteen\" style=\"padding-left:5px; text-align:left;\" nowrap>"+AppJS.readValueInObject(json_Data,"content.metrics.load.load_fifteen",0.0)+"</td>"
					+"</tr>"
					+"<tr><td colspan=\"2\">&nbsp;</td></tr>"
					+"<tr><td colspan=\"2\">&nbsp;</td></tr>"
					+"</table>";
					
					$("#namenode_load_usage").html(loadHtml);
					
			 		$("#namenodeloadstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
					$("#namenodeloadstat .inner-container .errinfo").css("display","none");
					$("#namenode_load_usage").css("display","block");	
					$('#namenodeloadstat .hidden-info div').html("<span style=\"font-size:16px;\">1 mins average load&nbsp;:&nbsp;"+AppJS.readValueInObject(json_Data,"content.metrics.load.load_one",0.0)+"<br/>5 mins average load &nbsp;:&nbsp;"+AppJS.readValueInObject(json_Data,"content.metrics.load.load_five",0.0)+"<br/>15 mins average load &nbsp;:&nbsp; "+AppJS.readValueInObject(json_Data,"content.metrics.load.load_fifteen",0.0)+"</span>");
	    		}else{
	    			$("#namenodeloadstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
					$("#namenodeloadstat .inner-container .errinfo").css("display","block");
					$("#namenode_load_usage").css("display","none");	
					$('#namenodeloadstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	    		}
	    	}catch(e){
	    		$("#namenodeloadstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
				$("#namenodeloadstat .inner-container .errinfo").css("display","block");
				$("#namenode_load_usage").css("display","none");	
				$('#namenodeloadstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	    	}	  
	       setTimeout(getNameNodeMemoryStats,ajaxUpdateInterval);
	      
	    },
	    error: function(e) {
	    	
	    	$("#namenodememorystat .inner-container .errinfo").html(dataUnavailableShortMsg)
			$("#namenodememorystat .inner-container .errinfo").css("display","block");
			$("#namenode_memo_usage").css("display","none");	
			$('#namenodememorystat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	    	
			$("#namenodecpustat .inner-container .errinfo").html(dataUnavailableShortMsg);
			$("#namenodecpustat .inner-container .errinfo").css("display","block");
			$("#namenode_cpu_usage").css("display","none");	
			$('#namenodecpustat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
	       
			$("#namenodeloadstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>");
			$("#namenodeloadstat .inner-container .errinfo").css("display","block");
			$("#namenode_load_usage").css("display","none");	
			$('#namenodeloadstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
			//console.log(e);
	       setTimeout(getNameNodeMemoryStats,ajaxUpdateInterval);
	       //alert(e);
	    }
	});
}


function getResourceManagerHeapUsage(){
	$.ajax( {
		Type : "GET",
		url : apiBase,
		data:{api:AppJS.getApiUrl("RESOURCE_MANGER_STATISTICS")},
		jsonpCallback: 'theCallBack7',
		async: true,
		success: function(rManagerHeapJson) {
		    
			try{
				var rManagerJsonData = JSON.parse(rManagerHeapJson);
				//console.log(rManagerHeapJson);			    
			    
			    r_totalHeapMemory = Number(""+rManagerJsonData.content.host_components[0].metrics.jvm.HeapMemoryMax);
			    r_totalHeapMemory = r_totalHeapMemory/1024/1024;
				if(isNaN(r_totalHeapMemory)) r_totalHeapMemory = 0;
				r_usedHeapMemory = Number(""+rManagerJsonData.content.host_components[0].metrics.jvm.HeapMemoryUsed);
				r_usedHeapMemory = r_usedHeapMemory/1024/1024;
			    if(isNaN(r_usedHeapMemory)) r_usedHeapMemory = 0;
			    r_percentageHeapUsed =  (100 * r_usedHeapMemory)/r_totalHeapMemory;
			    if(isNaN(r_percentageHeapUsed)) r_percentageHeapUsed = 0;			   
				
			    $("#resourceheapstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
 				$("#resourceheapstat .inner-container .errinfo").css("display","none");				
				d3donut.update('resourcemanager_heap_usage',Math.round(r_percentageHeapUsed));
				$("#resourcemanager_heap_usage").css("display","block");	
		 		$('#resourceheapstat .hidden-info div').html(r_percentageHeapUsed.toFixed(2)+" % Used <br/>"+r_usedHeapMemory.toFixed(2)+" MB Of "+r_totalHeapMemory.toFixed(2)+" MB");
			}catch(e){
				 $("#resourceheapstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
	 			 $("#resourceheapstat .inner-container .errinfo").css("display","block");
				 $("#resourcemanager_heap_usage").css("display","none");	
				 $('#resourceheapstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
				//console.log("Error");
				//console.log(e);
			}
	 		setTimeout(getResourceManagerHeapUsage,ajaxUpdateInterval);
		      
		    },
		    error: function(e) {
		       //console.log(e.message);
		        $("#resourceheapstat .inner-container .errinfo").html("<span class=\"red-highlight\" style=\"font-size:20px; font-weight:normal\">"+dataUnavailableShortMsg+"</span>")
	 			 $("#resourceheapstat .inner-container .errinfo").css("display","block");
				 $("#resourcemanager_heap_usage").css("display","none");	
				 $('#resourceheapstat .hidden-info div').html("<span style=\"color:#ff0000;\">"+dataUnavailableDescriptiveMsg+"</span>");
		       setTimeout(getResourceManagerHeapUsage,ajaxUpdateInterval);
		    }
		});
	}



function timeConverter(UNIX_timestamp){
	var time = "<span style='color:#FF0000'>"+dataUnavailableDescriptiveMsg+"</span>";
	
	if(UNIX_timestamp>0){
	  var a = new Date(UNIX_timestamp*1000);
	  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
	  var dayOfWeek = days[a.getDay()];
	  var year = a.getFullYear();
	  var month = months[a.getMonth()];
	  var date = a.getDate();
	  var hour = a.getHours();
	  var min = a.getMinutes();
	  var sec = a.getSeconds();
	  var time = dayOfWeek + ", " + month + ' ' + ((date<10) ? "0"+date : date) + ' ' + year + '<br/> ' + ((hour<10) ? "0"+hour : hour) + ':' + ((min<10) ? "0"+min : min) + ':' + ((sec<10) ? "0"+sec : sec) ;
	}
	return time;
}

/*
function setupTileViewMemoryGraph(memorySeriesData){
$('#memographTileView_chart').html("");
var memographTileView = new Rickshaw.Graph( {    
	element: document.querySelector("#memographTileView_chart"),
	renderer: 'area',
	stroke: true,
	width: 160,
	height: 110, 
	renderer: 'line',     
	series: memorySeriesData
});
memographTileView.render();
$('#memographTileView_chart').click(function(){
	openDialog('#memographpopup','Memory Usage: One hour usage statistics chart',true,800,'auto',false,false);
});
var memographTileView_yAxis = new Rickshaw.Graph.Axis.Y( {
	graph: memographTileView,		
	tickFormat: function(y){
	    var unit = " MB";
		var inData = (y/1024)/1024;
		if(inData>=1024){inData = inData/1024; unit = "GB";}
		if(inData>=1024){inData = inData/1024; unit = "TB";}
		var formattedData = inData.toFixed(1);
		if(formattedData>0){
			return inData.toFixed(1) + unit;
		}else{
			return "";
		}
	}
	
} );
memographTileView_yAxis.render();
return memographTileView;
}


function setupPopupViewMemoryGraph(memorySeriesData){

var memographpopupLargeView = new Rickshaw.Graph( {    
	element: document.querySelector("#memographpopup_chart"),
	renderer: 'line',   
	width: 530,
	height: 275, 	 
	series: memorySeriesData
});

var memoPopUpHoverDetail = new Rickshaw.Graph.HoverDetail( {
	graph: memographpopupLargeView,
	orientation: 'left',
	formatter: function(series, x, y, formattedX, formattedY, d) {
		var unit = " MB";
		var inData = (formattedY/1024)/1024;
		if(inData>=1024){inData = inData/1024; unit = "GB";}
		if(inData>=1024){inData = inData/1024; unit = "TB";}
		return series.name + '<br/>' + inData.toFixed(1) + unit;
	}
} );


var axes = new Rickshaw.Graph.Axis.Time( { graph: memographpopupLargeView,orientation: 'bottom' } );

var memoPopUpLegend = new Rickshaw.Graph.Legend( {
	element: document.querySelector('#memographpopup_legends'),
	graph: memographpopupLargeView
	});
var memoPopUpShelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
	graph: memographpopupLargeView,
	legend : memoPopUpLegend
} );
memographpopupLargeView.render();

var memoPopUp_yAxis = new Rickshaw.Graph.Axis.Y( {
	graph: memographpopupLargeView,	
	orientation: 'left',
	element: document.getElementById('memographpopup_y_axis'),
	//tickFormat: Rickshaw.Fixtures.Number.formatBase1024KMGTP,
	tickFormat: function(y){
	var unit = " MB";
		var inData = (y/1024)/1024;
		if(inData>=1024){inData = inData/1024; unit = "GB";}
		if(inData>=1024){inData = inData/1024; unit = "TB";}
		formattedData = inData.toFixed(1);
		if(formattedData>0){
		return inData.toFixed(1) + unit;
		}else{return "";}
		},
	
} );
memoPopUp_yAxis.render();

return memographpopupLargeView;
}

//Update memory chart	
function updateMemoryGraph(){			
$.ajax( {
	Type : "GET",
	url : apiBase+"metrices/memory?wrapper_function=theCallBack4",
	async: false,		
    jsonpCallback: 'theCallBack4',
    contentType: "application/json",
    dataType: 'jsonp',
    success: function(json) {
        //console.log(json);
        try{
	        var memorySeriesData = [];
	        for(i in json){
	        	curSeriesData = [];
	        	for(n=0;n<json[i].length;n++){
	        	
	        		curSeriesData.push({x:json[i][n][1],y:json[i][n][0]});
	        	}
	        	memorySeriesData.push({ color: palette.color(), name:i,data:curSeriesData});
	        }
	        if(tileMemoGraph == null){
	        	tileMemoGraph = setupTileViewMemoryGraph(memorySeriesData);
	        }else{
	        	tileMemoGraph.update(memorySeriesData);
	        }
	        if(popupMemoGraph == null){
	        	popupMemoGraph = setupPopupViewMemoryGraph(memorySeriesData);
	        }else{
	        	popupMemoGraph.update(memorySeriesData);
	        }
        }catch(e){}
        setTimeout(updateMemoryGraph,ajaxUpdateInterval);
      
    },
    error: function(e) {
       //console.log(e.message);
       setTimeout(updateMemoryGraph,ajaxUpdateInterval);
    }
});
}

function setupTileViewCpuGraph(){

$('#cpugraphTileView_chart').html("");
var cpugraphTileView = new Rickshaw.Graph( {    
element: document.querySelector("#cpugraphTileView_chart"),			
stroke: true,
width: 160,
height: 110, 
renderer: 'stack',     
series: cpuSeriesData
});
cpugraphTileView.render();
$('#cpugraphTileView_chart').click(function(){
openDialog('#cpugraphpopup','CPU Usage: One hour usage statistics chart',true,800,'auto',false,false);
});
var cpugraphTileView_yAxis = new Rickshaw.Graph.Axis.Y( {
graph: cpugraphTileView,		
tickFormat: function(y){
   return y.toFixed(2)+"%";
	
}

} );
cpugraphTileView_yAxis.render();
return cpugraphTileView;
}


function setupPopupViewCpuGraph(){

var cpugraphpopupLargeView = new Rickshaw.Graph( {    
element: document.querySelector("#cpugraphpopup_chart"),
renderer: 'stack', 
preserve: true,
width: 530,
height: 275, 	 
series: cpuSeriesData
});

var cpuPopUpHoverDetail = new Rickshaw.Graph.HoverDetail( {
graph: cpugraphpopupLargeView,
orientation: 'left',
formatter: function(series, x, y, formattedX, formattedY, d) {
	return y.toFixed(2)+"%";
}
} );


var axes = new Rickshaw.Graph.Axis.Time( { graph: cpugraphpopupLargeView,orientation: 'bottom' } );

var cpuPopUpLegend = new Rickshaw.Graph.Legend( {
element: document.querySelector('#cpugraphpopup_legends'),
graph: cpugraphpopupLargeView
});
var cpuPopUpShelving = new Rickshaw.Graph.Behavior.Series.Toggle( {
graph: cpugraphpopupLargeView,
legend : cpuPopUpLegend
} );
cpugraphpopupLargeView.render();

var cpuPopUp_yAxis = new Rickshaw.Graph.Axis.Y( {
graph: cpugraphpopupLargeView,	
orientation: 'left',
element: document.getElementById('cpugraphpopup_y_axis'),
//tickFormat: Rickshaw.Fixtures.Number.formatBase1024KMGTP,
tickFormat: function(y){
	return y.toFixed(2)+"%";
},

} );
cpuPopUp_yAxis.render();

return cpugraphpopupLargeView;
}

//Update cpury chart	
function updateCpuGraph(){			
$.ajax( {
Type : "GET",
url : apiBase+"metrices/cpu?wrapper_function=theCallBack5",
async: false,		
jsonpCallback: 'theCallBack5',
contentType: "application/json",
dataType: 'jsonp',
stroke: true,
preserve: true,
success: function(json) {
   // console.log(json);
    try{
        
       
        if(tileCpuGraph == null){
        	console.log("ok coming..");	
        	 cpuSeriesData = [];
		        for(i in json){	
		        	cpuCurSeriesData = [];
		        	for(n=0;n<json[i].length;n++){
		        		cpuCurSeriesData.push({x:json[i][n][1],y:json[i][n][0]});		        		
		        		lastCpuTimestamp = json[i][n][1];
		        	}
		        	cpuSeriesData.push({ color: palette.color(), name:i,data:cpuCurSeriesData});			        
		        	
		     }
        	tileCpuGraph = setupTileViewCpuGraph();
        }else{
        	var thisTimeCpuLastTimeStamp = 0;
        	for(i in json){	
	        	
	        	var curIndex = getIndexIfObjWithOwnAttr(cpuSeriesData,"name",i);
	        	console.log("curIndex : "+curIndex+",i : "+i);
	        	RemoveItemFromStart = 0;
	        	for(n=0;n<json[i].length;n++){
	        		//console.log(json[i][n][1]+">"+lastCpuTimestamp);
	        		
	        		if(json[i][n][1]>lastCpuTimestamp && curIndex>-1 && curIndex<cpuSeriesData.length){
	        			cpuSeriesData[curIndex]['data'].shift();
	        			cpuSeriesData[curIndex]['data'].push({x:json[i][n][1],y:json[i][n][0]});		        		
	        			if(thisTimeCpuLastTimeStamp<Number(""+json[i][n][1])) thisTimeCpuLastTimeStamp = Number(""+json[i][n][1]);
	        		}
	        		
	        	}
	        	
	        	
        	}
        	if(thisTimeCpuLastTimeStamp>lastCpuTimestamp) lastCpuTimestamp = thisTimeCpuLastTimeStamp;			        	
        	//lastCpuTimestamp = cpuSeriesData[0]['data'][cpuSeriesData[0]['data'].length-1].x;
        	console.log("lastCpuTimestamp set to : "+lastCpuTimestamp);
	       
	       // tileCpuGraph.series=cpuSeriesData;
        	tileCpuGraph.update();
        }

		    if(popupCpuGraph == null){
        	popupCpuGraph = setupPopupViewCpuGraph();
        }else{			        	
        	popupCpuGraph.series=cpuSeriesData;
        	popupCpuGraph.render();
       
        }
    }catch(e){ console.log(e);}
    
    setTimeout(updateCpuGraph,ajaxUpdateInterval);		      
},
error: function(e) {
   console.log(e.message);
   setTimeout(updateCpuGraph,ajaxUpdateInterval);
}
});
}
*/

/* Make items sortable and draggable in dash board*/
function makeTilesDraggableAndSortable(){
	$(function() {
	    $( "#dashboard-sortable-containers" ).sortable();
	    $( "#dashboard-sortable-containers" ).disableSelection();
	});
}


/*HDFS disk usage pie chart ends here*/
function renderDiskUsagePieChart(){
	/*HDFS disk usage pie chart*/
	d3donut.fontSize = 15;
	d3donut.drawDonutChart(
	  'hdfs_disk_usage',
	  0,
	  160,
	  150,
	  "",
	  ".35em",
	  {redRange:{min:88, max:100}, yellowRange:{min:60, max:88}}
	);
	
}


/*NameNode heap usage pie chart ends here*/
function renderNameNodeHeapUsagePieChart(){
	/*HDFS disk usage pie chart*/
	d3donut.fontSize = 15;
	d3donut.drawDonutChart(
	  'namenode_heap_usage',
	  0,
	  160,
	  150,
	  "",
	  ".35em",
	  {redRange:{min:90, max:100}, yellowRange:{min:60, max:90}}
	);
}

/*ResourceManager heap usage pie chart ends here*/
function renderResourceManagerHeapUsagePieChart(){
	/*HDFS disk usage pie chart*/
	d3donut.fontSize = 15;
	d3donut.drawDonutChart(
	  'resourcemanager_heap_usage',
	  0,
	  160,
	  150,
	  "",
	  ".35em",
	  { redRange:{min:90, max:100}, yellowRange:{min:60, max:90}}
	);
}

/*YARN memory usage pie chart ends here*/
function renderYarnMemoUsagePieChart(){
	/*HDFS disk usage pie chart*/
	d3donut.fontSize = 15;
	d3donut.drawDonutChart(
	  'yarn_memo_usage',
	  0,
	  160,
	  150,
	  "",
	  ".35em",
	  {redRange:{min:90, max:100}, yellowRange:{min:60, max:90}}
	);
}

/*YARN memory usage pie chart ends here*/
function renderNameNodeMemoUsagePieChart(){
	/*HDFS disk usage pie chart*/
	d3donut.fontSize = 15;
	d3donut.drawDonutChart(
	  'namenode_memo_usage',
	  0,
	  160,
	  150,
	  "",
	  ".35em",
	  { redRange:{min:90, max:100}, yellowRange:{min:60, max:90}}
	);
}


function openHealthWin(){
	openUrlInDialog('externalPopup',"/edb-adminconsole/host-status-list?api_base="+apiBase+"&cluster_name="+currentCluster, 'Node Health',true,700,500,false,false,true);	
}	


function openDetailNamenodeCpuStat(){
	if(NameNodeHostName!="")
	openUrlInDialog('externalPopup',"/edb-adminconsole/host-latest-cpu-pie-chart?api_base="+apiBase+"&cluster_name="+currentCluster+"&host_name="+NameNodeHostName, 'NameNode CPU',true,700,425,false,false,true);	
}


$(document).ready(function(){
	/* Popup view of memory graph*/
	makeTilesDraggableAndSortable();	
	renderDiskUsagePieChart();
	renderNameNodeHeapUsagePieChart();
	renderResourceManagerHeapUsagePieChart();
	renderYarnMemoUsagePieChart();
	renderNameNodeMemoUsagePieChart();
	getNameNodeStatistics();
	getResourceManagerHeapUsage();	
	/*
	updateMemoryGraph();
	updateCpuGraph();
	*/
});    