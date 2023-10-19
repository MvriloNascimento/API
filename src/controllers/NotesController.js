const { response } = require("express");
const knex = require("../database/knex");
const notesRoutes = require("../routes/notes.routes");

class NotesController {
  async create(request, response) {
    const { title, description, tags, links } = request.body;
    const user_id = request.user.id;

    const note_id = await knex("notes").insert({
      title,
      description,
      user_id,
    });

    const linksInsert = links.map((link) => {
      return {
        note_id,
        url: link,
      };
    });

    await knex("links").insert(linksInsert);

    const tagsInsert = tags.map((name) => {
      return {
        note_id,
        name,
        user_id,
      };
    });

    await knex("tags").insert(tagsInsert);

    return response.json();
  }

  //mostrar notas em tela
  async show(request, response) {
    const user_id = request.user.id;

    const note = await knex("notes").where({ user_id }).first();
    const tags = await knex("tags").where({ note_id: user_id }).orderBy("name");
    const links = await knex("links")
      .where({ note_id: user_id })
      .orderBy("created_at");

    return response.json({
      ...note,
      tags,
      links,
    });
  }

  //Deletar notas
  async delete(request, response) {
    const user_id = request.user.id;

    await knex("notes").where({ user_id }).delete();

    return response.json();
  }

  //Listagem de notas
  async index(request, response) {
    const { title, tags } = request.query;
    const user_id = request.user.id;

    let notes;

    //pesquisar pelas tags
    if (tags) {
      const filterTags = tags.split(",").map((tag) => tag.trim());
      notes = await knex("tags")
        .select(["notes.id", "notes.title", "notes.user_id"])
        .where("notes.user_id", user_id)
        .whereLike("notes.title", `%${title}%`)
        .whereIn("name", filterTags)
        .innerJoin("notes", "notes.id", "tags.note_id")
        .groupBy("notes.id")
        .orderBy("notes.title");
    } else {
      notes = await knex("notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("tags").where({ user_id });
    const notesWithTags = notes.map((note) => {
      const noteTags = userTags.filter((tag) => tag.note_id === note.id);

      return {
        ...note,
        tags: noteTags,
      };
    });

    return response.json(notesWithTags);
  }
}

module.exports = NotesController;