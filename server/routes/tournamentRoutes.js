import express from "express";
import upload from "../middlewares/uploadImage.js";
import {
  initializeMatches,
  setWinner,
  getTournaments,
  addTournament,
  setUpRound,
  createTournament,
  updateTournament,
  getTournamentById
} from "../controllers/tournamentController.js";

const tournamentRouter = express.Router();

// Initialize a tournament
tournamentRouter.patch(
  "/:tournamentId/initialize-matches",
  async (req, res) => {
    try {
      const tournamentId = req.params.tournamentId;
      await initializeMatches(tournamentId);
      res.json("Matches initialized successfully");
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  }
);

// set the winner of a match
tournamentRouter.patch(
  "/:tournamentId/matches/:matchId/set-winner",
  async (req, res) => {
    try {
      const { tournamentId, matchId } = req.params;
      const player = req.body.player;
      setWinner(tournamentId, matchId, player);
      res.json({ message: "Winner set successfully" });
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  }
);

// Get the tournaments
tournamentRouter.get("/", async (req, res) => {
  try {
    const tournaments = await getTournaments();
    res.json(tournaments);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// Add a new tournament
tournamentRouter.post("/", async (req, res) => {
  try {
    addTournament(req.body);
    res.json({ message: "Tournament added successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});

// Setup the next round
tournamentRouter.patch("/:tournamentId/setup-round", async (req, res) => {
  try {
    const tournamentId = req.params.tournamentId;
    await setUpRound(tournamentId);
    res.json("Round set up successfully");
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
});



/**
 * @desc Create a new tournament
 * @route /api/tournaments
 * @method POST
 * @access private
 *
 */

tournamentRouter.use(express.static('public'))
tournamentRouter.post("/api/tournaments", upload.single('cover_image_url'), createTournament)

/**
 * @desc get a tournament by id for the user
 * @route /api/tournaments/:id
 * @method GET
 * @access public
 *
 */
tournamentRouter.get("/api/tournaments/:id", getTournamentById);

/**
 * @desc update a tournament
 * @route /api/tournaments/:id
 * @method PUT
 * @access private
 *
 */

tournamentRouter.put("/api/tournaments/:id", upload.single('cover_image_url'), updateTournament);

export { tournamentRouter };
