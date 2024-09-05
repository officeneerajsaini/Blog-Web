import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import {dirname} from "path"
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT;
const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("view engine", "ejs");


mongoose.connect(process.env.MONGODB_URL);


const userSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    para: {
        type: String,
        required: true
    }
});

const User = mongoose.model('user', userSchema);

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", async (req, res) => {
    try {
        const foundDetails = await User.find();
        res.render("home.ejs", { data: foundDetails });
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/post", (req, res) => {
    res.render("post.ejs");
});

app.post("/post", async (req, res) => {
    try {
        const newUser = new User({
            title: req.body.title,
            para: req.body.para
        });
        newUser.save();
        res.redirect("/");
    }
    catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/delete/:id', async (req, res) => {
    const postId = req.params.id;

    try {
        const deletedPost = await User.deleteOne({ _id: postId });
        if (deletedPost) {
            console.log(`Deleted post with ID ${postId}`);
        } else {
            console.log(`Post with ID ${postId} not found`);
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get("/update/:id", async (req, res) => {
    const postId = req.params.id;
    try {
        const foundDetails = await User.findById(postId);
        if (!foundDetails) {
            console.log(`Post with ID ${postId} not found`);
            return res.status(404).send("Post not found");
        }

        res.render("update.ejs", { post: foundDetails });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/update/:id', async (req, res) => {
    const postId = req.params.id;
    const objectId = new mongoose.Types.ObjectId(postId);
    console.log(objectId);
    const title = req.body.title;
    const para = req.body.para;

    try {
        const updatePost = await User.updateOne({ _id: objectId }, { $set: { title: title, para: para } });

        if (updatePost) {
            console.log(`Updated post with ID ${postId}`);
        } else {
            console.log(`Post with ID ${postId} not found`);
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
