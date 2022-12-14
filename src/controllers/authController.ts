import { Request, Response } from "express";
import sessionService from "../services/sessionService.js";
import userService from "../services/userService.js";

export async function signUp(req: Request, res: Response) {
    const { email, username, password } = res.locals.body;
    await userService.userExist(email, username);
    await userService.insert(email, username, password);
    res.sendStatus(201);
}

export async function signIn(req: Request, res: Response) {
    const { email, password } = res.locals.body;
    const user = await userService.findByEmail(email);
    await userService.verifyPassword(user, password);
    const session = await sessionService.newSession(user);
    const token = await userService.generateToken(session);
    res.send({
        token,
        username: user.username,
    });
}
