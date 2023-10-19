const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage");

class UserAvatarController {
  //atualizar avatar
  async update(request, response) {
    const user_id = request.user.id;
    const avatarFilename = request.file.filename;

    //Instanciar o DiskStorage
    const diskStorage = new DiskStorage();

    //Buscar dados do usuário no banco para atualizar
    const user = await knex("users").where({ id: user_id }).first();

    //Se usuário não existir
    if (!user) {
      throw new AppError(
        "Somente usuários autenticados podem mudar o avatar", 401);
    }

    //Se existir um avatar no usuário delete a foto
    if (user.avatar) {
      await diskStorage.deleteFile(user.avatar);
    }

    //Adicionar o novo avatar
    const filename = await diskStorage.saveFile(avatarFilename);
    user.avatar = filename;

    //Atualizar o novo avatar
    await knex("users").update(user).where({ id: user_id });

    return response.json(user);
  }
}
module.exports = UserAvatarController;
