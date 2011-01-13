Ext.ns('simFla.ux.plugins');

simFla.ux.plugins.getYPos = function ( oElement ) {
   var iReturnValue = 0;
   while( oElement != null ) {
      iReturnValue += oElement.offsetTop;
      oElement = oElement.offsetParent;
   }
   return iReturnValue;
}

simFla.ux.plugins.getXPos = function ( oElement ) {
   var iReturnValue = 0;
   while( oElement != null ) {
      iReturnValue += oElement.offsetLeft;
      oElement = oElement.offsetParent;
   }
   return iReturnValue;
}


simFla.ux.plugins.Canvas2Image = (function() {

       // check if we have canvas support
	var bHasCanvas = false;
	var oCanvas = document.createElement("canvas");
	if (oCanvas.getContext("2d")) {
		bHasCanvas = true;
	}

	// no canvas, bail out.
	if (!bHasCanvas) {
		return {
			saveAsBMP : function(){},
			saveAsPNG : function(){},
			saveAsJPEG : function(){}
		}
	}

	var bHasImageData = !!(oCanvas.getContext("2d").getImageData);
	var bHasDataURL = !!(oCanvas.toDataURL);
	var bHasBase64 = !!(window.btoa);

	var strDownloadMime = "image/octet-stream";

	// ok, we're good
	var readCanvasData = function(oCanvas) {
		var iWidth = parseInt(oCanvas.width);
		var iHeight = parseInt(oCanvas.height);
		return oCanvas.getContext("2d").getImageData(0,0,iWidth,iHeight);
	}

	// base64 encodes either a string or an array of charcodes
	var encodeData = function(data) {
		var strData = "";
		if (typeof data == "string") {
			strData = data;
		} else {
			var aData = data;
			for (var i=0;i<aData.length;i++) {
				strData += String.fromCharCode(aData[i]);
			}
		}
		return btoa(strData);
	}

	// creates a base64 encoded string containing BMP data
	// takes an imagedata object as argument
	var createBMP = function(oData) {
		var aHeader = [];
	
		var iWidth = oData.width;
		var iHeight = oData.height;

		aHeader.push(0x42); // magic 1
		aHeader.push(0x4D); 
	
		var iFileSize = iWidth*iHeight*3 + 54; // total header size = 54 bytes
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256);

		aHeader.push(0); // reserved
		aHeader.push(0);
		aHeader.push(0); // reserved
		aHeader.push(0);

		aHeader.push(54); // dataoffset
		aHeader.push(0);
		aHeader.push(0);
		aHeader.push(0);

		var aInfoHeader = [];
		aInfoHeader.push(40); // info header size
		aInfoHeader.push(0);
		aInfoHeader.push(0);
		aInfoHeader.push(0);

		var iImageWidth = iWidth;
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256);
	
		var iImageHeight = iHeight;
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256);
	
		aInfoHeader.push(1); // num of planes
		aInfoHeader.push(0);
	
		aInfoHeader.push(24); // num of bits per pixel
		aInfoHeader.push(0);
	
		aInfoHeader.push(0); // compression = none
		aInfoHeader.push(0);
		aInfoHeader.push(0);
		aInfoHeader.push(0);
	
		var iDataSize = iWidth*iHeight*3; 
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); 
	
		for (var i=0;i<16;i++) {
			aInfoHeader.push(0);	// these bytes not used
		}
	
		var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

		var aImgData = oData.data;

		var strPixelData = "";
		var y = iHeight;
		do {
			var iOffsetY = iWidth*(y-1)*4;
			var strPixelRow = "";
			for (var x=0;x<iWidth;x++) {
				var iOffsetX = 4*x;

				strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+2]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX+1]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY+iOffsetX]);
			}
			for (var c=0;c<iPadding;c++) {
				strPixelRow += String.fromCharCode(0);
			}
			strPixelData += strPixelRow;
		} while (--y);

		var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

		return strEncoded;
	}


	// sends the generated file to the client
	var saveFile = function(strData) {
		document.location.href = strData;
	}

	var makeDataURI = function(strData, strMime) {
		return "data:" + strMime + ";base64," + strData;
	}

	// generates a <img> object containing the imagedata
	var makeImageObject = function(strSource) {
		var oImgElement = document.createElement("img");
		oImgElement.src = strSource;
		return oImgElement;
	}

	var scaleCanvas = function(oCanvas, iWidth, iHeight) {
		if (iWidth && iHeight) {
			var oSaveCanvas = document.createElement("canvas");
			oSaveCanvas.width = iWidth;
			oSaveCanvas.height = iHeight;
			oSaveCanvas.style.width = iWidth+"px";
			oSaveCanvas.style.height = iHeight+"px";

			var oSaveCtx = oSaveCanvas.getContext("2d");

			oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
			return oSaveCanvas;
		}
		return oCanvas;
	}

	return {
         
               getDataStr : function(oCanvas, bReturnImg, iWidth, iHeight) {
			if (!bHasDataURL) {
				return false;
			}
			var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
			var strData = oScaledCanvas.toDataURL("image/png");
			
			return strData;
		},

		saveAsPNG : function(oCanvas, bReturnImg, iWidth, iHeight) {
			if (!bHasDataURL) {
				return false;
			}
			var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
			var strData = oScaledCanvas.toDataURL("image/png");
			if (bReturnImg) {
				return makeImageObject(strData);
			} else {
				saveFile(strData.replace("image/png", strDownloadMime));
			}
			return true;
		},

		saveAsJPEG : function(oCanvas, bReturnImg, iWidth, iHeight) {
			if (!bHasDataURL) {
				return false;
			}

			var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);
			var strMime = "image/jpeg";
			var strData = oScaledCanvas.toDataURL(strMime);
	
			// check if browser actually supports jpeg by looking for the mime type in the data uri.
			// if not, return false
			if (strData.indexOf(strMime) != 5) {
				return false;
			}

			if (bReturnImg) {
				return makeImageObject(strData);
			} else {
				saveFile(strData.replace(strMime, strDownloadMime));
			}
			return true;
		},

		saveAsBMP : function(oCanvas, bReturnImg, iWidth, iHeight) {
			if (!(bHasImageData && bHasBase64)) {
				return false;
			}

			var oScaledCanvas = scaleCanvas(oCanvas, iWidth, iHeight);

			var oData = readCanvasData(oScaledCanvas);
			var strImgData = createBMP(oData);
			if (bReturnImg) {
				return makeImageObject(makeDataURI(strImgData, "image/bmp"));
			} else {
				saveFile(makeDataURI(strImgData, strDownloadMime));
			}
			return true;
		}
	};

})();

simFla.ux.plugins.touchHandler = function (event)
{
    var touches = event.changedTouches,
        first = touches[0],
        type = "";
         switch(event.type)
    {
        case "touchstart": type = "mousedown"; break;
        case "touchmove":  type="mousemove"; break;        
        case "touchend":   type="mouseup"; break;
        default: return;
    }

             //initMouseEvent(type, canBubble, cancelable, view, clickCount, 
    //           screenX, screenY, clientX, clientY, ctrlKey, 
    //           altKey, shiftKey, metaKey, button, relatedTarget);
    
    var simulatedEvent = document.createEvent("MouseEvent");
    simulatedEvent.initMouseEvent(type, true, true, window, 1, 
                              first.screenX, first.screenY, 
                              first.clientX, first.clientY, false, 
                              false, false, false, 0/*left*/, null);

    first.target.dispatchEvent(simulatedEvent);
    event.preventDefault();
}


simFla.ux.plugins.signaturePad = Ext.extend(Ext.util.Observable, {
 
 init: function(cmp){
    this.cmp = cmp;
    cmp.on('beforerender', this.initControl, this);
    cmp.on('afterrender', this.initCanvas, this);
  },
   
  initControl: function() {
      var width = 400, height = 100;
      if(this.width && this.width) {
         width = this.width;
         height = this.height;
      }
     this.cmp.html = '<canvas width="' + width + '" height="' + height + '" style="border:1px solid black;" id="thecanvas"></canvas>'; 
  }, 
   
  initCanvas: function(){
    
      var bMouseIsDown, oCanvas, oCtx, iWidth, iHeight, panel;
    
      bMouseIsDown = false;
	
      oCanvas = document.getElementById("thecanvas");
      
      oCanvas.addEventListener("touchstart", simFla.ux.plugins.touchHandler, true);
      oCanvas.addEventListener("touchmove", simFla.ux.plugins.touchHandler, true);
      oCanvas.addEventListener("touchend", simFla.ux.plugins.touchHandler, true);
      oCanvas.addEventListener("touchcancel", simFla.ux.plugins.touchHandler, true);  
      
      panel = this.cmp;
      
      if (oCanvas) {
         
         this.oCanvas = oCanvas;
      
         oCtx = oCanvas.getContext("2d");
    
         iWidth = oCanvas.width;
         iHeight = oCanvas.height;
    
         oCtx.beginPath();
         oCtx.strokeStyle = "rgba(0,0,0, 0.5)";
         oCtx.strokeWidth = "4px";
   
 
         oCanvas.onmousedown = function(e) {
                 bMouseIsDown = true;                 
                 iLastX = e.clientX - simFla.ux.plugins.getXPos(panel.el.dom);
                 iLastY = e.clientY - simFla.ux.plugins.getYPos(panel.el.dom);
         }
         oCanvas.onmouseup = function() {
                 bMouseIsDown = false;
                 iLastX = -1;
                 iLastY = -1;
         }
         oCanvas.onmousemove = function(e) {
                 if (bMouseIsDown) {
                         var iX = e.clientX - simFla.ux.plugins.getXPos(panel.el.dom);
                         var iY = e.clientY - simFla.ux.plugins.getYPos(panel.el.dom);
                         
                         oCtx.moveTo(iLastX, iLastY);
                         oCtx.lineTo(iX, iY);
                         oCtx.stroke();
                         iLastX = iX;
                         iLastY = iY;
                 }
         }
   
      }
  },
  
  getSignatureAsImage: function (strType) {
      var oCanvas = document.getElementById("thecanvas");
      var bRes = false;
      if (oCanvas) {
         if (strType == "DATA")
             bRes = simFla.ux.plugins.Canvas2Image.getDataStr(oCanvas);
         if (strType == "PNG")
             bRes = simFla.ux.plugins.Canvas2Image.saveAsPNG(oCanvas, true);
         if (strType == "BMP")
             bRes = simFla.ux.plugins.Canvas2Image.saveAsBMP(oCanvas, true);
         if (strType == "JPEG")
             bRes = simFla.ux.plugins.Canvas2Image.saveAsJPEG(oCanvas, true);

         if (!bRes) {
             return false;
         }
      }
     
      return bRes;
   },
   
   reset: function() {
	canvas=document.getElementById("thecanvas");
	c=canvas.getContext("2d");
	c.clearRect(0,0,canvas.width,canvas.height);
        c.beginPath();
   }
});
