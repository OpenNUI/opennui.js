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