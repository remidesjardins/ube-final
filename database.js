const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

// Memory limits
const MAX_MEMORY = 1024 * 1024 * 1024; // 1GB
process.memoryLimit = MAX_MEMORY;

// Connection pool configuration
const POOL_SIZE = 2; // Reduced for better resource management
const pool = [];
let currentPoolIndex = 0;
let isInitialized = false;

// Query timeout configuration
const QUERY_TIMEOUT = 3000; // 3 seconds

// Initialize database with connection pool
function initializeDatabase() {
  if (isInitialized) {
    return;
  }

  const dbPath = path.join(__dirname, "ubelicious.db");
  
  try {
    // Create pool of connections
    for (let i = 0; i < POOL_SIZE; i++) {
      const db = new Database(dbPath, {
        verbose: null, // Disable verbose logging in production
        timeout: QUERY_TIMEOUT,
        fileMustExist: true // Ensure database exists
      });
      
      // Configure database for better performance and lower resource usage
      db.pragma('journal_mode = WAL');
      db.pragma('synchronous = NORMAL');
      db.pragma('cache_size = 16000'); // Reduced to 16MB
      db.pragma('temp_store = MEMORY'); // Store temp tables in memory
      db.pragma('mmap_size = 268435456'); // 256MB (reduced from 30GB)
      db.pragma('page_size = 4096'); // Optimal page size
      db.pragma('busy_timeout = 3000'); // 3 seconds timeout for busy connections
      
      pool.push(db);
    }
    
    console.log(`Database pool initialized with ${POOL_SIZE} connections`);
    isInitialized = true;
    
    // Monitor memory usage
    setInterval(monitorResources, 60000); // Check every minute
    
    // Handle process termination
    process.on('SIGINT', () => closeDatabase());
    process.on('SIGTERM', () => closeDatabase());
  } catch (error) {
    console.error('Error initializing database pool:', error);
    throw error;
  }
}

// Resource monitoring
function monitorResources() {
  const used = process.memoryUsage();
  console.log('Memory Usage:');
  for (let key in used) {
    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
  }
  
  console.log(`Active connections: ${pool.length}`);
  console.log(`Current pool index: ${currentPoolIndex}`);
  
  // Check if memory usage is too high
  if (used.heapUsed > MAX_MEMORY * 0.8) { // 80% of max memory
    console.warn('High memory usage detected, optimizing...');
    optimizeMemory();
  }
}

// Memory optimization
function optimizeMemory() {
  pool.forEach(db => {
    try {
      db.prepare('PRAGMA shrink_memory').run();
      db.prepare('PRAGMA optimize').run();
    } catch (err) {
      console.error('Error optimizing memory:', err.message);
    }
  });
}

// Get a connection from the pool using round-robin
function getConnection() {
  if (!isInitialized) {
    initializeDatabase();
  }
  
  if (pool.length === 0) {
    throw new Error('Database pool not initialized');
  }
  
  currentPoolIndex = (currentPoolIndex + 1) % POOL_SIZE;
  return pool[currentPoolIndex];
}

// Helper function to execute queries with timeout and monitoring
async function executeQuery(query, params = []) {
  const db = getConnection();
  const stmt = db.prepare(query);
  
  try {
    // Monitor query execution time
    const start = process.hrtime();
    let result;
    
    // Execute query with timeout using Promise.race
    const queryPromise = new Promise((resolve, reject) => {
      try {
        if (query.trim().toUpperCase().startsWith('SELECT')) {
          result = params.length > 0 ? stmt.all(params) : stmt.all();
        } else {
          result = params.length > 0 ? stmt.run(params) : stmt.run();
        }
        resolve(result);
      } catch (err) {
        reject(err);
      }
    });

    // Create timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Query timeout after ${QUERY_TIMEOUT}ms`));
      }, QUERY_TIMEOUT);
    });

    // Race between query and timeout
    result = await Promise.race([queryPromise, timeoutPromise]);
    
    const end = process.hrtime(start);
    if (end[0] > 1) { // If query takes more than 1 second
      console.warn(`Slow query detected: ${query}`);
    }
    
    return result;
  } catch (error) {
    console.error('Query error:', error);
    throw error;
  }
}

// Properly close all database connections
function closeDatabase() {
  console.log("Closing database connections...");
  pool.forEach(db => {
    try {
      // Finalize all statements and optimize database
      db.prepare('PRAGMA optimize').run();
      db.prepare('PRAGMA shrink_memory').run();
      db.close();
    } catch (err) {
      console.error("Error closing database connection:", err.message);
    }
  });
  pool.length = 0;
  isInitialized = false;
  process.exit(0);
}

// Get existing database instance or create new one
function getDatabase() {
  if (!isInitialized) {
    initializeDatabase();
  }
  return getConnection();
}

// Update all database functions to use the new executeQuery helper
function getRecettes() {
  try {
    return executeQuery("SELECT * FROM recettes").all();
  } catch (error) {
    console.error('Error in getRecettes:', error);
    throw error;
  }
}

function getRecetteById(id) {
  try {
    return executeQuery("SELECT * FROM recettes WHERE id = ?").get(id);
  } catch (error) {
    console.error('Error in getRecetteById:', error);
    throw error;
  }
}

function addRecette(recette, userId) {
  const db = getConnection();
  try {
    const { titre, ingredients, etapes } = recette;
    const stmt = db.prepare(
      "INSERT INTO recettes (titre, ingredients, etapes, utilisateur_id) VALUES (?, ?, ?, ?)"
    );
    const result = stmt.run(titre, ingredients, etapes, userId);
    return result.lastInsertRowid;
  } catch (error) {
    console.error('Error in addRecette:', error);
    throw error;
  }
}

function updateRecette(db, id, titre, ingredients, etapes) {
  const stmt = db.prepare(
    "UPDATE recettes SET titre = ?, ingredients = ?, etapes = ? WHERE id = ?"
  );
  const result = stmt.run(titre, ingredients, etapes, id);
  return result.changes > 0;
}

function deleteRecette(db, id) {
  const stmt = db.prepare("DELETE FROM recettes WHERE id = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

function getRecommandations(db) {
  return db.prepare("SELECT * FROM RECOMMANDATION").all();
}

function getRecommandationsByUtilisateur(db, userId) {
  return db.prepare("SELECT * FROM RECOMMANDATION WHERE id_utilisateur = ?").all(userId);
}

function addRecommandation(db, recommandation) {
  const { titre, contenu, lieu, id_utilisateur } = recommandation;
  const stmt = db.prepare(
    "INSERT INTO RECOMMANDATION (titre, contenu, lieu, id_utilisateur) VALUES (?, ?, ?, ?)"
  );
  const result = stmt.run(titre, contenu, lieu, id_utilisateur);
  return result.lastInsertRowid;
}

function deleteRecommandation(db, id) {
  const stmt = db.prepare("DELETE FROM RECOMMANDATION WHERE id_recommandation = ?");
  const result = stmt.run(id);
  return result.changes > 0;
}

function registerUtilisateur(db, userData) {
  const { nom_user, prenom_user, nomUtilisateur, email, mdp } = userData;
  
  // Hash the password before storing
  bcrypt.hash(mdp, 10, (err, hashedPassword) => {
    if (err) {
      throw err;
    }

    const stmt = db.prepare(
      "INSERT INTO UTILISATEUR (nom_user, prenom_user, nomUtilisateur, email, mdp) VALUES (?, ?, ?, ?, ?)"
    );
    const result = stmt.run(nom_user, prenom_user, nomUtilisateur, email, hashedPassword);
    return result.lastInsertRowid;
  });
}

function loginUtilisateur(db, email, password) {
  const stmt = db.prepare(
    "SELECT id_utilisateur, nom_user, prenom_user, nomUtilisateur, email, mdp, estAdmin FROM UTILISATEUR WHERE email = ?"
  );
  const row = stmt.get(email);
  
  if (!row) {
    throw new Error("Identifiants incorrects");
  }

  try {
    // Compare the provided password with the hashed password
    const passwordMatch = bcrypt.compareSync(password, row.mdp);
    if (!passwordMatch) {
      throw new Error("Identifiants incorrects");
    }

    // Remove the password from the returned user object
    const { mdp, ...userWithoutPassword } = row;
    return userWithoutPassword;
  } catch (error) {
    throw error;
  }
}

function getUtilisateur(db, id) {
  const stmt = db.prepare(
    "SELECT id_utilisateur, nom_user, prenom_user, nomUtilisateur, email, estAdmin FROM UTILISATEUR WHERE id_utilisateur = ?"
  );
  const row = stmt.get(id);
  
  if (!row) {
    throw new Error("Utilisateur non trouvé");
  }
  return row;
}

function updateUtilisateur(db, id, userData) {
  const { nom_user, prenom_user, nomUtilisateur, email } = userData;
  const stmt = db.prepare(
    "UPDATE UTILISATEUR SET nom_user = ?, prenom_user = ?, nomUtilisateur = ?, email = ? WHERE id_utilisateur = ?"
  );
  const result = stmt.run(nom_user, prenom_user, nomUtilisateur, email, id);
  
  if (result.changes === 0) {
    throw new Error('Email ou nom d\'utilisateur déjà utilisé');
  }
}

function updatePassword(db, id, oldPassword, newPassword) {
  const stmt = db.prepare(
    "SELECT mdp FROM UTILISATEUR WHERE id_utilisateur = ?"
  );
  const row = stmt.get(id);
  
  if (!row) {
    throw new Error("Utilisateur non trouvé");
  }

  // Verify old password
  const oldPasswordMatch = bcrypt.compareSync(oldPassword, row.mdp);
  if (!oldPasswordMatch) {
    throw new Error("Ancien mot de passe incorrect");
  }

  // Hash the new password
  bcrypt.hash(newPassword, 10, (err, hashedNewPassword) => {
    if (err) {
      throw err;
    }

    // Update with new hashed password
    const updateStmt = db.prepare(
      "UPDATE UTILISATEUR SET mdp = ? WHERE id_utilisateur = ?"
    );
    const result = updateStmt.run(hashedNewPassword, id);
    
    if (result.changes === 0) {
      throw new Error("Erreur lors de la mise à jour du mot de passe");
    }
  });
}

module.exports = {
  getDatabase,
  closeDatabase,
  getRecettes,
  getRecetteById,
  addRecette,
  updateRecette,
  deleteRecette,
  getRecommandations,
  getRecommandationsByUtilisateur,
  addRecommandation,
  deleteRecommandation,
  registerUtilisateur,
  loginUtilisateur,
  getUtilisateur,
  updateUtilisateur,
  updatePassword,
};
