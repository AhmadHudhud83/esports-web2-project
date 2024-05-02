const TournamentModel = require("../models/Tournament");

// This function takes the matches array, which is passed by refrerence and the index of the current round,
// and fills it with given participants and supervisors
const fillMatches = (matches, roundId, participants, supervisors) => {
  i = 0; // traverse through the matches in a round
  j = 0; // traverse through the participants
  k = 0; // traverse through the supervisors

  while (i < Math.round(participants.length / 2)) {
    matches[roundId][i].team1 = participants[j]; // add the first participant to the match
    j++;

    if (matches[roundId][i].team2 === null) {
      // to avoid overriding the bye
      matches[roundId][i].team2 = participants[j]; // add the second participant to the match
      j++;
    }

    const supervisorIndex = i % supervisors.length; // to evenly distribute the supervisors
    matches[roundId][i].supervisor = supervisors[supervisorIndex]; // add the supervisor to the match
    i++;
  }
};

// This function initializes the matches for a tournament by creating the matches array with proper structure,
// adding needed byes to arrange proper matches, and filling the first round with participants and supervisors
exports.initializeMatches = async (tournamentId) => {
  // Fetch the tournament document
  const tournament = await TournamentModel.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found", tournamentId);
  }

  // Get the participants and supervisors
  const participants = tournament.participants;
  const supervisors = tournament.supervisors;

  // Create the matches array
  const numberOfParticipants = participants.length;
  const numberOfRounds = Math.ceil(Math.log2(numberOfParticipants));
  const matches = Array(numberOfRounds);

  let i = 0, // round index
    j = Math.round(numberOfParticipants / 2), // number of matches in a round
    p = numberOfParticipants; // number of participants in a round

  while (i < numberOfRounds) {
    matches[i] = Array(j).fill(null); // create an array of matches for each round
    for (let k = 0; k < j; k++) {
      // initialize each match
      matches[i][k] = {
        team1: null,
        team2: null,
        suppervisor: null,
        winner: null,
      };
    }

    if (p % 2 !== 0) {
      const byeIndex = Math.floor(Math.random() * j); // randomly select a match to have a bye
      matches[i][byeIndex].team2 = "bye"; // add the bye to the match
    }
    i++;
    j = Math.round(j / 2);
    p = Math.round(p / 2);
  }

  // Fill the first round with participants and supervisors
  fillMatches(matches, 0, participants, supervisors);

  // Update the tournament document
  tournament.matches = matches;
  tournament.currentRound = 0;
  await tournament.save();
};

// This function checks if all matches in a round have a winner
const isRoundComplete = (round) => {
  return round.every((match) => match.winner !== null);
};

// This function sets the winner of a match then checks if all matches in the current round have a winner to move to the next round
exports.setWinner = async (tournamentId, matchId, playerId) => {
  // Fetch the tournament document
  const tournament = await TournamentModel.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found", tournamentId);
  }
  const currentRound = tournament.currentRound;

  tournament.matches[currentRound][matchId].winner = playerId; // Set the winner of the match

  // Check if all matches in the current round have a winner
  if (isRoundComplete(tournament.matches[currentRound])) {
    tournament.currentRound++; // Move to the next round
    setUpRound(tournamentId); // Set up the next round
  }
  tournament.markModified("matches"); // Mark the matches array as modified
  await tournament.save(); // Save the updated tournament document
};

const setUpRound = async (tournamentId) => {
  // Fetch the tournament document
  const tournament = await TournamentModel.findById(tournamentId);
  if (!tournament) {
    throw new Error("Tournament not found", tournamentId);
  }

  // Get the winners of the matches in the previous round to be the participants of the next round
  const participants = tournament.matches[tournament.currentRound - 1].map(
    (match) => match.winner
  );

  // Get the supervisors
  const supervisors = tournament.supervisors;

  // Fill the matches of the current round with the participants and supervisors
  fillMatches(
    tournament.matches,
    tournament.currentRound,
    participants,
    supervisors
  );
};
