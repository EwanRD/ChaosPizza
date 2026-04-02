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

describe('PUT /orders/:id/status — mise à jour du statut', () => {

  // ── Test 2 ──────────────────────────────────────────────────────────────────
  // On crée d'abord une commande, puis on tente de mettre à jour son statut vers PREPARING
  it('devrait mettre à jour le statut vers PREPARING', async () => {
    // Créer une commande d'abord
    const create = await request(app)
      .post('/orders')
      .send({ items: [{ pizzaId: 1, qty: 1 }] });

    const orderId = create.body.id;

    // Mettre à jour son statut
    const response = await request(app)
      .put(`/orders/${orderId}/status`)
      .send({ status: 'PREPARING' });

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(orderId);
    expect(response.body.status).toBe('PREPARING');
  });

  // On teste aussi les cas d'erreur : statut invalide et commande inexistante
  it('devrait retourner 400 pour un statut invalide', async () => {
    const response = await request(app)
      .put('/orders/1/status')
      .send({ status: 'ANNULÉE' }); // valeur non acceptée

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });
});

// ─── Tests de calcul du prix (Vérification bug des 5%) ────────────────────────────
describe('GET /orders — vérification du calcul du prix', () => {
  it('ne doit plus appliquer les 5% de frais supplémentaires sur le total', (done) => {
    const quantite = 2;

    // Récupère le prix de la pizza en base de données
    db.get("SELECT price FROM pizzas WHERE id = 1", async (err, pizza) => {
      const prixReel = pizza.price; 
      const totalAttendu = prixReel * quantite;

      await request(app)
        .post('/orders')
        .send({ items: [{ pizzaId: 1, qty: quantite }] });

      // Récupère la commande pour vérifier le total
      const response = await request(app).get('/orders');
      const derniereCommande = response.body[response.body.length - 1];

      // Assertion prix attendu == prix réel?
      expect(derniereCommande.total).toBe(totalAttendu);
      
      done();
    });
  });
});

  it('devrait retourner 400 si la commande n\'existe pas', async () => {
    const response = await request(app)
      .put('/orders/99999/status')
      .send({ status: 'DELIVERED' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Commande introuvable');
  });
});


