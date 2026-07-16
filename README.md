# SACRABKD - Backend Service

This is the Node.js / Express backend service for the Students Anesthetic Collaborative Research Association (SACRA). It connects to a PostgreSQL database via Sequelize ORM and supports Cloudinary for media uploads.

## Tech Stack
- **Node.js** & **Express**
- **PostgreSQL** & **Sequelize ORM**
- **JSON Web Tokens (JWT)** for authentication
- **Multer** for file parsing
- **Cloudinary** for image/media hosting

## Getting Started

1. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DATABASE_URL=postgres://<username>:<password>@localhost:5432/sacra
   JWT_SECRET=<your-secret>
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database**:
   ```bash
   npm run seed
   ```

4. **Run Server**:
   ```bash
   npm run dev
   ```
