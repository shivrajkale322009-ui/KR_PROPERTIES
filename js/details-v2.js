import { db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const plotId = urlParams.get('id');

async function loadDetails() {
    if (!plotId) return;

    try {
        const docRef = doc(db, "plots", plotId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const plot = docSnap.data();
            renderUI(plot);
        }
    } catch (err) { console.error(err); }
}

function renderUI(plot) {
    // 1. Image Gallery
    const mainImg = document.getElementById('main-view');
    const thumbBox = document.getElementById('gallery-thumbs');
    
    if (plot.imageUrls && plot.imageUrls.length > 0) {
        mainImg.src = plot.imageUrls[0];
        thumbBox.innerHTML = plot.imageUrls.map((url, i) => `
            <div class="thumb-item ${i === 0 ? 'active' : ''}" onclick="window.updateGallery('${url}', this)">
                <img src="${url}">
            </div>
        `).join("");
    }

    // 2. Info Header
    document.getElementById('plot-price').innerText = `₹${Number(plot.price).toLocaleString()}`;
    document.getElementById('plot-title').innerText = plot.title;
    document.getElementById('plot-location').innerHTML = `
        <svg style="width:20px; color:#1e3a8a;" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
        ${plot.location}
    `;

    // 3. Highlights & Description
    document.getElementById('plot-description').innerText = plot.description || "No description provided.";
    
    const highlights = [
        { icon: 'path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"', text: plot.size },
        { icon: 'path d="M13 10V3L4 14h7v7l9-11h-7z"', text: "Clear Title Documentation" },
        { icon: 'path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"', text: "Electricity & Water Available" }
    ];

    document.getElementById('plot-highlights').innerHTML = highlights.map(h => `
        <div class="highlight-item">
            <svg class="highlight-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${h.icon.split('"')[1]}"></path></svg>
            ${h.text}
        </div>
    `).join("");

    // 4. Video Logic
    const videoSec = document.getElementById('video-section');
    const videoEmbed = document.getElementById('video-embed');
    
    if (plot.videoLink && plot.videoLink.trim() !== "") {
        const embedUrl = getYoutubeEmbed(plot.videoLink);
        if (embedUrl) {
            videoSec.style.display = 'block';
            videoEmbed.innerHTML = `<iframe src="${embedUrl}" allowfullscreen></iframe>`;
        }
    } else if (plot.videoEmbed && plot.videoEmbed.trim() !== "") {
        videoSec.style.display = 'block';
        videoEmbed.innerHTML = plot.videoEmbed;
    }
}

// Global Gallery Switcher
window.updateGallery = (url, el) => {
    document.getElementById('main-view').src = url;
    document.querySelectorAll('.thumb-item').forEach(th => th.classList.remove('active'));
    el.classList.add('active');
};

function getYoutubeEmbed(url) {
    let id = "";
    if (url.includes("youtube.com/watch?v=")) {
        id = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
        id = url.split("youtu.be/")[1].split("?")[0];
    }
    return id ? `https://www.youtube.com/embed/${id}` : null;
}

document.addEventListener('DOMContentLoaded', loadDetails);
