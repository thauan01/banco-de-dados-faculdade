import { Request, response, Response } from "express";
import { AppDataSource } from "../../database";
import { Turma } from "../../entities/Turma";
import { FaculdadeController } from "../FaculdadeController";


// Mock do repositório
const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockQuery = jest.fn();

// Mock do AppDataSource
jest.mock("../../database", () => ({
    AppDataSource: {
        getRepository: jest.fn()
    }
}));

// Mock do middleware de autenticação
jest.mock("../../middlewares/auth.middleware", () => ({
    authMiddleware: jest.fn((req, res, next) => next())
}));

describe("FaculdadeController", () => {
    let FaculdadeController: any;
    let faculdadeController: any;
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;

    beforeAll(() => {
        // Configura o mock do repositório ANTES de importar o controller
        (AppDataSource.getRepository as jest.Mock).mockReturnValue({
            create: mockCreate,
            save: mockSave,
            query: mockQuery
        });

        // Importa o controller DEPOIS de configurar o mock
        FaculdadeController = require("../../controller/FaculdadeController").FaculdadeController;
    });

    beforeEach(() => {
        // Limpa os mocks antes de cada teste
        jest.clearAllMocks();

        // Inicializa o controller
        faculdadeController = new FaculdadeController();

        // Mock do Request
        mockRequest = {
            body: {}
        };

        // Mock do Response
        mockResponse = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe("criarTurma", () => {
        it("deve criar uma turma com sucesso", async () => {
            // Arrange
            const turmaMock = {
                id: 1,
                nome: "Turma A",
                semestre: "2025.1",
                id_disciplina: 1
            };

            mockRequest.body = {
                nome: "Turma A",
                semestre: "2025.1",
                id_disciplina: 1
            };

            mockCreate.mockReturnValue(turmaMock);
            mockSave.mockResolvedValue(turmaMock);

            // Act
            await faculdadeController.criarTurma(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockCreate).toHaveBeenCalledWith({
                nome: "Turma A",
                semestre: "2025.1",
                id_disciplina: 1
            });
            expect(mockSave).toHaveBeenCalledWith(turmaMock);
            expect(mockResponse.json).toHaveBeenCalledWith(turmaMock);
        });

        it("deve criar uma turma com dados diferentes", async () => {
            // Arrange
            const turmaMock = {
                id: 2,
                nome: "Turma B",
                semestre: "2025.2",
                id_disciplina: 2
            };

            mockRequest.body = {
                nome: "Turma B",
                semestre: "2025.2",
                id_disciplina: 2
            };

            mockCreate.mockReturnValue(turmaMock);
            mockSave.mockResolvedValue(turmaMock);

            // Act
            await faculdadeController.criarTurma(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockCreate).toHaveBeenCalledWith({
                nome: "Turma B",
                semestre: "2025.2",
                id_disciplina: 2
            });
            expect(mockResponse.json).toHaveBeenCalledWith(turmaMock);
        });
    });

    describe("consultarTurmas", () => {
        it("deve retornar uma lista de turmas", async () => {
            // Arrange
            const turmasMock = [
                { id: 1, nome: "Turma A", semestre: "2025.1", id_disciplina: 1 },
                { id: 2, nome: "Turma B", semestre: "2025.2", id_disciplina: 2 }
            ];

            mockQuery.mockResolvedValue(turmasMock);

            // Act
            await faculdadeController.consultarTurmas(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM turma");
            expect(mockResponse.json).toHaveBeenCalledWith(turmasMock);
        });

        it("deve retornar uma lista vazia quando não há turmas", async () => {
            // Arrange
            mockQuery.mockResolvedValue([]);

            // Act
            await faculdadeController.consultarTurmas(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM turma");
            expect(mockResponse.json).toHaveBeenCalledWith([]);
        });
    });

    describe("updateturma", () => {
        it("deve atualizar uma turma com sucesso", async () => {
            // Arrange
            const turmaAtualizada = {
                id: 1,
                nome: "Turma A Atualizada",
                semestre: "2025.2",
                id_disciplina: 1
            };

            mockRequest.body = {
                id: 1,
                nome: "Turma A Atualizada",
                semestre: "2025.2",
                id_disciplina: 1
            };

            mockQuery.mockResolvedValue([turmaAtualizada]);

            // Act
            await faculdadeController.updateturma(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                "UPDATE turma SET nome = $1, semestre = $2, id_disciplina = $3 WHERE id = $4 RETURNING *",
                ["Turma A Atualizada", "2025.2", 1, 1]
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                update: true,
                turmaResponse: [turmaAtualizada]
            });
        });

        it("deve atualizar apenas o nome da turma", async () => {
            // Arrange
            const turmaAtualizada = {
                id: 2,
                nome: "Novo Nome",
                semestre: "2025.1",
                id_disciplina: 3
            };

            mockRequest.body = {
                id: 2,
                nome: "Novo Nome",
                semestre: "2025.1",
                id_disciplina: 3
            };

            mockQuery.mockResolvedValue([turmaAtualizada]);

            // Act
            await faculdadeController.updateturma(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockQuery).toHaveBeenCalledWith(
                "UPDATE turma SET nome = $1, semestre = $2, id_disciplina = $3 WHERE id = $4 RETURNING *",
                ["Novo Nome", "2025.1", 3, 2]
            );
            expect(mockResponse.json).toHaveBeenCalledWith({
                update: true,
                turmaResponse: [turmaAtualizada]
            });
        });

        it("deve retornar array vazio quando turma não existe", async () => {
            // Arrange
            mockRequest.body = {
                id: 999,
                nome: "Turma Inexistente",
                semestre: "2025.1",
                id_disciplina: 1
            };

            mockQuery.mockResolvedValue([]);

            // Act
            await faculdadeController.updateturma(
                mockRequest as Request,
                mockResponse as Response
            );

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                update: true,
                turmaResponse: []
            });
        });
    });
});



