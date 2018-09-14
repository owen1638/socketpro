//loading SocketPro adapter (nja.js + njadapter.node) for nodejs
var SPA=require('nja.js');

//define message request ids
const idMessage0 = SPA.BaseID.idReservedTwo + 100;
const idMessage1 = SPA.BaseID.idReservedTwo + 101;
const idMessage2 = SPA.BaseID.idReservedTwo + 102;
const idMessage3 = SPA.BaseID.idReservedTwo + 103;
const idMessage4 = SPA.BaseID.idReservedTwo + 104;
const TEST_QUEUE_KEY = 'queue_name_0';

var cs = SPA.CS; //CS == Client side

//create a socket pool object and let it be global
var p = cs.newPool(SPA.SID.sidQueue);
global.socketpool = p;

//create a connection context
var cc = cs.newCC('localhost',20902,'root','Smash123');

//start a socket pool having one session to a remote server
if (!p.Start(cc,1)) {
	console.log(p.getError());
	return;
}
var sq = p.Seek(); //seek an async persistent message queue handler

function testEnqueue(sq) {
	var idMsg;
	var ok = true;
	var buff = SPA.newBuffer();
	console.log('Going to enqueue 1024 messages ......');
	for (var n=0; n < 1024; ++n) {
		var str = '' + n + ' Object test';
		switch(n%3) {
		case 0:
			idMsg = idMessage0;
			break;
		case 1:
			idMsg = idMessage1;
			break;
		default:
			idMsg = idMessage2;
			break;
		}
		ok = sq.Enqueue(TEST_QUEUE_KEY, idMsg, buff.SaveString('SampleName').SaveString(str).SaveInt(n));
		if (!ok) break;
	}
	return ok;
}

sq.setResultReturned((id, q)=>{
	switch(id) {
		case idMessage0:
		case idMessage1:
		case idMessage2:
			 //parse a dequeued message which should be the same as the above enqueued message (two unicode strings and one int)
			var name = q.LoadString();
			var str = q.LoadString();
			var index = q.LoadInt();
			console.log('message id=' + id + ', name=' + name + ', str=' + str + ', index=' + index);
			break;
		case idMessage3:
			var s1 = q.LoadString();
			var s2 = q.LoadString();
			console.log(s1 + ' ' + s2);
			break;
		case idMessage4:
			var b = q.LoadBool();
			var dbl = q.LoadDouble();
			var s = q.LoadString();
			console.log('b=' + b + ', dbl=' + dbl + ', s=' + s);
			break;
		default:
			throw 'Unexpected';
			break;
	}
});

var cb = function(mc, fsize, msgs, bytes) {
	console.log('Total message count=' + mc + ', queue file size=' + fsize + ', messages dequeued=' + msgs + ', message bytes dequeued=' + bytes);
	if (mc) {
		sq.Dequeue(TEST_QUEUE_KEY, cb);
	}
};

function testDequeue(sq) {
	console.log("Going to dequeue messages ......");
	//optionally, add one extra to improve processing concurrency at both client and server sides for better performance and through-output
	return sq.Dequeue(TEST_QUEUE_KEY, cb) && sq.Dequeue(TEST_QUEUE_KEY, cb);
}

do {
	b = sq.StartTrans(TEST_QUEUE_KEY, (errCode)=>{console.log('errCode=' + errCode);});
	if (!b) break;
	b = testEnqueue(sq);
	if (!b) break;
	var buff = SPA.newBuffer();
	sq.BatchMessage(idMessage3, buff.SaveString('Hello').SaveString('World'));
	sq.BatchMessage(idMessage4, buff.SaveBool(true).SaveDouble(234.456).SaveString('MyTestWhatever'));
	b = sq.EnqueueBatch(TEST_QUEUE_KEY, (indexMsg)=>{});
	if (!b) break;
	b = sq.EndTrans(false);
	if (!b) break;
    b = testDequeue(sq);
	b = sq.Flush(TEST_QUEUE_KEY, (mc, fsize)=>{
		console.log('Total message count=' + mc + ', queue file size=' + fsize);
	});
}while(false);
if (!b) {
	console.log(sq.getSocket().getError());
	return;
}

function getKeys(sq) {
	return new Promise(function(res, rej){
		if(!sq.GetKeys((v) => {
				res(v);
			}, (cancled)=>{
				rej(cancled ? 'request canceled' : 'connection closed');
			}
		))
			rej('connection closed');
	});
}
async function asyncKeys(sq) {
	let result;
	try {
		result = await getKeys(sq);
	} catch (err) {
		console.error(err);
		throw err;
	}
	return result;
}
console.log(asyncKeys(sq));
