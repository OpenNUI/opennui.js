var oNUI = {};
var NUIBody = function() {
	this.joints = {};
};
var NUIJoint = function(status, x, y, z) {
	this.status = status;
	this.x = x; this.y = y; this.z = z;
	this.dx = 0; this.dy = 0; this.dz = 0;
};
var NUIEvent = function(type) {
	this.type = type;
};

(function(){'use strict';
	if (typeof jQuery === "undefined") {
		console.error("jQuery is not defined.");
	}
	$.extend(oNUI, { 
		URL : {
			LIFE_SOCKET: "ws://localhost:8001/",
			EVENT_SOCKET: function(port) { return "ws://localhost:" + port + "/"; },
			SENSOR_SOCKET: "ws://localhost/sensor"
		},
		RECEIVE_PACKET_TYPE : {
			HELLO: 0x0001,
			READY_CONNECTION: 0x0002,
			TEST_TEXTMESSAGE: 0x0003,
			RESPONSE_SHARED_MEMORY: 0x0004,
			EVENT: 0x0010
		},
		REQUEST_PACKET_TYPE : {
			HELLO_ACK: 0x0001,
			READY_CONNECTION_ACK: 0x0002,
			TEST_TEXTMESSAGE: 0x0003,
			REQUEST_SHARED_MEMORY: 0x0004
		},
		EVENT_TYPE : {
			HAND_STATUS_CHANGE: 0x0000,
			HAND_POSITION_CHANGE: 0x0001,
			FACE_DATA_CHANGE: 0x0002,
			PATTERN_DATA_CHANGE: 0x0003,
			GESTURE_DETECTED: 0x0004,
			SENSOR_CREATED: 0x0005,
			SENSOR_STATUS_CHANGED: 0x0006,
			
			USER_CUSTOM: 0x0007
		},
		NUI_EVENT : [
			"handStatusChange",
			"handPositionChange",
			"faceDataChange",
			"patternDataChange",
			"gestureDetected",
			"sensorCreated",
			"sensorStatusChanged"
		],
		Events : {
			COLOR_FRAME_UPDATED : "ColorFrameUpdated",
			DEPTH_FRAME_UPDATED : "DepthFrameUpdated",
			SKELETON_UPDATED : "SkeletonUpdated"
		},
		JointType : {
			HEAD: 3,
			LEFT_HAND: 7,
			RIGHT_HAND: 11
		},
		SensorState : {
			OPENED: "sensorOpened",
			SUSPENDED: "sensorSuspended"
			// ...
		},
		SkeletonState : {
			MISSING: "skeletonMissing",
			DETECTED: "skeletonDetected"
			// ...
		}
	});
})();

'use strict';
var ByteArray = function(arg) {
	// arg�뒗 ArrayBuffer �샊�? length
	this.buffer = arg.byteLength?arg:new ArrayBuffer(arg);
	this.view = new DataView(this.buffer);
	this.position = 0;
	Object.defineProperty(this, "bytesAvailable", {
		get: function(){ return this.buffer.byteLength - this.position; }
	});
	this.readUnsignedByte = function(){
		return this.view.getUint8(this.position++, true);
	}
	this.readUnsignedShort = function(){
		return this.view.getUint16((this.position += 2)-2, true);
	}
	this.readShort = function(){
		return this.view.getInt16((this.position += 2)-2, true);
	}
	this.readUnsignedInt = function(){
		return this.view.getUint32((this.position += 4)-4, true);
	}
	this.readFloat = function(){
		return this.view.getFloat32((this.position += 4)-4, true);
	}
	this.readDouble = function(){
		return this.view.getFloat64((this.position += 8)-8, true);
	}
	this.writeUnsignedByte = function(val){
		this.view.setUint8(this.position++, val, true);
	}
	this.writeUnsignedShort = function(val){
		this.view.setUint16((this.position += 2)-2, val, true);
	}
	this.writeUnsignedInt = function(val){
		this.view.setUint32((this.position += 4)-4, val, true);
	}
}
var NUISocket = function(url, openHandler, closeHandler, msgHandler) {
	this.socket = new WebSocket(url);
	this.socket.container = this;
	this.socket.binaryType = "arraybuffer";
	this.onOpen = openHandler;
	this.onClose = closeHandler;
	this.onMessage = msgHandler;
	this.socket.onopen = function(e){
		if(this.container.onOpen) this.container.onOpen(e);
	};
	this.socket.onclose = function(e){
		if(this.container.onClose) this.container.onClose(e);
	};
	this.socket.onmessage = function(e){
		if(this.container.onMessage) this.container.onMessage(e);
	};
	this.send = function(type, data){
		// �뿤�뜑�뒗 �븣�븘�꽌 �옉�꽦�븳�떎!
		var ba = new ByteArray(512); // 癒몃━ 16 + 紐� 6 + �굹癒몄?
		ba.writeUnsignedShort(0x2D7F);

		switch(type){
			case oNUI.REQUEST_PACKET_TYPE.HELLO_ACK:
				ba.writeUnsignedInt(6);
				ba.writeUnsignedInt(0);
				ba.writeUnsignedInt(0);
				ba.writeUnsignedShort(0);
				
				ba.writeUnsignedShort(type);
				ba.writeUnsignedInt(1);
				break;
			case oNUI.REQUEST_PACKET_TYPE.READY_CONNECTION_ACK:
				ba.writeUnsignedInt(6);
				ba.writeUnsignedInt(0);
				ba.writeUnsignedInt(0);
				ba.writeUnsignedShort(0);
				
				ba.writeUnsignedShort(type);
				ba.writeUnsignedInt(oNUI.id);
				break;
			default:
		}
		this.socket.send(ba.buffer);
	};
};

'use strict';
(function(){
	$.extend(oNUI, {
		parsePacket : function(buffer) {
			var reader = new ByteArray(buffer);
			var R = { head : {}, body : {}, view : reader };
			if(reader.readUnsignedShort() != 0x7F2D){
				throw new Error("Invalid packet header");
				return null;
			}
			R.head.bodyLength = reader.readUnsignedInt();
			reader.position = 16;
			R.body.kind = reader.readShort(); // �뙣�궥�쓽 醫낅쪟
			if(R.body.kind == oNUI.RECEIVE_PACKET_TYPE.EVENT){
				R.body.eventType = reader.readUnsignedInt();
			}
			return R;
		},
		onReveicePacket : function(e) {
			var data = oNUI.parsePacket(e.data);
			switch(data.body.kind) {
				case oNUI.RECEIVE_PACKET_TYPE.HELLO:
					oNUI.id = data.view.readUnsignedInt();
					oNUI.lifeSocket.send(oNUI.REQUEST_PACKET_TYPE.HELLO_ACK);
					break;
				case oNUI.RECEIVE_PACKET_TYPE.READY_CONNECTION:
					var eventPort = data.view.readUnsignedInt();
					oNUI.eventSocket = new NUISocket(oNUI.URL.EVENT_SOCKET(eventPort), oNUI.onConnected, oNUI.onDisconnected, oNUI.onReveicePacket);
					break;
				case oNUI.RECEIVE_PACKET_TYPE.EVENT:
					oNUI.parseEventPacket(data);
					$("#NUIHandler").trigger(oNUI.NUI_EVENT[data.body.eventType], new NUIEvent(data.body.eventType));
					break;
				default:
			}
		},
		parseEventPacket : function(data) {
			var ba = data.view;
			//var numBody = ba.readUnsignedInt();
			var i, j, o;

			data.body.data = new Array();

			switch(data.body.eventType) {
				case oNUI.EVENT_TYPE.HAND_STATUS_CHANGE:
					//for(i=0; i<numBody; i++){
						o = {
							type: ba.readUnsignedInt(),
							status: ba.readUnsignedShort()
						};
						j = oNUI.body[0].joints[o.type];
						j.status = o.status;
						/*o = new Object();
						o.id = ba.readUnsignedInt();
						o.numHand = 2; //ba.readUnsignedShort();
						o.hands = new Array();
						for(j=0; j<o.numHand; j++){
							o.hands.push({joint: ba.readUnsignedInt(), status: ba.readUnsignedShort()});
						}
						data.body.data.push(o);*/
					//}
					break;
				case oNUI.EVENT_TYPE.HAND_POSITION_CHANGE:
					//for(i=0; i<numBody; i++){
						o = {
							type: ba.readUnsignedInt(),
							status: ba.readUnsignedShort(),
							x: ba.readDouble(),
							y: ba.readDouble(),
							z: ba.readDouble()
						};
						j = oNUI.body[0].joints[o.type];
						j.dx = o.x - j.x; j.dy = o.y - j.y; j.dz = o.z - j.z;
						j.x = o.x; j.y = o.y; j.z = o.z;
						j.status = o.status;
						/*
						o.id = ba.readUnsignedInt();
						o.numHand = 2; //ba.readUnsignedShort();
						o.hands = new Array();
						for(j=0; j<o.numHand; j++){
							o.hands.push({
								joint: ba.readUnsignedInt(),
								status: ba.readUnsignedShort(),
								x: ba.readDouble(),
								y: ba.readDouble(),
								z: ba.readDouble()
							});
						}
						data.body.data.push(o);
						*/
					//}
					break;
				default:
			}
			return data;
		},
		onConnected : function(e){
			oNUI.eventSocket.send(oNUI.REQUEST_PACKET_TYPE.READY_CONNECTION_ACK, []);
		},
		onDisconnected : function(e){
			console.info("Fucking Framework");
		}
	});
	
})();
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
		 