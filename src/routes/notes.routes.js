const { Router } = require("express");

//importar do controllers
const NotesController = require("../controllers/NotesController");

//importar middleware
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const notesRoutes = Router();

//instanciando na memória
const notesController = new NotesController();

//usar o mesmo middleware para varias rotas
notesRoutes.use(ensureAuthenticated);

notesRoutes.get("/", notesController.index);
notesRoutes.post("/", notesController.create);
notesRoutes.get("/:id", notesController.show);
notesRoutes.delete("/:id", notesController.delete);

//exportar rotas para o server.js
module.exports = notesRoutes;
