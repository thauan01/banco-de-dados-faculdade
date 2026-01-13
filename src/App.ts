import { Express } from "express";
import { BearerTokenJWT, Description, ExpressInitializer, SwaggerEndpoint, SwaggerInitializer, Title, Version } from "express-swagger-autoconfigure";
import { AuthController } from "./controller/AuthController";
import { FaculdadeController } from "./controller/FaculdadeController";

@SwaggerInitializer
@SwaggerEndpoint("/doc")
@BearerTokenJWT(true)
@Description("API de Faculdade com autenticação")
@Version("1.0.0")
@Title("API Faculdade")
export default class App {
    @ExpressInitializer
    public app!: Express;
    
    constructor() {
        this.initControllers();
    }

    private initControllers() {
        new FaculdadeController();
        new AuthController();
    }

    public getApp(): Express {
        return this.app;
    }
}