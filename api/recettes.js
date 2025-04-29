const db = require("../database");

module.exports = async (req, res) => {
  if (req.method === "GET") {
    try {
      const recettes = await db.getRecettes();
      res.status(200).json(recettes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  else if (req.method === "POST") {
    try {
      const userId = req.body.userId || 1; 
      const recetteId = await db.addRecette(req.body.recette, userId);
      res.status(201).json({ id: recetteId, message: "Recette ajoutée" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  }

  else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
};