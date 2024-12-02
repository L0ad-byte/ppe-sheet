const form = document.getElementById('userForm');
const backendUrl = 'https://script.google.com/macros/s/XXXXXXXXXX/exec'; // Replace with your GAS Web App URL
const API_KEY = 'aml7UysdC6TL3LokHVElNKKcVlnEVQ7i'; // Your generated API key

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Handle Form Submission
form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const idNumber = document.getElementById('idNumber').value.trim();
  const contactNumber = document.getElementById('contactNumber').value.trim();

  const data = { name, idNumber, contactNumber, apiKey: API_KEY };

  if (navigator.onLine) {
    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert('Data submitted successfully!');
        form.reset();
      } else {
        throw new Error('Network response was not ok.');
      }
    } catch (error) {
      console.error('Error submitting data:', error);
      // Save data locally if submission fails
      saveDataLocally(data);
      alert('Failed to submit data. It will be saved locally and synced when online.');
      form.reset();
    }
  } else {
    // Save data locally
    saveDataLocally(data);
    alert('You are offline. Data will be submitted when back online.');
    form.reset();
  }
});

// Save data to localStorage
function saveDataLocally(data) {
  let submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  submissions.push(data);
  localStorage.setItem('submissions', JSON.stringify(submissions));
}

// Sync data when back online
window.addEventListener('online', () => {
  const submissions = JSON.parse(localStorage.getItem('submissions')) || [];
  if (submissions.length > 0) {
    submissions.forEach(async (data) => {
      try {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error('Network response was not ok.');
        }
      } catch (error) {
        console.error('Error syncing data:', error);
      }
    });
    localStorage.removeItem('submissions');
    alert('Offline data synchronized successfully!');
  }
});
