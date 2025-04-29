const db = require("../database");

module.exports = async (req, res) => {
  const database = db.initializeDatabase();
  const id = req.query.id; // Récupération de l'ID en query string

  try {
    const recette = await db.getRecetteById(database, id);
    res.status(200).json(recette);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
