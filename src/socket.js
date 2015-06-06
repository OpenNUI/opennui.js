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