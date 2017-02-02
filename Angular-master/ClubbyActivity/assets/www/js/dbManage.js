// var CREATE_USERS_TABLE = "CREATE TABLE IF NOT EXISTS user_tb(uid INTEGER, name TEXT, token TEXT, firstname TEXT, lastname TEXT, profileimg TEXT)";
// var CREATE_FAVOR_TABLE = "CREATE TABLE IF NOT EXISTS favor_tb(rid INTEGER, fid INTEGER, type INTEGER)";
// var CREATE_CART_TABLE = "CREATE TABLE IF NOT EXISTS cart_tb(cid INTEGER PRIMARY KEY AUTOINCREMENT, rid INTEGER, fid INTEGER, type INTEGER, quantity INTEGER, extra INTEGER, garnish INTEGER, dupcount INTEGER)";
// var CREATE_CART_TABLE = "CREATE TABLE IF NOT EXISTS cart_tb(cid INTEGER PRIMARY KEY AUTOINCREMENT, rid INTEGER, fid INTEGER, type INTEGER, quantity INTEGER, extra INTEGER, garnish INTEGER, dupcount INTEGER)";
// var CREATE_NEW_CART_TABLE = "CREATE TABLE IF NOT EXISTS new_cart_tb(rid INTEGER, cn INTEGER)";
var CREATE_ORDERS_TABLE = "CREATE TABLE IF NOT EXISTS order_tb(oid INTEGER, telnum TEXT, ojstr TEXT, status TEXT, dat TEXT, tim TEXT, ocode TEXT, tip INTEGER, cart_num INTEGER)";

// var INSERT_USER = "INSERT INTO user_tb (uid, name, token, firstname, lastname, profileimg) VALUES (?,?,?,?,?,?)";
// var INSERT_CART = "INSERT INTO cart_tb(rid, fid, type, quantity, extra, garnish, dupcount) VALUES (?,?,?,?,?,?,?)";
// var INSERT_FAVOR = "INSERT INTO favor_tb(rid, fid, type) VALUES(?,?,?)"

var INSERT_ORDER = "INSERT INTO order_tb(oid, telnum, ojstr, status, dat, tim, ocode, tip, cart_num) VALUES (?,?,?,?,?,?,?,?,?)";

var DELETE_USERS = "DELETE FROM user_tb WHERE 1";
var DROP_USERS_TABLE = "DROP TABLE user_tb";
var GET_USERS = "SELECT uid, name, token, firstname, lastname, profileimg FROM user_tb";
var UPDATE_PROFILE = "UPDATE user_tb SET profileimg=? WHERE 1";

var gDatabase = null;//openDatabase("wvmodelDB", "1.0", "wvmDB", 200000);

var localStorage = {uid:0, name:"", token:"", devtoken:"", firstname:"", lastname:"", profileimg:""};

function initDatabase()// Function Call When Page is ready.
{
	print_log("--------------------- initDatabase -----------------");
	try {
		print_log("initDatabase -----------------try");
		if(!window.openDatabase)// Check browser is supported SQLite or not.
		{
			alert('Databases are not supported in this browser.');
		} else {
			createTable();
			//sampleData()
			// If supported then call Function for create table in SQLite
		}
	} catch (e) {
		print_log("initDatabase -----------------catch");
		if(e == 2) {
			// Version number mismatch.
			print_log("Invalid database version.");
		} else {
			print_log("Unknown error " + e + ".");
		}
		return;
	}
}

function updateProfile(profileimg) {
	var update_profile = "UPDATE user_tb SET profileimg='" + profileimg + "' WHERE 1";
	print_log(update_profile);
	//alert(update_profile);
	gDatabase.transaction(function(tx) {		
			tx.executeSql(update_profile, [], function(tx, result){
				print_log("profile image updated");}, onExecuteSqlError);		
		});
}
function createTable() {
	gDatabase.transaction(function(tx) {
		// tx.executeSql(CREATE_USERS_TABLE);
		// print_log("user table create;");
		// tx.executeSql(CREATE_FAVOR_TABLE);
		// print_log("favorite table create;");
		// tx.executeSql(CREATE_CART_TABLE);
		// print_log("cart table create;");
		// tx.executeSql(CREATE_NEW_CART_TABLE);
		tx.executeSql(CREATE_ORDERS_TABLE);
		print_log("order table create;");
		
	});
}
function saveNewCartNumber(rid, cn)
{
	var query = "SELECT * FROM new_cart_tb WHERE rid="+rid;
	var query1 = "UPDATE new_cart_tb SET cn=" + cn + " WHERE rid=" + rid;
	var query2 = "INSERT INTO new_cart_tb(rid, cn) VALUES(?,?)";
	gDatabase.transaction(function(tx){
		tx.executeSql(query,[],function(ctx, results){
			var dataset = results.rows;
			if (dataset.length > 0) {
				updateNewCartNumber(rid, cn);
			} else {
				insertNewCartNumber(rid, cn);
			}

		}, onExecuteSqlError);
	});
}
function insertNewCartNumber(rid, cn) {	
	var query2 = "INSERT INTO new_cart_tb(rid, cn) VALUES(?,?)";
	gDatabase.transaction(function(tx){
		tx.executeSql(query2,[rid, cn],function(ctx, results){
			print_log("new cart number inserted");
		}, onExecuteSqlError);
	});
}
function updateNewCartNumber(rid, cn) {
	var query1 = "UPDATE new_cart_tb SET cn=" + cn + " WHERE rid=" + rid;
	gDatabase.transaction(function(tx){
		tx.executeSql(query1,[],function(ctx, results){
			print_log("new cart number updated");
		}, onExecuteSqlError);
	});
}
function saveUserInfo(){
	var auth = localStorage;	
	print_log("delete query will be running - " + JSON.stringify(localStorage));
	if (auth.uid > 0) {
		gDatabase.transaction(function(tx) {		
			tx.executeSql(DELETE_USERS, [], onSqlDeleteUserInfoSuccess, onExecuteSqlError);		
		});
	}
}
function deleteUserInfo() {
	gDatabase.transaction(function(tx) {		
			tx.executeSql(DELETE_USERS, [], 
				function(tx, result){print_log("deleted user info");}, 
				onExecuteSqlError);		
		});
}

function onSqlDeleteUserInfoSuccess(tx, result) {
	var auth = localStorage;
	print_log("delete query success - " + JSON.stringify(localStorage));
	gDatabase.transaction(function(tx) {
		tx.executeSql(INSERT_USER,[auth.uid, auth.name, auth.token, auth.firstname, auth.lastname, auth.profileimg], 
			function(tx,result){
				//alert(JSON.stringify(localStorage));
				//localStorage.profileimg = '';
				print_log("save userinfo to local database success.");
			}, onExecuteSqlError);
		});
}

function onExecuteSqlError(tx, error){
	print_log(error.message);
	alert(JSON.stringify(error));
}

function checkLoggedin (){
    gDatabase.transaction(function(tx) {
        tx.executeSql(GET_USERS, [], function(tx, results) {
            var dataset = results.rows;
            print_log("Users exist " + dataset.length);
            print_log("Users from db - " + JSON.stringify(dataset));
            //alert("Users from db - " + JSON.stringify(dataset));
            //dataset.length
            if(dataset.length > 0) {
                //print_log(dataset.item(0));
                var row = dataset.item(0);
                //alert(row.profileimg);
                localStorage = {
                    token: row.token,
                    uid: row.uid,
                    name: row.name,
                    firstname: row.firstname,
                    lastname: row.lastname,
                    profileimg: row.profileimg
                };
                localStorage.profileimg = row.profileimg;
                //alert(JSON.stringify(localStorage));
                //localStorageService.add('auth', auth);
                //menu.setMainPage('location.html', {closeMenu: true});
                //home.pushPage('location.html');
                menu.setMainPage('location.html', {closeMenu: true});
                $rootScope.$broadcast('handleTokenBroadcast', userData.token);
            }else{
                print_log("login page");
                
                //menu.setMainPage('login.html', {closeMenu: true});
            }
        }, onExecuteSqlError);
    });
}
