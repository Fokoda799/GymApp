import express from 'express';
import db from '../../config/db.js';

const router = express.Router();

router.get('/:clientId', async (req, res) => {
  const { clientId } = req.params;

  try {
    // INFOS
    const [clients] = await db.query(
      `SELECT 
         c.id, c.name, c.birth, c.gender, c.weight, c.height,
         c.frequency, c.goal, c.weightGoal, c.createdAt,
         co.id   AS coachId,
         co.name AS coachName,
         co.specialty AS coachSpecialty,
         co.bio  AS coachBio,
         co.email AS coachEmail
       FROM Clients c
       LEFT JOIN Coaches co ON c.coachID = co.id
       WHERE c.id = ?`,
      [clientId]
    );

    if (!clients || clients.length === 0) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }

    const client = clients[0];

    // AGE
    let age = null;
    if (client.birth) {
      const birthDate = new Date(client.birth);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    }

    // EXERCICES
    const [workouts] = await db.query(
      `SELECT w.weekDay, e.name AS exercise, e.muscle, bp.name AS bodyPart
       FROM Workouts w
       JOIN Exercises e ON w.exerciseID = e.id
       LEFT JOIN BodyParts bp ON e.bodyPartID = bp.id
       WHERE w.clientID = ?
       ORDER BY FIELD(w.weekDay,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')`,
      [clientId]
    );

    // HISTORY WEIGHT
    const [weightHistory] = await db.query(
      `SELECT weight, logDate FROM WeightHistory
       WHERE clientID = ? ORDER BY logDate DESC LIMIT 10`,
      [clientId]
    );

    // ACTIVITES RECENT
    const [activities] = await db.query(
      `SELECT a.name, a.calories, d.logDate
       FROM Activities a
       JOIN Days d ON a.dayID = d.id
       WHERE d.clientID = ?
       ORDER BY d.logDate DESC LIMIT 10`,
      [clientId]
    );

    // FOODS RECENT
    const [nutritionIngredients] = await db.query(
      `SELECT i.name, i.calories, id.mealtime, id.quantity, d.logDate
       FROM IngredientsDay id
       JOIN Ingredients i ON id.ingredientID = i.id
       JOIN Days d ON id.dayID = d.id
       WHERE d.clientID = ?
       ORDER BY d.logDate DESC LIMIT 20`,
      [clientId]
    );

    const [nutritionRecipes] = await db.query(
      `SELECT r.name, r.calories, rd.mealtime, rd.quantity, d.logDate
       FROM RecipesDay rd
       JOIN Recipes r ON rd.recipeID = r.id
       JOIN Days d ON rd.dayID = d.id
       WHERE d.clientID = ?
       ORDER BY d.logDate DESC LIMIT 20`,
      [clientId]
    );

    // INVITES
    const [invites] = await db.query(
      `SELECT co.name AS coachName, co.specialty
       FROM Invites inv
       JOIN Coaches co ON inv.coachID = co.id
       WHERE inv.clientID = ?`,
      [clientId]
    );

    const data = [
      {
        profile: {
          name: client.name,
          age: age,
          gender: client.gender,
          weight: client.weight,
          height: client.height,
          frequency: client.frequency,
          goal: client.goal,
          weightGoal: client.weightGoal,
          memberSince: client.createdAt,
        },
        assignedCoach: client.coachId
          ? {
              id: client.coachId,
              name: client.coachName,
              specialty: client.coachSpecialty,
              bio: client.coachBio,
              email: client.coachEmail,
            }
          : null,
        workouts: workouts,
        weightHistory: weightHistory,
        recentActivities: activities,
        recentNutrition: {
          ingredients: nutritionIngredients,
          recipes: nutritionRecipes,
        },
        pendingInvites: invites,
      }
    ];

    return res.json({ success: true, data });
  } catch (err) {
    console.error('AI route error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;