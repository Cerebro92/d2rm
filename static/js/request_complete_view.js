var requessId = "4d4d4462-4997-4838-a698-213049c1b9f9";

$(document).ready(function(){
	/*var requestTracker = new jQuery.requestTrackerAjax({
			requestID:requessId,
			callbackFunction:function(data){renderSingleRequest(data)}
	});
	function renderSingleRequest(jData){
		this.childRequestIds =[];
		var hasChild = false;
		console.log(AppJS.readValueInObject(jData,"content.RequestResource",null));
		if(AppJS.readValueInObject(jData,"content.RequestResource",null)!= null){
			var listOfRequest = AppJS.readValueInObject(jData,"content.RequestResource",[]);
			if(listOfRequest.length>0){
				for(var ctr = 0 ; ctr < listOfRequest.length ; crt++){
					rObj = listOfRequest[ctr];
					if(rObj.requestId == requessId){
						var keyCounter = 0;
						for(var ky in rObj.childRequest){
							this.childRequestIds[keyCounter] = ky[keyCounter];
							keyCounter++;
						}
						
						hasChild = (keyCounter > 0) ? true : false;
						if(hasChild){
							
							
						}else{
							
							
						}
					}	
				}
				
			}
		
		}else{
			console.log("null");
			
		}
	
	}
	
	function prepareTaskDetails(){
		
		
	}*/
	// 6 sex 
	var minTimeInWhichProgressWillFinishInSecond = 150 * 1000;
	var setMaxTimeToDisplayPrgress = Math.floor(parseInt(minTimeInWhichProgressWillFinishInSecond / 100));
	var setMinTimeToDisplayPrgress = Math.floor(parseInt(minTimeInWhichProgressWillFinishInSecond / 100) / 2) ;
	var progressCompleted = 0;
	var maxProgressupdate = 8 ; 
	var minProgressupdate = 5 ;
	
	setTimeout(simulationProgress, getRandomIntInclusive(setMaxTimeToDisplayPrgress,setMinTimeToDisplayPrgress));
	
	function simulationProgress(){
		increamentInProgress = getRandomIntInclusive(maxProgressupdate ,minProgressupdate);
		progressCompleted =  ((parseInt(progressCompleted + increamentInProgress) >= 100 ) ?  100 : parseInt(progressCompleted + increamentInProgress));
		console.log("progressCompleted"+ progressCompleted);
		$("#mainprogressbar").css("width",progressCompleted+"%");
		$("#mainprogressbar").html(progressCompleted+"%");
		if(progressCompleted < 100 ){
			setTimeout(simulationProgress, getRandomIntInclusive(setMaxTimeToDisplayPrgress,setMinTimeToDisplayPrgress));
		}else{
			setTimeout(function(){
					$("#progressStatus").html("Success")
					$("#requestActionButton").css("display","block");	
					
			}, 1000);
			
		}
	}
	
	function getRandomIntInclusive(max , min ) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
	
	$("#VisualizeAnalysedData").click(function(){
		window.parent.visualizeAnalysedData();
		window.parent.$(".ui-dialog-content").dialog('close');
		
	});
	
	
});