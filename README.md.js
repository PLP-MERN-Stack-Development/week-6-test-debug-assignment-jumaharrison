[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=19929756&assignment_repo_type=AssignmentRepo)
# Testing and Debugging MERN Applications

This assignment focuses on implementing comprehensive testing strategies for a MERN stack application, including unit testing, integration testing, and end-to-end testing, along with debugging techniques.

## Assignment Overview

You will:
1. Set up testing environments for both client and server
2. Write unit tests for React components and server functions
3. Implement integration tests for API endpoints
4. Create end-to-end tests for critical user flows
5. Apply debugging techniques for common MERN stack issues

## Project Structure

```
mern-testing/
├── client/                 # React front-end
│   ├── src/                # React source code
│   │   ├── components/     # React components
│   │   ├── tests/          # Client-side tests
│   │   │   ├── unit/       # Unit tests
│   │   │   └── integration/ # Integration tests
│   │   └── App.jsx         # Main application component
│   └── cypress/            # End-to-end tests
├── server/                 # Express.js back-end
│   ├── src/                # Server source code
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── routes/         # API routes
│   │   └── middleware/     # Custom middleware
│   └── tests/              # Server-side tests
│       ├── unit/           # Unit tests
│       └── integration/    # Integration tests
├── jest.config.js          # Jest configuration
└── package.json            # Project dependencies
```

## Getting Started

1. Accept the GitHub Classroom assignment invitation
2. Clone your personal repository that was created by GitHub Classroom
3. Follow the setup instructions in the `Week6-Assignment.md` file
4. Explore the starter code and existing tests
5. Complete the tasks outlined in the assignment

## Files Included

- `Week6-Assignment.md`: Detailed assignment instructions
- Starter code for a MERN application with basic test setup:
  - Sample React components with test files
  - Express routes with test files
  - Jest and testing library configurations
  - Example tests for reference

## Requirements

- Node.js (v18 or higher)
- MongoDB (local installation or Atlas account)
- npm or yarn
- Basic understanding of testing concepts

## Testing Tools

- Jest: JavaScript testing framework
- React Testing Library: Testing utilities for React
- Supertest: HTTP assertions for API testing
- Cypress/Playwright: End-to-end testing framework
- MongoDB Memory Server: In-memory MongoDB for testing

## Submission

Your work will be automatically submitted when you push to your GitHub Classroom repository. Make sure to:

1. Complete all required tests (unit, integration, and end-to-end)
2. Achieve at least 70% code coverage for unit tests
3. Document your testing strategy in the README.md
4. Include screenshots of your test coverage reports
5. Demonstrate debugging techniques in your code

// bug-tracker.js

// ====== Imports ======
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const { readFileSync } = require("fs");
const { createServer } = require("http");

// ====== Express App Setup ======
const app = express();
app.use(cors());
app.use(express.json());

// ====== MongoDB Model ======
const bugSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: {
    type: String,
    enum: ["open", "in-progress", "resolved"],
    default: "open"
  }
}, { timestamps: true });

const Bug = mongoose.model("Bug", bugSchema);

// ====== API Routes ======

// Create Bug
app.post("/api/bugs", async (req, res, next) => {
  try {
    const bug = new Bug(req.body);
    const saved = await bug.save();
    res.status(201).json(saved);
  } catch (err) {
    next(err);
  }
});

// Get All Bugs
app.get("/api/bugs", async (req, res, next) => {
  try {
    const bugs = await Bug.find();
    res.json(bugs);
  } catch (err) {
    next(err);
  }
});

// Update Bug
app.put("/api/bugs/:id", async (req, res, next) => {
  try {
    const bug = await Bug.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bug);
  } catch (err) {
    next(err);
  }
});

// Delete Bug
app.delete("/api/bugs/:id", async (req, res, next) => {
  try {
    await Bug.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// ====== React Frontend ======
const frontendHTML = `
<!DOCTYPE html>
<html>
  <head>
    <title>Bug Tracker</title>
    <style>
      body { font-family: sans-serif; padding: 20px; }
      input, select, textarea { display: block; margin: 5px 0; width: 300px; }
    </style>
  </head>
  <body>
    <h1>Bug Tracker</h1>
    <form id="bugForm">
      <input type="text" id="title" placeholder="Bug Title" required />
      <textarea id="description" placeholder="Description"></textarea>
      <button type="submit">Report Bug</button>
    </form>
    <ul id="bugList"></ul>
    <script>
      const api = "http://localhost:5000/api/bugs";
      const form = document.getElementById("bugForm");
      const list = document.getElementById("bugList");

      async function fetchBugs() {
        const res = await fetch(api);
        const bugs = await res.json();
        list.innerHTML = "";
        bugs.forEach(bug => {
          const li = document.createElement("li");
          li.textContent = bug.title + " (" + bug.status + ")";
          li.onclick = () => updateStatus(bug._id);
          const del = document.createElement("button");
          del.textContent = "X";
          del.onclick = (e) => { e.stopPropagation(); deleteBug(bug._id); };
          li.appendChild(del);
          list.appendChild(li);
        });
      }

      async function updateStatus(id) {
        await fetch(\`\${api}/\${id}\`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "resolved" })
        });
        fetchBugs();
      }

      async function deleteBug(id) {
        await fetch(\`\${api}/\${id}\`, { method: "DELETE" });
        fetchBugs();
      }

      form.onsubmit = async (e) => {
        e.preventDefault();
        const bug = {
          title: document.getElementById("title").value,
          description: document.getElementById("description").value
        };
        await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bug)
        });
        form.reset();
        fetchBugs();
      };

      fetchBugs();
    </script>
  </body>
</html>
`;

// Serve React UI
app.get("/", (req, res) => {
  res.send(frontendHTML);
});

// ====== Error Handling ======
app.use((err, req, res, next) => {
  console.error("ERROR:", err.message);
  res.status(500).json({ error: err.message });
});

// ====== Start Server ======
mongoose.connect("mongodb://localhost:27017/bugtracker")
  .then(() => {
    app.listen(5000, () => console.log("Bug Tracker running at http://localhost:5000"));
  })
  .catch(console.error);

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Cypress Documentation](https://docs.cypress.io/)
- [MongoDB Testing Best Practices](https://www.mongodb.com/blog/post/mongodb-testing-best-practices) 
