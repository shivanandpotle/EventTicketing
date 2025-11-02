document.addEventListener("DOMContentLoaded", () => {

  // Countdown Timer
  const countdown = () => {
    const countDate = new Date("November 04, 2025 00:00:00").getTime();
    const now = new Date().getTime();
    const gap = countDate - now;

    // Stop the timer when the date is reached
    if (gap < 0) {
      clearInterval(countdownInterval);
      if (document.getElementById("days")) {
        document.getElementById("days").innerText = "00";
        document.getElementById("hours").innerText = "00";
        document.getElementById("minutes").innerText = "00";
        document.getElementById("seconds").innerText = "00";
      }
      return;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const textDay = String(Math.floor(gap / day)).padStart(2, "0");
    const textHour = String(Math.floor((gap % day) / hour)).padStart(2, "0");
    const textMinute = String(Math.floor((gap % hour) / minute)).padStart(2,"0");
    const textSecond = String(Math.floor((gap % minute) / second)).padStart(2,"0");

    // Check if the elements exist before trying to update them
    if (document.getElementById("days")) {
        document.getElementById("days").innerText = textDay;
        document.getElementById("hours").innerText = textHour;
        document.getElementById("minutes").innerText = textMinute;
        document.getElementById("seconds").innerText = textSecond;
    }
  };
  const countdownInterval = setInterval(countdown, 1000);

  // Particles.js Initialization
  if (document.getElementById("particles-js")) {
    particlesJS("particles-js", {
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#00aaff" },
          shape: { type: "circle" },
          opacity: { value: 0.5, random: true },
          size: { value: 3, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#00ffaa",
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 2,
            direction: "none",
            random: true,
            straight: false,
            out_mode: "out",
            bounce: false,
          },
        },
        interactivity: {
          detect_on: "canvas",
          events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true,
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 },
          },
        },
        retina_detect: true,
      });
  }


  // --- Dynamic Content Loading ---

  const speakers = [
    { name: "Yogesh Shinde", title: "Bamboo India FounderTank India", image: "assets/Yogesh Shinde.webp" },
    { name: "Girish Prabhune", title: "Padmashri Award Holder,Social Worker", image: "assets/Girish.jpg" },
    { name: "Sahil Horane", title: "Standup Comedian", image: "assets/Sahil Horane.webp" },
    { name: "Sharad Tandale", title: "Business Man,Writer", image: "assets/Sharad Tandale.jpg" },
    { name: "Kamlesh Ghumare(Jugadu Kamlesh)", title: "Entrepreneur,SharkTank India", image: "assets/kamlesh.jpg" },
     { name: "Kunal  Samant ", title: "Mumbai Indians SpokesPerson", image: "assets/kunal samant.jpg" },
  ];

  const galleryImages = [
    "assets/gallery/ludo.JPG",
    "assets/gallery/kbc.jpg",
    "assets/gallery/aarambh.JPG",
    "assets/gallery/inspireX.jpg",
    "assets/gallery/inspireX2.jpg",
  ];
  
  const team = [
    { name: "Vikram Khade", role: "Organiser", image: "assets/Team1/vikram.jpg" },
    { name: "Om Sonawane", role: "Organiser", image: "assets/Team1/President.jpeg" },
    { name: "Rushikesh Mashalkar", role: "Curation", image: "assets/team/IMG-20240607-WA0044 - Rushikesh Mashalkar.jpg" },
    { name: "Neha Chanal", role: "Curation", image: "assets/team/IMG_9900 - Neha Chanal.jpeg" },
    { name: "Pranav More", role: "Core Team", image: "assets/team/more.jpg" },
    { name: "Sanika Avhad", role: "Core Team", image: "assets/team/IMG_20240624_183936 - Sanika Avhad.jpg" },
    { name: "Tejas Ghondage", role: "Core Team", image: "assets/team/tejas.jpg" },
    { name: "Smita Swami", role: "Core Team", image: "assets/team/IMG_20240624_111438 - Smita Swami.jpg" },
  ];

  const sponsors = [
    
    { name: "Budhane Sweets", logo: "assets/Budhane.jpg" },
    { name: "Coporate Sathi", logo: "assets/corporatesathi.jpg" },
  
  ];

  const speakersGrid = document.querySelector(".speakers-grid");
  if (speakersGrid) {
    speakers.forEach((speaker) => {
      const card = document.createElement("div");
      card.classList.add("speaker-card");
      card.innerHTML = `
                      <img src="${speaker.image}" alt="${speaker.name}" onerror="this.src='https://placehold.co/400x400/00051a/00aaff?text=Image'"/>
                      <div class="speaker-info">
                          <h3>${speaker.name}</h3>
                          <p>${speaker.title}</p>
                      </div>
                  `;
      speakersGrid.appendChild(card);
    });
  }

  const gallerySlider = document.querySelector(".gallery-slider");
  if (gallerySlider) {
    const allImages = [...galleryImages, ...galleryImages];
    allImages.forEach((imgSrc) => {
      const slide = document.createElement("div");
      slide.classList.add("gallery-slide");
      slide.innerHTML = `<img src="${imgSrc}" alt="Gallery Image" onerror="this.src='https://placehold.co/300x200/00051a/00aaff?text=Event+Photo'"/>`;
      gallerySlider.appendChild(slide);
    });
  }

  const teamGrid = document.querySelector(".team-grid");
  if (teamGrid) {
    team.forEach((member) => {
      const memberDiv = document.createElement("div");
      memberDiv.classList.add("team-member");
      memberDiv.innerHTML = `
                      <img src="${member.image}" alt="${member.name}" onerror="this.src='https://placehold.co/150x150/00051a/00aaff?text=Photo'"/>
                      <h4>${member.name}</h4>
                      <p>${member.role}</p>
                  `;
      teamGrid.appendChild(memberDiv);
    });
  }

  const sponsorsGrid = document.querySelector(".sponsors-grid");
  if (sponsorsGrid) {
    sponsors.forEach((sponsor) => {
      const sponsorImg = document.createElement("img");
      sponsorImg.src = sponsor.logo;
      sponsorImg.alt = sponsor.name;
      sponsorImg.classList.add("sponsor-logo");
      sponsorImg.onerror = () => {
        sponsorImg.src =
          "https://placehold.co/180x100/FFFFFF/000000?text=Sponsor";
        sponsorImg.style.filter = "none";
      };
      sponsorsGrid.appendChild(sponsorImg);
    });
  }
});









