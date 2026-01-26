import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db/connection.js';

export const signup = async (req, res) => {
    try {
        const { email, password, nickname, age, gender } = req.body;

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: "이미 존재하는 이메일입니다." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO users (email, password_hash, nickname, age, gender) 
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [email, hashedPassword, nickname, age, gender]
        );

        res.status(201).json({
            message: "회원가입 성공", 
            userId: newUser.rows[0].id 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러 발생" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ message: "이메일 혹은 비밀번호가 틀렸습니다." });
        }

        const user = userResult.rows[0];

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "이메일 혹은 비밀번호가 틀렸습니다." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1h' }
        );

        res.json({ 
            token, 
            nickname: user.nickname 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러" });
    }
};

export const findMyInfo = async (req, res) => {
    try {
        const userId = req.user.id; 

        const result = await pool.query(
            'SELECT id, email, nickname, age, gender FROM users WHERE id = $1', 
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "존재하지 않는 사용자입니다." });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "서버 에러" });
    }
};