const db = require("../database");

module.exports = async (req, res) => {
  const database = db.initializeDatabase();
  const id = req.query.id;

  if (req.method === "PUT") {
    try {
      const { titre, ingredients, etapes } = req.body;
      await db.updateRecette(database, id, titre, ingredients, etapes);
      res.status(200).json({ message: "Recette mise à jour" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
};
