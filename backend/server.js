require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const seedAdmin = require('./utils/seedAdmin');
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
const postRoutes = require('./routes/postRoutes');
const aiRoutes = require('./routes/aiRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    },
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// Connect to Database & Seed Admin
connectDB().then(() => {
    seedAdmin();
});

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
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
app.use('/api/posts', postRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
    res.send('Payven API is running...');
});

// Socket logic
const onlineUsers = new Map(); // Track online users (userId -> socketId)

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
            onlineUsers.set(userId.toString(), socket.id);
            socket.userId = userId.toString();
            console.log(`User ${userId} joined room: ${userId}`);
            
            // Broadcast to everyone that this user is online
            io.emit('user-status-change', { userId: userId.toString(), status: 'online' });
        }
    });

    socket.on('check-status', (userIds, callback) => {
        if (!Array.isArray(userIds)) return;
        const statuses = {};
        userIds.forEach(id => {
            statuses[id] = onlineUsers.has(id.toString()) ? 'online' : 'offline';
        });
        if (typeof callback === 'function') callback(statuses);
    });

    // Chat Logic
    socket.on('sendMessage', async (data) => {
        try {
            const Message = require('./models/Message');
            const Consultation = require('./models/Consultation');
            const message = await Message.create({
                consultation: data.consultationId,
                sender: data.senderId,
                text: data.text
            });
            await Consultation.findByIdAndUpdate(data.consultationId, { lastMessageAt: Date.now() });
            const populatedMessage = await Message.findById(message._id).populate('sender', 'name image');
            
            io.to(data.receiverId).emit('receiveMessage', populatedMessage);
            io.to(data.senderId).emit('receiveMessage', populatedMessage);
        } catch (error) {
            console.error('Socket sendMessage error:', error);
        }
    });

    // WebRTC Signaling
    socket.on('call-user', (data) => {
        io.to(data.userToCall).emit('call-made', {
            offer: data.offer,
            callerId: data.callerId,
            callerName: data.callerName
        });
    });

    socket.on('make-answer', (data) => {
        io.to(data.to).emit('answer-made', {
            answer: data.answer
        });
    });

    socket.on('ice-candidate', (data) => {
        io.to(data.to).emit('ice-candidate-received', {
            candidate: data.candidate
        });
    });
    
    // Reconnection Signaling
    socket.on('reconnect-call-offer', (data) => {
        io.to(data.to).emit('reconnect-call-offer', {
            offer: data.offer,
            from: data.from
        });
    });

    socket.on('reconnect-call-answer', (data) => {
        io.to(data.to).emit('reconnect-call-answer', {
            answer: data.answer
        });
    });

    socket.on('request-reconnect', (data) => {
        io.to(data.to).emit('request-reconnect', {
            from: data.from
        });
    });

    socket.on('end-call', (data) => {
        io.to(data.to).emit('call-ended');
    });

    socket.on('disconnect', () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit('user-status-change', { userId: socket.userId, status: 'offline' });
        }
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
