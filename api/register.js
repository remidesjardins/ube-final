const db = require("../database");

module.exports = async (req, res) => {
  const database = db.getDatabase();

  if (req.method === "POST") {
    try {
      const { nom_user, prenom_user, nomUtilisateur, email, mdp } = req.body;
      
      if (!nom_user || !prenom_user || !nomUtilisateur || !email || !mdp) {
        return res.status(400).json({ error: "Tous les champs sont requis" });
      }

      const userId = await db.registerUtilisateur(database, {
        nom_user,
        prenom_user,
        nomUtilisateur,
        email,
        mdp
      });

      res.status(201).json({
        id: userId,
        message: "Utilisateur créé avec succès"
      });
    } catch (error) {
      console.error(error);
      if (error.message.includes('déjà utilisé')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
};
