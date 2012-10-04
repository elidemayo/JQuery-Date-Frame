(function( $ ) {
	$.widget( "iris.dateframe", {
	
		// These options will be used as defaults
		options: { 
			defaultType:"m",
			types:"yqmwdc",
			date:new Date()
		},
		types:{"y":"Year","q":"Quarter","m":"Month","w":"Week","d":"Day","c":"Custom"},
		values:{},
		_init: function(){
			
		},
		// Set up the widget
		_create: function() {
			$self = this;
			this.values = {
				start: this.options.date,
				type: this.options.defaultType
			}
			this.element.addClass("ui-widget ui-widget-header ui-dateframe");
			this.tf_selector = $("<span></span>").css("float","left").appendTo(this.element);
			this._buildTypes();
			this.tf_picker = $("<a>",{href:"#"}).appendTo(this.element)
			.addClass("ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all ui-dateframe-picker ui-datefarm-fulllink");
			$("<span>").addClass("ui-icon ui-icon-circle-triangle-w").html("Prev").appendTo(this.tf_picker)
			.wrap('<a class="ui-datepicker-prev ui-corner-all" title="Prev"></a>')
			.bind("click.dateframe",{num:-1},this._addSteps);
			$("<span>").addClass("ui-icon ui-icon-circle-triangle-e").html("Next").appendTo(this.tf_picker)
			.wrap('<a class="ui-datepicker-next ui-corner-all" title="Next"></a>')
			.bind("click.dateframe",{num:1},this._addSteps);
			var div = $("<div>").addClass("ui-datepicker-title tf-picker-title").appendTo(this.tf_picker);
			this.tf_display = $("<span>").addClass("ui-datepicker-year").html("&nbsp;").appendTo(div)
			.bind("click.dateframe",{pk:"r"},this._open_picker)
			this.r_picker = $("<input>",{type:"hidden"}).appendTo(div).datepicker({
				onSelect: function(dateText, inst) {
					$self.setDateFrame($self.r_picker.datepicker('getDate'));
					$self.tf_selector.buttonset("refresh");
				}
			});
			$("<span>").addClass("ui-datepicker-anchor").html("&nbsp;").insertAfter(this.r_picker);
			this.tf_blocker = $("<div>").html("&nbsp;").addClass("ui-dateframe-blocker").appendTo(this.tf_picker)
			.hide();
			// Custom start date picker
			this.s_picker = $("<input>",{type:"hidden",name:"StartDate"}).datepicker({
				onSelect: function(dateText, inst) {
					$self.e_picker.datepicker("option","minDate",dateText);
					if(!$self.setType("c")){
						var s = $self.s_picker.datepicker('getDate') || new Date();
						var e = $self.e_picker.datepicker('getDate') || new Date();
						$self.setDateFrame(s,e);
					}
				}
			});
			this.s_picker.wrap('<a href="#"></a>').parent().bind("click.dateframe",{pk:"s"},this._open_picker).appendTo(this.element)
			.addClass("ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all ui-dateframe-picker ui-datefarm-fulllink");
			$("<span>").addClass("ui-datepicker-anchor").html("&nbsp;").insertAfter(this.s_picker);
			this.s_display = $("<span>").addClass("ui-dateframe-display").html("&nbsp;").insertBefore(this.s_picker);
			// Custom end date picker
			this.e_picker = $("<input>",{type:"hidden",name:"EndDate"}).datepicker({
				onSelect: function(dateText, inst) {
					$self.s_picker.datepicker("option","maxDate",dateText);
					if(!$self.setType("c")){
						var s = $self.s_picker.datepicker('getDate') || new Date();
						var e = $self.e_picker.datepicker('getDate') || new Date();
						$self.setDateFrame(s,e);
					}
				}
			});
			this.e_picker.wrap('<a href="#"></a>').parent().bind("click.dateframe",{pk:"e"},this._open_picker).appendTo(this.element)
			.addClass("ui-datepicker-header ui-widget-header ui-helper-clearfix ui-corner-all ui-dateframe-picker ui-datefarm-fulllink");
			$("<span>").addClass("ui-datepicker-anchor").html("&nbsp;").insertAfter(this.e_picker);
			this.e_display = $("<span>").addClass("ui-dateframe-display").html("&nbsp;").insertBefore(this.e_picker);
			this.r_name = $("<input>",{type:"hidden",name:"RangeName"}).appendTo(this.element);
			this.element.append($("<div>").css("clear","both"));
			$self.setDateFrame($self.options.date);
		},
		// Use the _setOption method to respond to changes to options
		_setOption: function( key, value ) {
			switch( key ) {
			case "clear":
			// handle changes to clear option
			break;
			}
	
			// In jQuery UI 1.8, you have to manually invoke the _setOption method from the base widget
			$.Widget.prototype._setOption.apply( this, arguments );
			// In jQuery UI 1.9 and above, you use the _super method instead
			//	this._super( "_setOption", key, value );
			switch( key ) {
			case "types":
				$self._buildTypes();
			break;
			}	
			
		},
		_buildTypes: function(){
			var types = [];
			for(var i=0;i<this.options.types.length;i++){
				var l = this.options.types.substr(i,1);
				if($.inArray(l, types) == -1 && "yqmwdc".indexOf(l) !== -1) types.push(l);
			}
			this.options.types = types.join("");
			this.tf_selector.buttonset("destroy");
			this.tf_selector.empty();
			for(var i=0;i<types.length;i++){
				var $inp = $("<input>",{type:"radio",name:"tf_select",value:types[i],id:"tf_select_" + types[i]})
				.bind("click.dateframe",{tf:types[i]},this._changeType).appendTo(this.tf_selector);
				if(types[i] === this.options.defaultType) $inp.attr("checked",true);
				$("<label>",{"for":"tf_select_" + types[i]}).html(this.types[types[i]]).insertAfter($inp);
			};
			this.tf_selector.buttonset();
		},
		setType: function(tf){
			if(typeof tf == "string" && tf.length == 1 && $self.options.types.indexOf(tf) != -1){
				$self.tf_selector.find("input[name='tf_select'][value='" + tf + "']").attr("checked",true);
				$self.tf_selector.buttonset("refresh");
				return $self._setType(tf);
			}
			return false;
		},
		_changeType: function(e){
			$self._setType(e.data.tf);
		},
		_setType: function(tf){
			if($self.values.type != tf){
				$self.values.type = tf;
				$self.tf_blocker.toggle(tf === "c");
				var s,e;
				if(tf === "c"){
					s = $self.s_picker.datepicker('getDate') || new Date();
					e = $self.e_picker.datepicker('getDate') || new Date();
				}
				else s = $self.options.date;
				$self.setDateFrame(s,e);
				return true;
			}
			return false;
		},
		_addSteps: function(e){
			$self.addSteps(e.data.num)
		},
		_open_picker: function(e){
			if((e.data.pk == "r" && $self.values.type === "d") || (e.data.pk !== "r" && $self.options.types.indexOf("c") != -1)){
				var picker, date;
				switch(e.data.pk){
				case "r": $self.r_picker.datepicker("setDate",$self.values.start).datepicker('show');break;
				case "s": $self.s_picker.datepicker("setDate",$self.values.start).datepicker('show');break;
				case "e": $self.e_picker.datepicker("setDate",$self.values.end).datepicker('show');break;
				}
			}
			return false;
		},
		addSteps: function(num){
			var d = $self.values.start;
			if(!isNaN(num)){
				num = parseInt(num);
				switch($self.values.type){
				case "y": d.setFullYear(d.getFullYear() + num); break;
				case "q": d.setMonth(d.getMonth() + (num * 3)); break;
				case "m": d.setMonth(d.getMonth() + num); break;
				case "w": d.setDate(d.getDate() + (num * 7)); break;
				case "d": d.setDate(d.getDate() + num); break;
				}
				$self.setDateFrame(d)
			}
		},
		setDateFrame: function(d,d2){
			var rname = "";
			switch($self.values.type){
			case "y": 
				$self.values.start = new Date(d.getFullYear(),0,1); 
				$self.values.end = new Date(d.getFullYear(),11,31);
				rname = d.getFullYear().toString()
				break;
			case "q":
				var qq = [
					[new Date(d.getFullYear(),0,1),new Date(d.getFullYear(),2,31)],
					[new Date(d.getFullYear(),3,1),new Date(d.getFullYear(),5,30)],
					[new Date(d.getFullYear(),6,1),new Date(d.getFullYear(),8,30)],
					[new Date(d.getFullYear(),9,1),new Date(d.getFullYear(),11,31)]
				];
				var q = Math.floor(d.getMonth() / 3);
				qq = qq[q];
				q++;
				$self.values.start = new Date(qq[0]); 
				$self.values.end = new Date(qq[1]);
				rname = "Q" + q + "&nbsp;" + d.getFullYear().toString();
				break;
			case "m":
				$self.values.start = new Date(d.getFullYear(),d.getMonth(),1); 
				$self.values.end = new Date($self.values.start);
				$self.values.end.setMonth($self.values.end.getMonth() + 1);
				$self.values.end.setDate($self.values.end.getDate() - 1);
				rname = $self._monthNames[d.getMonth()] + "&nbsp;" + d.getFullYear().toString();
				break;
			case "w":
				var y = d.getFullYear();
				var ww = $self._getWeeks(y)
				if(ww[ww.length - 1][1] < d) {
					y++;
					ww = $self._getWeeks(y);
				}
				if(ww[0][0] > d){
					y--;
					ww = $self._getWeeks(y);
				}
				for(var i=0;i<ww.length;i++){
					if(d < ww[i][1]){break;}
				}
				$self.values.start = new Date(ww[i][0]); 
				$self.values.end = new Date(ww[i][1]);
				rname = "WW" + (i + 1).toString() + "&nbsp;" + y.toString();
				break;
			case "d":
				$self.values.start = new Date(d);
				$self.values.end = new Date(d);
				rname = $self._formatDate(d);
				break;
			case "c":
				$self.values.start = new Date(d);
				$self.values.end = new Date(d2);
				rname = $self._formatDate(d) + " - " + $self._formatDate(d2)
			}
			if($self.values.type != "c") $self.tf_display.html(rname);
			$self.r_name.val(rname);
			$self.s_display.html($self._formatDate($self.values.start));
			$self.s_picker.datepicker("setDate",$self.values.start);
			$self.s_picker.datepicker("option","maxDate",$self.values.end);
			$self.e_display.html($self._formatDate($self.values.end));
			$self.e_picker.datepicker("setDate",$self.values.end);
			$self.e_picker.datepicker("option","minDate",$self.values.start);
		},
		_formatDate: function(d){
			return $self._monthNames[d.getMonth()].substr(0,3) + "&nbsp;" + d.getDate().toString() + "&nbsp;" + 
			d.getFullYear().toString()
		},
		_getWeeks: function(y){
			var ww = [];
			var fd = new Date(y, 0, 1);
			var d = 1 - fd.getDay();
			if(d < -3) d += 7;
			fd.setDate(fd.getDate() + d);
			d = [6,1];
			while(fd.getFullYear() <= y){
				var r = [];
				for(var i=0;i<d.length;i++){
					r.push(new Date(fd.getTime()))
					fd.setDate(fd.getDate() + d[i]);
				}
				if(fd.getFullYear() <= y || r[1].getDate() < 3) ww.push(r);
			}
			return ww;
		},
		_monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", 
		"September", "October", "November", "December"],
		// Use the destroy method to clean up any modifications your widget has made to the DOM
		destroy: function() {
			// In jQuery UI 1.8, you must invoke the destroy method from the base widget
			$self.element.empty().removeClass();
			$.Widget.prototype.destroy.call( this );
			// In jQuery UI 1.9 and above, you would define _destroy instead of destroy and not call the base method
		}
	});
}( jQuery ) )
