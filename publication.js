async function fetchAndParsePublications() {
    try {
        console.log("Fetching DBLP data...");
        const response = await fetch('https://dblp.org/pid/11/1649.xml');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const xmlText = await response.text();
        console.log("DBLP Data Fetched Successfully!");

        const parser = new DOMParser();
        return parser.parseFromString(xmlText, 'application/xml');
    } catch (error) {
        console.error("Error fetching DBLP data:", error);
        return null;
    }
}

// Function to remove numbers from author names
function cleanAuthorName(name) {
    return name.replace(/\d+$/, "").trim(); // Removes trailing numbers
}

function extractPublications(xmlDoc) {
    if (!xmlDoc) {
        console.error("XML Document is null.");
        return [];
    }

    const publications = [];
    const entryElements = xmlDoc.getElementsByTagName('r');

    for (let entry of entryElements) {
        const titleElem = entry.querySelector('title');
        const authorElems = entry.querySelectorAll('author');
        const yearElem = entry.querySelector('year');
        const urlElem = entry.querySelector('ee');
        const venueElem = entry.querySelector('journal, booktitle'); // Journals & Conferences

        const title = titleElem ? titleElem.textContent : 'No Title';
        const authors = Array.from(authorElems).map(a => cleanAuthorName(a.textContent)).join(', ') || 'No Authors';
        const year = yearElem ? yearElem.textContent : 'No Year';
        const url = urlElem ? urlElem.textContent : '#';
        const venue = venueElem ? venueElem.textContent : 'Unpublished';

        // Filter out unpublished manuscripts
        if (venue === 'Unpublished') {
            continue; // Skip this entry
        }

        // Filter out papers published in "CoRR" and "Electron. Colloquium Comput. Complex."
        if (venue.toLowerCase().includes("corr") || venue.toLowerCase().includes("electron. colloquium comput. complex")) {
            continue; // Skip this entry
        }

        // Determine if it's a journal or conference paper
        const type = entry.querySelector('journal') ? 'journal' : 'conference';

        publications.push({ title, authors, year, url, venue, type });
    }

    console.log(`Extracted ${publications.length} publications.`);
    return publications;
}

function displayPublications(publications) {
    const publicationsList = document.getElementById('publications-list');
    publicationsList.innerHTML = ''; // Clear any existing content

    if (publications.length === 0) {
        publicationsList.innerHTML = "<p>No publications found.</p>";
        return;
    }

    publications.forEach(pub => {
        const listItem = document.createElement('li');
        listItem.classList.add(pub.type); // Assign class for different colors

        listItem.innerHTML = `
            <strong><a href="${pub.url}" target="_blank">${pub.title}</a></strong><br>
            <em>Authors: ${pub.authors}</em><br>
            <em>Published in: ${pub.venue}, ${pub.year}</em>
        `;
        publicationsList.appendChild(listItem);
    });

    console.log("Publications displayed successfully!");
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("Page Loaded!");
    const xmlDoc = await fetchAndParsePublications();
    const publications = extractPublications(xmlDoc);
    displayPublications(publications);
});
