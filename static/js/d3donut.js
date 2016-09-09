var d3donut = new function(){
	this.label = "";
	this.fontSize = 22;
	this.fontWeight = "300";
	this.fontColor = "#1072b8";
	this.filledAreaColor = "#1072b8";
	this.emptyAreaColor = "#35526b";
	this.defaultConfig = {fontSize:48, fontWeight:"300", fontColor:"#70b761",	filledAreaColor:"#70b761", emptyAreaColor:"#bcbcbc", redRange:{min:0,max:0}, yellowRange:{min:0,max:0}};
	this.duration = 500;   
    this.orelation = {};  
    this.oconfigData = {};
    //NONE, LT or GT OR LTE OR GTE
   
    this.drawDonutChart = function (element, percent, width, height, label,text_y, configObj) {
							var alreadyRendered = false;
							if($('#'+element).data('whetherrendered') == null || Number($('#'+element).data('whetherrendered')) ==0){
								$('#'+element).data('whetherrendered',1);
								//alert("case1");
							}else{
								//alert("case2");
								alreadyRendered = true;
								return;
							}
						
						  if(configObj!=null){
							  for(key in this.defaultConfig){
						    	  //console.log(key+"=>"+this.defaultConfig[key]);
						    	  if(!this.keyExists(configObj,key)){
						    		  configObj[key] = this.defaultConfig[key];
						    	  }else{
						    		 // console.log(key+"=>"+configObj[key]);  
						    	  }
						      }
							  this.oconfigData[element] = configObj;
    					  }else{
    						  this.oconfigData[element] = this.defaultConfig;
    					  }
						  width = typeof width !== 'undefined' ? width : 290;
						  height = typeof height !== 'undefined' ? height : 290;
						  text_y = typeof text_y !== 'undefined' ? text_y : "-.10em";
						  $('#'+element).data('percent',percent);
						 
						  var dataset = {
								lower: this.calcPercent(0),
								upper: this.calcPercent(percent)
							  },
							  radius = Math.min(width, height) / 2;
							  pie = d3.layout.pie().sort(null);
							  format = d3.format(".0%");

						  var arc = d3.svg.arc()
								.innerRadius(radius - 9)
								.outerRadius(radius);

						  var svg = d3.select('#'+element).append("svg")
								.attr("width", width)
								.attr("height", height)
								.append("g")
								.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
						  var clrObj = this.getColors(element,percent);
						  var clrs = clrObj['circleClr'];
						  
							
							
							
						  var path = svg.selectAll("path")
								.data(pie(dataset.lower))
								.enter().append("path")
								.style("fill", function(d, i) {  return clrs[i]; })									 
								.attr("d", arc)
								.style("stroke", "#00000")
								 .style("stroke-width", 2)
								.each(function(d) { this._current = d; }); // store the initial values
						  var txtClr = clrObj['fontClr'];
						  var text = svg.append("text")
								.attr("text-anchor", "middle")
								.attr("dy", text_y)
								.style("font-size",this.oconfigData[element]['fontSize'])
								.style("fill",txtClr)
								.style("font-family",'"Source Sans Pro",sans-serif')
								.style("font-weight",this.oconfigData[element]['fontWeight'])
								.style("line-height",this.oconfigData[element]['fontSize']-2);
								
						  this.orelation[element] = {path:path,txt:text,arc:arc,lbl:label,svg:svg};
						  
						  if (typeof(percent) === "string") {
							text.text(lbl+" "+percent);
							
						  }
						  else {
							    var progress = 0;
								var lbl = label;
							    var timeout = setTimeout(function (ref) {
							    clearTimeout(timeout);							   
							    path = path.data(pie(dataset.upper)); // update the data								
							    path.transition().duration(ref.duration).attrTween("d", function (a) {
								// Store the displayed angles in _current.
								// Then, interpolate from _current to the new angles.
								// During the transition, _current is updated in-place by d3.interpolate.
								var i  = d3.interpolate(this._current, a);
								var i2 = d3.interpolate(progress, percent);
								this._current = i(0);
								return function(t) {
								  text.text( lbl+" "+format(i2(t) / 100) );
								  return arc(i(t));
								};
							  }); // r+edraw the arcs
							}, 200,this);
						  }
					};
		 this.calcPercent = function(percent) {
						  return [percent, 100-percent];
					};
		 
		 this.update = function(element,percent){
							  var path = typeof this.orelation[element] !== 'undefined' ? this.orelation[element]['path'] : null;
							  var text = typeof this.orelation[element] !== 'undefined' ? this.orelation[element]['txt'] : null;
							  var arc = typeof this.orelation[element] !== 'undefined' ? this.orelation[element]['arc'] : null;
							  var lbl = "";
							  if(typeof this.orelation[element] !== 'undefined' && typeof this.orelation[element]['lbl'] !== 'undefined'){
								lbl = this.orelation[element]['lbl'];
							  }
							  if(path!=null && text!=null){
							  $('#'+element).data('percent',percent);
									var dataset = {
										lower: this.calcPercent($('#'+element).data('percent')),
										upper: this.calcPercent(percent)
									 }, pie = d3.layout.pie().sort(null);
									var  format = d3.format(".0%");
									var progress = percent;
									
									var clrObj = this.getColors(element,percent);
									var clrs = clrObj['circleClr'];
									var txtClr = clrObj['fontClr'];
									text.style("fill",txtClr);
									
									path.style("fill", function(d, i) {  return clrs[i]; });
									var timeout = setTimeout(function (ref) {
									  clearTimeout(timeout);

									  path = path.data(pie(dataset.upper)); // update the data
									  path.transition().duration(ref.duration).attrTween("d", function (a) {
										// Store the displayed angles in _current.
										// Then, interpolate from _current to the new angles.
										// During the transition, _current is updated in-place by d3.interpolate.
										var i  = d3.interpolate(this._current, a);
										var i2 = d3.interpolate(progress, percent)
										this._current = i(0);
										return function(t) {
										  text.text( lbl+" "+format(i2(t) / 100) );
										  return arc(i(t));
										};
									  }); // redraw the arcs
									}, 200, this);
							  }
				 };
				 
			this.keyExists = function(obj,key){
				return (typeof obj[key] !== 'undefined');
			};
			
			this.getColors = function(element,percent){
				var clrObj = {circleClr:[this.oconfigData[element]['filledAreaColor'],this.oconfigData[element]['emptyAreaColor']], fontClr:this.oconfigData[element]['fontColor']};
				if(this.keyExists(this.oconfigData[element]['redRange'],"min") && this.keyExists(this.oconfigData[element]['redRange'],"max")){
					if(percent>this.oconfigData[element]['redRange']['min'] && percent<=this.oconfigData[element]['redRange']['max'] && (this.oconfigData[element]['redRange']['max']-this.oconfigData[element]['redRange']['min'])>0){
						clrObj['circleClr'] = ["#f57663","#bcbcbc"];
						clrObj['fontClr']="#f57663";
					}
				}
				
				if(this.keyExists(this.oconfigData[element]['yellowRange'],"min") && this.keyExists(this.oconfigData[element]['yellowRange'],"max")){
					if(percent>this.oconfigData[element]['yellowRange']['min'] && percent<=this.oconfigData[element]['yellowRange']['max'] && (this.oconfigData[element]['yellowRange']['max']-this.oconfigData[element]['yellowRange']['min'])>0){
						clrObj['circleClr'] = ["#f3a221","#bcbcbc"];
						clrObj['fontClr']="#f3a221";
					}
				}
				return clrObj;
			};
};