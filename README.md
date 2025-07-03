# DevMate - Developer Community Platform

A full-stack MERN application that connects developers, allows them to share code snippets, and build a community around coding and collaboration.

## 🚀 Features

### Core Features

- **User Authentication**: Secure JWT-based authentication with login and registration
- **User Profiles**: Customizable profiles with bio, skills, GitHub links, and avatar
- **Posts & Feed**: Create posts with text content and optional code snippets
- **Social Interactions**: Like/unlike posts and add comments
- **Explore & Search**: Discover users by name or skills
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Technical Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Server-side validation with express-validator
- **Error Handling**: Comprehensive error handling on both client and server
- **Loading States**: User-friendly loading indicators throughout the app
- **Responsive UI**: Mobile-optimized interface with Tailwind CSS

## 🧱 Tech Stack

### Frontend

- **React 18**: Modern React with functional components and hooks
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

### Backend

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd DevMate
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the server directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/devmate
JWT_SECRET=your_jwt_secret_here_change_in_production
NODE_ENV=development
```

### 3. Frontend Setup

```bash
cd ../client
npm install
```

### 4. Database Setup

Make sure MongoDB is running on your system. The application will automatically create the database and collections.

### 5. Running the Application

#### Start the Backend Server

```bash
cd server
npm run dev
```

The server will run on `http://localhost:5000`

#### Start the Frontend Development Server

```bash
cd client
npm start
```

The client will run on `http://localhost:3000`

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Users

- `GET /api/users` - Get all users (with search/filter)
- `GET /api/users/:username` - Get user profile and posts
- `PUT /api/users/:id` - Update user profile (protected)

### Posts

- `POST /api/posts` - Create a new post (protected)
- `GET /api/posts` - Get all posts (paginated)
- `GET /api/posts/:id` - Get single post
- `PUT /api/posts/:id/like` - Like/unlike a post (protected)
- `POST /api/posts/:id/comment` - Add comment to post (protected)
- `DELETE /api/posts/:id` - Delete post (protected, author only)

## 🎨 User Interface

### Pages

- **Home**: Landing page with features and call-to-action
- **Login/Register**: Authentication forms
- **Feed**: Main timeline showing all posts
- **Profile**: User profile with posts and stats
- **Edit Profile**: Form to update user information
- **Create Post**: Form to create new posts
- **Post Detail**: Individual post view with all comments
- **Explore**: Browse and search for users

### Components

- **Navbar**: Navigation with user menu
- **PostCard**: Reusable post component with interactions
- **LoadingSpinner**: Loading indicator
- **Protected Routes**: Authentication guards

## 🔒 Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **XSS Protection**: Content sanitization
- **CORS Configuration**: Proper cross-origin resource sharing setup

## 🎯 Usage

1. **Registration**: Create an account with username, email, and password
2. **Profile Setup**: Add your bio, skills, and GitHub link
3. **Create Posts**: Share your thoughts, code snippets, or questions
4. **Interact**: Like and comment on other users' posts
5. **Explore**: Discover other developers and their work
6. **Connect**: Build your network within the developer community

## 🚀 Deployment

### Production Environment Variables

```env
NODE_ENV=production
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secure_jwt_secret_at_least_32_characters
```

### Build for Production

```bash
cd client
npm run build
```

### Deployment Options

- **Frontend**: Netlify, Vercel, or any static hosting service
- **Backend**: Heroku, DigitalOcean, AWS, or any Node.js hosting service
- **Database**: MongoDB Atlas (recommended for production)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Tailwind CSS for the utility-first CSS framework
- All the open-source contributors who made this project possible

## 📞 Support

If you have any questions or need help with setup, please create an issue in the repository or contact the maintainers.

---

**Happy Coding! 🎉**
