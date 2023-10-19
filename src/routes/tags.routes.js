const { Router } = require("express");

//importar do controllers
const TagsController = require("../controllers/TagsController");

//importar middleware
const ensureAuthenticated = require("../middleware/ensureAuthenticated");

const tagsRoutes = Router();

//instanciando na memória
const tagsController = new TagsController();

tagsRoutes.get("/",ensureAuthenticated , tagsController.index);

//exportar rotas para o server.js
module.exports = tagsRoutes;
