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
