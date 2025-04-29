const db = require("../database");

module.exports = async (req, res) => {
  const database = db.getDatabase();

  if (req.method === "POST") {
    try {
      const { email, mdp } = req.body;
      
      if (!email || !mdp) {
        return res.status(400).json({ error: "Email et mot de passe requis" });
      }

      const user = await db.loginUtilisateur(database, email, mdp);
      res.status(200).json({
        id_utilisateur: user.id_utilisateur,
        nom_user: user.nom_user,
        prenom_user: user.prenom_user,
        nomUtilisateur: user.nomUtilisateur,
        email: user.email,
        estAdmin: user.estAdmin
      });
    } catch (error) {
      console.error(error);
      if (error.message === "Identifiants incorrects") {
        res.status(401).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Erreur serveur" });
      }
    }
  } else {
    res.status(405).json({ message: "Méthode non autorisée" });
  }
};
