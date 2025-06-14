// app.js - גרסת Frontend-Only

document.addEventListener('DOMContentLoaded', () => {

    const GOOGLE_API_KEY = "AIzaSyD5yK_2qHlpuNc7isG0lMwzyzWnvHmr59U"; 

    const header = document.querySelector('header'); // בחירת הכותרת
    const searchContainer = document.querySelector('.search-container'); // בחירת קונטיינר החיפוש
    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('restaurant-input');
    const resultsContainer = document.getElementById('results-container');
    const loader = document.getElementById('loader');
    const errorMessage = document.getElementById('error-message');

    const resetToSearchView = () => {
        // מסתירים את התוצאות, השגיאות והטעינה
        resultsContainer.classList.add('hidden');
        errorMessage.classList.add('hidden');
        loader.classList.add('hidden');
        
        // מציגים מחדש את תיבת החיפוש
        searchContainer.classList.remove('hidden');

        // מנקים את שדה החיפוש לחוויה טובה יותר
        searchInput.value = '';
    };

    // ---- פונקציית החיפוש הראשית ----
    const search = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            alert("יש להזין שם מסעדה");
            return;
        }

        // עדכון הממשק למצב טעינה
        loader.classList.remove('hidden');
        errorMessage.classList.add('hidden');
        resultsContainer.classList.add('hidden');

        try {
            const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Goog-Api-Key': GOOGLE_API_KEY,
                    'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.rating,places.photos,places.primaryTypeDisplayName,places.priceLevel,places.websiteUri'
                },
                body: JSON.stringify({
                    textQuery: query,
                    languageCode: 'he'
                })
            });

            const data = await response.json();

            if (data.error || !data.places || data.places.length === 0) {
                throw new Error(data.error?.message || "לא נמצאו תוצאות.");
            }
            
            searchContainer.classList.add('hidden');
            displayResults(data.places[0]);

        } catch (error) {
            console.error("Fetch error:", error);
            errorMessage.textContent = `אופס, משהו השתבש: ${error.message}`;
            errorMessage.classList.remove('hidden');
        } finally {
            loader.classList.add('hidden');
        }
    };

    const displayResults = (place) => {
        resultsContainer.innerHTML = ''; // ניקוי תוצאות קודמות
        
        // --- 1. תמונת Thumbnail ראשית ---
        if (place.photos && place.photos.length > 0) {
            const mainPhoto = place.photos[0]; 
            const mainPhotoElement = document.createElement('img');
            mainPhotoElement.className = 'main-photo-thumbnail';
            mainPhotoElement.src = `https://places.googleapis.com/v1/${mainPhoto.name}/media?key=${GOOGLE_API_KEY}&maxHeightPx=400`;
            mainPhotoElement.alt = `תמונה ראשית של ${place.displayName.text}`;
            resultsContainer.appendChild(mainPhotoElement);
        }

        // --- 2. קונטיינר לכל שאר הפרטים ---
        const detailsWrapper = document.createElement('div');
        detailsWrapper.className = 'details-wrapper';

        // --- קונטיינר גמיש (Flex) לשם המסעדה והלינק ---
        const nameAndLinkWrapper = document.createElement('div');
        nameAndLinkWrapper.className = 'name-and-link-wrapper';

        // --- שם המסעדה ---
        const name = document.createElement('h2');
        name.textContent = place.displayName.text;
        nameAndLinkWrapper.appendChild(name); // הוספה לקונטיינר החדש

        // --- לינק לאתר המסעדה (אם קיים) ---
        if (place.websiteUri) {
            const websiteLink = document.createElement('a');
            websiteLink.href = place.websiteUri;
            websiteLink.innerHTML = 'אתר <span class="link-icon">↗️</span>'; // טקסט עדין יותר
            websiteLink.className = 'website-link-inline'; // קלאס חדש לעיצוב עדין
            websiteLink.target = '_blank';
            websiteLink.rel = 'noopener noreferrer';
            nameAndLinkWrapper.appendChild(websiteLink); // הוספה לקונטיינר החדש
        }
        
        detailsWrapper.appendChild(nameAndLinkWrapper); // הוספת הקונטיינר המשותף

        // --- קונטיינר לסגנון, מחיר ודירוג (בשורה אחת) ---
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'details-container';
        
        // יצירת טקסט לסוג המסעדה ורמת המחיר
        let detailsTextParts = [];
        if (place.primaryTypeDisplayName) {
            detailsTextParts.push(place.primaryTypeDisplayName.text);
        }
        if (place.priceLevel) {
            detailsTextParts.push(formatPriceLevel(place.priceLevel));
        }
        const detailsTextElement = document.createElement('p');
        detailsTextElement.className = 'details-text';
        detailsTextElement.textContent = detailsTextParts.join(' • ');
        detailsContainer.appendChild(detailsTextElement);

        // הוספת הדירוג החסר
        const rating = document.createElement('p');
        rating.className = 'rating-text';
        rating.innerHTML = `<strong>דירוג:</strong> ${place.rating || 'אין'} ⭐`;
        detailsContainer.appendChild(rating);

        detailsWrapper.appendChild(detailsContainer);

        // --- כתובת ---
        const address = document.createElement('p');
        address.innerHTML = `<span class="icon">📍</span> ${place.formattedAddress || 'לא צוינה כתובת'}`;
        detailsWrapper.appendChild(address);

        // --- גלריית תמונות (של שאר התמונות) ---
        if (place.photos && place.photos.length > 1) {
            const galleryTitle = document.createElement('h3');
            galleryTitle.textContent = 'תמונות נוספות';
            detailsWrapper.appendChild(galleryTitle);
            
            const gallery = document.createElement('div');
            gallery.className = 'photo-gallery';
            
            place.photos.slice(1, 13).forEach(photo => {
                const photoUrl = `https://places.googleapis.com/v1/${photo.name}/media?key=${GOOGLE_API_KEY}&maxHeightPx=400`;
                const img = document.createElement('img');
                img.src = photoUrl;
                img.alt = `תמונה של ${place.displayName.text}`;
                gallery.appendChild(img);
            });
            detailsWrapper.appendChild(gallery);
        }
        
        resultsContainer.appendChild(detailsWrapper);
        resultsContainer.classList.remove('hidden');
    };


    // ---- פונקציית עזר לתרגום רמת מחיר לסימני שקלים ----
    const formatPriceLevel = (level) => {
        switch(level) {
            case 'PRICE_LEVEL_FREE':
                return 'חינם';
            case 'PRICE_LEVEL_INEXPENSIVE':
                return '₪';
            case 'PRICE_LEVEL_MODERATE':
                return '₪₪';
            case 'PRICE_LEVEL_EXPENSIVE':
                return '₪₪₪';
            case 'PRICE_LEVEL_VERY_EXPENSIVE':
                return '₪₪₪₪';
            default:
                return '';
        }
    };

    searchButton.addEventListener('click', search);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            search();
        }
    });

    // --- הוספת Event Listener חדש לכותרת ---
    header.addEventListener('click', resetToSearchView);
});
