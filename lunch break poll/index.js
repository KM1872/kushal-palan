import { initializeApp } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-app.js";
import { getDatabase, ref, push, onValue, update, set } from "https://www.gstatic.com/firebasejs/9.20.0/firebase-database.js";

// Firebase configuration
const firebaseConfig = {
  databaseURL: "https://lunch-break-poll-c9c9b-default-rtdb.asia-southeast1.firebasedatabase.app/"
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const placesRef = ref(database, "places");

// Page Elements
const placeForm = document.getElementById('placeForm');
const placesList = document.getElementById('placesList');
const placeInput = document.getElementById('placeInput');
const leadingPlaceDisplay = document.getElementById('leadingPlace');
const deletePollButton = document.getElementById('deletePoll');

// Function to reset the poll
function resetPoll() {
  set(placesRef, {}); // Clear the 'places' node in the database
  leadingPlaceDisplay.textContent = ''; // Clear the leading place display
  placesList.innerHTML = ''; // Clear the list of places
  deletePollButton.style.display = 'none'; // Hide the delete button
}

// Function to update the user's vote in Firebase and Local Storage
function updateUserVote(newVoteKey) {
  const currentVoteKey = localStorage.getItem('userVote');
  if (currentVoteKey) {
    // Decrement vote count for the old vote
    const oldVoteRef = ref(database, `places/${currentVoteKey}`);
    onValue(oldVoteRef, (snapshot) => {
      if (snapshot.exists()) {
        const votes = snapshot.val().votes;
        update(oldVoteRef, { votes: votes > 0 ? votes - 1 : 0 });
      }
    }, { onlyOnce: true });
  }

  // Increment vote count for the new vote
  const newVoteRef = ref(database, `places/${newVoteKey}`);
  onValue(newVoteRef, (snapshot) => {
    if (snapshot.exists()) {
      const votes = snapshot.val().votes;
      update(newVoteRef, { votes: votes + 1 });
    }
  }, { onlyOnce: true });

  // Update local storage
  localStorage.setItem('userVote', newVoteKey);
}

// Event listener for form submission
placeForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const placeName = placeInput.value.trim();
  if (placeName) {
    push(placesRef, { name: placeName, votes: 0 });
  }
  placeInput.value = '';
});

// Listen for real-time updates from Firebase
onValue(placesRef, (snapshot) => {
  if (snapshot.exists() && snapshot.hasChildren()) {
    deletePollButton.style.display = 'block'; // Show the delete button
  } else {
    deletePollButton.style.display = 'none'; // Hide the delete button if no polls
  }
  
  placesList.innerHTML = '';
  let leadingPlace = { name: '', votes: -1 };

  snapshot.forEach((childSnapshot) => {
    const place = childSnapshot.val();
    const placeKey = childSnapshot.key;

    // Create list item for each place
    const listItem = document.createElement('li');
    listItem.textContent = `${place.name} - Votes: ${place.votes}`;
    listItem.style.cursor = 'pointer';
    listItem.addEventListener('click', () => {
      const userVote = localStorage.getItem('userVote');
      if (userVote !== placeKey) {
        updateUserVote(placeKey); // Update the user's vote
      }
    });

    placesList.appendChild(listItem);

    // Update leading place
    if (place.votes > leadingPlace.votes) {
      leadingPlace = { name: place.name, votes: place.votes };
    }
  });

  // Display the leading place
  if (leadingPlace.votes > -1) {
    leadingPlaceDisplay.textContent = `Leading Place: ${leadingPlace.name} with ${leadingPlace.votes} votes`;
  }
});

// Event listener for the delete button
deletePollButton.addEventListener('click', resetPoll);

"https://lunch-break-poll-c9c9b-default-rtdb.asia-southeast1.firebasedatabase.app/"