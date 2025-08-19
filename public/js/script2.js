document.addEventListener("DOMContentLoaded", () => {
  // Header Scroll Effect
  const header = document.querySelector("header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // Hamburger Menu
  const hamburger = document.getElementById("hamburger");
  const mobileNav = document.getElementById("mobile-nav");
  const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

  hamburger.addEventListener("click", () => {
    mobileNav.classList.toggle("active");
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileNav.classList.remove("active");
    });
  });

  // Countdown Timer
  const countdown = () => {
    const countDate = new Date("October 10, 2025 00:00:00").getTime();
    const now = new Date().getTime();
    const gap = countDate - now;

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;

    const textDay = String(Math.floor(gap / day)).padStart(2, "0");
    const textHour = String(Math.floor((gap % day) / hour)).padStart(2, "0");
    const textMinute = String(Math.floor((gap % hour) / minute)).padStart(
      2,
      "0"
    );
    const textSecond = String(Math.floor((gap % minute) / second)).padStart(
      2,
      "0"
    );

    document.getElementById("days").innerText = textDay;
    document.getElementById("hours").innerText = textHour;
    document.getElementById("minutes").innerText = textMinute;
    document.getElementById("seconds").innerText = textSecond;
  };
  setInterval(countdown, 1000);

  // Particles.js Initialization
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

  // --- Dynamic Content Loading ---

  const speakers = [
    { name: "Dr. Prakash Amte", title: "Padma Shri", image: "assets/baba.png" },
    {
      name: "Dr. Mandakini Amte",
      title: "Padma Shri",
      image: "assets/aaji.png",
    },
    {
      name: "Dr. Ashok Nagarkar",
      title: "Actor, Poet, Writer",
      image: "assets/ashu.jpg",
    },
    {
      name: "Dr. Sanjay Katkar",
      title: "ED & CEO, Quick Heal",
      image: "assets/sanju.png",
    },
    {
      name: "Raghvendra Ponkshe",
      title: "Founder CEO, F5 Escapes",
      image: "assets/raghu.png",
    },
    { name: "Jaywant Patil", title: "Filmmaker", image: "assets/jaywant.png" },
    {
      name: "Aarya Jadhao (QK)",
      title: "Influencer",
      image: "assets/aarya jadhav.jpg",
    },
  ];

  const galleryImages = [
    "assets/gallery/ludo.jpg",
    "assets/gallery/kbc.jpg",
    "assets/gallery/aarambh.jpg",
    "assets/gallery/inspireX.jpg",
    "assets/gallery/inspireX2.jpg",
  ];

  const team = [
    {
      name: "Vikram Khade",
      role: "Organiser",
      image: "assets/Team1/vikram.jpg",
    },
    {
      name: "Om Sonawane",
      role: "Organiser",
      image: "assets/Team1/President.jpeg",
    },
    {
      name: "Rushikesh Mashalkar",
      role: "Curation",
      image: "assets/team/IMG-20240607-WA0044 - Rushikesh Mashalkar.jpg",
    },
    {
      name: "Neha Chanal",
      role: "Curation",
      image: "assets/team/IMG_9900 - Neha Chanal.jpeg",
    },
    { name: "Pranav More", role: "Core Team", image: "assets/team/more.jpg" },
    {
      name: "Sanika Avhad",
      role: "Core Team",
      image: "assets/team/IMG_20240624_183936 - Sanika Avhad.jpg",
    },
    {
      name: "Tejas Ghondage",
      role: "Core Team",
      image: "assets/team/tejas.jpg",
    },
    {
      name: "Smita Swami",
      role: "Core Team",
      image: "assets/team/IMG_20240624_111438 - Smita Swami.jpg",
    },
  ];

  const sponsors = [
    { name: "Studx", logo: "assets/studx.jpg" },
    { name: "TipTop", logo: "assets/tiptop.png" },
    { name: "Budhane Sweets", logo: "assets/Budhane.jpg" },
    { name: "JSPM RSCOE", logo: "assets/download (2).png" },
    { name: "Other Sponsor", logo: "assets/Logo.png" },
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
    // Duplicate the images array to create a seamless loop
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
        sponsorImg.style.filter = "none"; // remove filter for placeholder
      };
      sponsorsGrid.appendChild(sponsorImg);
    });
  }
});
