/* require fs */
var fs = require("fs");

/* ssl information */
module.exports = {
	/* database information */
	dbName: "english",
	dbHost: "localhost",
	dbUser: "devel",
	dbPass: "",
	dbTime: "+09:00", // set to japanese time
	
	/* ssl files */
	options: {
		key: fs.readFileSync('/vagrant/ssl/stg-node.nativecamp.net.nopass.key'),
		cert: fs.readFileSync('/vagrant/ssl/stg-node.nativecamp.net.crt'),
		ca: fs.readFileSync('/vagrant/ssl/stg-node.nativecamp.net.ca.crt')
	},
	
	/* allowed sites */
	origins: ""
};