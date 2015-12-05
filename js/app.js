$(document).foundation();

var resizer = angular.module("imageResizer", []);

resizer.directive("fileread", function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
				var fileList = element[0].files;
				var c = 0;
				scope.fileread = [];
				//use a self-invoking to draw images in canvases and wait to complete the drawing before passing to the next image.
				(function draw(){
					var img = new Image();
					var reader = new FileReader();
					
					reader.onload = function(e){
						img.src = e.target.result;
					}
					img.onload = function(){
						scope.$apply(function () {
                			scope.fileread[c] = img;
            			});
						c++;
						if (c<fileList.length) draw();
					}
					reader.readAsDataURL(fileList[c]);	
				})();
            });
        }
    }
});

resizer.controller("irController", ["$scope", "$http", function($scope, $http){
	$scope.images = [];
	$scope.height = 1080;
	$scope.width = 1920;
	$scope.compression = 80;
	$scope.zipname = "output";
	$scope.currentYear = new Date().getFullYear();
	$scope.year = $scope.currentYear - 5;
	$scope.brands = [];
	$scope.models = [];
	$scope.err = "";

	var timeoutval = 4000

	var startTime = new Date().getTime();
	
	$http.get("car-server.php/brands", {timeout: timeoutval}).then(function successCallback(response) {
		    $scope.brands = response.data;
		  }, function errorCallback(response) {
		  	var respTime = new Date().getTime();
		  	if(respTime > startTime + timeoutval) $scope.err = "Can't retrieve cars data, please check your connection and try again";
		  	else  $scope.err = "Oops, an error occured while retrieving cars data, please try again";
		  });

	$scope.getModels = function(){
		$scope.models = [];
		startTime = new Date().getTime();
		$http.get("car-server.php/"+$scope.choosenBrand+"/models", {timeout: timeoutval}).then(function successCallback(response) {
		    $scope.models = response.data;
		  }, function errorCallback(response) {
		  	var respTime = new Date().getTime();
		  	if(respTime > startTime + timeoutval) $scope.err = "Can't retrieve cars data, please check your connection and try again";
		    else  $scope.err = "Oops, an error occured while retrieving cars data, please try again";
		  });
	}
	
	$scope.resize = function(){
		var canvases = document.getElementsByTagName("canvas");
		var i = 0;
		var p_height, p_width;
		(function scale(){
			var the_canvas = canvases[i];
			var img = new Image();
			img.onload = function(){
				var aspect_ratio = img.width / img.height; //width on height
				var ctx = the_canvas.getContext("2d");
				if($scope.crop){
					if($scope.height * aspect_ratio >= $scope.width){
						img.height = $scope.height;
						img.width = $scope.height * aspect_ratio;
					}
					else{
						img.height = $scope.width/aspect_ratio;
						img.width = $scope.width;
					}
					the_canvas.width = $scope.width;
					the_canvas.height = $scope.height;
					var y_offset = Math.round(($scope.height - img.height)/2);
					var x_offset = Math.round(($scope.width - img.width)/2);
					console.log ("x_offset = "+x_offset+" y_offset = "+y_offset);
					ctx.drawImage(img,x_offset,y_offset,img.width,img.height);
				}
				else{
					p_height = Math.abs(img.height - $scope.height) / img.height;
					p_width = Math.abs(img.width - $scope.width) / img.width;
					
					if(p_height < p_width){
						img.height = the_canvas.height = $scope.height;
						img.width = the_canvas.width = aspect_ratio * $scope.height;
					}
					else{
						img.height = the_canvas.height = $scope.width / aspect_ratio; 
						img.width = the_canvas.width = $scope.width;
					}
					ctx.drawImage(img,0,0,img.width,img.height);
				}
				i++;
				if(i<canvases.length) scale();
			}
			img.src = $scope.images[i].src;
		})();
	};

	$scope.save = function(){
		var canvases = document.getElementsByTagName("canvas");
		var zip = new JSZip();
		var compression = Math.round($scope.compression)/100;
		alert(compression);
		var i = 0;
		(function write(){
			var the_canvas = canvases[i];
			var img = new Image();
			img.onload = function(){
				var index = img.src.indexOf(",");
				var data = img.src.substring(index + 1, img.src.length);
				zip.file("image"+i+".jpeg",data,{base64:true});
				i++;
				if(i<canvases.length) write();
				else{
					var content = zip.generate({type:"blob"});
					saveAs(content, $scope.choosenBrand+"-"+$scope.choosenModel+"-"+$scope.year+".zip");
				}
			}
			img.src = the_canvas.toDataURL("image/jpeg", compression);
		})();

	};
}]);