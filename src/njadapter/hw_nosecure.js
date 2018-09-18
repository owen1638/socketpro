//loading SocketPro adapter (nja.js + njadapter.node) for nodejs
var SPA=require('nja.js');

const sid = SPA.SID.sidReserved + 1; //hello world service id

//hello world service supports the following three requests
const idSayHello = SPA.BaseID.idReservedTwo + 1;
const idSleep = idSayHello + 1;
const idEcho = idSleep + 1;

var cs = SPA.CS; //CS == Client side

//create a global socket pool object
var p=cs.newPool(sid);
global.socketpool = p;

//create a connection context
var cc = cs.newCC('localhost',20901,'root','Smash123');

//start a socket pool having one session to a remote server
if (!p.Start(cc,1)) {
	console.log(p.getError());
	return;
}
var hw = p.Seek(); //seek an async hello world handler

var buffer = new ArrayBuffer(8);
var int32View = new Int32Array(buffer);
int32View[0] = 1;
int32View[1] = 76890;
//prepare a real complex structure for a remote request
var data = {
	nullStr:null,
	objNull:null,
	aDate:new Date(),
	aDouble:1234.567,
	aBool:true,
	unicodeStr:'Unicode',
	asciiStr:'ASCII',
	objBool:true,
	objString:'test',
	objArrString:['Hello', 'world'],
	objArrInt:int32View
};
console.log(data);

//streaming all the following five requests without waiting server responses

//serialize and de-serialize a complex structure with a specific order,
//pay attention to both serialization and de-serialization,
//which must be in agreement with server implementation

//echo a complex object
var ok = hw.SendRequest(idEcho, SPA.newBuffer().Save(q=>{
		//serialize member values into buffer q with a specific order, which must be in agreement with server implementation
		q.SaveString(data.nullStr); //4 bytes for length
		q.SaveObject(data.objNull);  //2 bytes for data type
		q.SaveDate(data.aDate); //8 bytes for ulong with accuracy to 1 micro-second
		q.SaveDouble(data.aDouble); //8 bytes
		q.SaveBool(data.aBool); //1 byte
		q.SaveString(data.unicodeStr); //4 bytes for string length + (length * 2) bytes for string data -- UTF16-lowendian
		q.SaveAString(data.asciiStr); //4 bytes for ASCII string length + length bytes for string data
		q.SaveObject(data.objBool); //2 bytes for data type + 2 bytes for variant bool
		q.SaveObject(data.objString); //2 bytes for data type + 4 bytes for string length + (length * 2) bytes for string data -- UTF16-lowendian
		q.SaveObject(data.objArrString); //2 bytes for data type + 4 bytes for array size + (4 bytes for string length + (length * 2) bytes for string data) * arraysize -- UTF16-lowendian
		q.SaveObject(data.objArrInt); //2 bytes for data type + 4 bytes for array size + arraysize * 4 bytes for int data
	}), q=>{
		//de-serialize once result comes from server
		var d = {nullStr:q.LoadString(),
			objNull:q.LoadObject(),
			aDate:q.LoadDate(),
			aDouble:q.LoadDouble(),
			aBool:q.LoadBool(),
			unicodeStr:q.LoadString(),
			asciiStr:q.LoadAString(),
			objBool:q.LoadObject(),
			objString:q.LoadObject(),
			objArrString:q.LoadObject(),
			objArrInt:q.LoadObject()
		};
		console.log(d);
	}
);

ok = hw.SendRequest(idSayHello, SPA.newBuffer().SaveString('Mary').SaveString('Smith'), q=>{
	console.log(q.LoadString());
});

//sleep 5000 ms at server side
ok = hw.SendRequest(idSleep, SPA.newBuffer().SaveInt(5000), q=>{
	console.log('Sleep returned');
});

ok = hw.SendRequest(idSayHello, SPA.newBuffer().SaveString('Jone').SaveString('Dole'), q=>{
	console.log(q.LoadString());
});

function asycFunc(hw, fName, lName) {
	return new Promise((res, rej)=>{
		var ok = hw.SendRequest(idSayHello, SPA.newBuffer().SaveString(fName).SaveString(lName), q=> {
			res(q.LoadString());
		}, canceled=>{
			rej(canceled ? 'Connection canceled' : 'Connection closed');
		}, errMsg=>{
			rej(errMsg);
		});
		if (!ok) {
			rej('Connection closed');
		}
	});
}
async function asyncWait(hw, fName, lName) {
	var result;
	try {
		result = await asycFunc(hw, fName, lName);
	} catch (err) {
		console.error(err);
		throw err;
	}
	console.log(result);
}

//send a request by use of Promise, async and await
asyncWait(hw, 'Hillary', 'Clinton');