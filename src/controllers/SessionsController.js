//Validação de dados do usuário
const knex = require("../database/knex");
const AppError = require("../utils/AppError");

//Importar configurações do token
const authConfig = require("../configs/auth");
const { sign } = require("jsonwebtoken");

//Validando senha criptografada
const { compare } = require("bcryptjs");

class SessionsController {
  async create(request, response) {
    //Buscar informações passadas pelo usurário
    const { email, password } = request.body;

    //Buscar usuário no banco de dados
    const user = await knex("users").where({ email }).first();

    //Se usuário não existir no banco de dados informe mensagem de erro
    if (!user) {
      throw new AppError("E-mail e/ou senha incorreta", 401);
    }

    //Comparar senha enviada com a senha do banco
    const passwordMatched = await compare(password, user.password);

    //Se a senha for diferente da senha cadastrada no banco de dados informe mensagem de erro
    if (!passwordMatched) {
      throw new AppError("E-mail e/ou senha incorreta", 401);
    }

    //Desestruturar a configuração do token
    const { secret, expiresIn } = authConfig.jwt;

    //Criar token
    const token = sign({}, secret, {
      subject: String(user.id),
      expiresIn,
    });

    return response.json({ user, token });
  }
}

module.exports = SessionsController;
