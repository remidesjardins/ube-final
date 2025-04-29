const db = require("../database");

module.exports = async (req, res) => {
  const database = db.initializeDatabase();
  const id = req.query.id;

  try {
    const recommandations = await db.getRecommandationsByUtilisateur(database, id);
    res.status(200).json(recommandations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
