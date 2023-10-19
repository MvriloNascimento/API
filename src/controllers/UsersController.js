//Importar para criptografia
const { hash, compare } = require("bcryptjs");

//importando error
const AppError = require("../utils/AppError");

//importar conexão com o banco
const sqliteConnection = require("../database/sqlite");

class UsersController {
  /*um controller pode ter no máximo 5 funções
  
  index = GET para listar todos os usuários registrados
  show = GET exibir um registro especifico
  create = POST criar um registro
  update = PUT atualizar um registro
  delete - DELETE para remover um registro
  */

  //Criação

  async create(request, response) {
    const { name, email, password } = request.body;
  
    const database = await sqliteConnection();
    const checkUserExists = await database.get(
      "SELECT * FROM users WHERE email = (?)",
      [email]
    );

    //se o email já existir disparar erro
    if (checkUserExists) {
      throw new AppError("Este  e-mail já está em uso!");
    }

    //Criptografia password
    const hashedPassword = await hash(password, 8);

    //Inserir dados
    await database.run(
      "INSERT INTO users (name,email,password) VALUES (?,?,?)",
      [name, email, hashedPassword]
    );

    return response.status(201).json();
  }

  async update(request, response) {
    const { name, email, password, old_password } = request.body;

    const user_id= request.user.id;
    const database = await sqliteConnection();
    const user = await database.get("SELECT * FROM users WHERE id = (?)", [user_id]);

    //se usuário não existir
    if (!user) {
      throw new AppError("Usuário não encontrado");
    }

    //se email ja estiver cadastrado
    const userWithUpdatedEmail = await database.get(
      "SELECT * FROM users WHERE email =(?)",
      [email]
    );

    if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
      throw new AppError("Este e-mail já está em uso!");
    }

    // se existir conteúdo atualizado insira senão insira o conteúdo anterior
    user.name = name ?? user.name;
    user.email = email ?? user.email;

    //verificações na alterações de senha
    if (password && !old_password) {
      throw new AppError(
        "Você precisa informar a senha antiga para definir a nova senha!"
      );
    }

    if (password && old_password) {
      const checkOldPassword = await compare(old_password, user.password);

      if (!checkOldPassword) {
        throw new AppError("A senha antiga não confere");
      }

      user.password = await hash(password, 8);
    }
    await database.run(
      `UPDATE users SET name = ?, email = ?,password =?, updated_at = DATETIME('now') WHERE id =?`,
      [user.name, user.email, user.password, user_id]
    );

    return response.json();
  }
}

module.exports = UsersController;
