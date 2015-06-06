'use strict';
(function(){ 
	oNUI.lifeSocket = new NUISocket(oNUI.URL.LIFE_SOCKET, function(e){ console.info("OhNUI Module Loaded!"); }, null, oNUI.onReveicePacket);
	oNUI.body = [new NUIBody()];
	for(var I in oNUI.JointType){
		oNUI.body[0].joints[oNUI.JointType[I]] = new NUIJoint(0, 0, 0, 0);
	}
	$("body").append($("<div id='NUIHandler'>").hide());
})();

		/* �뿴嫄고삎 蹂��닔
		*/
		
		/* 援ъ“泥�
		ImageData: function(bits, width, height, colorPerBits, sensorID){
			this.bits = new Uint8Array(bits);
			this.width = width;
			this.height = height;
			this.colorPerBits = colorPerBits;
			this.sensorID = sensorID;
		},
		DepthData: function(bits, width, height, minDepth, maxDepth, sensorID){
			this.bits = bits; // byte[][]
			this.width = width;
			this.height = height;
			this.minDepth = minDepth;
			this.maxDepth = maxDepth;
			this.sensorID = sensorID;
		},
		SensorData: function(name, company, id, state){
			this.name = name;
			this.company = company;
			this.id = id;
			this.state = state;
		},
		SkeletonData: function(joints, id, sensorID){
			this.joints = joints;
			this.id = id;
			this.sensorID = sensorID;
		},
		Vector3: function(x, y, z){
			this.x = x;
			this.y = y;
			this.z = z;
		},
		*/
		
		/* �븿�닔
		GetSensorList: function(){
			return [new SensorData()];
		},
		GetSensorState: function(sensorID){
			return [oNUI.SensorState];
		},
		SetDefaultSensor: function(sensorID){
			
		},
		GetColorFrame: function(sensorID){
			// (Optional) int sensorID = (湲곕낯 �꽱�꽌 ID)
			// return colorFrame(ImageData)
		},
		GetDepthFrame: function(sensorID){
			// (Optional) int sensorID = (湲곕낯 �꽱�꽌 ID)
			// return depthFrame(DepthData)
		},
		GetSkeletonIDList: function(sensorID){
			// (Optional) int sensorID = (湲곕낯 �꽱�꽌 ID)
			// return skeletonIDs(int[])
		},
		GetSkeletonList: function(param1, param2){
			// (Required) int param1 = (湲곕낯 �꽱�꽌�쓽 Skeleton ID �샊�? �듅�젙 �꽱�꽌 ID)
			// (Optional) int param2 = (�듅�꽦 �꽱�꽌�쓽 Skeleton ID)
			// return skeleton(SkeletonData)
		},

		GetPersonOnlyColorFrame: function(sensorID){
			// (Optional) int sensorID = (湲곕낯 �꽱�꽌 ID)
			// return colorFrame(ImageData)
		},
		GetBackgroundOnlyColorFrame: function(sensorID){
			// (Optional) int sensorID = (湲곕낯 �꽱�꽌 ID)
			// return colorFrame(ImageData)
		},

		ResizeColorFrame: function(colorFrame, width, height){
			// return colorFrame(ImageData)
		},
		ResizeDepthFrame: function(depthFrame, width, height){
			// return depthFrame(DepthData)
		},
		*/
		
		/* �씠踰ㅽ듃
		*/ 
		 