/**
 * this file will contain all the business logic related to
 * the lesson scheme
 */

/* set dependencies */
// var util = require('./util.js');
// var constant = require('./constant.js'); 
// var db = require('./database.js');
// var moment = require('moment');
// var logger = require('./logger.js');
// var connect = require("./connect.js");

// /* export models functions */
// module.exports = {
// 	/**
// 	 * update lesson onairs table
// 	 * @param: obj -> contains rows of the lessonOnairs table
// 	 */
// 	updateLessonOnair: function(values, where, data){
// 		util.log("[UPDATE_LESSON_ONAIR] values -> " + JSON.stringify(values) + " condition -> " + JSON.stringify(where));

// 		// set lesson onairs
// 		var model = db.lesson_onairs;

// 		// change model if recruit camera check
// 		if (data.memberType == 'recruit_camera_check') {
// 			model = db.recruit_lesson_onairs;
// 		}

// 		// update
// 		return model.update(values, where);
// 	}
// };