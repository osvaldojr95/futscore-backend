import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Session, User } from "@prisma/client";
import { CreateUserData } from "../interfaces/userInterface.js";
import userRepository from "../repository/userRepository.js";
import "../config/config.js";
import sessionRepository from "../repository/sessionRepository.js";

async function insert(email: string, username: string, password: string) {
    const passwordHash: string = bcrypt.hashSync(password, +process.env.SALT);
    const user: CreateUserData = {
        email,
        username,
        password: passwordHash,
    };
    return await userRepository.insert(user);
}

async function findByEmail(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) throw { type: "notFound" };
    return user;
}

async function findBySession(sessionId: string) {
    const session = await sessionRepository.findBySession(sessionId);
    if (!session) throw { type: "unauthorized" };
    const user = await userRepository.findById(session.userId);
    if (!user) throw { type: "notFound" };
    return user;
}

async function userExist(email: string, username: string) {
    let user = await userRepository.findByEmail(email);
    if (user) throw { type: "conflict", message: "email exist" };
    user = await userRepository.findByUsername(username);
    if (user) throw { type: "conflict", message: "username exist" };
}

async function verifyPassword(user: User, password: string) {
    if (!bcrypt.compareSync(password, user.password))
        throw { type: "unauthorized" };
}

async function generateToken(session: string) {
    return jwt.sign({ session }, process.env.SECRET_KEY);
}

export default {
    insert,
    findByEmail,
    findBySession,
    userExist,
    verifyPassword,
    generateToken,
};
