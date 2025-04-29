const db = require("../database");

module.exports = async (req, res) => {
  const database = db.initializeDatabase();
  const id = req.query.id;

  if (req.method === "DELETE") {
    try {
      await db.deleteRecette(database, id);
      res.status(200).json({ message: "Recette supprimée" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
};
