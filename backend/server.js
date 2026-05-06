require('dotenv').config(); // Restart trigger 2
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const petRoutes = require('./routes/petRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const userRoutes = require('./routes/userRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const wellnessRoutes = require('./routes/wellnessRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: true,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Rate Limiter
const apiLimiter = require('./middlewares/rateLimiter');
app.use('/api', apiLimiter);

// Serve uploaded images as static files
app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));


// Socket.io context
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/wellness', wellnessRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
    res.send('Pet Care API is running...');
});

// Socket logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);
    
    socket.on('join', (userId) => {
        if (userId) {
            // Leave previous rooms
            const rooms = Array.from(socket.rooms);
            rooms.forEach(room => {
                if (room !== socket.id) socket.leave(room);
            });
            socket.join(userId.toString());
            console.log(`User ${userId} joined room: ${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});
