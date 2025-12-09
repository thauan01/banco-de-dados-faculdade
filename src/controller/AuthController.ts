import { Body, Controller, Post, StatusResponse } from "express-swagger-autoconfigure";
import { Request, Response } from "express";
import { AppDataSource } from "../database";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserDto } from "../dto/User.dto";
import { LoginDto } from "../dto/Login.dto";

const repoUser = AppDataSource.getRepository(User);

@Controller("/auth")
export class AuthController {

    @StatusResponse(201, "Usuário registrado com sucesso")
    @StatusResponse(400, "Erro ao registrar usuário")
    @Body(UserDto)
    @Post("/registro")
    async registro(request: Request, response: Response): Promise<Response> {
        const { name, email, senha } = request.body;

        if (!name || !email || !senha) {
            return response.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        if (senha.length < 4) {
            return response.status(400).json({ error: "A senha deve ter pelo menos 4 caracteres" });
        }

        const senhaHash = await bcrypt.hash(senha, 10);


        const user = repoUser.create({
            name,
            email,
            senha: senhaHash
        });

        const userSalvo = await repoUser.save(user);
        return response.status(201).json({
            message: "Usuário registrado com sucesso",
            user: userSalvo
        })
    }

    @StatusResponse(200, "Usuário registrado com sucesso")
    @StatusResponse(400, "Erro ao registrar usuário")
    @Body(LoginDto)
    @Post("/login")
    async login(request: Request, response: Response): Promise<Response> {
        try {
            const { email, senha } = request.body;

            if (!email || !senha) {
                return response.status(400).json({ error: "Email e senha são obrigatórios" });
            }


            const user = await repoUser.findOne({ where: { email } });
            if (!user) return response.status(400).json({ error: "Email ou senha inválidos" });

            const senhaValida = await bcrypt.compare(senha, user.senha)
            if (!senhaValida) return response.status(401).json({ error: "Senha inválidos" });

            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET!,
                { expiresIn: '1d' }
            );

            const { senha: _, ...userResponse } = user;

            return response.status(200).json({
                message: "Login realizado",
                token,
                user: userResponse
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao tentar fazer login";
            return response.status(500).json({ error: errorMessage });
        }
    }

}

    