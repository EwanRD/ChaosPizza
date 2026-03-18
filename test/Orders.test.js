const request = require("supertest");
const app = require("../app");
const db = require("../database");

// ─── Nettoyage avant/après chaque test ────────────────────────────────────────
// On vide la table orders
beforeEach((done) => {
  db.run("DELETE FROM orders", done);
});

// Ferme la connexion SQLite
afterAll((done) => {
  db.close(done);
});

// ─── Tests de la route POST /orders ───────────────────────────────────────────
describe("POST /orders — création de commande", () => {
  // ── Test 1 ──────────────────────────────────────────────────────────────────
  // On envoie une commande valide avec une pizza existante (id=1)
  // et on vérifie que l'API répond avec les bons champs
  it("devrait créer une commande simple et retourner id + total + status", async () => {
    // ARRANGE — préparer les données d'entrée
    const nouvelleCommande = {
      items: [
        { pizzaId: 1, qty: 2 }, // 2x Margherita à 10€ = 20€
      ],
    };

    // ACT — envoyer la requête HTTP via Supertest
    const response = await request(app).post("/orders").send(nouvelleCommande);

    // ASSERT — vérifier la réponse
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id");
    expect(response.body).toHaveProperty("total");
    expect(response.body).toHaveProperty("status");
    expect(response.body.status).toBe("CREATED");
    expect(typeof response.body.id).toBe("number");
    expect(response.body.total).toBeGreaterThan(0);
  });

  it("devrait appliquer le code promo FREEPIZZA et retourner total 0", async () => {
    const commandeGratuite = {
      items: [{ pizzaId: 1, qty: 1 }],
      promoCode: "FREEPIZZA",
    };

    const response = await request(app).post("/orders").send(commandeGratuite);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("total");
    expect(response.body.total).toBe(0);
    expect(response.body.status).toBe("CREATED");
  });
});
