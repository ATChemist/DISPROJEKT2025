// src/server/eventsData.js
// her er en liste af tilfældige events. (oprettet af Chat)
const events = [
  {
    id: "e-101",
    title: "Guidet Byvandring på Vesterbro",
    when: "2025-12-01 10:00",
    duration: "2 timer",
    spots: 12,
    location: "Vesterbro, København",
    host: "Mie, lokal historiefortæller",
    category: "Byvandring",
    thumbnail:
      "https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg",
    shortDescription:
      "Oplev Vesterbros skjulte gårde, historier og lokale tips til caféer og barer.",
  },
  {
    id: "e-102",
    title: "Keramik Workshop for Begyndere",
    when: "2025-12-02 14:00",
    duration: "3 timer",
    spots: 8,
    location: "Nørrebro, København",
    host: "Studio Clay & Wine",
    category: "Kreativt",
    thumbnail:
      "https://images.pexels.com/photos/948635/pexels-photo-948635.jpeg",
    shortDescription:
      "Lær at dreje dine egne kopper og skåle – inkl. et glas vin og bræt med snacks.",
  },
  {
    id: "e-103",
    title: "Morning Yoga i Kongens Have",
    when: "2025-12-03 08:30",
    duration: "1 time",
    spots: 20,
    location: "Kongens Have, København",
    host: "Sofie, yoga instruktør",
    category: "Wellness",
    thumbnail:
      "https://images.pexels.com/photos/843658/pexels-photo-843658.jpeg",
    shortDescription:
      "Blid vinyasa yoga under åben himmel – perfekt start på dagen.",
  },
  {
    id: "e-104",
    title: "Naturvins-smagning i Kælderen",
    when: "2025-12-04 19:00",
    duration: "2,5 time",
    spots: 16,
    location: "Indre By, København",
    host: "Bar Vin & Natur",
    category: "Smagning",
    thumbnail:
      "https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg",
    shortDescription:
      "Smag 6 forskellige naturvine og lær, hvad der gør dem anderledes.",
  },
  {
    id: "e-105",
    title: "Street Food Tour på Refshaleøen",
    when: "2025-12-05 13:00",
    duration: "3 timer",
    spots: 10,
    location: "Refshaleøen, København",
    host: "Local Eats CPH",
    category: "Mad & Drikke",
    thumbnail:
      "https://images.pexels.com/photos/374052/pexels-photo-374052.jpeg",
    shortDescription:
      "Guidet smagning gennem de bedste boder – fra tacos til bao og naturvin.",
  },
  {
    id: "e-106",
    title: "Fotowalk ved Solnedgang",
    when: "2025-12-06 16:00",
    duration: "2 timer",
    spots: 14,
    location: "Islands Brygge, København",
    host: "Lukas, fotograf",
    category: "Foto",
    thumbnail:
      "https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg",
    shortDescription:
      "Lær at tage bedre billeder med din mobil eller kamera langs havnefronten.",
  },
];

function getAllEvents() {
  return events;
}

function getEventById(id) {
  return events.find((e) => e.id === id);
}

module.exports = {
  getAllEvents,
  getEventById,
};
