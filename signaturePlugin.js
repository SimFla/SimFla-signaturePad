Ext.ns('simFla.ux.plugins');

simFla.ux.plugins.signaturePad = Ext.extend(Ext.util.Observable, {
 
 init: function(cmp){
    this.cmp = cmp;
    cmp.html = '<canvas width="200" height="200" style="border:1px solid black;" id="thecanvas"></canvas>'
    cmp.on('render', this.initCanvas, this);
  },
 
        
  initCanvas: function(){
    
        var bMouseIsDown = false;
	
	var oCanvas = document.getElementById("thecanvas");
	var oCtx = oCanvas.getContext("2d");
 
	var iWidth = oCanvas.width;
	var iHeight = oCanvas.height;
 
	oCtx.beginPath();
	oCtx.strokeStyle = "rgb(255,0,255)";
	oCtx.strokeWidth = "4px";
 
	oCanvas.onmousedown = function(e) {
		bMouseIsDown = true;
		iLastX = e.clientX - oCanvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
		iLastY = e.clientY - oCanvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
	}
	oCanvas.onmouseup = function() {
		bMouseIsDown = false;
		iLastX = -1;
		iLastY = -1;
	}
	oCanvas.onmousemove = function(e) {
		if (bMouseIsDown) {
			var iX = e.clientX - oCanvas.offsetLeft + (window.pageXOffset||document.body.scrollLeft||document.documentElement.scrollLeft);
			var iY = e.clientY - oCanvas.offsetTop + (window.pageYOffset||document.body.scrollTop||document.documentElement.scrollTop);
			oCtx.moveTo(iLastX, iLastY);
			oCtx.lineTo(iX, iY);
			oCtx.stroke();
			iLastX = iX;
			iLastY = iY;
		}
	}
 
	function showDownloadText() {
		document.getElementById("buttoncontainer").style.display = "none";
		document.getElementById("textdownload").style.display = "block";
	}
 
	function hideDownloadText() {
		document.getElementById("buttoncontainer").style.display = "block";
		document.getElementById("textdownload").style.display = "none";
	}
 
	function convertCanvas(strType) {
		if (strType == "PNG")
			var oImg = Canvas2Image.saveAsPNG(oCanvas, true);
		if (strType == "BMP")
			var oImg = Canvas2Image.saveAsBMP(oCanvas, true);
		if (strType == "JPEG")
			var oImg = Canvas2Image.saveAsJPEG(oCanvas, true);
 
		if (!oImg) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}
 
		oImg.id = "canvasimage";
 
		oImg.style.border = oCanvas.style.border;
		oCanvas.parentNode.replaceChild(oImg, oCanvas);
 
		showDownloadText();
                
                return true;
	}
 
	function saveCanvas(pCanvas, strType) {
		var bRes = false;
		if (strType == "PNG")
			bRes = Canvas2Image.saveAsPNG(oCanvas);
		if (strType == "BMP")
			bRes = Canvas2Image.saveAsBMP(oCanvas);
		if (strType == "JPEG")
			bRes = Canvas2Image.saveAsJPEG(oCanvas);
 
		if (!bRes) {
			alert("Sorry, this browser is not capable of saving " + strType + " files!");
			return false;
		}
                
                return bRes;
	}
  }
});
