/* ==========================================================================
   OSHNEER VIEW GUEST HOUSE — SITE CONFIGURATION
   Edit this file to change contact details, prices, photos, links and more.
   No rebuild is needed: save the file and reload the page.
   ========================================================================== */
window.SITE = {
  business: {
    name: "Oshneer View Guest House",
    shortName: "Oshneer View",
    tagline: "A Peaceful Stay in the Heart of Upper Chitral",
    address: "Parwak, Upper Chitral, Pakistan",
    email: "oshneerviewguesthouse@gmail.com"
  },

  /* Phone numbers. "tel" is the dialable form (no spaces). */
  hosts: [
    { name: "Fida Hussain",   role: "Owner",    phone: "+92 345 0246257", tel: "+923450246257", photo: "assets/img/fida.webp" },
    { name: "Sharif Hussain", role: "Co-owner", phone: "+92 344 9356645", tel: "+923449356645", photo: "assets/img/sharif.webp" }
    /* To change a portrait: put a square photo in assets/img/ and edit "photo". */
  ],

  /* Rooms. "price" is shown exactly as written — edit freely. */
  rooms: [
    { name: "Room 01",      beds: "Two beds",   bath: "",                  price: "PKR 6,000",   image: "assets/img/room-01-800.webp", alt: "Room with two wooden single beds and red floral blankets" },
    { name: "Room 02",      beds: "Two beds",   bath: "",                  price: "PKR 7,000",   image: "assets/img/room-02-800.webp", alt: "Room with a carved wooden bed, bedside table and orange curtains" },
    { name: "Room 03",      beds: "Two beds",   bath: "",                  price: "PKR 7,000",   image: "assets/img/room-03-800.webp", alt: "Room with two single beds side by side and a patterned carpet" },
    { name: "Premium Room", beds: "Double bed", bath: "Attached washroom", price: "Up to PKR 8,000", image: "assets/img/room-bed-800.webp", alt: "Carved wooden double bed with green blanket and bedside table" }
  ],
  priceNote: "Prices are per room. Contact us to confirm the rate for your dates.",

  /* Social links. Leave a url empty ("") to hide that icon. */
  social: {
    instagram: { handle: "@oshneer_view_guest_house", url: "https://www.instagram.com/oshneer_view_guest_house/" },
    facebook:  { handle: "Oshneer View Guest House Parwak", url: "https://www.facebook.com/profile.php?id=61560958775749&locale=en_GB#" } /* paste the official page URL here */
  },

  /* Map. Paste the "Embed a map" src URL from Google Maps → Share → Embed.
     directionsUrl works without coordinates (it searches by name). Replace it
     with your exact Google Maps share link when you have it. */
  map: {
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3216.295515976483!2d72.42624977505025!3d36.280878896802676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38c33ddae2bea153%3A0x8e92c81fbdc08336!2sOshneer%20View%20Guest%20house%20Parwak!5e0!3m2!1sen!2s!4v1792234175109!5m2!1sen!2s" width="600" height="450" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"
    directionsUrl: "https://maps.app.goo.gl/GGBCypjCZ56Cj1798"
  },

  /* Booking form. The form posts JSON to this endpoint (see server.js). */
  booking: {
    endpoint: "/api/booking",
    successMessage: "Thank you! Your booking request has been received. We will contact you shortly to confirm availability."
  },

  /* Gallery. category: one of the names in galleryCategories. */
  galleryCategories: ["All", "Guest House", "Rooms", "Outdoors", "Aerial"],
  gallery: [
    { src: "assets/img/aerial-1.webp",         full: "assets/img/aerial-1.webp",         category: "Aerial",      alt: "Aerial view of the maroon-walled guest house with its red roof and lawn", w: 1280, h: 720 },
    { src: "assets/img/house-800.webp",        full: "assets/img/house-1600.webp",       category: "Guest House", alt: "Front of Oshneer View Guest House with rose garden and mountain behind", w: 1600, h: 720 },
    { src: "assets/img/room-sitting-800.webp", full: "assets/img/room-sitting-1600.webp",category: "Rooms",       alt: "Guest room with wooden bed, table and patterned rug", w: 1600, h: 1200 },
    { src: "assets/img/lawn-800.webp",         full: "assets/img/lawn-1600.webp",        category: "Outdoors",    alt: "Green lawn beside the guest house with snow-capped mountains beyond", w: 1600, h: 720 },
    { src: "assets/img/room-bed-800.webp",     full: "assets/img/room-bed-1600.webp",    category: "Rooms",       alt: "Carved wooden bed with green blanket", w: 1600, h: 1200 },
    { src: "assets/img/roses-800.webp",        full: "assets/img/roses-800.webp",        category: "Outdoors",    alt: "Pink roses in the garden with the guest house behind", w: 800, h: 600 },
    { src: "assets/img/aerial-24.webp",        full: "assets/img/aerial-24.webp",        category: "Aerial",      alt: "Aerial view of Parwak village among autumn trees beside a gorge", w: 1280, h: 720 },
    { src: "assets/img/room-01-800.webp",      full: "assets/img/room-01-1600.webp",     category: "Rooms",       alt: "Room with two wooden beds and red floral blankets", w: 800, h: 600 },
    { src: "assets/img/room-03-800.webp",      full: "assets/img/room-03-1600.webp",     category: "Rooms",       alt: "Room with a carved bed, wooden wardrobe and orange curtains", w: 800, h: 600 },
    { src: "assets/img/aerial-12.webp",        full: "assets/img/aerial-12.webp",        category: "Guest House", alt: "Guest house front seen through garden roses", w: 1280, h: 720 }
  ],

  /* Facilities. Add or remove lines freely. Only list what is really available. */
  facilities: [
    { title: "Parking available", text: "Space to park at the guest house." },
    { title: "Lawn & outdoor dining", text: "Book the lawn by the hour and eat outdoors." },
    { title: "Pakistani & Chinese food", text: "Plus tea and coffee." },
    { title: "Attached washroom", text: "In the Premium Room." }
  ],
  facilitiesNote: "Need something specific? Contact us for details.",

  /* Guest review. Show only reviews that are real. rating is 1-5.
     url (optional) = link to the real review/Google listing, shown as "Read on Google". */
  guests: [
    { photo: "assets/img/guests-800.webp", alt: "Two guests seated on the lawn at Oshneer View",
      caption: "Guests on the lawn at Oshneer View",
      rating: 5, source: "Google review", name: "Guests at Oshneer View", url: "",
      quote: "We had a wonderful experience at Oshneer View Guest House, Parwak. The peaceful atmosphere, beautiful mountain views, and comfortable rooms made our stay truly special. As a couple, we really enjoyed the privacy, hospitality, and relaxing environment. The staff were welcoming, and everything was well taken care of. We would definitely love to visit again and recommend this place to anyone looking for a peaceful getaway in Upper Chitral." }
  ]
};
