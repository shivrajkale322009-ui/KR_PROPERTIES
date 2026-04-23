import { db } from './js/firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const urlParams = new URLSearchParams(window.location.search);
const plotId = urlParams.get('id');

const detailContainer = document.querySelector('.container');

async function loadPlotDetails() {
    if (!plotId) return;

    try {
        const docRef = doc(db, "plots", plotId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const plot = docSnap.data();

            // Dynamically build the detail page content
            // Assuming we have structural containers already there
            document.title = `${plot.title} | KR Properties`;

            // Build gallery
            let galleryHTML = plot.imageUrls.map(url =>
                `<img src="${url}" class="gallery-img" style="margin-bottom: 20px; border-radius: 12px; width:100%;">`
            ).join("");

            detailContainer.innerHTML = `
                <div class="detail-grid" style="padding-top: 40px;">
                    <div class="detail-info">
                        <div style="font-size: 2.5rem; font-weight: 800; color: #0b8f5a;">₹${plot.price.toLocaleString()}</div>
                        <h1 style="font-size: 1.8rem; margin-top: 10px;">${plot.title}</h1>
                        <p style="font-size: 1.1rem; color: #4b5563;">${plot.location} | ${plot.size}</p>
                        
                        <div style="margin-top: 30px;">
                            ${galleryHTML}
                        </div>

                        <div style="margin-top: 40px; padding: 25px; background: #f9fafb; border-radius: 16px;">
                            <h3>Property Description</h3>
                            <p style="margin-top:15px; font-size: 1.1rem;">${plot.description}</p>
                        </div>
                    </div>

                    <div class="detail-sidebar">
                        <div style="background: white; padding: 25px; border-radius: 16px; border: 2px solid #0b8f5a; position: sticky; top: 100px;">
                            <h3 style="margin-bottom: 15px;">Interested?</h3>
                            <p style="margin-bottom: 20px;">Contact Jeevan Kale directly for a site visit.</p>
                            <a href="tel:+919970434686" class="btn-header" style="display: block; text-align: center; margin-bottom: 15px;">Call Agent</a>
                            <a href="https://wa.me/919970434686?text=Interested in ${plot.title}" class="btn-header" style="display: block; text-align: center; background: #25d366;">WhatsApp Now</a>
                        </div>
                    </div>
                </div>
            `;
        }
    } catch (error) {
        console.error("Error loading plot:", error);
    }
}

document.addEventListener('DOMContentLoaded', loadPlotDetails);
