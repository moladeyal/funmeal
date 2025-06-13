// app.js - גרסת Frontend-Only

document.addEventListener('DOMContentLoaded', () => {

    const GOOGLE_API_KEY = "AIzaSyD5yK_2qHlpuNc7isG0lMwzyzWnvHmr59U"; 

    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('restaurant-input');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    const search = async () => {
        const query = searchInput.value;
        if (!query) return;

        loader.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');

        const searchUrl = 'https://places.googleapis.com/v1/places:searchText';

        try {
            const response = await fetch(searchUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.rating,places.photos'
                },
                body: JSON.stringify({
                    textQuery: query,
                    languageCode: 'he'
                })
            });
            
            const data = await response.json();

            if (data.error) {
                throw new Error(data.error.message);
            }

            if (data.places && data.places.length > 0) {
                displayResults(data.places[0]);
            } else {
                 throw new Error("לא נמצאו תוצאות.");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            errorMessage.textContent = `אופס, משהו השתבש: ${error.message}`;
            errorMessage.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    };

    const displayResults = (place) => {
        // פונקציית התצוגה נשארת זהה, אבל גם כאן צריך להשתמש במפתח
        resultsContainer.innerHTML = ''; 

        const name = document.createElement('h2');
        name.textContent = place.displayName.text;

        const address = document.createElement('p');
        address.textContent = `כתובת: ${place.formattedAddress || 'לא צוינה כתובת'}`;
        
        const rating = document.createElement('p');
        rating.textContent = `דירוג: ${place.rating || 'אין דירוג'} ⭐`;

        resultsContainer.appendChild(name);
        resultsContainer.appendChild(address);
        resultsContainer.appendChild(rating);


        if (place.photos && place.photos.length > 0) {
            const gallery = document.createElement('div');
            gallery.className = 'photo-gallery';
            
            place.photos.slice(0, 5).forEach(photo => {
                // בניית ה-URL לתמונה ישירות בקוד, כולל המפתח
                const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?key=${GOOGLE_API_KEY}&maxHeightPx=400`;

                const img = document.createElement('img');
                img.src = photoUrl;
                img.alt = `תמונה של ${place.displayName}`;
                gallery.appendChild(img);
            });
             resultsContainer.appendChild(gallery);
        }
        resultsContainer.classList.remove('hidden');
    };

    searchButton.addEventListener('click', search);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            search();
        }
    });
});
