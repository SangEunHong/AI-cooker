import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/connection.js';

import authRouters from './routers/authRouters.js';
import fridgeRouters from './routers/fridgeRouters.js';
import chatRouters from "./routers/chatRouters.js"; 
import recipeRouters from "./routers/recipeRouters.js";
//import bookmarkRouters from './routers/bookmarksRouters.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());          
app.use(express.json());  

app.use('/auth', authRouters);
app.use('/ingredients', fridgeRouters);
//app.use('/bookmarks', bookmarkRouters);
app.use('/chat', chatRouters);
app.use('/recipes', recipeRouters);

app.listen(PORT, async () => {
  try {
        await initDb(); // 서버 켜질 때 테이블 없으면 자동 생성 (db.js 함수)
        console.log(`Server is running on port ${PORT}`);
        console.log(`API Ready: http://localhost:${PORT}/auth/signup`);
      } catch (error) {
        console.error("Server start failed:", error);
      }
});