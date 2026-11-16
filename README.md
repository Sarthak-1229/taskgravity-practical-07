# Practical 07: Full-Stack Node.js & MongoDB (NoSQL) Application

## TaskGravity — Full-Stack MERN Architecture, Mongoose ODM, NoSQL Persistence, and Cloud Deployment

### 1. Overview
Practical 07 culminates the TaskGravity project into an enterprise-grade full-stack web application integrating Node.js, Express, and MongoDB (via Mongoose ODM).

### 2. Full-Stack Architecture
- **Mongoose ODM Model (`models/Task.js`)**:
  - Typed fields: `title`, `category`, `priority`, `dueDate`, `estimatedHours`, `description`, `status`.
  - Schema validators, required constraints, and enum whitelists.
  - Compound indexes on `{ status: 1, category: 1, priority: 1 }` for high-velocity query execution.
  - Automatic `createdAt` and `updatedAt` timestamps.
- **Database Connection Manager (`config/db.js`)**:
  - Connects to local MongoDB Compass or cloud MongoDB Atlas via `MONGO_URI`.
  - Fallback in-memory cache to guarantee zero-crash execution even prior to cluster provisioning.
- **RESTful CRUD Operations (`routes/taskRoutes.js`)**:
  - `GET /api/tasks`: MongoDB collection queries with regex search and sorting.
  - `GET /api/tasks/stats`: Aggregation pipeline calculating completion velocity.
  - `GET /api/tasks/:id`: Document retrieval with Mongoose ObjectId validation.
  - `POST /api/tasks`: Document insertion enforcing schema constraints.
  - `PUT /api/tasks/:id` & `PATCH /api/tasks/:id/status`: Mutation endpoints.
  - `DELETE /api/tasks/:id`: Permanent document removal.
- **Frontend Client (`public/`)**:
  - Minimalist TaskGravity dashboard featuring live database connectivity indicator, asynchronous task mutations, and filter streams.
- **Testing & Deployment**:
  - Automated Postman collection `TaskGravity_Practical_07.postman_collection.json`.
  - Render cloud configuration blueprint `render.yaml`.

### 3. Setup & Execution

#### Step 1: Install Dependencies
```bash
cd Practical7
npm install
```

#### Step 2: Configure Environment
Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/TaskGravityDB
# Or your MongoDB Atlas connection string:
# MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/TaskGravityDB?retryWrites=true&w=majority
```

#### Step 3: Start Server
```bash
npm start
```
Access the application on `http://localhost:5000`.
