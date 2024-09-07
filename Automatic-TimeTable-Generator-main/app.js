var express = require("express")
var http = require('http')
var path = require('path')
var bodyParser = require("body-parser")
var mongoose = require("mongoose")
const { Int32 } = require("mongodb")
const app = express()
var server =http.Server(app)
var port=3000;
app.set("port",port);
app.set('view engine', 'ejs');
app.use(bodyParser.json())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended:true
}))
mongoose.connect('mongodb+srv://harrish:harrish@tt.zhx5z37.mongodb.net/?retryWrites=true&w=majority&appName=TT',{
    useNewUrlParser: true,
    useUnifiedTopology: true
});
var db = mongoose.connection;
db.on('error',()=>console.log("Error in Connecting to Database"));
db.once('open',()=>console.log("Connected to Database"));
var adminSchema = new mongoose.Schema({
    username: String,
    password: String
});
var Admin = mongoose.model('Admin', adminSchema);
var facultySchema = new mongoose.Schema({
    username: String,
    password: String
});
var Faculty = mongoose.model('Faculty', facultySchema);
var courseSchema = new mongoose.Schema({
    programme: String,
    stream: String
});
app.get("/",(req,res)=>{
    res.set({
        "Allow-access-Allow-Origin": '*'
    })
    return res.redirect('index.html');
}).listen(1200);
console.log("Listening on PORT 1200");
app.post("/login", async (req, res) => {
    const userType = req.body.userType;
    const username = req.body.username;
    const password = req.body.password;

    try {
        if (userType === 'admin') {
            // Find admin in database
            db.collection('Admin').findOne({ username: username, password: password }, (err, user) => {
            if (user) {
                return res.json({ message: 'Login successful' });
            } else {
                return res.send('Invalid admin credentials');
            }
        });
        }
         else if (userType === 'faculty') {
            // Find faculty in database
            db.collection('Faculty').findOne({ username: username, password: password }, (err, user) => {
                if (user) {
                    return res.json({ message: 'Login successful' });
                } else {
                    return res.send('Invalid admin credentials');
                }
            });
        } else {
            return res.send('Invalid user type');
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});
app.post("/insertdept", async (req, res) => {
    const programme = req.body.programme;
    const stream = req.body.stream;

    try {
        // Check if the course already exists in the database
        db.collection('Department').findOne({ programme:programme, stream:stream}, (err, dept) => {

        if (dept) {
            // If course exists, send an alert message
            return res.send("Department Aldready Exist");
        } else {
            // If course doesn't exist, insert it into the database

            var newCourse = {
                "programme": programme,
                "stream": stream
            }
            
            db.collection('Department').insertOne(newCourse, (err, collection) => {
                if (err) {
                    throw err;
                }
                console.log("Record Inserted Successfully");
                return res.send("Department Added Successfully");
            });
        }
    });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});
app.post("/removedept", async (req, res) => {
    const programme = req.body.programme;
    const stream = req.body.stream;

    try {
        // Check if the department exists in the database
        db.collection('Department').findOneAndDelete({ programme:programme, stream:stream}, (err, dept) => {
            if (err) {
                throw err;
            }
            if (!dept) {
                // If department doesn't exist, send an alert message
                return res.send("Department not found!");
            }
            console.log("Record Removed Successfully");
            return res.send("Department removed successfully");
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});
app.get("/getProgrammes", async (req, res) => {
    try {
        // Fetch distinct programmes from the Department collection
        db.collection('Department').distinct("programme", (err, programmes) => {
            console.log(programmes);
            if (err) {
                throw err;
            }
            res.json(programmes);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});

app.get("/getStreams", async (req, res) => {
    const programme = req.query.programme; // Get the selected programme from query parameters
    try {
        // Fetch distinct streams based on the selected programme from the Department collection
        db.collection('Department').distinct("stream", { programme: programme }, (err, streams) => {
            console.log(streams);
            if (err) {
                throw err;
            }
            res.json(streams);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});

// Handle POST request to insert course
// Handle POST request to insert course
app.post("/insertcourse", async (req, res) => {
    const { programme, stream, courseName, courseID, year, semester, credits, type } = req.body;

    try {
        // Check if the course already exists for the particular program and stream
        const existingCourse = await db.collection('Department').findOne({
            programme: programme,
            stream: stream,
            "courses.courseName": courseName,
            "courses.courseID": courseID
        });

        if (existingCourse) {
            // If the course already exists, return a message indicating it
            console.log("Course already exists for the given program and stream");
            return res.send("Course already exists for the given program and stream");
        } else {
            // If the course doesn't exist, proceed to add it

            // Find the department in the database based on programme and stream
            db.collection('Department').findOne({ programme: programme, stream: stream }, (err, dept) => {
                if (err) {
                    throw err;
                }

                if (!dept) {
                    // If department doesn't exist, create a new one
                    const newDepartment = {
                        programme: programme,
                        stream: stream,
                        courses: [{ courseName: courseName, courseID: courseID, year: year, semester: semester, credits: credits, type: type }]
                    };
                    db.collection('Department').insertOne(newDepartment, (err, collection) => {
                        if (err) {
                            throw err;
                        }
                        console.log("Record Inserted Successfully");
                        return res.send("Department Added Successfully");
                    });
                } else {
                    // If department exists, insert the course into it
                    db.collection('Department').updateOne(
                        { programme: programme, stream: stream },
                        { $push: { courses: { courseName: courseName, courseID: courseID, year: year, semester: semester, credits: credits, type: type } } },
                        (err, result) => {
                            if (err) {
                                throw err;
                            }
                            console.log("Record Updated Successfully");
                            return res.send("Course Added to Existing Department Successfully");
                        }
                    );
                }
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});




// Handle POST request to remove course
// Handle POST request to remove course
app.post("/removecourse", async (req, res) => {
    const { courseName, courseID } = req.body;

    try {
        // Remove the course from the department
        const result = await db.collection('Department').updateOne(
            { "courses": { $elemMatch: { $or: [{ courseName: courseName }, { courseID: courseID }] } } },
            { $pull: { "courses": { $or: [{ courseName: courseName }, { courseID: courseID }] } } }
        );

        if (result.modifiedCount === 0) {
            // If no document was modified, the course wasn't found
            return res.send("Course not found in any department!");
        }

        console.log("Record Removed Successfully");
        return res.send("Course Removed Successfully");
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


app.get("/getCourses", async (req, res) => {
    // Parse incoming data
    const { programme, stream } = req.query;

    try {
        // Find the department document based on programme and stream
        db.collection('Department').findOne({ programme: programme, stream: stream }, (err, department) => {
            if (err) {
                throw err;
            }
            
            if (!department) {
                return res.status(404).json({ message: 'Department not found' });
            }

            // Extract the courses array from the department document if it exists
            const courses = department.courses ? department.courses.map(course => course.courseName) : [];
            console.log(courses);
            res.json(courses);
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


// Handle POST request to insert faculty
app.post("/insertfaculty", async (req, res) => {
    const { programme, stream, course, facultyName ,group,password } = req.body;

    try {
        // Find the department in the database based on programme and stream
        db.collection('Department').findOne({ programme: programme, stream: stream }, (err, dept) => {
            if (err) {
                throw err;
            }

            if (!dept) {
                // If department doesn't exist, send an alert message
                return res.send("Department not found");
            }

            // Check if the course exists in the department
            const existingCourse = dept.courses.find(c => c.courseName === course);
            if (!existingCourse) {
                // If course doesn't exist, send an alert message
                return res.send("Course not found in the department");
            }

            // Check if faculty already exists for the course
            const facultyExists = existingCourse.facultyName === facultyName;
            if (facultyExists) {
                // If faculty already exists, send an alert message
                return res.send("Faculty already assigned to this course");
            }

            // Insert faculty into the course
            db.collection('Department').updateOne(
                { programme: programme, stream: stream, "courses.courseName": course },
                { $set: { "courses.$.facultyName": facultyName} }, // Updated to set the facultyName for the specific course
                (err, result) => {
                    if (err) {
                        throw err;
                    }
                }
            );
        });
        db.collection('Faculty').findOne({ username: facultyName, password: password }, (err, user) => {
            if (!user) {               
                var newFaculty = {
                    "username":facultyName ,
                    "password": password
                }
                db.collection('Faculty').insertOne(newFaculty, (err, result) => {
                if (err) {
                    throw err;
                }
                return res.send("Faculty Inserted Successfully");
            });
        }
    });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


// Handle POST request to remove faculty
app.post("/removefaculty", async (req, res) => {
    const { programme, stream, course, facultyName ,password} = req.body;

    try {
        // Remove the faculty from the course
        const result = await db.collection('Department').updateOne(
            { programme: programme, stream: stream, "courses.courseName": course },
            { $unset: { "courses.$.facultyName": "" } }
        );

        if (result.modifiedCount === 0) {
            // If no document was modified, the faculty wasn't found
            return res.send("Faculty not found in the course!");
        }

        db.collection('Faculty').findOneAndDelete({ username: facultyName, password: password }, (err, result) => {
            if (err) {
                throw err;
            }
            res.send("Faculty Removed Successfully");
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


// Define a route to fetch course details based on course nam
// Define a route to fetch course ID based on course name, programme, and stream
// Define a route to fetch course ID based on course name, programme, and stream
app.get("/getCourseID", async (req, res) => {
    const { courseName, programme, stream } = req.query;

    try {
        // Find the department document based on programme and stream
        db.collection('Department').findOne({ programme: programme, stream: stream }, (err, department) => {
            if (err) {
                throw err;
            }
            
            if (!department) {
                return res.status(404).json({ message: 'Department not found' });
            }


        // Find the course in the department's courses array based on the course name
        const course = department.courses.find(course => course.courseName === courseName);

        if (!course) {
            return res.status(404).json({ message: 'Course not found in the department' });
        }
        
        // Extract the course ID
        const courseID = course.courseID;
        console.log(courseID);
        res.send(courseID);
                });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});



app.get("/getCoursesByFaculty", async (req, res) => {
    const facultyName = req.query.username;
    try {
        // Find departments where the faculty is assigned to teach
        const departments = await db.collection('Department').find({ "courses.facultyName": facultyName }).toArray();

        // Extract course names and IDs from the fetched departments
        const courseNames = [];
        departments.forEach(department => {
            department.courses.forEach(course => {
                if (course.facultyName === facultyName) {
                    courseNames.push(course.courseName);
                }
            });
        });

        // Send the extracted data as response
        res.json({ courseNames: courseNames });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


// Route to handle updating timetable
app.post('/updateTimetable', (req, res) => {
    const { facultyName, courseName, timetable } = req.body;

    console.log('Received request to update timetable for:', facultyName, courseName);

    // Convert the timetable object to a string
    const timetableString = JSON.stringify(timetable);

    // Find and update the department entry based on facultyName and courseName
    db.collection('Department').findOne({ "courses.facultyName": facultyName, "courses.courseName": courseName }, (err, dept) => {
        if (err) {
            console.error("Error finding department:", err);
            return res.status(500).send("Internal server error");
        }

        if (!dept) {
            // If department doesn't exist, send a 404 error
            console.log('Department not found');
            return res.status(404).send("Department not found");
        }

        // Update the timetable for the specific course
        db.collection('Department').updateOne(
            { "courses.facultyName": facultyName, "courses.courseName": courseName },
            { $set: { 'courses.$.timetable': timetableString } },
            (err, result) => {
                if (err) {
                    console.error("Error updating timetable:", err);
                    return res.status(500).send("Internal server error");
                }
                console.log('Timetable updated successfully');
                return res.status(200).send("Timetable updated successfully");
            }
        );
    });
});



// Route to handle fetching default availability based on faculty name and course name
app.get("/getDefaultAvailability", async (req, res) => {
    const facultyName = req.query.facultyName;
    const courseName = req.query.courseName;
    console.log(facultyName+courseName);
    try {
        // Fetch the default availability from the database based on faculty name and course name
        const department = await db.collection('Department').findOne({ "courses.facultyName": facultyName, "courses.courseName": courseName });

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        // Extract the timetable for the specific course
        const timetableString = department.courses.find(course => course.courseName === courseName).timetable;
        console.log(timetableString);
        // Parse the timetable string to JSON
        const timetable = JSON.parse(timetableString);

        // Send the timetable as response
        res.json({ timetable: timetable });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal server error');
    }
});


server.listen(port, () => {
    console.log(`Listening on PORT ${port}`);
});