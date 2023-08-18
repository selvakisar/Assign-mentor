import express, { Router, json } from "express";
import { request } from "http";
import mongoose from "mongoose";
import { Schema, model, connect } from "mongoose";

import dotenv from "dotenv";
const app = express();

app.use(json());

// model mentor
const mentorSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },

  mentorId: {
    type: String,
    required: true,
    unique: true,
  },
  student: [
    {
      type: Schema.Types.ObjectId,
      ref: "student",
    },
  ],
});
const Mentor = model("Mentor", mentorSchema);

// model student
const studentSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  rollno: {
    type: String,
    required: true,
    unique: true,
  },
  batch: {
    type: String,
    required: true,
  },
  mentor: {
    type: Schema.Types.ObjectId,
    ref: "Mentor",
  },
});
const Student = model("Student", studentSchema);

// Mentor Routes


// mentor Add
app.post("/mentor/add", async (req, res) => {
  try {
    const newMentor = await new Mentor(req.body).save();

    return res.status(200).send(newMentor);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "adding mentor have error" });
  }
});

// student assign for mentor

app.post("/mentorId/assign", async (req, res) => {
  try {
    const { mentorId } = req.params;
    const studentId = req.body._id;
    console.log(studentId);

    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (!mentor) {
      return res.status(402).send({ message: "mentor unavailable" });
    }
    if (!student) {
      return res.status(402).send({ message: "student unavailable" });
    }
    if (!student.mentor) {
      return res.status(420).send({ message: "mentor had this student" });
    }
    mentor.student.push(studentId);
    student.mentor = mentorId;
    await mentor.save();
    await student.save();
    return res.status(200).send({ message: "Student assigned to mentor " });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "Internal server error" });
  }
});

// particular mentor students
app.get("/mentorId/students", async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await Mentor.findById(mentorId).populate("student");

    if (!mentor) {
      return res.status(404).send({ error: "Mentor not found" });
    }

    return res.status(200).send(mentor.student);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "server cant provide data" });
  }
});


// student add

app.post("/student/add", async (req, res) => {
  try {
    const existStudent = await Student.findOne({ rollno: req.body.rollno });
    if (existStudent) {
      return res.status(420).send({ error: "student already exists" });
    }
    const newStudent = await new Student(req.body).save();
    return res.status(220).send(newStudent);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error in adding student" });
  }
});

// all students

app.get("/student/all", async (req, res) => {
  try {
    const students = await Student.find();
    return res.status(200).json(students);
  } catch (error) {
    console.error("error in getting students", error);
    return res.status(500).json({ error: "error in getting students" });
  }
});

// assign new mentor for student
app.put("/:studentId/replace-mentor", async (req, res) => {
  try {
    const { studentId } = req.params;
    const newmentorId = req.body._id;
    const student = await Student.findById(studentId);
    const newMentor = await Mentor.findById(newmentorId);
    if (!student) {
      return res.status(420).send({ error: "cant assign to student" });
    }
    if (!newMentor) {
      return res.status(420).send({ error: "cant assign Mentor" });
    }

    // removing student from old
    if (student.mentor) {
      const exMentor = await Mentor.findById(student.mentor);
      if (exMentor) {
        exMentor.student.pull(studentId);
        await exMentor.save();
      }
    }
    // assign new mentor
    student.mentor = newmentorId;
    newMentor.student.push(studentId);
    await student.save();
    await newMentor.save();
    return res.status(200).send({ message: "Mentor changed" });
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: " server error" });
  }
});

// previous mentor

app.get("/:studentId/exmentor", async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findById(studentId).populate("mentor");
    if (!student) {
      return res.status(404).send({ error: "Student not available" });
    }
    if (!student.mentor) {
      return res.status(200).send({ message: "Student has no ex mentor" });
    }
    return res.status(200).send(student.mentor);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: "error occured" });
  }
});


dotenv.config();

// database

const params = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};
try {
  connect(
    "mongodb+srv://selva:923813114048@cluster0.hsza6fq.mongodb.net/?retryWrites=true&w=majority ",
    params
  );
  console.log("Connected on mongodb");
} catch (error) {
  console.log("Error in connecting", error);
}

const PORT = process.env.PORT;



app.use(json());

// app.use("/mentor");

// app.use("/student");

app.listen(PORT, () => console.log(`serrver running on port ${PORT}`));
